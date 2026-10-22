"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

import { updateResourceAction } from "@/lib/resources/actions";
import { initialResourceActionState } from "@/lib/resources/constants";
import { RESOURCE_TYPES, type ResourceType } from "@/lib/validations/resources";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditResourceDialogProps {
  resource: {
    id: string;
    title: string;
    type: ResourceType;
    url: string | null;
    file_path: string | null;
    category: string | null;
    description: string | null;
    author: string | null;
    goal_id: string | null;
    is_archived: boolean;
  };
  availableGoals?: { id: string; title: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Saving changes…" : "Save changes"}
    </Button>
  );
}

export function EditResourceDialog({
  resource,
  availableGoals = [],
  open,
  onOpenChange,
}: EditResourceDialogProps) {
  const [state, formAction] = useActionState(
    updateResourceAction,
    initialResourceActionState
  );

  // Close dialog on successful update
  useEffect(() => {
    if (state.message && !state.error) {
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit learning resource</DialogTitle>
          <DialogDescription>
            Update metadata, classification, or linked learning goals.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={resource.id} />

          {state.error && (
            <p role="alert" className="text-destructive text-sm font-medium">
              {state.error}
            </p>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor={`edit-resource-title-${resource.id}`}>Title *</Label>
            <Input
              id={`edit-resource-title-${resource.id}`}
              name="title"
              type="text"
              required
              defaultValue={resource.title}
              aria-invalid={Boolean(state.fieldErrors?.title)}
            />
            {state.fieldErrors?.title && (
              <p className="text-destructive text-xs">{state.fieldErrors.title}</p>
            )}
          </div>

          {/* Type and Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor={`edit-resource-type-${resource.id}`}>Resource type *</Label>
              <select
                id={`edit-resource-type-${resource.id}`}
                name="type"
                defaultValue={resource.type}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                required
              >
                {RESOURCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              {state.fieldErrors?.type && (
                <p className="text-destructive text-xs">{state.fieldErrors.type}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`edit-resource-category-${resource.id}`}>Category (optional)</Label>
              <Input
                id={`edit-resource-category-${resource.id}`}
                name="category"
                type="text"
                defaultValue={resource.category ?? ""}
                placeholder="e.g. Computer Science, Math"
                aria-invalid={Boolean(state.fieldErrors?.category)}
              />
              {state.fieldErrors?.category && (
                <p className="text-destructive text-xs">{state.fieldErrors.category}</p>
              )}
            </div>
          </div>

          {/* URL */}
          <div className="space-y-1.5">
            <Label htmlFor={`edit-resource-url-${resource.id}`}>
              URL / Link (optional)
            </Label>
            <Input
              id={`edit-resource-url-${resource.id}`}
              name="url"
              type="url"
              defaultValue={resource.url ?? ""}
              placeholder="https://example.com/material"
              aria-invalid={Boolean(state.fieldErrors?.url)}
            />
            {state.fieldErrors?.url && (
              <p className="text-destructive text-xs">{state.fieldErrors.url}</p>
            )}
          </div>

          {/* Author and Goal Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor={`edit-resource-author-${resource.id}`}>Author / Instructor (optional)</Label>
              <Input
                id={`edit-resource-author-${resource.id}`}
                name="author"
                type="text"
                defaultValue={resource.author ?? ""}
                placeholder="e.g. Harold Abelson"
                aria-invalid={Boolean(state.fieldErrors?.author)}
              />
              {state.fieldErrors?.author && (
                <p className="text-destructive text-xs">{state.fieldErrors.author}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`edit-resource-goal-${resource.id}`}>Associated goal (optional)</Label>
              <select
                id={`edit-resource-goal-${resource.id}`}
                name="goal_id"
                defaultValue={resource.goal_id ?? ""}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">None (General library)</option>
                {availableGoals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor={`edit-resource-description-${resource.id}`}>Description / Notes (optional)</Label>
            <Textarea
              id={`edit-resource-description-${resource.id}`}
              name="description"
              rows={3}
              defaultValue={resource.description ?? ""}
              placeholder="Key topics covered, reading chapters, or why this resource is useful..."
              aria-invalid={Boolean(state.fieldErrors?.description)}
            />
            {state.fieldErrors?.description && (
              <p className="text-destructive text-xs">{state.fieldErrors.description}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

