"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";

import { fieldErrorsFrom } from "@/lib/validations/auth";
import {
  createResourceSchema,
  updateResourceSchema,
  resourceIdSchema,
  stepResourceAssociationSchema,
  type CreateResourceInput,
  type UpdateResourceInput,
  type ResourceId,
  type StepResourceAssociationInput,
} from "@/lib/validations/resources";
import {
  createResource,
  updateResource,
  deleteResource,
  toggleArchiveResource,
  addResourceToStep,
  removeResourceFromStep,
} from "@/lib/resources";
import type { ResourceActionState } from "@/lib/resources/constants";

export type { ResourceActionState };

function validateCreateResource(input: unknown): CreateResourceInput {
  const parsed = createResourceSchema.safeParse(input);
  if (!parsed.success) {
    throw { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  return parsed.data;
}

function validateUpdateResource(input: unknown): UpdateResourceInput {
  const parsed = updateResourceSchema.safeParse(input);
  if (!parsed.success) {
    throw { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  return parsed.data;
}

function validateResourceId(input: unknown): ResourceId {
  const parsed = resourceIdSchema.safeParse(input);
  if (!parsed.success) {
    throw { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  return parsed.data;
}

function validateStepResourceAssociation(input: unknown): StepResourceAssociationInput {
  const parsed = stepResourceAssociationSchema.safeParse(input);
  if (!parsed.success) {
    throw { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  return parsed.data;
}

export async function createResourceAction(
  _previousState: ResourceActionState,
  formData: FormData
): Promise<ResourceActionState> {
  let resourceId: string;
  const redirectTo = formData.get("redirectTo") as string | null;

  try {
    const stepIds = formData.getAll("step_ids").map((id) => String(id)).filter(Boolean);

    const rawInput = {
      title: formData.get("title"),
      type: formData.get("type"),
      url: formData.get("url") ?? undefined,
      category: formData.get("category") ?? undefined,
      description: formData.get("description") ?? undefined,
      author: formData.get("author") ?? undefined,
      goal_id: formData.get("goal_id") ?? undefined,
      step_ids: stepIds.length > 0 ? stepIds : undefined,
    };

    const input = validateCreateResource(rawInput);
    const resource = await createResource(input);
    resourceId = resource.id;
  } catch (err) {
    unstable_rethrow(err);
    if (err && typeof err === "object" && "fieldErrors" in err) {
      return {
        error: "Please correct the highlighted fields.",
        fieldErrors: (err as { fieldErrors: Record<string, string> }).fieldErrors,
      };
    }
    return { error: "Could not create resource. Please try again." };
  }

  revalidatePath("/resources");
  revalidatePath("/dashboard");
  if (redirectTo) {
    revalidatePath(redirectTo);
    redirect(redirectTo);
  }
  redirect(`/resources/${resourceId}`);
}

export async function updateResourceAction(
  _previousState: ResourceActionState,
  formData: FormData
): Promise<ResourceActionState> {
  try {
    const rawId = formData.get("id");
    const id = validateResourceId(rawId);

    const hasStepIds = formData.has("step_ids");
    const stepIds = hasStepIds
      ? formData.getAll("step_ids").map((sid) => String(sid)).filter(Boolean)
      : undefined;

    const rawInput = {
      title: formData.get("title") ?? undefined,
      type: formData.get("type") ?? undefined,
      url: formData.get("url") ?? undefined,
      category: formData.get("category") ?? undefined,
      description: formData.get("description") ?? undefined,
      author: formData.get("author") ?? undefined,
      goal_id: formData.get("goal_id") ?? undefined,
      is_archived: formData.has("is_archived")
        ? formData.get("is_archived") === "true"
        : undefined,
      step_ids: stepIds,
    };

    const input = validateUpdateResource(rawInput);
    await updateResource(id, input);

    revalidatePath("/resources");
    revalidatePath(`/resources/${id}`);
    revalidatePath("/dashboard");
    return { message: "Resource updated successfully." };
  } catch (err) {
    unstable_rethrow(err);
    if (err && typeof err === "object" && "fieldErrors" in err) {
      return {
        error: "Please correct the highlighted fields.",
        fieldErrors: (err as { fieldErrors: Record<string, string> }).fieldErrors,
      };
    }
    return { error: "Could not update resource. Please try again." };
  }
}

export async function toggleArchiveResourceAction(
  _previousState: ResourceActionState,
  formData: FormData
): Promise<ResourceActionState> {
  try {
    const rawId = formData.get("id");
    const id = validateResourceId(rawId);
    const isArchived = formData.get("is_archived") === "true";

    await toggleArchiveResource(id, isArchived);

    revalidatePath("/resources");
    revalidatePath(`/resources/${id}`);
    revalidatePath("/dashboard");
    return {
      message: isArchived ? "Resource archived." : "Resource restored from archive.",
    };
  } catch (err) {
    unstable_rethrow(err);
    return { error: "Could not update archive status. Please try again." };
  }
}

export async function deleteResourceAction(
  _previousState: ResourceActionState,
  formData: FormData
): Promise<ResourceActionState> {
  try {
    const rawId = formData.get("id");
    const id = validateResourceId(rawId);

    await deleteResource(id);
  } catch (err) {
    unstable_rethrow(err);
    if (err && typeof err === "object" && "fieldErrors" in err) {
      return {
        error: "Please correct the highlighted fields.",
        fieldErrors: (err as { fieldErrors: Record<string, string> }).fieldErrors,
      };
    }
    return { error: "Could not delete resource. Please try again." };
  }

  revalidatePath("/resources");
  revalidatePath("/dashboard");
  redirect("/resources");
}

export async function associateResourceWithStepAction(
  _previousState: ResourceActionState,
  formData: FormData
): Promise<ResourceActionState> {
  try {
    const rawInput = {
      step_id: formData.get("step_id"),
      resource_id: formData.get("resource_id"),
    };

    const input = validateStepResourceAssociation(rawInput);
    await addResourceToStep(input.step_id, input.resource_id);

    const roadmapId = formData.get("roadmap_id") as string | null;
    if (roadmapId) {
      revalidatePath(`/roadmaps/${roadmapId}`);
    }
    revalidatePath(`/resources/${input.resource_id}`);
    revalidatePath("/resources");

    return { message: "Resource linked to step." };
  } catch (err) {
    unstable_rethrow(err);
    return { error: "Could not link resource to step. Please try again." };
  }
}

export async function dissociateResourceFromStepAction(
  _previousState: ResourceActionState,
  formData: FormData
): Promise<ResourceActionState> {
  try {
    const rawInput = {
      step_id: formData.get("step_id"),
      resource_id: formData.get("resource_id"),
    };

    const input = validateStepResourceAssociation(rawInput);
    await removeResourceFromStep(input.step_id, input.resource_id);

    const roadmapId = formData.get("roadmap_id") as string | null;
    if (roadmapId) {
      revalidatePath(`/roadmaps/${roadmapId}`);
    }
    revalidatePath(`/resources/${input.resource_id}`);
    revalidatePath("/resources");

    return { message: "Resource unlinked from step." };
  } catch (err) {
    unstable_rethrow(err);
    return { error: "Could not unlink resource from step. Please try again." };
  }
}

