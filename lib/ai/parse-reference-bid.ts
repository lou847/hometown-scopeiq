import { readFileSync } from "fs";
import { resolve } from "path";
import Anthropic from "@anthropic-ai/sdk";

function getApiKey(): string {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  const match = envFile.match(/^ANTHROPIC_API_KEY=(.+)$/m);
  if (!match) throw new Error("ANTHROPIC_API_KEY not found in .env.local");
  return match[1].trim();
}

function getClient() {
  return new Anthropic({ apiKey: getApiKey() });
}

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
  const response = await getClient().messages.create({
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

  let jsonText = textBlock.text.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  return JSON.parse(jsonText) as ParsedReferenceBid;
}
