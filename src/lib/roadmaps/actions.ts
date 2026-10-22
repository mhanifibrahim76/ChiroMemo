"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";

import { fieldErrorsFrom } from "@/lib/validations/auth";
import {
  createRoadmapSchema,
  updateRoadmapSchema,
  roadmapIdSchema,
  createStepSchema,
  updateStepSchema,
  stepIdSchema,
  reorderStepsSchema,
  associateGoalRoadmapSchema,
  removeGoalRoadmapSchema,
  type CreateRoadmapInput,
  type UpdateRoadmapInput,
  type RoadmapId,
  type CreateStepInput,
  type UpdateStepInput,
  type StepId,
  type ReorderStepsInput,
  type AssociateGoalRoadmapInput,
  type RemoveGoalRoadmapInput,
} from "@/lib/validations/roadmaps";
import {
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
  createRoadmapStep,
  updateRoadmapStep,
  deleteRoadmapStep,
  reorderRoadmapSteps,
  addGoalToRoadmap,
  removeGoalFromRoadmap,
  updateRoadmapProgress,
} from "@/lib/roadmaps";
import type { RoadmapActionState } from "@/lib/roadmaps/constants";

export type { RoadmapActionState };

function validateCreateRoadmap(input: unknown): CreateRoadmapInput {
  const parsed = createRoadmapSchema.safeParse(input);
  if (!parsed.success) {
    throw { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  return parsed.data;
}

function validateUpdateRoadmap(input: unknown): UpdateRoadmapInput {
  const parsed = updateRoadmapSchema.safeParse(input);
  if (!parsed.success) {
    throw { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  return parsed.data;
}

function validateRoadmapId(input: unknown): RoadmapId {
  const parsed = roadmapIdSchema.safeParse(input);
  if (!parsed.success) {
    throw { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  return parsed.data;
}

function validateCreateStep(input: unknown): CreateStepInput {
  const parsed = createStepSchema.safeParse(input);
  if (!parsed.success) {
    throw { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  return parsed.data;
}

function validateUpdateStep(input: unknown): UpdateStepInput {
  const parsed = updateStepSchema.safeParse(input);
  if (!parsed.success) {
    throw { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  return parsed.data;
}

function validateStepId(input: unknown): StepId {
  const parsed = stepIdSchema.safeParse(input);
  if (!parsed.success) {
    throw { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  return parsed.data;
}

function validateReorderSteps(input: unknown): ReorderStepsInput {
  const parsed = reorderStepsSchema.safeParse(input);
  if (!parsed.success) {
    throw { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  return parsed.data;
}

function validateAssociateGoalRoadmap(input: unknown): AssociateGoalRoadmapInput {
  const parsed = associateGoalRoadmapSchema.safeParse(input);
  if (!parsed.success) {
    throw { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  return parsed.data;
}

function validateRemoveGoalRoadmap(input: unknown): RemoveGoalRoadmapInput {
  const parsed = removeGoalRoadmapSchema.safeParse(input);
  if (!parsed.success) {
    throw { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  return parsed.data;
}

export async function createRoadmapAction(
  _previousState: RoadmapActionState,
  formData: FormData
): Promise<RoadmapActionState> {
  let roadmapId: string;

  try {
    const rawInput = {
      title: formData.get("title"),
      description: formData.get("description") ?? undefined,
      goalIds: formData.getAll("goalIds").map((id) => String(id)),
    };

    const input = validateCreateRoadmap(rawInput);
    const roadmap = await createRoadmap(input);
    roadmapId = roadmap.id;
  } catch (err) {
    // requireUser() redirects through a thrown control-flow error; never swallow it.
    unstable_rethrow(err);
    if (err && typeof err === "object" && "fieldErrors" in err) {
      return { error: "Please correct the highlighted fields.", fieldErrors: (err as { fieldErrors: Record<string, string> }).fieldErrors };
    }
    return { error: "Could not create roadmap. Please try again." };
  }

  // Outside any try/catch: redirect() works by throwing.
  revalidatePath("/roadmaps");
  revalidatePath("/goals");
  redirect(`/roadmaps/${roadmapId}`);
}

export async function updateRoadmapAction(
  _previousState: RoadmapActionState,
  formData: FormData
): Promise<RoadmapActionState> {
  try {
    const rawId = formData.get("id");
    const id = validateRoadmapId(rawId);

    const rawInput = {
      title: formData.get("title") ?? undefined,
      description: formData.get("description") ?? undefined,
    };

    const input = validateUpdateRoadmap(rawInput);
    await updateRoadmap(id, input);

    revalidatePath("/roadmaps");
    revalidatePath(`/roadmaps/${id}`);
    revalidatePath("/goals");
    return { message: "Roadmap updated successfully." };
  } catch (err) {
    if (err && typeof err === "object" && "fieldErrors" in err) {
      return { error: "Please correct the highlighted fields.", fieldErrors: (err as { fieldErrors: Record<string, string> }).fieldErrors };
    }
    return { error: "Could not update roadmap. Please try again." };
  }
}

export async function deleteRoadmapAction(
  _previousState: RoadmapActionState,
  formData: FormData
): Promise<RoadmapActionState> {
  try {
    const rawId = formData.get("id");
    const id = validateRoadmapId(rawId);

    await deleteRoadmap(id);
  } catch (err) {
    // requireUser() redirects through a thrown control-flow error; never swallow it.
    unstable_rethrow(err);
    if (err && typeof err === "object" && "fieldErrors" in err) {
      return { error: "Please correct the highlighted fields.", fieldErrors: (err as { fieldErrors: Record<string, string> }).fieldErrors };
    }
    return { error: "Could not delete roadmap. Please try again." };
  }

  // Outside any try/catch: redirect() works by throwing.
  revalidatePath("/roadmaps");
  revalidatePath("/goals");
  redirect("/roadmaps");
}

export async function createRoadmapStepAction(
  _previousState: RoadmapActionState,
  formData: FormData
): Promise<RoadmapActionState> {
  try {
    const rawInput = {
      roadmapId: formData.get("roadmapId"),
      title: formData.get("title"),
      description: formData.get("description") ?? undefined,
      order: formData.get("order") ? Number(formData.get("order")) : undefined,
    };

    const input = validateCreateStep(rawInput);
    await createRoadmapStep(input);
    await updateRoadmapProgress(input.roadmapId);

    revalidatePath(`/roadmaps/${input.roadmapId}`);
    revalidatePath("/roadmaps");
    return { message: "Step created successfully." };
  } catch (err) {
    if (err && typeof err === "object" && "fieldErrors" in err) {
      return { error: "Please correct the highlighted fields.", fieldErrors: (err as { fieldErrors: Record<string, string> }).fieldErrors };
    }
    const message = err instanceof Error ? err.message : "Could not create step. Please try again.";
    return { error: message };
  }
}

export async function updateRoadmapStepAction(
  _previousState: RoadmapActionState,
  formData: FormData
): Promise<RoadmapActionState> {
  try {
    const rawId = formData.get("id");
    const id = validateStepId(rawId);

    const rawInput = {
      title: formData.get("title") ?? undefined,
      description: formData.get("description") ?? undefined,
      status: formData.get("status") ?? undefined,
    };

    const input = validateUpdateStep(rawInput);
    const step = await updateRoadmapStep(id, input);
    await updateRoadmapProgress(step.roadmap_id);

    revalidatePath("/roadmaps");
    revalidatePath(`/roadmaps/${step.roadmap_id}`);
    return { message: "Step updated successfully." };
  } catch (err) {
    if (err && typeof err === "object" && "fieldErrors" in err) {
      return { error: "Please correct the highlighted fields.", fieldErrors: (err as { fieldErrors: Record<string, string> }).fieldErrors };
    }
    return { error: "Could not update step. Please try again." };
  }
}

export async function updateRoadmapStepStatusAction(
  _previousState: RoadmapActionState,
  formData: FormData
): Promise<RoadmapActionState> {
  try {
    const rawId = formData.get("id");
    const id = validateStepId(rawId);

    const status = formData.get("status");
    if (!status || !["PENDING", "IN_PROGRESS", "COMPLETED"].includes(status as string)) {
      return { error: "Invalid status." };
    }

    const step = await updateRoadmapStep(id, { status: status as "PENDING" | "IN_PROGRESS" | "COMPLETED" });
    await updateRoadmapProgress(step.roadmap_id);

    revalidatePath("/roadmaps");
    revalidatePath(`/roadmaps/${step.roadmap_id}`);
    return { message: "Status updated." };
  } catch {
    return { error: "Could not update status. Please try again." };
  }
}

export async function deleteRoadmapStepAction(
  _previousState: RoadmapActionState,
  formData: FormData
): Promise<RoadmapActionState> {
  try {
    const rawId = formData.get("id");
    const id = validateStepId(rawId);

    const roadmapId = await deleteRoadmapStep(id);
    await updateRoadmapProgress(roadmapId);

    revalidatePath("/roadmaps");
    revalidatePath(`/roadmaps/${roadmapId}`);
    return { message: "Step deleted." };
  } catch (err) {
    if (err && typeof err === "object" && "fieldErrors" in err) {
      return { error: "Please correct the highlighted fields.", fieldErrors: (err as { fieldErrors: Record<string, string> }).fieldErrors };
    }
    return { error: "Could not delete step. Please try again." };
  }
}

export async function reorderRoadmapStepsAction(
  _previousState: RoadmapActionState,
  formData: FormData
): Promise<RoadmapActionState> {
  try {
    const rawInput = {
      roadmapId: formData.get("roadmapId"),
      steps: JSON.parse(String(formData.get("steps"))),
    };

    const input = validateReorderSteps(rawInput);
    await reorderRoadmapSteps(input.roadmapId, input.steps);

    revalidatePath(`/roadmaps/${input.roadmapId}`);
    return { message: "Steps reordered." };
  } catch (err) {
    if (err && typeof err === "object" && "fieldErrors" in err) {
      return { error: "Please correct the highlighted fields.", fieldErrors: (err as { fieldErrors: Record<string, string> }).fieldErrors };
    }
    return { error: "Could not reorder steps. Please try again." };
  }
}

export async function associateGoalRoadmapAction(
  _previousState: RoadmapActionState,
  formData: FormData
): Promise<RoadmapActionState> {
  try {
    const rawInput = {
      goalId: formData.get("goalId"),
      roadmapId: formData.get("roadmapId"),
    };

    const input = validateAssociateGoalRoadmap(rawInput);
    await addGoalToRoadmap(input.goalId, input.roadmapId);

    revalidatePath(`/roadmaps/${input.roadmapId}`);
    revalidatePath(`/goals/${input.goalId}`);
    revalidatePath("/goals");
    return { message: "Goal added to roadmap." };
  } catch (err) {
    if (err && typeof err === "object" && "fieldErrors" in err) {
      return { error: "Please correct the highlighted fields.", fieldErrors: (err as { fieldErrors: Record<string, string> }).fieldErrors };
    }
    return { error: "Could not associate goal with roadmap. Please try again." };
  }
}

export async function removeGoalFromRoadmapAction(
  _previousState: RoadmapActionState,
  formData: FormData
): Promise<RoadmapActionState> {
  try {
    const rawInput = {
      goalId: formData.get("goalId"),
      roadmapId: formData.get("roadmapId"),
    };

    const input = validateRemoveGoalRoadmap(rawInput);
    await removeGoalFromRoadmap(input.goalId, input.roadmapId);

    revalidatePath(`/roadmaps/${input.roadmapId}`);
    revalidatePath(`/goals/${input.goalId}`);
    revalidatePath("/goals");
    return { message: "Goal removed from roadmap." };
  } catch (err) {
    if (err && typeof err === "object" && "fieldErrors" in err) {
      return { error: "Please correct the highlighted fields.", fieldErrors: (err as { fieldErrors: Record<string, string> }).fieldErrors };
    }
    return { error: "Could not remove goal from roadmap. Please try again." };
  }
}