"use server";

import { unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";

import { fieldErrorsFrom } from "@/lib/validations/auth";
import {
  createNoteSchema,
  updateNoteSchema,
  noteIdSchema,
  type CreateNoteInput,
  type UpdateNoteInput,
  type NoteId,
} from "@/lib/validations/notes";
import { createNote, updateNote, deleteNote } from "@/lib/notes";
import type { NoteActionState } from "@/lib/notes/constants";

export type { NoteActionState };

function parseTags(rawTags: unknown): string[] {
  if (Array.isArray(rawTags)) {
    return rawTags.map(String).filter(Boolean);
  }
  if (typeof rawTags === "string") {
    return rawTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }
  return [];
}

function validateCreateNote(input: unknown): CreateNoteInput {
  const parsed = createNoteSchema.safeParse(input);
  if (!parsed.success) {
    throw { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  return parsed.data;
}

function validateUpdateNote(input: unknown): UpdateNoteInput {
  const parsed = updateNoteSchema.safeParse(input);
  if (!parsed.success) {
    throw { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  return parsed.data;
}

function validateNoteId(input: unknown): NoteId {
  const parsed = noteIdSchema.safeParse(input);
  if (!parsed.success) {
    throw { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  return parsed.data;
}

export async function createNoteAction(
  _previousState: NoteActionState,
  formData: FormData
): Promise<NoteActionState> {
  let noteId: string;

  try {
    const rawTags = formData.get("tags");
    const rawInput = {
      title: formData.get("title"),
      content: formData.get("content") ?? "",
      tags: parseTags(rawTags),
      resource_id: formData.get("resource_id") ?? undefined,
      step_id: formData.get("step_id") ?? undefined,
    };

    const input = validateCreateNote(rawInput);
    const note = await createNote(input);
    noteId = note.id;
  } catch (err) {
    unstable_rethrow(err);
    if (err && typeof err === "object" && "fieldErrors" in err) {
      return {
        error: "Please correct the highlighted fields.",
        fieldErrors: (err as { fieldErrors: Record<string, string> }).fieldErrors,
      };
    }
    return { error: "Could not create note. Please try again." };
  }

  revalidatePath("/notes");
  revalidatePath("/dashboard");
  return { message: "Note created successfully.", noteId };
}

export async function updateNoteAction(
  _previousState: NoteActionState,
  formData: FormData
): Promise<NoteActionState> {
  try {
    const rawId = formData.get("id");
    const id = validateNoteId(rawId);

    const hasTags = formData.has("tags");
    const rawInput = {
      title: formData.get("title") ?? undefined,
      content: formData.has("content") ? String(formData.get("content")) : undefined,
      tags: hasTags ? parseTags(formData.get("tags")) : undefined,
      resource_id: formData.has("resource_id")
        ? formData.get("resource_id") ?? null
        : undefined,
      step_id: formData.has("step_id") ? formData.get("step_id") ?? null : undefined,
    };

    const input = validateUpdateNote(rawInput);
    await updateNote(id, input);

    revalidatePath("/notes");
    revalidatePath("/dashboard");
    return { message: "Note saved successfully.", noteId: id };
  } catch (err) {
    unstable_rethrow(err);
    if (err && typeof err === "object" && "fieldErrors" in err) {
      return {
        error: "Please correct the highlighted fields.",
        fieldErrors: (err as { fieldErrors: Record<string, string> }).fieldErrors,
      };
    }
    return { error: "Could not update note. Please try again." };
  }
}

export async function deleteNoteAction(
  _previousState: NoteActionState,
  formData: FormData
): Promise<NoteActionState> {
  try {
    const rawId = formData.get("id");
    const id = validateNoteId(rawId);

    await deleteNote(id);

    revalidatePath("/notes");
    revalidatePath("/dashboard");
    return { message: "Note deleted successfully." };
  } catch (err) {
    unstable_rethrow(err);
    return { error: "Could not delete note. Please try again." };
  }
}

