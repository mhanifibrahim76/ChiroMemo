import "server-only";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate, Json } from "@/lib/supabase/database.types";

type RoadmapRow = Tables<"roadmaps">;
type RoadmapInsert = TablesInsert<"roadmaps">;
type RoadmapUpdate = TablesUpdate<"roadmaps">;

type StepRow = Tables<"roadmap_steps">;
type StepUpdate = TablesUpdate<"roadmap_steps">;

const ROADMAP_SELECT_COLUMNS =
  "id, user_id, title, description, progress_percent, created_at, updated_at";

const STEP_SELECT_COLUMNS =
  "id, roadmap_id, title, description, \"order\", status, completed_at, created_at, updated_at";

export async function listRoadmaps(): Promise<RoadmapRow[]> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("roadmaps")
    .select(ROADMAP_SELECT_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42501" || error.message.toLowerCase().includes("permission denied")) {
      redirect("/login");
    }
    throw new Error(`Could not list roadmaps: ${error.message}`);
  }

  return data ?? [];
}

export async function listRoadmapsWithGoalCount(): Promise<
  (RoadmapRow & { goalCount: number })[]
> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: roadmaps, error } = await supabase
    .from("roadmaps")
    .select(ROADMAP_SELECT_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42501" || error.message.toLowerCase().includes("permission denied")) {
      redirect("/login");
    }
    throw new Error(`Could not list roadmaps: ${error.message}`);
  }

  if (!roadmaps || roadmaps.length === 0) {
    return [];
  }

  const roadmapIds = roadmaps.map((r) => r.id);

  const { data: goalRoadmaps, error: grError } = await supabase
    .from("goal_roadmaps")
    .select("roadmap_id")
    .in("roadmap_id", roadmapIds);

  if (grError) {
    throw new Error(`Could not get goal counts: ${grError.message}`);
  }

  const goalCounts = new Map<string, number>();
  for (const gr of goalRoadmaps ?? []) {
    goalCounts.set(gr.roadmap_id, (goalCounts.get(gr.roadmap_id) ?? 0) + 1);
  }

  return roadmaps.map((r) => ({
    ...r,
    goalCount: goalCounts.get(r.id) ?? 0,
  }));
}

export async function getRoadmap(id: string): Promise<RoadmapRow | null> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("roadmaps")
    .select(ROADMAP_SELECT_COLUMNS)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Could not get roadmap: ${error.message}`);
  }

  return data;
}

export async function createRoadmap(input: {
  title: string;
  description?: string | null;
  goalIds?: string[];
}): Promise<RoadmapRow> {
  const user = await requireUser();
  const supabase = await createClient();

  const now = new Date().toISOString();
  const roadmapId = crypto.randomUUID();

  const insertData: RoadmapInsert = {
    id: roadmapId,
    user_id: user.id,
    title: input.title,
    description: input.description ?? null,
    progress_percent: 0,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("roadmaps")
    .insert(insertData)
    .select(ROADMAP_SELECT_COLUMNS)
    .single();

  if (error) {
    throw new Error(`Could not create roadmap: ${error.message}`);
  }

  if (input.goalIds && input.goalIds.length > 0) {
    const goalRoadmapData = input.goalIds.map((goalId) => ({
      goal_id: goalId,
      roadmap_id: roadmapId,
    }));

    const { error: grError } = await supabase
      .from("goal_roadmaps")
      .insert(goalRoadmapData);

    if (grError) {
      throw new Error(`Could not associate goals with roadmap: ${grError.message}`);
    }
  }

  return data;
}

export async function updateRoadmap(
  id: string,
  input: {
    title?: string;
    description?: string | null;
  }
): Promise<RoadmapRow> {
  const user = await requireUser();
  const supabase = await createClient();

  const updateData: RoadmapUpdate = {
    ...input,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("roadmaps")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(ROADMAP_SELECT_COLUMNS)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error("Roadmap not found or access denied");
    }
    throw new Error(`Could not update roadmap: ${error.message}`);
  }

  return data;
}

export async function deleteRoadmap(id: string): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("roadmaps")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Could not delete roadmap: ${error.message}`);
  }
}

export async function listRoadmapSteps(roadmapId: string): Promise<StepRow[]> {
  await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("roadmap_steps")
    .select(STEP_SELECT_COLUMNS)
    .eq("roadmap_id", roadmapId)
    .order("\"order\"", { ascending: true });

  if (error) {
    throw new Error(`Could not list roadmap steps: ${error.message}`);
  }

  return data ?? [];
}

export async function createRoadmapStep(input: {
  roadmapId: string;
  title: string;
  description?: string | null;
  order?: number;
}): Promise<StepRow> {
  await requireUser();
  const supabase = await createClient();

  // Call the atomic create RPC which handles locking, validation, and append logic
  const { data, error } = await supabase.rpc("create_roadmap_step", {
    p_roadmap_id: input.roadmapId,
    p_title: input.title,
    p_description: input.description ?? null,
    p_order: input.order ?? null,
  });

  if (error) {
    throw new Error(`Could not create step: ${error.message}`);
  }

  // Parse and validate the returned JSONB to match StepRow type
  const step = data as unknown as StepRow;
  return step;
}

