"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createRoadmapStepAction } from "@/lib/roadmaps/actions";
import { initialRoadmapActionState } from "@/lib/roadmaps/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";

interface CreateStepDialogProps {
  roadmapId: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating…" : "Create step"}
    </Button>
  );
}

export function CreateStepDialog({ roadmapId }: CreateStepDialogProps) {
  const [state, formAction] = useActionState(createRoadmapStepAction, initialRoadmapActionState);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add step
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create step</DialogTitle>
          <DialogDescription>Add a new step to this roadmap.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="roadmapId" value={roadmapId} />

          {state.error && (
            <p role="alert" className="text-destructive text-sm">
              {state.error}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              type="text"
              autoComplete="off"
              required
              aria-invalid={Boolean(state.fieldErrors?.title)}
              placeholder="e.g., Learn SQL basics"
            />
            {state.fieldErrors?.title && (
              <p className="text-destructive text-sm">{state.fieldErrors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              name="description"
              autoComplete="off"
              rows={3}
              placeholder="What will this step cover?"
              aria-invalid={Boolean(state.fieldErrors?.description)}
            />
            {state.fieldErrors?.description && (
              <p className="text-destructive text-sm">{state.fieldErrors.description}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="mr-auto" onClick={() => (document.querySelector('[data-slot="dialog-close"]') as HTMLButtonElement)?.click()}>
              Cancel
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}