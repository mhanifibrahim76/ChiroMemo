import { z } from "zod";

import type { Database } from "@/lib/supabase/database.types";

type GoalStatus = Database["public"]["Enums"]["GoalStatus"];

const goalStatusValues: [GoalStatus, ...GoalStatus[]] = ["ACTIVE", "COMPLETED", "ARCHIVED"];

/**
 * Sanitizes target_date input from browser <input type="date"> (YYYY-MM-DD),
 * empty strings, or ISO datetime strings into a clean ISO 8601 string or null.
 */
const sanitizeTargetDate = (val: unknown) => {
  if (val === null || val === undefined) return null;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed === "" || trimmed === "none") return null;
    // HTML <input type="date"> format: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return new Date(`${trimmed}T00:00:00.000Z`).toISOString();
    }
    // General parseable date
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  }
  return val;
};

export const createGoalSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().trim().max(5000, "Description is too long").optional().nullable(),
  target_date: z.preprocess(
    sanitizeTargetDate,
    z.string().datetime().nullable().optional()
  ),
  priority: z.number().int().min(0).optional().default(0),
  status: z.enum(goalStatusValues).optional().default("ACTIVE"),
});

export const updateGoalSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long").optional(),
  description: z.string().trim().max(5000, "Description is too long").optional().nullable(),
  target_date: z.preprocess(
    sanitizeTargetDate,
    z.string().datetime().nullable().optional()
  ),
  priority: z.number().int().min(0).optional(),
  status: z.enum(goalStatusValues).optional(),
});

export const goalIdSchema = z.string().min(1, "Goal ID is required");

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type GoalId = z.infer<typeof goalIdSchema>;