export async function updateRoadmapStep(
  id: string,
  input: {
    title?: string;
    description?: string | null;
    status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  }
): Promise<StepRow> {
  await requireUser();
  const supabase = await createClient();

  const updateData: StepUpdate = {
    ...input,
    updated_at: new Date().toISOString(),
  };

  if (input.status === "COMPLETED") {
    updateData.completed_at = new Date().toISOString();
  } else if (input.status === "PENDING" || input.status === "IN_PROGRESS") {
    updateData.completed_at = null;
  }

  const { data, error } = await supabase
    .from("roadmap_steps")
    .update(updateData)
    .eq("id", id)
    .select(STEP_SELECT_COLUMNS)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error("Step not found or access denied");
    }
    throw new Error(`Could not update step: ${error.message}`);
  }

  return data;
}

export async function updateRoadmapStepStatus(
  id: string,
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
): Promise<StepRow> {
  return updateRoadmapStep(id, { status });
}

export async function deleteRoadmapStep(id: string): Promise<string> {
  await requireUser();
  const supabase = await createClient();

  // First, get the step's roadmap_id to call the RPC
  const { data: step, error: stepError } = await supabase
    .from("roadmap_steps")
    .select("roadmap_id")
    .eq("id", id)
    .single();

  if (stepError) {
    if (stepError.code === "PGRST116") {
      throw new Error("Step not found or access denied");
    }
    throw new Error(`Could not find step: ${stepError.message}`);
  }

  // Call the atomic delete-and-reorder RPC
  const { error } = await supabase.rpc("delete_and_reorder_roadmap_step", {
    p_roadmap_id: step.roadmap_id,
    p_step_id: id,
  });

  if (error) {
    throw new Error(`Could not delete step: ${error.message}`);
  }

  return step.roadmap_id;
}

export async function reorderRoadmapSteps(
  roadmapId: string,
  steps: { id: string; order: number }[]
): Promise<void> {
  await requireUser();
  const supabase = await createClient();

  // Call the atomic reorder RPC which handles locking, validation, and two-phase update
  const { error } = await supabase.rpc("reorder_roadmap_steps", {
    p_roadmap_id: roadmapId,
    p_steps: steps as unknown as Json,
  });

  if (error) {
    throw new Error(`Could not reorder steps: ${error.message}`);
  }
}

export async function getGoalRoadmaps(goalId: string): Promise<RoadmapRow[]> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: goalRoadmaps, error: grError } = await supabase
    .from("goal_roadmaps")
    .select("roadmap_id")
    .eq("goal_id", goalId);

  if (grError) {
    throw new Error(`Could not get goal roadmaps: ${grError.message}`);
  }

  const roadmapIds = goalRoadmaps?.map((gr) => gr.roadmap_id) ?? [];

  if (roadmapIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("roadmaps")
    .select(ROADMAP_SELECT_COLUMNS)
    .in("id", roadmapIds)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Could not get goal roadmaps: ${error.message}`);
  }

  return data ?? [];
}

export async function getRoadmapGoals(roadmapId: string): Promise<Tables<"learning_goals">[]> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: roadmapGoals, error: rgError } = await supabase
    .from("goal_roadmaps")
    .select("goal_id")
    .eq("roadmap_id", roadmapId);

  if (rgError) {
    throw new Error(`Could not get roadmap goals: ${rgError.message}`);
  }

  const goalIds = roadmapGoals?.map((rg) => rg.goal_id) ?? [];

  if (goalIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("learning_goals")
    .select("id, user_id, title, description, status, target_date, priority, created_at, updated_at")
    .in("id", goalIds)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Could not get roadmap goals: ${error.message}`);
  }

  return data ?? [];
}

export async function addGoalToRoadmap(goalId: string, roadmapId: string): Promise<void> {
  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("goal_roadmaps")
    .insert({ goal_id: goalId, roadmap_id: roadmapId });

  if (error) {
    throw new Error(`Could not associate goal with roadmap: ${error.message}`);
  }
}

export async function removeGoalFromRoadmap(goalId: string, roadmapId: string): Promise<void> {
  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("goal_roadmaps")
    .delete()
    .eq("goal_id", goalId)
    .eq("roadmap_id", roadmapId);

  if (error) {
    throw new Error(`Could not remove goal from roadmap: ${error.message}`);
  }
}

export async function calculateRoadmapProgress(roadmapId: string): Promise<number> {
  await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("roadmap_steps")
    .select("status", { count: "exact" })
    .eq("roadmap_id", roadmapId);

  if (error) {
    throw new Error(`Could not calculate progress: ${error.message}`);
  }

  const total = data?.length ?? 0;
  if (total === 0) return 0;

  const completed = data?.filter((s) => s.status === "COMPLETED").length ?? 0;
  return Math.round((completed / total) * 100);
}

export async function updateRoadmapProgress(roadmapId: string): Promise<number> {
  const user = await requireUser();
  const supabase = await createClient();

  const progressPercent = await calculateRoadmapProgress(roadmapId);

  const { error } = await supabase
    .from("roadmaps")
    .update({
      progress_percent: progressPercent,
      updated_at: new Date().toISOString(),
    })
    .eq("id", roadmapId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Could not update roadmap progress: ${error.message}`);
  }

  return progressPercent;
}