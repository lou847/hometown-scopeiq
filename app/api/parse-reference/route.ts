import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseReferenceBid } from "@/lib/ai/parse-reference-bid";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { document_id, project_id, trade } = await req.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Download the document
  const { data: doc } = await supabase
    .from("project_documents")
    .select("*")
    .eq("id", document_id)
    .single();

  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  const { data: fileData } = await supabase.storage
    .from("documents")
    .download(doc.file_url);

  if (!fileData) return NextResponse.json({ error: "File download failed" }, { status: 500 });

  const buffer = Buffer.from(await fileData.arrayBuffer());
  const base64Data = buffer.toString("base64");

  const parsed = await parseReferenceBid(base64Data);

  const referenceBid = {
    id: uuid(),
    project_id,
    document_id,
    trade,
    company_name: parsed.company_name,
    total_bid_amount: parsed.total_bid_amount,
    inclusions: parsed.inclusions,
    exclusions: parsed.exclusions,
    parsed_at: new Date().toISOString(),
  };

  await supabase.from("reference_bids").insert(referenceBid);

  return NextResponse.json(referenceBid);
}
