"use client";

import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";

import { createResourceAction } from "@/lib/resources/actions";
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
  DialogTrigger,
} from "@/components/ui/dialog";

interface CreateResourceDialogProps {
  availableGoals?: { id: string; title: string }[];
  initialGoalId?: string | null;
  trigger?: React.ReactNode;
  redirectTo?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Adding resource…" : "Add resource"}
    </Button>
  );
}

export function CreateResourceDialog({
  availableGoals = [],
  initialGoalId,
  trigger,
  redirectTo,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CreateResourceDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const [state, formAction] = useActionState(
    createResourceAction,
    initialResourceActionState
  );
  const [selectedType, setSelectedType] = useState<ResourceType>("WEBSITE");

  // Close dialog on successful creation if no redirect happened
  useEffect(() => {
    if (state.message && !state.error) {
      setOpen(false);
    }
  }, [state, setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add resource
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add learning resource</DialogTitle>
          <DialogDescription>
            Save an article, book, course, video, or PDF material to your library.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

          {state.error && (
            <p role="alert" className="text-destructive text-sm font-medium">
              {state.error}
            </p>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="create-resource-title">Title *</Label>
            <Input
              id="create-resource-title"
              name="title"
              type="text"
              required
              placeholder="e.g. Structure and Interpretation of Computer Programs"
              aria-invalid={Boolean(state.fieldErrors?.title)}
            />
            {state.fieldErrors?.title && (
              <p className="text-destructive text-xs">{state.fieldErrors.title}</p>
            )}
          </div>

          {/* Type and Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="create-resource-type">Resource type *</Label>
              <select
                id="create-resource-type"
                name="type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ResourceType)}
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
              <Label htmlFor="create-resource-category">Category (optional)</Label>
              <Input
                id="create-resource-category"
                name="category"
                type="text"
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
            <Label htmlFor="create-resource-url">
              {selectedType === "PDF" ? "PDF URL or link (optional)" : "URL / Web link (optional)"}
            </Label>
            <Input
              id="create-resource-url"
              name="url"
              type="url"
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
              <Label htmlFor="create-resource-author">Author / Instructor (optional)</Label>
              <Input
                id="create-resource-author"
                name="author"
                type="text"
                placeholder="e.g. Harold Abelson"
                aria-invalid={Boolean(state.fieldErrors?.author)}
              />
              {state.fieldErrors?.author && (
                <p className="text-destructive text-xs">{state.fieldErrors.author}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-resource-goal">Associated goal (optional)</Label>
              <select
                id="create-resource-goal"
                name="goal_id"
                defaultValue={initialGoalId ?? ""}
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
            <Label htmlFor="create-resource-description">Description / Notes (optional)</Label>
            <Textarea
              id="create-resource-description"
              name="description"
              rows={3}
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
              onClick={() => setOpen(false)}
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

