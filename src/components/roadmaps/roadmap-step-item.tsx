"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useState } from "react";

import { updateRoadmapStepAction, deleteRoadmapStepAction, updateRoadmapStepStatusAction, reorderRoadmapStepsAction } from "@/lib/roadmaps/actions";
import { initialRoadmapActionState } from "@/lib/roadmaps/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { TrashIcon, EditIcon, CheckCircleIcon, ChevronUpIcon, ChevronDownIcon, GripVerticalIcon } from "lucide-react";
import { StepResourceDialog } from "@/components/resources/step-resource-dialog";
import type { ResourceRow } from "@/lib/resources";

interface RoadmapStepItemProps {
  step: {
    id: string;
    roadmapId: string;
    title: string;
    description: string | null;
    order: number;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    completed_at: string | null;
    created_at: string;
    updated_at: string;
  };
  allSteps: {
    id: string;
    order: number;
  }[];
  isFirst: boolean;
  isLast: boolean;
  attachedResources?: ResourceRow[];
  allUserResources?: ResourceRow[];
}

function StatusBadge({ status }: { status: "PENDING" | "IN_PROGRESS" | "COMPLETED" }) {
  const variants = {
    PENDING: "outline" as const,
    IN_PROGRESS: "default" as const,
    COMPLETED: "secondary" as const,
  };
  return <Badge variant={variants[status]}>{status.replace("_", " ")}</Badge>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" variant="ghost" className="w-full justify-start text-left" disabled={pending}>{pending ? "Deleting…" : "Delete step"}</Button>;
}

export function RoadmapStepItem({
  step,
  allSteps,
  isFirst,
  isLast,
  attachedResources,
  allUserResources,
}: RoadmapStepItemProps) {
  const [deleteState, deleteFormAction] = useActionState(deleteRoadmapStepAction, initialRoadmapActionState);
  const [, statusFormAction] = useActionState(updateRoadmapStepStatusAction, initialRoadmapActionState);
  const [editState, editFormAction] = useActionState(updateRoadmapStepAction, initialRoadmapActionState);
  const [, reorderFormAction] = useActionState(reorderRoadmapStepsAction, initialRoadmapActionState);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const computeReorderedSteps = (direction: "up" | "down") => {
    const sorted = [...allSteps].sort((a, b) => a.order - b.order);
    const currentIndex = sorted.findIndex((s) => s.id === step.id);
    if (currentIndex < 0) return sorted;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return sorted;

    const nextSteps = sorted.map((s, i) => {
      if (i === currentIndex) return { id: s.id, order: targetIndex };
      if (i === targetIndex) return { id: s.id, order: currentIndex };
      return { id: s.id, order: i };
    });

    return nextSteps;
  };

  return (
    <article className="border rounded-lg p-4 bg-card transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <form action={reorderFormAction} className="inline">
                <input type="hidden" name="roadmapId" value={step.roadmapId} />
                <input
                  type="hidden"
                  name="steps"
                  value={JSON.stringify(computeReorderedSteps("up"))}
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0"
                  disabled={isFirst}
                  aria-label="Move up"
                >
                  <ChevronUpIcon className="h-4 w-4" />
                </Button>
              </form>
              <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">{step.order + 1}</span>
              <form action={reorderFormAction} className="inline">
                <input type="hidden" name="roadmapId" value={step.roadmapId} />
                <input
                  type="hidden"
                  name="steps"
                  value={JSON.stringify(computeReorderedSteps("down"))}
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0"
                  disabled={isLast}
                  aria-label="Move down"
                >
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </form>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium truncate">{step.title}</h4>
                <StatusBadge status={step.status} />
              </div>
              {step.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{step.description}</p>
              )}
            </div>
          </div>

          <dl className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <dt className="sr-only">Status</dt>
            <dd>
              <form action={statusFormAction}>
                <input type="hidden" name="id" value={step.id} />
                <select
                  name="status"
                  value={step.status}
                  onChange={(e) => (e.currentTarget as HTMLSelectElement).form?.requestSubmit()}
                  className="border rounded px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Step status"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </form>
            </dd>
            {step.completed_at && (
              <dd className="flex items-center gap-1">
                <CheckCircleIcon className="h-3 w-3 text-green-600" aria-hidden="true" />
                <span suppressHydrationWarning>
                  Completed{" "}
                  {new Date(step.completed_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </dd>
            )}
          </dl>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {allUserResources && (
            <StepResourceDialog
              stepId={step.id}
              roadmapId={step.roadmapId}
              stepTitle={step.title}
              attachedResources={attachedResources ?? []}
              allUserResources={allUserResources}
            />
          )}

          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Step actions">
              <GripVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <EditIcon className="h-4 w-4" />
                    Edit step
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit step</DialogTitle>
                    <DialogDescription>Update your learning step details.</DialogDescription>
                  </DialogHeader>
                  <form action={editFormAction} className="space-y-4">
                    <input type="hidden" name="id" value={step.id} />

                    {editState.error && (
                      <p role="alert" className="text-destructive text-sm">
                        {editState.error}
                      </p>
                    )}
                    {editState.message && (
                      <p role="status" className="text-green-600 text-sm">
                        {editState.message}
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
                        defaultValue={step.title}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description (optional)</Label>
                      <Textarea
                        id="description"
                        name="description"
                        autoComplete="off"
                        rows={3}
                        defaultValue={step.description ?? ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <select
                        id="status"
                        name="status"
                        defaultValue={step.status}
                        className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save changes</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" asChild>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-destructive focus:text-destructive">
                    <TrashIcon className="h-4 w-4" />
                    Delete step
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Delete step</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to permanently delete &ldquo;{step.title}&rdquo;? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <form action={deleteFormAction} className="space-y-4">
                    <input type="hidden" name="id" value={step.id} />
                    <p className="text-sm text-muted-foreground">
                      This will permanently delete the step.
                      Step & Resource associations will be removed.
                      Resources, Notes, Summaries, and Learning Activities will be preserved.
                    </p>
                    {deleteState.error && (
                      <p role="alert" className="text-destructive text-sm">{deleteState.error}</p>
                    )}
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <SubmitButton />
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </article>
  );
}