import { z } from "zod";

export const RESOURCE_TYPES = ["PDF", "VIDEO", "WEBSITE", "BOOK", "COURSE"] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

const emptyStringToNull = (val: unknown) => {
  if (typeof val === "string" && val.trim() === "") return null;
  return val;
};

const optionalUrl = z.preprocess(
  emptyStringToNull,
  z.string().trim().url("Invalid URL format (must include http:// or https://)").nullable().optional()
);

const optionalString = (max: number, errorMsg: string) =>
  z.preprocess(emptyStringToNull, z.string().trim().max(max, errorMsg).nullable().optional());

const optionalGoalId = z.preprocess(
  (val) => (val === "" || val === "none" || val === undefined ? null : val),
  z.string().trim().nullable().optional()
);

export const createResourceSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  type: z.enum(RESOURCE_TYPES, {
    message: "Please select a valid resource type",
  }),
  url: optionalUrl,
  file_path: optionalString(500, "File path is too long"),
  category: optionalString(100, "Category is too long"),
  description: optionalString(5000, "Description is too long"),
  author: optionalString(200, "Author name is too long"),
  goal_id: optionalGoalId,
  step_ids: z.array(z.string()).optional(),
});

export const updateResourceSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long").optional(),
  type: z
    .enum(RESOURCE_TYPES, {
      message: "Please select a valid resource type",
    })
    .optional(),
  url: optionalUrl,
  file_path: optionalString(500, "File path is too long"),
  category: optionalString(100, "Category is too long"),
  description: optionalString(5000, "Description is too long"),
  author: optionalString(200, "Author name is too long"),
  goal_id: optionalGoalId,
  is_archived: z.boolean().optional(),
  step_ids: z.array(z.string()).optional(),
});

export const resourceIdSchema = z.string().min(1, "Resource ID is required");

export const stepResourceAssociationSchema = z.object({
  step_id: z.string().min(1, "Step ID is required"),
  resource_id: z.string().min(1, "Resource ID is required"),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type ResourceId = z.infer<typeof resourceIdSchema>;
export type StepResourceAssociationInput = z.infer<typeof stepResourceAssociationSchema>;
