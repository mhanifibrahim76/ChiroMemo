import { z } from "zod";

import type { Database } from "@/lib/supabase/database.types";

type GoalStatus = Database["public"]["Enums"]["GoalStatus"];

const goalStatusValues: [GoalStatus, ...GoalStatus[]] = ["ACTIVE", "COMPLETED", "ARCHIVED"];

export const createGoalSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().trim().max(5000, "Description is too long").optional().nullable(),
  target_date: z.string().datetime({ offset: true }).nullable().optional(),
  priority: z.number().int().min(0).optional().default(0),
  status: z.enum(goalStatusValues).optional().default("ACTIVE"),
});

export const updateGoalSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long").optional(),
  description: z.string().trim().max(5000, "Description is too long").optional().nullable(),
  target_date: z.string().datetime({ offset: true }).nullable().optional(),
  priority: z.number().int().min(0).optional(),
  status: z.enum(goalStatusValues).optional(),
});

export const goalIdSchema = z.string().uuid("Invalid goal ID format");

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type GoalId = z.infer<typeof goalIdSchema>;