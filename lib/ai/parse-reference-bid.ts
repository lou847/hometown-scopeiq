import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are a construction bid proposal parser.
Read the provided bid proposal PDF and extract structured data.
Output ONLY valid JSON. Do not include any text outside the JSON object.`;

const PARSE_PROMPT = `Parse this existing bid proposal and extract:
- company_name: the bidding company
- total_bid_amount: total bid dollar amount (number or null if not stated)
- inclusions: array of { item, drawing_ref? } — every scope item explicitly included
- exclusions: array of { item, note? } — every scope item explicitly excluded, with exact exclusion language
- carve_outs: array of strings — any qualifications, assumptions, or carve-outs

Output JSON matching this schema:
{
  "company_name": "<string>",
  "total_bid_amount": null,
  "inclusions": [{ "item": "<description>", "drawing_ref": "<optional>" }],
  "exclusions": [{ "item": "<description>", "note": "<exclusion language>" }],
  "carve_outs": ["<string>"]
}`;

export interface ParsedReferenceBid {
  company_name: string;
  total_bid_amount: number | null;
  inclusions: { item: string; drawing_ref?: string }[];
  exclusions: { item: string; note?: string }[];
  carve_outs: string[];
}

export async function parseReferenceBid(
  base64Data: string
): Promise<ParsedReferenceBid> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64Data,
            },
          },
          { type: "text", text: PARSE_PROMPT },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }

  return JSON.parse(textBlock.text) as ParsedReferenceBid;
}
