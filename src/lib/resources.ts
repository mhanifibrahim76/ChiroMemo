import "server-only";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";
import type {
  ResourceType,
  CreateResourceInput,
  UpdateResourceInput,
} from "@/lib/validations/resources";

export type ResourceRow = Tables<"resources">;
export type ResourceInsert = TablesInsert<"resources">;
export type ResourceUpdate = TablesUpdate<"resources">;

const RESOURCE_SELECT_COLUMNS =
  "id, user_id, goal_id, title, type, url, file_path, category, description, author, extracted_text, is_archived, created_at, updated_at";

const RESOURCE_SELECT_COLUMNS_NO_CATEGORY =
  "id, user_id, goal_id, title, type, url, file_path, description, author, is_archived, created_at, updated_at";

export interface ResourceFilter {
  type?: ResourceType;
  goalId?: string;
  category?: string;
  isArchived?: boolean;
  search?: string;
}

export interface ResourceWithRelations extends ResourceRow {
  goalTitle: string | null;
  stepCount: number;
}

export interface ResourceDetailData extends ResourceRow {
  goal: {
    id: string;
    title: string;
    status: string;
  } | null;
  steps: {
    id: string;
    title: string;
    status: string;
    order: number;
    roadmap: {
      id: string;
      title: string;
    };
  }[];
}

export async function listResources(filter?: ResourceFilter): Promise<ResourceWithRelations[]> {
  const user = await requireUser();
  const supabase = await createClient();

  let query = supabase
    .from("resources")
    .select(RESOURCE_SELECT_COLUMNS)
    .eq("user_id", user.id);

  if (filter?.isArchived !== undefined) {
    query = query.eq("is_archived", filter.isArchived);
  }

  if (filter?.type) {
    query = query.eq("type", filter.type);
  }

  if (filter?.goalId) {
    query = query.eq("goal_id", filter.goalId);
  }

  if (filter?.category) {
    query = query.eq("category", filter.category);
  }

  query = query.order("created_at", { ascending: false });

  let { data: resources, error } = await query;

  // Defensive fallback if migrations for category or extracted_text have not run yet
  if (
    error &&
    (error.code === "42703" ||
      error.message.toLowerCase().includes("category") ||
      error.message.toLowerCase().includes("extracted_text"))
  ) {
    let fallbackQuery = supabase
      .from("resources")
      .select(RESOURCE_SELECT_COLUMNS_NO_CATEGORY)
      .eq("user_id", user.id);

    if (filter?.isArchived !== undefined) {
      fallbackQuery = fallbackQuery.eq("is_archived", filter.isArchived);
    }
    if (filter?.type) {
      fallbackQuery = fallbackQuery.eq("type", filter.type);
    }
    if (filter?.goalId) {
      fallbackQuery = fallbackQuery.eq("goal_id", filter.goalId);
    }
    fallbackQuery = fallbackQuery.order("created_at", { ascending: false });

    const fallbackResult = await fallbackQuery;
    if (!fallbackResult.error && fallbackResult.data) {
      resources = fallbackResult.data.map((r) => ({
        ...r,
        category: null,
        extracted_text: null,
      })) as ResourceRow[];
      error = null;
    }
  }

  if (error) {
    if (error.code === "42501" || error.message.toLowerCase().includes("permission denied")) {
      redirect("/login");
    }
    throw new Error(`Could not list resources: ${error.message}`);
  }

  if (!resources || resources.length === 0) {
    return [];
  }

  // Filter in-memory for search query if provided (matches title, description, author, category)
  let filtered = resources;
  if (filter?.search && filter.search.trim().length > 0) {
    const s = filter.search.toLowerCase().trim();
    filtered = resources.filter(
      (r) =>
        r.title.toLowerCase().includes(s) ||
        r.description?.toLowerCase().includes(s) ||
        r.author?.toLowerCase().includes(s) ||
        r.category?.toLowerCase().includes(s)
    );
  }

  if (filtered.length === 0) {
    return [];
  }

  // Fetch goal titles for all resources with a goal_id
  const goalIds = Array.from(
    new Set(filtered.map((r) => r.goal_id).filter((id): id is string => Boolean(id)))
  );

  const goalTitleMap = new Map<string, string>();
  if (goalIds.length > 0) {
    const { data: goals, error: goalsError } = await supabase
      .from("learning_goals")
      .select("id, title")
      .in("id", goalIds);

    if (!goalsError && goals) {
      for (const g of goals) {
        goalTitleMap.set(g.id, g.title);
      }
    }
  }

  // Fetch step counts for each resource via step_resources
  const resourceIds = filtered.map((r) => r.id);
  const stepCountMap = new Map<string, number>();

  if (resourceIds.length > 0) {
    const { data: stepAssociations, error: stepError } = await supabase
      .from("step_resources")
      .select("resource_id")
      .in("resource_id", resourceIds);

    if (!stepError && stepAssociations) {
      for (const sa of stepAssociations) {
        stepCountMap.set(sa.resource_id, (stepCountMap.get(sa.resource_id) ?? 0) + 1);
      }
    }
  }

  return filtered.map((r) => ({
    ...r,
    goalTitle: r.goal_id ? goalTitleMap.get(r.goal_id) ?? null : null,
    stepCount: stepCountMap.get(r.id) ?? 0,
  }));
}

