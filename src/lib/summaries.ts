import "server-only";

import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";

export type SummaryRow = Tables<"summaries">;
export type SummaryInsert = TablesInsert<"summaries">;
export type SummaryUpdate = TablesUpdate<"summaries">;

export interface SummaryWithResource extends SummaryRow {
  resourceTitle: string | null;
  resourceType: string | null;
  resourceFilePath: string | null;
  resourceExtractedText: string | null;
}

export interface SummaryFilter {
  resourceId?: string;
  search?: string;
}

/**
 * Lists all summaries for the current user, joined with resource information.
 */
export async function listSummaries(
  filter?: SummaryFilter
): Promise<SummaryWithResource[]> {
  const user = await requireUser();
  const supabase = await createClient();

  let query = supabase
    .from("summaries")
    .select("id, user_id, resource_id, content, key_points, model, created_at, updated_at")
    .eq("user_id", user.id);

  if (filter?.resourceId) {
    query = query.eq("resource_id", filter.resourceId);
  }

  query = query.order("created_at", { ascending: false });

  const { data: summaries, error } = await query;

  if (error) {
    throw new Error(`Could not list summaries: ${error.message}`);
  }

  if (!summaries || summaries.length === 0) {
    return [];
  }

  // Fetch linked resources in batch
  const resourceIds = summaries
    .map((s) => s.resource_id)
    .filter((id): id is string => Boolean(id));

  const resourceMap = new Map<
    string,
    { title: string; type: string; filePath: string | null; extractedText: string | null }
  >();

  if (resourceIds.length > 0) {
    const { data: resources, error: resError } = await supabase
      .from("resources")
      .select("id, title, type, file_path, extracted_text")
      .in("id", resourceIds);

    if (!resError && resources) {
      for (const res of resources) {
        resourceMap.set(res.id, {
          title: res.title,
          type: res.type,
          filePath: res.file_path,
          extractedText: res.extracted_text,
        });
      }
    }
  }

  const results: SummaryWithResource[] = summaries.map((s) => {
    const res = s.resource_id ? resourceMap.get(s.resource_id) : null;
    return {
      ...s,
      resourceTitle: res?.title ?? null,
      resourceType: res?.type ?? null,
      resourceFilePath: res?.filePath ?? null,
      resourceExtractedText: res?.extractedText ?? null,
    };
  });

  if (filter?.search && filter.search.trim().length > 0) {
    const term = filter.search.toLowerCase().trim();
    return results.filter((s) => {
      const matchTitle = s.resourceTitle?.toLowerCase().includes(term);
      const matchContent = s.content.toLowerCase().includes(term);
      const matchKeyPoints = s.key_points.some((kp) =>
        kp.toLowerCase().includes(term)
      );
      return matchTitle || matchContent || matchKeyPoints;
    });
  }

  return results;
}

/**
 * Retrieves a single summary by its ID with full linked resource data.
 */
export async function getSummary(
  id: string
): Promise<SummaryWithResource | null> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: summary, error } = await supabase
    .from("summaries")
    .select("id, user_id, resource_id, content, key_points, model, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Could not get summary: ${error.message}`);
  }

  if (!summary) {
    return null;
  }

  let resourceTitle: string | null = null;
  let resourceType: string | null = null;
  let resourceFilePath: string | null = null;
  let resourceExtractedText: string | null = null;

  if (summary.resource_id) {
    const { data: res } = await supabase
      .from("resources")
      .select("title, type, file_path, extracted_text")
      .eq("id", summary.resource_id)
      .eq("user_id", user.id)
      .single();

    if (res) {
      resourceTitle = res.title;
      resourceType = res.type;
      resourceFilePath = res.file_path;
      resourceExtractedText = res.extracted_text;
    }
  }

  return {
    ...summary,
    resourceTitle,
    resourceType,
    resourceFilePath,
    resourceExtractedText,
  };
}

/**
 * Retrieves the most recent summary for a specific resource, if one exists.
 */
export async function getSummaryByResourceId(
  resourceId: string
): Promise<SummaryRow | null> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("summaries")
    .select("id, user_id, resource_id, content, key_points, model, created_at, updated_at")
    .eq("resource_id", resourceId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

/**
 * Creates or updates a summary in the database under RLS and logs learning activity.
 */
export async function createOrUpdateSummary(data: {
  id?: string;
  resourceId?: string | null;
  content: string;
  keyPoints: string[];
  model?: string;
}): Promise<SummaryRow> {
  const user = await requireUser();
  const supabase = await createClient();

  const summaryId = data.id || crypto.randomUUID();

  // If resourceId is provided, verify it belongs to user
  let resourceTitle: string | null = null;
  if (data.resourceId) {
    const { data: res } = await supabase
      .from("resources")
      .select("id, title")
      .eq("id", data.resourceId)
      .eq("user_id", user.id)
      .single();

    if (res) {
      resourceTitle = res.title;
    }
  }

  const payload: SummaryInsert = {
    id: summaryId,
    user_id: user.id,
    resource_id: data.resourceId ?? null,
    content: data.content,
    key_points: data.keyPoints,
    model: data.model ?? "gemini-2.5-flash",
    updated_at: new Date().toISOString(),
  };

  const { data: savedSummary, error } = await supabase
    .from("summaries")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error || !savedSummary) {
    throw new Error(`Failed to save summary: ${error?.message || "Unknown error"}`);
  }

  // Log to learning activities for Dashboard and Analytics
  try {
    await supabase.from("learning_activities").insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      type: "SUMMARY_GENERATED",
      entity_id: savedSummary.id,
      metadata: {
        resource_id: data.resourceId ?? null,
        resource_title: resourceTitle,
        model: savedSummary.model,
      },
    });
  } catch (logErr) {
    // Non-blocking error for activity log
    console.error("Failed to log SUMMARY_GENERATED activity:", logErr);
  }

  return savedSummary;
}

/**
 * Deletes a summary by ID under RLS.
 */
export async function deleteSummary(id: string): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("summaries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to delete summary: ${error.message}`);
  }
}
