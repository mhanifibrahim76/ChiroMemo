import "server-only";

import { GoogleGenAI } from "@google/genai";
import { getServerEnv } from "@/lib/env";
import {
  geminiSummaryResultSchema,
  type GeminiSummaryResult,
} from "@/lib/validations/summaries";

/** Maximum characters passed to Gemini to prevent unbounded memory and latency */
const MAX_DOCUMENT_CHARACTERS = 120_000;

const SYSTEM_INSTRUCTION = `You are an expert academic tutor and learning analyst in ChiroMemo, a Personal Learning and Knowledge Management System (PLKMS) designed for university students.
Your task is to analyze the provided learning material (lecture notes, academic paper, textbook excerpt, study guide) and generate a high-yield, structured academic summary.

You MUST respond strictly with a valid JSON object matching the following schema:
{
  "overview": "A concise 2-4 sentence executive overview explaining the subject, thesis, and core purpose of the material.",
  "keyPoints": [
    "Key concept 1: explanation",
    "Key concept 2: explanation",
    "Key concept 3: explanation"
  ],
  "detailedSummary": "A comprehensive, structured summary in GitHub Flavored Markdown format using ## and ### headings, bullet points, bold keywords, and clear academic explanations.",
  "actionableTakeaways": [
    "Practical study recommendation 1",
    "Practical study recommendation 2"
  ]
}

Guidelines:
- Maintain an objective, educational, and encouraging academic tone.
- Extract between 3 and 7 high-impact key points.
- Highlight important formulas, definitions, or critical terminology.
- Make the detailed summary clear, thorough, and easy to review before an exam.
- Do NOT wrap the JSON in Markdown code fences (e.g. no \`\`\`json). Output pure parseable JSON only.`;

/**
 * Initializes and returns an authenticated GoogleGenAI client instance.
 * Validates that GEMINI_API_KEY is not a template placeholder.
 */
export function getGeminiClient(): GoogleGenAI {
  const env = getServerEnv();
  const rawKey = env.GEMINI_API_KEY?.trim();

  if (
    !rawKey ||
    rawKey === "YOUR_GEMINI_API_KEY" ||
    rawKey.startsWith("YOUR_") ||
    rawKey.length < 10
  ) {
    throw new Error(
      "Gemini API key is not configured or is using a placeholder. Please set a valid GEMINI_API_KEY in your .env.local file to use AI features."
    );
  }

  return new GoogleGenAI({ apiKey: rawKey });
}

export interface SummarizeDocumentOptions {
  text: string;
  title?: string | null;
  documentType?: string | null;
}

export interface GeneratedSummaryPayload {
  overview: string;
  keyPoints: string[];
  detailedSummary: string;
  actionableTakeaways: string[];
  formattedContent: string;
  model: string;
}

/**
 * Normalizes and truncates document text for AI prompt injection.
 */
function prepareDocumentText(rawText: string): string {
  const trimmed = rawText.trim();
  if (trimmed.length <= MAX_DOCUMENT_CHARACTERS) {
    return trimmed;
  }
  return (
    trimmed.slice(0, MAX_DOCUMENT_CHARACTERS) +
    "\n\n[...Document truncated for optimal AI processing...]"
  );
}

/**
 * Assembles a unified Markdown document from the validated summary parts.
 */
function assembleFormattedMarkdown(result: GeminiSummaryResult): string {
  const sections: string[] = [];

  sections.push(`## Overview\n\n${result.overview}`);

  if (result.keyPoints.length > 0) {
    const pointsList = result.keyPoints.map((kp) => `- ${kp}`).join("\n");
    sections.push(`## Key Concepts & Highlights\n\n${pointsList}`);
  }

  sections.push(`## Detailed Summary\n\n${result.detailedSummary}`);

  if (result.actionableTakeaways && result.actionableTakeaways.length > 0) {
    const takeawaysList = result.actionableTakeaways
      .map((t) => `- ${t}`)
      .join("\n");
    sections.push(`## Actionable Study Takeaways\n\n${takeawaysList}`);
  }

  return sections.join("\n\n");
}

import { parseGeminiJson } from "./parser";
export { parseGeminiJson };

/**
 * Calls Gemini AI to summarize a document using structured JSON output
 * validated via Zod schemas.
 */
export async function generateDocumentSummary(
  options: SummarizeDocumentOptions
): Promise<GeneratedSummaryPayload> {
  const { text, title, documentType } = options;

  if (!text || text.trim().length === 0) {
    throw new Error("No text content provided to summarize.");
  }

  const ai = getGeminiClient();
  const preparedText = prepareDocumentText(text);

  const prompt = [
    `Document Title: ${title || "Untitled Document"}`,
    documentType ? `Document Type: ${documentType}` : "",
    "",
    "--- DOCUMENT CONTENT BEGIN ---",
    preparedText,
    "--- DOCUMENT CONTENT END ---",
  ]
    .filter(Boolean)
    .join("\n");

  const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let lastError: Error | null = null;
  let successfulModel = "";
  let rawResponseText = "";

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      if (response && response.text) {
        rawResponseText = response.text;
        successfulModel = model;
        break;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      lastError = err instanceof Error ? err : new Error(message);

      // If error indicates invalid API key, do not retry with other models
      if (
        message.toLowerCase().includes("api key not valid") ||
        message.toLowerCase().includes("invalid_argument") ||
        message.toLowerCase().includes("api_key_invalid")
      ) {
        throw new Error(
          "Invalid Gemini API key. Please check your GEMINI_API_KEY in .env.local."
        );
      }

      // If quota exceeded
      if (
        message.toLowerCase().includes("quota") ||
        message.toLowerCase().includes("resource_exhausted")
      ) {
        throw new Error(
          "Gemini API rate limit or quota exceeded. Please try again shortly or check your Google Cloud quota."
        );
      }

      // Otherwise try next model in fallback list
      continue;
    }
  }

  if (!rawResponseText || !successfulModel) {
    throw (
      lastError ||
      new Error(
        "Could not generate summary: Gemini API returned an empty response."
      )
    );
  }

  // Parse and validate AI output with Zod
  let parsedJson: unknown;
  try {
    parsedJson = parseGeminiJson(rawResponseText);
  } catch {
    throw new Error(
      "AI response was not valid JSON. Please try regenerating the summary."
    );
  }

  const validation = geminiSummaryResultSchema.safeParse(parsedJson);
  if (!validation.success) {
    // If structured parse fails slightly, fall back to safe extracted content
    const issues = validation.error.issues.map((i) => i.message).join(", ");
    throw new Error(`AI generated response failed validation: ${issues}`);
  }

  const validatedData = validation.data;
  const formattedContent = assembleFormattedMarkdown(validatedData);

  return {
    overview: validatedData.overview,
    keyPoints: validatedData.keyPoints,
    detailedSummary: validatedData.detailedSummary,
    actionableTakeaways: validatedData.actionableTakeaways,
    formattedContent,
    model: successfulModel,
  };
}

