"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createRoadmapAction } from "@/lib/roadmaps/actions";
import { initialRoadmapActionState } from "@/lib/roadmaps/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { MapIcon } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating…" : "Create roadmap"}
    </Button>
  );
}

export function CreateRoadmapDialog({ preSelectedGoalIds }: { preSelectedGoalIds?: string[] } = {}) {
  const [state, formAction] = useActionState(createRoadmapAction, initialRoadmapActionState);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <MapIcon className="mr-2 h-4 w-4" />
          Create roadmap
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create roadmap</DialogTitle>
          <DialogDescription>Define a new learning roadmap with ordered steps.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
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
              placeholder="e.g., Data Engineering Fundamentals"
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
              placeholder="What does this roadmap cover?"
              aria-invalid={Boolean(state.fieldErrors?.description)}
            />
            {state.fieldErrors?.description && (
              <p className="text-destructive text-sm">{state.fieldErrors.description}</p>
            )}
          </div>

          {preSelectedGoalIds && preSelectedGoalIds.length > 0 && (
            <div className="space-y-2">
              <Label>Pre-selected Goals</Label>
              <p className="text-sm text-muted-foreground">
                This roadmap will be associated with {preSelectedGoalIds.length} goal(s).
              </p>
              {preSelectedGoalIds.map((goalId) => (
                <input type="hidden" key={goalId} name="goalIds" value={goalId} />
              ))}
            </div>
          )}

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