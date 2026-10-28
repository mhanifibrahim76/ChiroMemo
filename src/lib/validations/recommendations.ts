import { z } from "zod";

export const recommendationPrioritySchema = z.enum(["HIGH", "MEDIUM", "LOW"]);
export type RecommendationPriority = z.infer<typeof recommendationPrioritySchema>;

export const recommendationCategorySchema = z.enum([
  "NEXT_STEP",       // Immediate roadmap milestone or goal action
  "KNOWLEDGE_GAP",   // Missing notes/resources for an active goal
  "REVIEW_RECALL",   // Spaced repetition review for older notes/summaries
  "STUDY_STRATEGY",  // Study habit, pacing, or exam readiness tip
]);
export type RecommendationCategory = z.infer<typeof recommendationCategorySchema>;

export const recommendationItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  category: recommendationCategorySchema,
  priority: recommendationPrioritySchema,
  description: z.string().min(1),
  actionLabel: z.string().min(1),
  actionHref: z.string().min(1),
  targetEntity: z
    .object({
      type: z.enum(["GOAL", "ROADMAP", "NOTE", "RESOURCE", "SUMMARY", "GENERAL"]),
      id: z.string().optional(),
      title: z.string().optional(),
    })
    .optional(),
  reasoning: z
    .string()
    .describe("Explanation of why this study action is recommended right now based on student activity."),
});

export type RecommendationItem = z.infer<typeof recommendationItemSchema>;

export const geminiRecommendationsSchema = z.object({
  overallAssessment: z
    .string()
    .describe("A 2-3 sentence overview assessing the student's current learning momentum and study balance."),
  keyFocusArea: z
    .string()
    .describe("The single most impactful subject or milestone the student should dedicate their next study session to."),
  recommendations: z
    .array(recommendationItemSchema)
    .min(2)
    .max(6)
    .describe("2 to 6 prioritized, actionable study recommendations."),
});

export type GeminiRecommendations = z.infer<typeof geminiRecommendationsSchema>;

export interface StudentAcademicProfile {
  activeGoals: { id: string; title: string; status: string; priority: number }[];
  activeRoadmaps: { id: string; title: string; progressPercent: number; pendingStepTitle?: string }[];
  recentNotes: { id: string; title: string; tags: string[]; updatedAt: string }[];
  recentResources: { id: string; title: string; type: string; hasNotes: boolean }[];
  summariesCount: number;
  recentActivityTypes: string[];
  daysSinceLastActivity: number;
}