export async function getResource(id: string): Promise<ResourceDetailData | null> {
  const user = await requireUser();
  const supabase = await createClient();

  let { data: resource, error } = await supabase
    .from("resources")
    .select(RESOURCE_SELECT_COLUMNS)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (
    error &&
    (error.code === "42703" ||
      error.message.toLowerCase().includes("category") ||
      error.message.toLowerCase().includes("extracted_text"))
  ) {
    const fallback = await supabase
      .from("resources")
      .select(RESOURCE_SELECT_COLUMNS_NO_CATEGORY)
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!fallback.error && fallback.data) {
      resource = {
        ...fallback.data,
        category: null,
        extracted_text: null,
      } as ResourceRow;
      error = null;
    }
  }

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Could not get resource: ${error.message}`);
  }

  if (!resource) {
    return null;
  }

  // Fetch linked goal if exists
  let goalData: ResourceDetailData["goal"] = null;
  if (resource.goal_id) {
    const { data: goal } = await supabase
      .from("learning_goals")
      .select("id, title, status")
      .eq("id", resource.goal_id)
      .single();

    if (goal) {
      goalData = goal;
    }
  }

  // Fetch linked steps through step_resources
  const { data: stepRows, error: stepsError } = await supabase
    .from("step_resources")
    .select(
      `
      step_id,
      roadmap_steps (
        id,
        title,
        status,
        "order",
        roadmap_id,
        roadmaps (
          id,
          title
        )
      )
    `
    )
    .eq("resource_id", resource.id);

  const steps: ResourceDetailData["steps"] = [];

  if (!stepsError && stepRows) {
    for (const row of stepRows) {
      const s = row.roadmap_steps as unknown as {
        id: string;
        title: string;
        status: string;
        order: number;
        roadmaps: { id: string; title: string } | null;
      } | null;

      if (s && s.roadmaps) {
        steps.push({
          id: s.id,
          title: s.title,
          status: s.status,
          order: s.order,
          roadmap: {
            id: s.roadmaps.id,
            title: s.roadmaps.title,
          },
        });
      }
    }
  }

  return {
    ...resource,
    goal: goalData,
    steps,
  };
}

export async function createResource(input: CreateResourceInput): Promise<ResourceRow> {
  const user = await requireUser();
  const supabase = await createClient();

  const now = new Date().toISOString();
  const resourceId = crypto.randomUUID();

  const insertData: ResourceInsert = {
    id: resourceId,
    user_id: user.id,
    title: input.title,
    type: input.type,
    url: input.url ?? null,
    file_path: input.file_path ?? null,
    category: input.category ?? null,
    description: input.description ?? null,
    author: input.author ?? null,
    goal_id: input.goal_id ?? null,
    is_archived: false,
    created_at: now,
    updated_at: now,
  };

  let { data, error } = await supabase
    .from("resources")
    .insert(insertData)
    .select(RESOURCE_SELECT_COLUMNS)
    .single();

  if (error && (error.code === "42703" || error.message.toLowerCase().includes("category"))) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { category, ...insertDataBase } = insertData;
    const fallback = await supabase
      .from("resources")
      .insert(insertDataBase)
      .select(RESOURCE_SELECT_COLUMNS_NO_CATEGORY)
      .single();

    if (!fallback.error && fallback.data) {
      data = {
        ...fallback.data,
        category: null,
      } as ResourceRow;
      error = null;
    }
  }

  if (error || !data) {
    throw new Error(`Could not create resource: ${error?.message ?? "Unknown error"}`);
  }

  // If initial step IDs are provided, link them
  if (input.step_ids && input.step_ids.length > 0) {
    const stepAssociations = input.step_ids.map((stepId) => ({
      step_id: stepId,
      resource_id: resourceId,
    }));

    const { error: stepError } = await supabase
      .from("step_resources")
      .insert(stepAssociations);

    if (stepError) {
      // Non-fatal for resource creation itself, but log or notify
      console.error("Could not associate steps with resource:", stepError.message);
    }
  }

  return data;
}

export async function updateResource(
  id: string,
  input: UpdateResourceInput
): Promise<ResourceRow> {
  const user = await requireUser();
  const supabase = await createClient();

  const updateData: ResourceUpdate = {
    ...(input.title !== undefined && { title: input.title }),
    ...(input.type !== undefined && { type: input.type }),
    ...(input.url !== undefined && { url: input.url }),
    ...(input.file_path !== undefined && { file_path: input.file_path }),
    ...(input.category !== undefined && { category: input.category }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.author !== undefined && { author: input.author }),
    ...(input.goal_id !== undefined && { goal_id: input.goal_id }),
    ...(input.is_archived !== undefined && { is_archived: input.is_archived }),
    updated_at: new Date().toISOString(),
  };

  let { data, error } = await supabase
    .from("resources")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(RESOURCE_SELECT_COLUMNS)
    .single();

  if (error && (error.code === "42703" || error.message.toLowerCase().includes("category"))) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { category, ...updateDataBase } = updateData;
    const fallback = await supabase
      .from("resources")
      .update(updateDataBase)
      .eq("id", id)
      .eq("user_id", user.id)
      .select(RESOURCE_SELECT_COLUMNS_NO_CATEGORY)
      .single();

    if (!fallback.error && fallback.data) {
      data = {
        ...fallback.data,
        category: null,
      } as ResourceRow;
      error = null;
    }
  }

  if (error || !data) {
    if (error?.code === "PGRST116") {
      throw new Error("Resource not found or access denied");
    }
    throw new Error(`Could not update resource: ${error?.message ?? "Unknown error"}`);
  }

  // Update step associations if provided
  if (input.step_ids !== undefined) {
    // Remove existing step associations for this resource
    await supabase.from("step_resources").delete().eq("resource_id", id);

    if (input.step_ids.length > 0) {
      const stepAssociations = input.step_ids.map((stepId) => ({
        step_id: stepId,
        resource_id: id,
      }));

      await supabase.from("step_resources").insert(stepAssociations);
    }
  }

  return data;
}

export async function toggleArchiveResource(
  id: string,
  isArchived: boolean
): Promise<ResourceRow> {
  return updateResource(id, { is_archived: isArchived });
}

export async function deleteResource(id: string): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("resources")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Could not delete resource: ${error.message}`);
  }
}

