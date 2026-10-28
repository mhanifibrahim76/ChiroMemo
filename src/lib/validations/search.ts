import { z } from "zod";

export const searchEntityTypeSchema = z.enum([
  "ALL",
  "NOTE",
  "RESOURCE",
  "SUMMARY",
  "GOAL",
  "ROADMAP",
]);

export type SearchEntityType = z.infer<typeof searchEntityTypeSchema>;

export const searchQueryParamsSchema = z.object({
  q: z.string().trim().max(200).optional().default(""),
  type: searchEntityTypeSchema.optional().default("ALL"),
});

export type SearchQueryParams = z.infer<typeof searchQueryParamsSchema>;

export interface SearchResultItem {
  id: string;
  type: SearchEntityType;
  title: string;
  snippet: string;
  href: string;
  updatedAt: string;
  metadata?: {
    tags?: string[];
    resourceType?: string;
    goalStatus?: string;
    progressPercent?: number;
    author?: string | null;
  };
  relevanceReason?: string;
  score?: number;
}

export const geminiSearchSynthesisSchema = z.object({
  directAnswer: z
    .string()
    .describe(
      "A concise, educational 2-4 sentence synthesized answer answering the student's query based directly on their study materials."
    ),
  keyInsights: z
    .array(z.string())
    .max(4)
    .describe("1-3 key conceptual takeaways or connection points between the items."),
  rankedItemExplanations: z
    .array(
      z.object({
        id: z.string(),
        relevanceExplanation: z
          .string()
          .describe("A short phrase explaining why this specific item answers the query."),
        relevanceScore: z.number().min(0).max(100),
      })
    )
    .describe("Relevance evaluations and scores for the provided items."),
  suggestedFollowUps: z
    .array(z.string())
    .max(3)
    .describe("2-3 smart follow-up study questions or search queries."),
});

export type GeminiSearchSynthesis = z.infer<typeof geminiSearchSynthesisSchema>;

export interface SearchExecutionResult {
  query: string;
  activeType: SearchEntityType;
  items: SearchResultItem[];
  totalMatches: number;
  synthesis: GeminiSearchSynthesis | null;
  modelUsed?: string;
}

