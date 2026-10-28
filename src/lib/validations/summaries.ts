import { z } from "zod";

/**
 * Validation schema for triggering an AI document summarization.
 * Requires either a valid resourceId or direct text content.
 */
export const generateSummarySchema = z
  .object({
    resourceId: z.string().trim().optional().or(z.literal("")).nullable(),
    text: z.string().trim().optional().or(z.literal("")).nullable(),
    title: z.string().trim().max(255).optional().or(z.literal("")).nullable(),
  })
  .refine(
    (data) => {
      const hasResource = Boolean(data.resourceId && data.resourceId.trim().length > 0);
      const hasText = Boolean(data.text && data.text.trim().length > 0);
      return hasResource || hasText;
    },
    {
      message: "Please select a resource or provide text content to summarize.",
      path: ["text"],
    }
  );

export type GenerateSummaryInput = z.infer<typeof generateSummarySchema>;

/**
 * Validation schema for the structured JSON response returned by Gemini AI.
 * Ensures untrusted AI output strictly adheres to the required contract.
 */
export const geminiSummaryResultSchema = z.object({
  overview: z
    .string()
    .min(1, "Overview is required from AI")
    .describe("A concise 2-4 sentence executive overview of the document"),
  keyPoints: z
    .array(z.string().min(1))
    .min(1, "At least one key point is required")
    .max(15)
    .describe("List of core key concepts, theories, or pivotal findings"),
  detailedSummary: z
    .string()
    .min(1, "Detailed summary is required")
    .describe("Comprehensive structured summary in GitHub Flavored Markdown"),
  actionableTakeaways: z
    .array(z.string().min(1))
    .default([])
    .describe("2-4 concrete next steps or study tips for a student"),
});

export type GeminiSummaryResult = z.infer<typeof geminiSummaryResultSchema>;

/**
 * Schema for exporting an existing summary into a Personal Note.
 */
export const exportSummaryToNoteSchema = z.object({
  summaryId: z.string().min(1, "Summary ID is required"),
  targetTitle: z.string().max(255).optional(),
});

export type ExportSummaryToNoteInput = z.infer<typeof exportSummaryToNoteSchema>;

