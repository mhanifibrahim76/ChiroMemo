"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useState } from "react";

import { updateGoalStatusAction, deleteGoalAction, initialGoalActionState } from "@/lib/goals/actions";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { TrashIcon, EditIcon, CheckCircleIcon, ArchiveIcon, RotateCcwIcon, CalendarIcon } from "lucide-react";

interface GoalCardProps {
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

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" variant="ghost" className="w-full justify-start text-left" disabled={pending}>{pending ? "Deleting…" : "Delete goal"}</Button>;
}

export function GoalCard({ goal }: GoalCardProps) {
  const [deleteState, deleteFormAction] = useActionState(deleteGoalAction, initialGoalActionState);
  const [, statusFormAction] = useActionState(updateGoalStatusAction, initialGoalActionState);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <article className="border rounded-lg p-4 bg-card transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link href={`/goals/${goal.id}`} className="block">
            <h3 className="font-semibold text-lg truncate">{goal.title}</h3>
          </Link>
          {goal.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{goal.description}</p>
          )}
          <dl className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <dt className="sr-only">Status</dt>
            <dd>
              <form action={statusFormAction}>
                <input type="hidden" name="id" value={goal.id} />
                <select
                  name="status"
                  value={goal.status}
                  onChange={(e) => (e.currentTarget as HTMLSelectElement).form?.requestSubmit()}
                  className="border rounded px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Goal status"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </form>
            </dd>
            <dt className="sr-only">Priority</dt>
            <dd className="flex items-center gap-1">
              <span className="font-mono px-2 py-0.5 bg-muted rounded">{goal.priority}</span>
              <span className="text-xs">priority</span>
            </dd>
            {goal.target_date && (
              <>
                <dt className="sr-only">Target date</dt>
                <dd className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                  <span>{formatDate(goal.target_date)}</span>
                </dd>
              </>
            )}
            <dt className="sr-only">Created</dt>
            <dd className="text-xs">Created {formatDate(goal.created_at)}</dd>
          </dl>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Goal actions">
              <EditIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {}}>Edit goal</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <form action={statusFormAction}>
                <input type="hidden" name="id" value={goal.id} />
                <input type="hidden" name="status" value="ACTIVE" />
                <Button type="submit" variant="ghost" className="w-full justify-start gap-2" disabled={goal.status === "ACTIVE"}>
                  <RotateCcwIcon className="h-4 w-4" />
                  Mark active
                </Button>
              </form>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <form action={statusFormAction}>
                <input type="hidden" name="id" value={goal.id} />
                <input type="hidden" name="status" value="COMPLETED" />
                <Button type="submit" variant="ghost" className="w-full justify-start gap-2" disabled={goal.status === "COMPLETED"}>
                  <CheckCircleIcon className="h-4 w-4" />
                  Mark completed
                </Button>
              </form>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <form action={statusFormAction}>
                <input type="hidden" name="id" value={goal.id} />
                <input type="hidden" name="status" value="ARCHIVED" />
                <Button type="submit" variant="ghost" className="w-full justify-start gap-2" disabled={goal.status === "ARCHIVED"}>
                  <ArchiveIcon className="h-4 w-4" />
                  Archive
                </Button>
              </form>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" asChild>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-destructive focus:text-destructive">
                    <TrashIcon className="h-4 w-4" />
                    Delete goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Delete goal</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to permanently delete &ldquo;{goal.title}&rdquo;? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <form action={deleteFormAction} className="space-y-4">
                    <input type="hidden" name="id" value={goal.id} />
                    <p className="text-sm text-muted-foreground">
                      This will permanently delete the goal and remove its connections to any roadmaps.
                      The roadmaps themselves and all other learning data (resources, notes, summaries, activities) will be preserved.
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
    </article>
  );
}