export async function addResourceToStep(
  stepId: string,
  resourceId: string
): Promise<void> {
  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("step_resources")
    .insert({ step_id: stepId, resource_id: resourceId });

  if (error) {
    // Unique violation is benign (already associated)
    if (error.code === "23505") {
      return;
    }
    throw new Error(`Could not link resource to step: ${error.message}`);
  }
}

export async function removeResourceFromStep(
  stepId: string,
  resourceId: string
): Promise<void> {
  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("step_resources")
    .delete()
    .eq("step_id", stepId)
    .eq("resource_id", resourceId);

  if (error) {
    throw new Error(`Could not unlink resource from step: ${error.message}`);
  }
}

export async function listResourcesForStep(stepId: string): Promise<ResourceRow[]> {
  await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("step_resources")
    .select("resource_id, resources (*)")
    .eq("step_id", stepId);

  if (error) {
    throw new Error(`Could not list resources for step: ${error.message}`);
  }

  const results: ResourceRow[] = [];
  for (const item of data ?? []) {
    if (item.resources) {
      results.push(item.resources as unknown as ResourceRow);
    }
  }

  return results;
}

export async function listResourcesForGoal(goalId: string): Promise<ResourceRow[]> {
  const user = await requireUser();
  const supabase = await createClient();

  let { data, error } = await supabase
    .from("resources")
    .select(RESOURCE_SELECT_COLUMNS)
    .eq("user_id", user.id)
    .eq("goal_id", goalId)
    .order("created_at", { ascending: false });

  if (error && (error.code === "42703" || error.message.toLowerCase().includes("category"))) {
    const fallback = await supabase
      .from("resources")
      .select(RESOURCE_SELECT_COLUMNS_NO_CATEGORY)
      .eq("user_id", user.id)
      .eq("goal_id", goalId)
      .order("created_at", { ascending: false });

    if (!fallback.error && fallback.data) {
      data = fallback.data.map((r) => ({
        ...r,
        category: null,
      })) as ResourceRow[];
      error = null;
    }
  }

  if (error) {
    throw new Error(`Could not list resources for goal: ${error.message}`);
  }

  return data ?? [];
}

export async function getStepResourcesMapForRoadmap(
  roadmapId: string
): Promise<Record<string, ResourceRow[]>> {
  await requireUser();
  const supabase = await createClient();

  const { data: stepData } = await supabase
    .from("roadmap_steps")
    .select("id")
    .eq("roadmap_id", roadmapId);

  if (!stepData || stepData.length === 0) {
    return {};
  }

  const stepIds = stepData.map((s) => s.id);

  const { data: associations, error } = await supabase
    .from("step_resources")
    .select("step_id, resources (*)")
    .in("step_id", stepIds);

  if (error || !associations) {
    return {};
  }

  const map: Record<string, ResourceRow[]> = {};
  for (const item of associations) {
    if (item.resources) {
      map[item.step_id] ??= [];
      map[item.step_id].push(item.resources as unknown as ResourceRow);
    }
  }

  return map;
}

