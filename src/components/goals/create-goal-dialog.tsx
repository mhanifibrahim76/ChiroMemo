"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createGoalAction, initialGoalActionState } from "@/lib/goals/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { TargetIcon } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating…" : "Create goal"}
    </Button>
  );
}

export function CreateGoalDialog() {
  const [state, formAction] = useActionState(createGoalAction, initialGoalActionState);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <TargetIcon className="mr-2 h-4 w-4" />
          Create goal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create goal</DialogTitle>
          <DialogDescription>Define a new learning goal to track your progress.</DialogDescription>
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
              placeholder="e.g., Learn TypeScript"
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
              placeholder="What do you want to achieve?"
              aria-invalid={Boolean(state.fieldErrors?.description)}
            />
            {state.fieldErrors?.description && (
              <p className="text-destructive text-sm">{state.fieldErrors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_date">Target date (optional)</Label>
            <Input
              id="target_date"
              name="target_date"
              type="date"
              autoComplete="off"
              aria-invalid={Boolean(state.fieldErrors?.target_date)}
            />
            {state.fieldErrors?.target_date && (
              <p className="text-destructive text-sm">{state.fieldErrors.target_date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority (optional)</Label>
            <Input
              id="priority"
              name="priority"
              type="number"
              min="0"
              step="1"
              autoComplete="off"
              placeholder="0"
              aria-invalid={Boolean(state.fieldErrors?.priority)}
            />
            <p className="text-muted-foreground text-xs">Higher values indicate higher priority. Default is 0.</p>
            {state.fieldErrors?.priority && (
              <p className="text-destructive text-sm">{state.fieldErrors.priority}</p>
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