"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { updateRoadmapAction } from "@/lib/roadmaps/actions";
import { initialRoadmapActionState } from "@/lib/roadmaps/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { EditIcon, AlertTriangleIcon } from "lucide-react";

interface EditRoadmapDialogProps {
  roadmap: {
    id: string;
    title: string;
    description: string | null;
    progress_percent: number;
    created_at: string;
    updated_at: string;
    goalCount: number;
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

export function EditRoadmapDialog({ roadmap }: EditRoadmapDialogProps) {
  const [state, formAction] = useActionState(updateRoadmapAction, initialRoadmapActionState);

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
          <DialogTitle>Edit roadmap</DialogTitle>
          <DialogDescription>Update your learning roadmap details.</DialogDescription>
        </DialogHeader>
        {roadmap.goalCount > 1 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Shared Roadmap</p>
              <p className="text-xs text-yellow-700 mt-0.5">
                This Roadmap is shared by {roadmap.goalCount} Goals. Changes to this Roadmap affect all connected Goals.
              </p>
            </div>
          </div>
        )}
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={roadmap.id} />

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
              defaultValue={roadmap.title}
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
              defaultValue={roadmap.description ?? ""}
              aria-invalid={Boolean(state.fieldErrors?.description)}
            />
            {state.fieldErrors?.description && (
              <p className="text-destructive text-sm">{state.fieldErrors.description}</p>
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