import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractScope } from "@/lib/ai/extract-scope";
import { v4 as uuid } from "uuid";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { project_id } = await req.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { data: documents } = await supabase
    .from("project_documents")
    .select("*")
    .eq("project_id", project_id)
    .eq("ai_processed", false);

  if (!documents?.length) {
    return new Response(JSON.stringify({ error: "No unprocessed documents" }), { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function sendProgress(phase: string, pct: number) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ phase, pct })}\n\n`));
      }

      let totalItemsCreated = 0;

      try {
        // Process documents one at a time to avoid rate limits
        for (let docIdx = 0; docIdx < documents.length; docIdx++) {
          const doc = documents[docIdx];
          const docPctBase = Math.round((docIdx / documents.length) * 100);
          const docPctRange = Math.round(100 / documents.length);

          sendProgress(`Downloading ${doc.file_name} (${docIdx + 1}/${documents.length})...`, docPctBase + 2);

          // Download PDF
          const { data: fileData } = await supabase.storage
            .from("documents")
            .download(doc.file_url);
          if (!fileData) throw new Error(`Failed to download ${doc.file_name}`);
          const buffer = Buffer.from(await fileData.arrayBuffer());
          const pdfDoc = { base64Data: buffer.toString("base64"), fileName: doc.file_name };

          // Wait between docs to respect rate limits (skip first)
          if (docIdx > 0) {
            sendProgress(`Rate limit cooldown (${docIdx + 1}/${documents.length})...`, docPctBase + 3);
            await sleep(65000); // 65 seconds between docs
          }

          // Extract scope from this single document
          const extraction = await extractScope([pdfDoc], (phase, rawPct) => {
            // Scale the per-doc progress to fit within this doc's range
            const scaledPct = docPctBase + Math.round((rawPct / 100) * docPctRange);
            sendProgress(`[${docIdx + 1}/${documents.length}] ${phase}`, Math.min(scaledPct, 99));
          });

          // Insert scope items
          const scopeItems = extraction.trades.flatMap((trade, tradeIdx) =>
            trade.items.map((item, itemIdx) => ({
              id: uuid(),
              project_id,
              trade: trade.trade,
              item_text: item.item_text,
              drawing_ref: item.drawing_ref,
              notes: item.notes,
              is_fbo: item.is_fbo,
              is_by_others: item.is_by_others,
              lead_time_flag: item.lead_time_flag,
              sort_order: (totalItemsCreated + tradeIdx * 100 + itemIdx),
              created_by_ai: true,
              ai_confidence: item.confidence,
              published: false,
            }))
          );

          if (scopeItems.length) {
            await supabase.from("scope_items").insert(scopeItems);
            totalItemsCreated += scopeItems.length;
          }

          // Handle reference bid if present
          if (extraction.reference_bid) {
            await supabase.from("reference_bids").insert({
              id: uuid(),
              project_id,
              document_id: doc.id,
              trade: extraction.trades[0]?.trade ?? "other",
              company_name: extraction.reference_bid.company_name,
              total_bid_amount: extraction.reference_bid.total_bid_amount,
              inclusions: extraction.reference_bid.inclusions,
              exclusions: extraction.reference_bid.exclusions,
              parsed_at: new Date().toISOString(),
            });
          }

          // Mark this document as processed
          await supabase
            .from("project_documents")
            .update({ ai_processed: true, ai_processed_at: new Date().toISOString() })
            .eq("id", doc.id);

          sendProgress(`Completed ${doc.file_name} (${scopeItems.length} items)`, docPctBase + docPctRange);
        }

        sendProgress("Done!", 100);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, scope_items_created: totalItemsCreated })}\n\n`));
      } catch (err) {
        console.error("AI extraction error:", err);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err instanceof Error ? err.message : "Extraction failed" })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { project_id } = await req.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  await supabase
    .from("project_documents")
    .update({ ai_processed: false, ai_processed_at: null })
    .eq("project_id", project_id);

  await supabase
    .from("scope_items")
    .delete()
    .eq("project_id", project_id)
    .eq("created_by_ai", true);

  return new Response(JSON.stringify({ reset: true }));
}
