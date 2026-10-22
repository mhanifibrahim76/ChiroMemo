"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  validateDocumentFile,
  documentMetadataSchema,
} from "@/lib/validations/documents";
import { extractDocumentText } from "@/lib/pdf";
import { recordLearningActivity } from "@/lib/dashboard";
import type { DocumentActionState } from "@/lib/documents/constants";

/**
 * Sanitizes a filename for safe object storage.
 */
function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "_")
    .replace(/_+/g, "_");
}

/**
 * Server Action: Uploads a document (PDF / TXT), extracts its text on the server,
 * stores the file in Supabase Storage ("documents" bucket), and registers it
 * in the public.resources table.
 */
export async function uploadDocumentAction(
  prevState: DocumentActionState,
  formData: FormData
): Promise<DocumentActionState> {
  try {
    const user = await requireUser();
    const supabase = await createClient();

    // 1. Validate File
    const rawFile = formData.get("file");
    const fileValidation = validateDocumentFile(rawFile);
    if (!fileValidation.valid || !fileValidation.file) {
      return {
        success: false,
        error: fileValidation.error || "Invalid file uploaded.",
      };
    }

    const file = fileValidation.file;

    // 2. Validate Metadata fields
    const rawMetadata = {
      title: formData.get("title")?.toString(),
      goalId: formData.get("goalId")?.toString(),
      category: formData.get("category")?.toString(),
      description: formData.get("description")?.toString(),
    };

    const parsedMeta = documentMetadataSchema.safeParse(rawMetadata);
    if (!parsedMeta.success) {
      return {
        success: false,
        error: "Validation failed. Please verify the form fields.",
        fieldErrors: parsedMeta.error.flatten().fieldErrors,
      };
    }

    // 3. Read Buffer & Extract Text on Server
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extracted;
    try {
      extracted = await extractDocumentText({
        buffer,
        fileName: file.name,
        mimeType: file.type,
      });
    } catch (extractError) {
      const msg =
        extractError instanceof Error
          ? extractError.message
          : "Failed to extract text from document.";
      return {
        success: false,
        error: msg,
      };
    }

    // 4. Upload to Supabase Storage: `${user.id}/${Date.now()}-${safeName}`
    const safeName = sanitizeFileName(file.name);
    const storagePath = `${user.id}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        error: `Could not save file to storage: ${uploadError.message}`,
      };
    }

    // 5. Determine resource title & type
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    const title =
      parsedMeta.data.title && parsedMeta.data.title.trim().length > 0
        ? parsedMeta.data.title.trim()
        : extracted.title || fileNameWithoutExt;

    const isPdf = file.name.toLowerCase().endsWith(".pdf");
    const resourceType = isPdf ? "PDF" : "WEBSITE"; // Schema ResourceType supports PDF
    const resourceId = crypto.randomUUID();

    const category =
      parsedMeta.data.category && parsedMeta.data.category.trim().length > 0
        ? parsedMeta.data.category.trim()
        : isPdf
        ? "PDF Document"
        : "Text Document";

    const description =
      parsedMeta.data.description && parsedMeta.data.description.trim().length > 0
        ? parsedMeta.data.description.trim()
        : `Uploaded document (${extracted.pageCount} ${
            extracted.pageCount === 1 ? "page" : "pages"
          }, ${extracted.wordCount} words)`;

    // 6. Insert into public.resources
    // Defensive query to handle DBs that may not yet have category or extracted_text columns applied
    const basePayload: Record<string, unknown> = {
      id: resourceId,
      user_id: user.id,
      goal_id: parsedMeta.data.goalId ?? null,
      title,
      type: resourceType,
      file_path: storagePath,
      author: extracted.author ?? null,
      description,
      is_archived: false,
    };

    // Attempt 1: Full payload with category and extracted_text
    const fullPayload = {
      ...basePayload,
      category,
      extracted_text: extracted.text,
    };

    const { error: insertError } = await supabase
      .from("resources")
      .insert(fullPayload as never);

    if (insertError) {
      // Fallback 1: Without extracted_text if column doesn't exist
      if (
        insertError.code === "42703" &&
        insertError.message.toLowerCase().includes("extracted_text")
      ) {
        const payloadNoExtracted = {
          ...basePayload,
          category,
        };
        const { error: fallbackError1 } = await supabase
          .from("resources")
          .insert(payloadNoExtracted as never);

        if (fallbackError1) {
          // Fallback 2: Without category and without extracted_text
          const { error: fallbackError2 } = await supabase
            .from("resources")
            .insert(basePayload as never);

          if (fallbackError2) {
            return {
              success: false,
              error: `Database insertion failed: ${fallbackError2.message}`,
            };
          }
        }
      } else if (
        insertError.code === "42703" &&
        insertError.message.toLowerCase().includes("category")
      ) {
        // Fallback without category
        const payloadNoCat = {
          ...basePayload,
          extracted_text: extracted.text,
        };
        const { error: fallbackErrorCat } = await supabase
          .from("resources")
          .insert(payloadNoCat as never);

        if (fallbackErrorCat) {
          return {
            success: false,
            error: `Database insertion failed: ${fallbackErrorCat.message}`,
          };
        }
      } else {
        return {
          success: false,
          error: `Could not save document record: ${insertError.message}`,
        };
      }
    }

    // 7. Record Learning Activity non-blockingly
    await recordLearningActivity({
      type: "RESOURCE_ADDED",
      entityId: resourceId,
      metadata: {
        title,
        type: resourceType,
        format: isPdf ? "pdf" : "txt",
        pages: extracted.pageCount,
        words: extracted.wordCount,
      },
    });

    // 8. Revalidate routes
    revalidatePath("/resources");
    revalidatePath("/dashboard");

    // 9. Return success
    const snippet =
      extracted.text.length > 300
        ? extracted.text.slice(0, 300) + "…"
        : extracted.text;

    return {
      success: true,
      resourceId,
      filePath: storagePath,
      extractedStats: {
        pageCount: extracted.pageCount,
        characterCount: extracted.characterCount,
        wordCount: extracted.wordCount,
        snippet,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Server Action: Generates a temporary signed URL (valid for 1 hour)
 * allowing the authenticated student to view or download their private document.
 */
export async function getDocumentSignedUrlAction(
  filePath: string
): Promise<{ url: string | null; error?: string }> {
  try {
    const user = await requireUser();
    const supabase = await createClient();

    // Verify ownership by checking path prefix `${user.id}/`
    if (!filePath.startsWith(`${user.id}/`)) {
      return { url: null, error: "Access denied. You do not own this document." };
    }

    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(filePath, 3600); // 1 hour expiration

    if (error || !data) {
      return {
        url: null,
        error: error?.message || "Could not generate download URL.",
      };
    }

    return { url: data.signedUrl };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not retrieve document URL.";
    return { url: null, error: message };
  }
}

/**
 * Server Action: Deletes a document file from Supabase Storage.
 */
export async function deleteDocumentFileAction(
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser();
    const supabase = await createClient();

    // Ensure user owns file
    if (!filePath.startsWith(`${user.id}/`)) {
      return { success: false, error: "Unauthorized file deletion." };
    }

    const { error } = await supabase.storage.from("documents").remove([filePath]);
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete file from storage.";
    return { success: false, error: message };
  }
}

