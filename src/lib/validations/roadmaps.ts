import { z } from "zod";

import type { Database } from "@/lib/supabase/database.types";

type RoadmapStepStatus = Database["public"]["Enums"]["RoadmapStepStatus"];

const roadmapStepStatusValues: [RoadmapStepStatus, ...RoadmapStepStatus[]] = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
];

export const createRoadmapSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().trim().max(5000, "Description is too long").optional().nullable(),
  goalIds: z.array(z.string().uuid("Invalid goal ID format")).optional().default([]),
});

export const updateRoadmapSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long").optional(),
  description: z.string().trim().max(5000, "Description is too long").optional().nullable(),
});

export const roadmapIdSchema = z.string().uuid("Invalid roadmap ID format");

export const createStepSchema = z.object({
  roadmapId: z.string().uuid("Invalid roadmap ID format"),
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().trim().max(5000, "Description is too long").optional().nullable(),
  order: z.number().int().min(0).optional(),
});

export const updateStepSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long").optional(),
  description: z.string().trim().max(5000, "Description is too long").optional().nullable(),
  status: z.enum(roadmapStepStatusValues).optional(),
});

export const stepIdSchema = z.string().uuid("Invalid step ID format");

export const reorderStepsSchema = z.object({
  roadmapId: z.string().uuid("Invalid roadmap ID format"),
  steps: z.array(
    z.object({
      id: z.string().uuid("Invalid step ID format"),
      order: z.number().int().min(0),
    })
  ).min(1),
});

export const associateGoalRoadmapSchema = z.object({
  goalId: z.string().uuid("Invalid goal ID format"),
  roadmapId: z.string().uuid("Invalid roadmap ID format"),
});

export const removeGoalRoadmapSchema = z.object({
  goalId: z.string().uuid("Invalid goal ID format"),
  roadmapId: z.string().uuid("Invalid roadmap ID format"),
});

export type CreateRoadmapInput = z.infer<typeof createRoadmapSchema>;
export type UpdateRoadmapInput = z.infer<typeof updateRoadmapSchema>;
export type RoadmapId = z.infer<typeof roadmapIdSchema>;
export type CreateStepInput = z.infer<typeof createStepSchema>;
export type UpdateStepInput = z.infer<typeof updateStepSchema>;
export type StepId = z.infer<typeof stepIdSchema>;
export type ReorderStepsInput = z.infer<typeof reorderStepsSchema>;
export type AssociateGoalRoadmapInput = z.infer<typeof associateGoalRoadmapSchema>;
export type RemoveGoalRoadmapInput = z.infer<typeof removeGoalRoadmapSchema>;