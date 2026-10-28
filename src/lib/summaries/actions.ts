"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { generateDocumentSummary } from "@/lib/ai/gemini";
import {
  createOrUpdateSummary,
  deleteSummary,
  getSummary,
} from "@/lib/summaries";
import { createNote } from "@/lib/notes";
import {
  generateSummarySchema,
  exportSummaryToNoteSchema,
} from "@/lib/validations/summaries";
import type { SummaryActionState } from "./constants";

/**
 * Server Action to generate an AI summary from an uploaded resource or raw text.
 */
export async function generateSummaryAction(
  prevState: SummaryActionState,
  formData: FormData
): Promise<SummaryActionState> {
  try {
    const user = await requireUser();
    const rawResourceId = formData.get("resourceId") as string | null;
    const rawText = formData.get("text") as string | null;
    const rawTitle = formData.get("title") as string | null;

    const validation = generateSummarySchema.safeParse({
      resourceId: rawResourceId || undefined,
      text: rawText || undefined,
      title: rawTitle || undefined,
    });

    if (!validation.success) {
      return {
        status: "error",
        message: "Invalid input parameters.",
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const { resourceId, text: directText, title: directTitle } = validation.data;

    let targetText = "";
    let targetTitle = directTitle ?? "Document Summary";
    let documentType: string | null = null;
    let boundResourceId: string | null = null;

    if (resourceId && resourceId.trim().length > 0) {
      const supabase = await createClient();
      const { data: resource, error: resError } = await supabase
        .from("resources")
        .select("id, title, type, extracted_text, description, file_path")
        .eq("id", resourceId)
        .eq("user_id", user.id)
        .single();

      if (resError || !resource) {
        return {
          status: "error",
          message: "The selected resource could not be found or you do not have permission to access it.",
        };
      }

      boundResourceId = resource.id;
      targetTitle = resource.title;
      documentType = resource.type;

      if (resource.extracted_text && resource.extracted_text.trim().length > 0) {
        targetText = resource.extracted_text;
      } else if (resource.description && resource.description.trim().length > 0) {
        targetText = resource.description;
      } else {
        return {
          status: "error",
          message:
            "This resource has no extracted text or content to summarize. Please upload a PDF or text file first.",
        };
      }
    } else if (directText && directText.trim().length > 0) {
      targetText = directText;
    }

    if (!targetText || targetText.trim().length < 20) {
      return {
        status: "error",
        message: "Document content is too short to generate a meaningful summary (minimum 20 characters required).",
      };
    }

    // Call Gemini AI
    const aiResult = await generateDocumentSummary({
      text: targetText,
      title: targetTitle,
      documentType,
    });

    // Save to database
    const saved = await createOrUpdateSummary({
      resourceId: boundResourceId,
      content: aiResult.formattedContent,
      keyPoints: aiResult.keyPoints,
      model: aiResult.model,
    });

    revalidatePath("/summaries");
    revalidatePath("/dashboard");
    if (boundResourceId) {
      revalidatePath(`/resources/${boundResourceId}`);
    }

    return {
      status: "success",
      summaryId: saved.id,
      message: `Summary generated successfully with ${aiResult.model}!`,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred while generating summary.";
    return {
      status: "error",
      message,
    };
  }
}

/**
 * Server Action to delete a summary.
 */
export async function deleteSummaryAction(
  prevState: SummaryActionState,
  formData: FormData
): Promise<SummaryActionState> {
  try {
    await requireUser();
    const id = formData.get("id") as string;

    if (!id || id.trim().length === 0) {
      return {
        status: "error",
        message: "Summary ID is required to delete.",
      };
    }

    await deleteSummary(id);

    revalidatePath("/summaries");
    revalidatePath("/resources");
    revalidatePath("/dashboard");

    return {
      status: "success",
      message: "Summary deleted successfully.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Failed to delete summary.",
    };
  }
}

/**
 * Server Action to export an AI Summary into a Personal Note.
 */
export async function exportSummaryToNoteAction(
  prevState: SummaryActionState,
  formData: FormData
): Promise<SummaryActionState> {
  try {
    await requireUser();
    const rawSummaryId = formData.get("summaryId") as string;
    const rawTargetTitle = formData.get("targetTitle") as string | null;

    const validation = exportSummaryToNoteSchema.safeParse({
      summaryId: rawSummaryId,
      targetTitle: rawTargetTitle || undefined,
    });

    if (!validation.success) {
      return {
        status: "error",
        message: "Invalid summary parameters.",
      };
    }

    const { summaryId, targetTitle } = validation.data;

    const summary = await getSummary(summaryId);
    if (!summary) {
      return {
        status: "error",
        message: "Summary not found.",
      };
    }

    const noteTitle =
      targetTitle && targetTitle.trim().length > 0
        ? targetTitle.trim()
        : summary.resourceTitle
        ? `Summary: ${summary.resourceTitle}`
        : "AI Document Summary";

    const formattedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const noteContent = `# ${noteTitle}\n\n*Generated by Gemini AI (${summary.model || "gemini-2.5-flash"}) on ${formattedDate}*\n\n${summary.content}`;

    const createdNote = await createNote({
      title: noteTitle,
      content: noteContent,
      tags: ["ai-summary", "study-notes"],
      resource_id: summary.resource_id ?? undefined,
    });

    revalidatePath("/notes");
    revalidatePath("/dashboard");

    return {
      status: "success",
      noteId: createdNote.id,
      message: "Summary successfully saved as a Personal Note!",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Failed to export summary to note.",
    };
  }
}

