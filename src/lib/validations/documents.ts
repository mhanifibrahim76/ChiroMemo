import { z } from "zod";

/**
 * Maximum file upload limit: 10 Megabytes
 */
export const MAX_DOCUMENT_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

/**
 * Allowed MIME types for document uploads
 */
export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "text/plain",
] as const;

/**
 * Allowed file extensions
 */
export const ALLOWED_DOCUMENT_EXTENSIONS = [".pdf", ".txt"] as const;

/**
 * Zod schema for validating document metadata fields
 */
export const documentMetadataSchema = z.object({
  title: z
    .string()
    .trim()
    .max(200, "Title must be 200 characters or less")
    .optional()
    .or(z.literal("")),
  goalId: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  category: z
    .string()
    .trim()
    .max(50, "Category must be 50 characters or less")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or less")
    .optional()
    .or(z.literal("")),
});

export type DocumentMetadataInput = z.infer<typeof documentMetadataSchema>;

/**
 * Validates a client-submitted File object before processing.
 */
export function validateDocumentFile(file: unknown): {
  valid: boolean;
  error?: string;
  file?: File;
} {
  if (!file || !(file instanceof File)) {
    return { valid: false, error: "Please select a valid document file." };
  }

  if (file.size === 0) {
    return { valid: false, error: "The uploaded file is empty (0 bytes)." };
  }

  if (file.size > MAX_DOCUMENT_FILE_SIZE) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeInMb} MB) exceeds the maximum allowed limit of 10 MB.`,
    };
  }

  const nameLower = file.name.toLowerCase();
  const hasValidExt = ALLOWED_DOCUMENT_EXTENSIONS.some((ext) =>
    nameLower.endsWith(ext)
  );

  const hasValidMime =
    ALLOWED_DOCUMENT_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number]
    ) ||
    // Some browsers send application/octet-stream or empty type for text files
    (hasValidExt && (!file.type || file.type === "application/octet-stream"));

  if (!hasValidExt || !hasValidMime) {
    return {
      valid: false,
      error: "Unsupported file type. Only PDF (.pdf) and plain text (.txt) files are supported.",
    };
  }

  return { valid: true, file };
}

