import "server-only";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";
import type { CreateNoteInput, UpdateNoteInput } from "@/lib/validations/notes";

export type NoteRow = Tables<"notes">;
export type NoteInsert = TablesInsert<"notes">;
export type NoteUpdate = TablesUpdate<"notes">;

const NOTE_SELECT_COLUMNS =
  "id, user_id, resource_id, step_id, title, content, tags, created_at, updated_at";

export interface NoteFilter {
  resourceId?: string;
  stepId?: string;
  tag?: string;
  search?: string;
}

export interface NoteWithRelations extends NoteRow {
  resource?: {
    id: string;
    title: string;
    type: "PDF" | "VIDEO" | "WEBSITE" | "BOOK" | "COURSE";
  } | null;
  step?: {
    id: string;
    title: string;
    roadmap_id: string;
  } | null;
}

export async function listNotes(filter?: NoteFilter): Promise<NoteWithRelations[]> {
  const user = await requireUser();
  const supabase = await createClient();

  let query = supabase
    .from("notes")
    .select(NOTE_SELECT_COLUMNS)
    .eq("user_id", user.id);

  if (filter?.resourceId) {
    query = query.eq("resource_id", filter.resourceId);
  }

  if (filter?.stepId) {
    query = query.eq("step_id", filter.stepId);
  }

  query = query.order("updated_at", { ascending: false });

  const { data: notes, error } = await query;

  if (error) {
    if (error.code === "42501" || error.message.toLowerCase().includes("permission denied")) {
      redirect("/login");
    }
    throw new Error(`Could not list notes: ${error.message}`);
  }

  if (!notes || notes.length === 0) {
    return [];
  }

  // Filter by tag in-memory if requested
  let filtered = notes;
  if (filter?.tag) {
    const t = filter.tag.toLowerCase().trim();
    filtered = filtered.filter((n) => n.tags?.some((tag) => tag.toLowerCase() === t));
  }

  // Filter by search query in-memory (title, content, tags)
  if (filter?.search && filter.search.trim().length > 0) {
    const s = filter.search.toLowerCase().trim();
    filtered = filtered.filter(
      (n) =>
        n.title.toLowerCase().includes(s) ||
        n.content.toLowerCase().includes(s) ||
        n.tags?.some((tag) => tag.toLowerCase().includes(s))
    );
  }

  if (filtered.length === 0) {
    return [];
  }

  // Fetch linked resources for all notes that have a resource_id
  const resourceIds = Array.from(
    new Set(filtered.map((n) => n.resource_id).filter((id): id is string => Boolean(id)))
  );

  const resourceMap = new Map<
    string,
    { id: string; title: string; type: "PDF" | "VIDEO" | "WEBSITE" | "BOOK" | "COURSE" }
  >();

  if (resourceIds.length > 0) {
    const { data: resources } = await supabase
      .from("resources")
      .select("id, title, type")
      .in("id", resourceIds);

    if (resources) {
      for (const r of resources) {
        resourceMap.set(r.id, r);
      }
    }
  }

  return filtered.map((note) => ({
    ...note,
    resource: note.resource_id ? resourceMap.get(note.resource_id) ?? null : null,
  }));
}

export async function getNote(id: string): Promise<NoteWithRelations | null> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: note, error } = await supabase
    .from("notes")
    .select(NOTE_SELECT_COLUMNS)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Could not get note: ${error.message}`);
  }

  if (!note) {
    return null;
  }

  let resourceData: NoteWithRelations["resource"] = null;
  if (note.resource_id) {
    const { data: resource } = await supabase
      .from("resources")
      .select("id, title, type")
      .eq("id", note.resource_id)
      .single();

    if (resource) {
      resourceData = resource;
    }
  }

  let stepData: NoteWithRelations["step"] = null;
  if (note.step_id) {
    const { data: step } = await supabase
      .from("roadmap_steps")
      .select("id, title, roadmap_id")
      .eq("id", note.step_id)
      .single();

    if (step) {
      stepData = step;
    }
  }

  return {
    ...note,
    resource: resourceData,
    step: stepData,
  };
}

export async function createNote(input: CreateNoteInput): Promise<NoteRow> {
  const user = await requireUser();
  const supabase = await createClient();

  const now = new Date().toISOString();
  const noteId = crypto.randomUUID();

  const insertData: NoteInsert = {
    id: noteId,
    user_id: user.id,
    title: input.title,
    content: input.content ?? "",
    tags: input.tags ?? [],
    resource_id: input.resource_id ?? null,
    step_id: input.step_id ?? null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("notes")
    .insert(insertData)
    .select(NOTE_SELECT_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(`Could not create note: ${error?.message ?? "Unknown error"}`);
  }

  return data;
}

export async function updateNote(id: string, input: UpdateNoteInput): Promise<NoteRow> {
  const user = await requireUser();
  const supabase = await createClient();

  const updateData: NoteUpdate = {
    ...(input.title !== undefined && { title: input.title }),
    ...(input.content !== undefined && { content: input.content }),
    ...(input.tags !== undefined && { tags: input.tags }),
    ...(input.resource_id !== undefined && { resource_id: input.resource_id }),
    ...(input.step_id !== undefined && { step_id: input.step_id }),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("notes")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(NOTE_SELECT_COLUMNS)
    .single();

  if (error || !data) {
    if (error?.code === "PGRST116") {
      throw new Error("Note not found or access denied");
    }
    throw new Error(`Could not update note: ${error?.message ?? "Unknown error"}`);
  }

  return data;
}

export async function deleteNote(id: string): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Could not delete note: ${error.message}`);
  }
}

export async function listNotesForResource(resourceId: string): Promise<NoteRow[]> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notes")
    .select(NOTE_SELECT_COLUMNS)
    .eq("user_id", user.id)
    .eq("resource_id", resourceId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Could not list notes for resource: ${error.message}`);
  }

  return data ?? [];
}

export async function listNotesForStep(stepId: string): Promise<NoteRow[]> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notes")
    .select(NOTE_SELECT_COLUMNS)
    .eq("user_id", user.id)
    .eq("step_id", stepId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Could not list notes for step: ${error.message}`);
  }

  return data ?? [];
}

