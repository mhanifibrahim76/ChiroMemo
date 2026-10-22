"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { updateGoalAction } from "@/lib/goals/actions";
import { initialGoalActionState } from "@/lib/goals/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { EditIcon } from "lucide-react";

interface EditGoalDialogProps {
  goal: {
    id: string;
    title: string;
    description: string | null;
    status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
    priority: number;
    target_date: string | null;
    created_at: string;
    updated_at: string;
  };
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export function EditGoalDialog({ goal }: EditGoalDialogProps) {
  const [state, formAction] = useActionState(updateGoalAction, initialGoalActionState);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <EditIcon className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit goal</DialogTitle>
          <DialogDescription>Update your learning goal details.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={goal.id} />

          {state.error && (
            <p role="alert" className="text-destructive text-sm">
              {state.error}
            </p>
          )}

          {state.message && (
            <p role="status" className="text-green-600 text-sm">
              {state.message}
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
              defaultValue={goal.title}
              aria-invalid={Boolean(state.fieldErrors?.title)}
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
              defaultValue={goal.description ?? ""}
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
              defaultValue={goal.target_date ? goal.target_date.split("T")[0] : ""}
              aria-invalid={Boolean(state.fieldErrors?.target_date)}
            />
            {state.fieldErrors?.target_date && (
              <p className="text-destructive text-sm">{state.fieldErrors.target_date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Input
              id="priority"
              name="priority"
              type="number"
              min="0"
              step="1"
              autoComplete="off"
              defaultValue={goal.priority}
              aria-invalid={Boolean(state.fieldErrors?.priority)}
            />
            <p className="text-muted-foreground text-xs">Higher values indicate higher priority.</p>
            {state.fieldErrors?.priority && (
              <p className="text-destructive text-sm">{state.fieldErrors.priority}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={goal.status}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50"
              aria-invalid={Boolean(state.fieldErrors?.status)}
            >
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            {state.fieldErrors?.status && (
              <p className="text-destructive text-sm">{state.fieldErrors.status}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => (document.querySelector('[data-slot="dialog-close"]') as HTMLButtonElement)?.click()}>
              Cancel
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}