"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { fieldErrorsFrom } from "@/lib/validations/auth";
import { createGoalSchema, updateGoalSchema, goalIdSchema, type CreateGoalInput, type UpdateGoalInput, type GoalId } from "@/lib/validations/goals";
import { createGoal, updateGoal, deleteGoal, updateGoalStatus, updateGoalPriority } from "@/lib/goals";

export type GoalActionState = {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialGoalActionState: GoalActionState = {};

function validateCreateGoal(input: unknown): CreateGoalInput {
  const parsed = createGoalSchema.safeParse(input);
  if (!parsed.success) {
    throw { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  return parsed.data;
}

function validateUpdateGoal(input: unknown): UpdateGoalInput {
  const parsed = updateGoalSchema.safeParse(input);
  if (!parsed.success) {
    throw { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  return parsed.data;
}

function validateGoalId(input: unknown): GoalId {
  const parsed = goalIdSchema.safeParse(input);
  if (!parsed.success) {
    throw { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  return parsed.data;
}

export async function createGoalAction(
  _previousState: GoalActionState,
  formData: FormData
): Promise<GoalActionState> {
  try {
    const rawInput = {
      title: formData.get("title"),
      description: formData.get("description") ?? undefined,
      target_date: formData.get("target_date") ?? undefined,
      priority: formData.get("priority") ? Number(formData.get("priority")) : undefined,
      status: formData.get("status") ?? undefined,
    };

    const input = validateCreateGoal(rawInput);
    const goal = await createGoal(input);

    revalidatePath("/goals");
    redirect(`/goals/${goal.id}`);
  } catch (err) {
    if (err && typeof err === "object" && "fieldErrors" in err) {
      return { error: "Please correct the highlighted fields.", fieldErrors: (err as { fieldErrors: Record<string, string> }).fieldErrors };
    }
    return { error: "Could not create goal. Please try again." };
  }
}

export async function updateGoalAction(
  _previousState: GoalActionState,
  formData: FormData
): Promise<GoalActionState> {
  try {
    const rawId = formData.get("id");
    const id = validateGoalId(rawId);

    const rawInput = {
      title: formData.get("title") ?? undefined,
      description: formData.get("description") ?? undefined,
      target_date: formData.get("target_date") ?? undefined,
      priority: formData.get("priority") ? Number(formData.get("priority")) : undefined,
      status: formData.get("status") ?? undefined,
    };

    const input = validateUpdateGoal(rawInput);
    await updateGoal(id, input);

    revalidatePath("/goals");
    revalidatePath(`/goals/${id}`);
    return { message: "Goal updated successfully." };
  } catch (err) {
    if (err && typeof err === "object" && "fieldErrors" in err) {
      return { error: "Please correct the highlighted fields.", fieldErrors: (err as { fieldErrors: Record<string, string> }).fieldErrors };
    }
    return { error: "Could not update goal. Please try again." };
  }
}

export async function updateGoalStatusAction(
  _previousState: GoalActionState,
  formData: FormData
): Promise<GoalActionState> {
  try {
    const rawId = formData.get("id");
    const id = validateGoalId(rawId);
    const status = formData.get("status");

    if (!status || !["ACTIVE", "COMPLETED", "ARCHIVED"].includes(status as string)) {
      return { error: "Invalid status." };
    }

    await updateGoalStatus(id, status as "ACTIVE" | "COMPLETED" | "ARCHIVED");

    revalidatePath("/goals");
    revalidatePath(`/goals/${id}`);
    return { message: "Status updated." };
  } catch {
    return { error: "Could not update status. Please try again." };
  }
}

export async function updateGoalPriorityAction(
  _previousState: GoalActionState,
  formData: FormData
): Promise<GoalActionState> {
  try {
    const rawId = formData.get("id");
    const id = validateGoalId(rawId);
    const priority = Number(formData.get("priority"));

    if (!Number.isInteger(priority) || priority < 0) {
      return { error: "Priority must be a non-negative integer." };
    }

    await updateGoalPriority(id, priority);

    revalidatePath("/goals");
    revalidatePath(`/goals/${id}`);
    return { message: "Priority updated." };
  } catch {
    return { error: "Could not update priority. Please try again." };
  }
}

export async function deleteGoalAction(
  _previousState: GoalActionState,
  formData: FormData
): Promise<GoalActionState> {
  try {
    const rawId = formData.get("id");
    const id = validateGoalId(rawId);

    await deleteGoal(id);

    revalidatePath("/goals");
    redirect("/goals");
  } catch (err) {
    if (err && typeof err === "object" && "fieldErrors" in err) {
      return { error: "Please correct the highlighted fields.", fieldErrors: (err as { fieldErrors: Record<string, string> }).fieldErrors };
    }
    return { error: "Could not delete goal. Please try again." };
  }
}