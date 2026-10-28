/**
 * Parses JSON responses from Gemini AI, removing markdown code fences (```json...```)
 * and surrounding whitespace if present.
 */
export function parseGeminiJson(rawText: string): unknown {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/i, "").trim();
  }
  return JSON.parse(cleaned);
}

