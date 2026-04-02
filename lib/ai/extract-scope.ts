import Anthropic from "@anthropic-ai/sdk";
import type { AiScopeExtraction } from "@/lib/types";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are a construction scope extraction specialist.
Read the provided construction documents and extract a structured scope checklist
for each trade. Output ONLY valid JSON matching the provided schema.
Do not include any text outside the JSON object.`;

const EXTRACTION_PROMPT = `Analyze all provided construction documents and produce a unified scope checklist.

For each scope item:
- Group by trade: electrical, plumbing, hvac, civil, carpentry, glazing, masonry, fire_protection, elevator, other
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

export async function extractScope(
  documents: { base64Data: string; fileName: string }[]
): Promise<AiScopeExtraction> {
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

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }

  return JSON.parse(textBlock.text) as AiScopeExtraction;
}
