import { readFileSync } from "fs";
import { resolve } from "path";
import Anthropic from "@anthropic-ai/sdk";
import { jsonrepair } from "jsonrepair";
import type { AiScopeExtraction } from "@/lib/types";

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

const SYSTEM_PROMPT = `You are a construction scope extraction specialist.
Read the provided construction documents and extract a structured scope checklist
for each trade. Output ONLY valid JSON matching the provided schema.
Do not include any text outside the JSON object.`;

const EXTRACTION_PROMPT = `Analyze all provided construction documents and produce a unified scope checklist.

For each scope item:
- Group by trade: electrical, plumbing, hvac, civil, carpentry, glazing, masonry, fire_protection, elevator, painting, drywall, flooring, roofing, concrete, demolition, insulation, signage, other
- IMPORTANT: Look carefully for ALL trades in the drawings, including finishes (painting, flooring, drywall), sitework (concrete, demolition, civil), and specialty (signage, insulation, roofing). These are often found in architectural sheets (A-series), finish schedules, and specification notes — not just the MEP sheets.
- Write a clear, specific scope description
- Note the drawing sheet reference (e.g. "E4.0, E5.0")
- Flag items marked FBO (furnished by owner — connection only)
- Flag items marked "by others" or "by owner"
- Flag items with known lead times
- Rate your confidence: high (clearly stated), medium (inferred from context), low (uncertain)

If any document is an existing bid proposal (not drawings/specs), extract it as a
separate "reference_bid" object with company_name, total_bid_amount, inclusions, and exclusions.

Output JSON matching this schema:
{
  "trades": [
    {
      "trade": "<trade enum>",
      "items": [
        {
          "item_text": "<scope description>",
          "drawing_ref": "<sheet references or null>",
          "is_fbo": false,
          "is_by_others": false,
          "lead_time_flag": false,
          "confidence": "high",
          "notes": "<optional note or null>"
        }
      ]
    }
  ],
  "reference_bid": null
}`;

export type ProgressCallback = (phase: string, pct: number) => void;

export async function extractScope(
  documents: { base64Data: string; fileName: string }[],
  onProgress?: ProgressCallback
): Promise<AiScopeExtraction> {
  onProgress?.("Preparing documents...", 5);

  const content: Anthropic.ContentBlockParam[] = [
    ...documents.map(
      (doc) =>
        ({
          type: "document" as const,
          source: {
            type: "base64" as const,
            media_type: "application/pdf" as const,
            data: doc.base64Data,
          },
        })
    ),
    { type: "text", text: EXTRACTION_PROMPT },
  ];

  onProgress?.("Sending to AI...", 10);

  const stream = getClient().messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 32000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
  });

  // Track streaming progress based on output tokens
  let tokenCount = 0;
  const estimatedTokens = documents.length * 4000; // rough estimate per doc

  stream.on("text", (text) => {
    tokenCount += text.length / 4; // ~4 chars per token
    const pct = Math.min(95, 10 + Math.round((tokenCount / estimatedTokens) * 85));
    onProgress?.("AI analyzing drawings...", pct);
  });

  const response = await stream.finalMessage();

  onProgress?.("Parsing results...", 96);

  if (response.stop_reason === "max_tokens") {
    throw new Error("AI output was truncated — try uploading fewer pages at once");
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }

  let jsonText = textBlock.text.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  onProgress?.("Saving scope items...", 98);

  try {
    return JSON.parse(jsonText) as AiScopeExtraction;
  } catch {
    const repaired = jsonrepair(jsonText);
    return JSON.parse(repaired) as AiScopeExtraction;
  }
}
