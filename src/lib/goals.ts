import "server-only";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";

type GoalRow = Tables<"learning_goals">;
type GoalInsert = TablesInsert<"learning_goals">;
type GoalUpdate = TablesUpdate<"learning_goals">;

const GOAL_SELECT_COLUMNS =
  "id, user_id, title, description, status, target_date, priority, created_at, updated_at";

export async function listGoals(): Promise<GoalRow[]> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("learning_goals")
    .select(GOAL_SELECT_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42501" || error.message.toLowerCase().includes("permission denied")) {
      redirect("/login");
    }
    throw new Error(`Could not list goals: ${error.message}`);
  }

  return data ?? [];
}

export async function getGoal(id: string): Promise<GoalRow | null> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("learning_goals")
    .select(GOAL_SELECT_COLUMNS)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Could not get goal: ${error.message}`);
  }

  return data;
}

export async function createGoal(input: {
  title: string;
  description?: string | null;
  target_date?: string | null;
  priority?: number;
  status?: "ACTIVE" | "COMPLETED" | "ARCHIVED";
}): Promise<GoalRow> {
  const user = await requireUser();
  const supabase = await createClient();

  const now = new Date().toISOString();
  const goalId = crypto.randomUUID();

  const insertData: GoalInsert = {
    id: goalId,
    user_id: user.id,
    title: input.title,
    description: input.description ?? null,
    status: input.status ?? "ACTIVE",
    target_date: input.target_date ?? null,
    priority: input.priority ?? 0,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("learning_goals")
    .insert(insertData)
    .select(GOAL_SELECT_COLUMNS)
    .single();

  if (error) {
    throw new Error(`Could not create goal: ${error.message}`);
  }

  return data;
}

export async function updateGoal(
  id: string,
  input: {
    title?: string;
    description?: string | null;
    target_date?: string | null;
    priority?: number;
    status?: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  }
): Promise<GoalRow> {
  const user = await requireUser();
  const supabase = await createClient();

  const updateData: GoalUpdate = {
    ...input,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("learning_goals")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(GOAL_SELECT_COLUMNS)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error("Goal not found or access denied");
    }
    throw new Error(`Could not update goal: ${error.message}`);
  }

  return data;
}

export async function updateGoalStatus(
  id: string,
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED"
): Promise<GoalRow> {
  return updateGoal(id, { status });
}

export async function updateGoalPriority(id: string, priority: number): Promise<GoalRow> {
  if (!Number.isInteger(priority) || priority < 0) {
    throw new Error("Priority must be a non-negative integer");
  }
  return updateGoal(id, { priority });
}

export async function deleteGoal(id: string): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("learning_goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Could not delete goal: ${error.message}`);
  }
}