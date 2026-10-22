"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { associateGoalRoadmapAction, removeGoalFromRoadmapAction } from "@/lib/roadmaps/actions";
import { initialRoadmapActionState } from "@/lib/roadmaps/constants";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon, LinkIcon, UnlinkIcon } from "lucide-react";

interface GoalRoadmapAssociationsProps {
  roadmapId: string;
  currentGoals: {
    id: string;
    title: string;
    status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  }[];
  availableGoals: {
    id: string;
    title: string;
    status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  }[];
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export function GoalRoadmapAssociations({ roadmapId, currentGoals, availableGoals }: GoalRoadmapAssociationsProps) {
  const [associateState, associateFormAction] = useActionState(associateGoalRoadmapAction, initialRoadmapActionState);
  const [removeState, removeFormAction] = useActionState(removeGoalFromRoadmapAction, initialRoadmapActionState);

  const unassociatedGoals = availableGoals.filter(
    (g) => !currentGoals.some((cg) => cg.id === g.id)
  );

  return (
    <div className="space-y-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={unassociatedGoals.length === 0}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Goals
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Goals to Roadmap</DialogTitle>
            <DialogDescription>
              Select one or more Goals to associate with this Roadmap.
            </DialogDescription>
          </DialogHeader>
          <form action={associateFormAction} className="space-y-4">
            <input type="hidden" name="roadmapId" value={roadmapId} />

            {associateState.error && (
              <p role="alert" className="text-destructive text-sm">
                {associateState.error}
              </p>
            )}

            {unassociatedGoals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                All your Goals are already associated with this Roadmap.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {unassociatedGoals.map((goal) => (
                  <div key={goal.id} className="flex items-center gap-3 p-2 rounded-lg border hover:bg-accent transition-colors">
                    <Checkbox
                      name="goalId"
                      value={goal.id}
                      id={`goal-${goal.id}`}
                    />
                    <Label htmlFor={`goal-${goal.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium">{goal.title}</div>
                      <div className="text-xs text-muted-foreground capitalize">{goal.status.toLowerCase()}</div>
                    </Label>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => (document.querySelector('[data-slot="dialog-close"]') as HTMLButtonElement)?.click()}>
                Cancel
              </Button>
              <SubmitButton />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {currentGoals.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Connected Goals ({currentGoals.length})</h4>
          <div className="space-y-1">
            {currentGoals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between p-2 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">{goal.title}</div>
                    <div className="text-xs text-muted-foreground capitalize">{goal.status.toLowerCase()}</div>
                  </div>
                </div>
                <form action={removeFormAction} className="inline">
                  <input type="hidden" name="goalId" value={goal.id} />
                  <input type="hidden" name="roadmapId" value={roadmapId} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    disabled={Boolean(removeState.error || removeState.message)}
                    aria-label={`Remove ${goal.title} from roadmap`}
                  >
                    <UnlinkIcon className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}