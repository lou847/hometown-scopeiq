import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractScope } from "@/lib/ai/extract-scope";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { project_id } = await req.json();

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch unprocessed documents
  const { data: documents } = await supabase
    .from("project_documents")
    .select("*")
    .eq("project_id", project_id)
    .eq("ai_processed", false);

  if (!documents?.length) {
    return NextResponse.json({ error: "No unprocessed documents" }, { status: 400 });
  }

  // Download PDFs and convert to base64
  const pdfDocuments = await Promise.all(
    documents.map(async (doc) => {
      const { data } = await supabase.storage
        .from("documents")
        .download(doc.file_url);
      if (!data) throw new Error(`Failed to download ${doc.file_name}`);
      const buffer = Buffer.from(await data.arrayBuffer());
      return { base64Data: buffer.toString("base64"), fileName: doc.file_name };
    })
  );

  // Call AI extraction
  const extraction = await extractScope(pdfDocuments);

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
      sort_order: tradeIdx * 100 + itemIdx,
      created_by_ai: true,
      ai_confidence: item.confidence,
      published: false,
    }))
  );

  if (scopeItems.length) {
    await supabase.from("scope_items").insert(scopeItems);
  }

  // Handle reference bid if present
  if (extraction.reference_bid) {
    const refDoc = documents.find((d) => d.document_type === "reference_bid");
    await supabase.from("reference_bids").insert({
      id: uuid(),
      project_id,
      document_id: refDoc?.id ?? documents[0].id,
      trade: extraction.trades[0]?.trade ?? "other",
      company_name: extraction.reference_bid.company_name,
      total_bid_amount: extraction.reference_bid.total_bid_amount,
      inclusions: extraction.reference_bid.inclusions,
      exclusions: extraction.reference_bid.exclusions,
      parsed_at: new Date().toISOString(),
    });
  }

  // Mark documents as processed
  await supabase
    .from("project_documents")
    .update({ ai_processed: true, ai_processed_at: new Date().toISOString() })
    .in("id", documents.map((d) => d.id));

  return NextResponse.json({
    scope_items_created: scopeItems.length,
    trades: extraction.trades.map((t) => t.trade),
    has_reference_bid: !!extraction.reference_bid,
  });
}
