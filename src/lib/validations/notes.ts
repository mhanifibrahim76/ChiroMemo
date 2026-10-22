import { z } from "zod";

const emptyStringToNull = (val: unknown) => {
  if (typeof val === "string" && (val.trim() === "" || val === "none")) return null;
  return val;
};

export const createNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title is too long (maximum 200 characters)"),
  content: z.string().default(""),
  tags: z
    .array(z.string().trim().min(1).max(50))
    .optional()
    .default([]),
  resource_id: z.preprocess(
    emptyStringToNull,
    z.string().trim().nullable().optional()
  ),
  step_id: z.preprocess(
    emptyStringToNull,
    z.string().trim().nullable().optional()
  ),
});

export const updateNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title is too long (maximum 200 characters)")
    .optional(),
  content: z.string().optional(),
  tags: z.array(z.string().trim().min(1).max(50)).optional(),
  resource_id: z.preprocess(
    emptyStringToNull,
    z.string().trim().nullable().optional()
  ),
  step_id: z.preprocess(
    emptyStringToNull,
    z.string().trim().nullable().optional()
  ),
});

export const noteIdSchema = z.string().min(1, "Note ID is required");

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type NoteId = z.infer<typeof noteIdSchema>;

