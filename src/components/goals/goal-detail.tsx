"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useState } from "react";

import { updateGoalStatusAction, updateGoalPriorityAction, deleteGoalAction, initialGoalActionState } from "@/lib/goals/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { EditGoalDialog } from "./edit-goal-dialog";
import { ArrowLeftIcon, CalendarIcon, TargetIcon, TrashIcon } from "lucide-react";

interface GoalDetailProps {
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

function StatusBadge({ status }: { status: "ACTIVE" | "COMPLETED" | "ARCHIVED" }) {
  const variants = {
    ACTIVE: "default" as const,
    COMPLETED: "secondary" as const,
    ARCHIVED: "outline" as const,
  };
  return <Badge variant={variants[status]}>{status}</Badge>;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

function formatDateTime(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" variant="ghost" className="w-full justify-start text-left text-destructive" disabled={pending}>{pending ? "Deleting…" : "Delete goal"}</Button>;
}

export function GoalDetail({ goal }: GoalDetailProps) {
  const [deleteState, deleteFormAction] = useActionState(deleteGoalAction, initialGoalActionState);
  const [, statusFormAction] = useActionState(updateGoalStatusAction, initialGoalActionState);
  const [priorityState, priorityFormAction] = useActionState(updateGoalPriorityAction, initialGoalActionState);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/goals" className="text-muted-foreground hover:text-foreground">
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="sr-only">Back to goals</span>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{goal.title}</h1>
          <p className="text-muted-foreground text-sm">Created {formatDateTime(goal.created_at)}</p>
        </div>
      </div>

      {goal.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{goal.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={statusFormAction} className="space-y-2">
              <input type="hidden" name="id" value={goal.id} />
              <StatusBadge status={goal.status} />
              <select
                name="status"
                value={goal.status}
                onChange={(e) => (e.currentTarget as HTMLSelectElement).form?.requestSubmit()}
                className="w-full border rounded px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Change status"
              >
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={priorityFormAction} className="space-y-2">
              <input type="hidden" name="id" value={goal.id} />
              <div className="flex items-center gap-2">
                <input
                  name="priority"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={goal.priority}
                  className="w-20 border rounded px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Priority"
                />
                <Button type="submit" variant="outline" size="sm" disabled={Boolean(priorityState.error || priorityState.message)}>
                  Update
                </Button>
              </div>
              {priorityState.message && <p className="text-green-600 text-xs">Priority updated</p>}
              {priorityState.error && <p className="text-destructive text-xs">{priorityState.error}</p>}
            </form>
            <p className="mt-1 text-xs text-muted-foreground">Higher values = higher priority</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Target date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-2">
              <TargetIcon className="h-4 w-4 text-muted-foreground" />
              <span>{goal.target_date ? formatDate(goal.target_date) : "Not set"}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Last updated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>{formatDateTime(goal.updated_at)}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Manage this goal</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <EditGoalDialog goal={goal} />

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <TrashIcon className="mr-2 h-4 w-4" />
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
        </CardContent>
      </Card>
    </div>
  );
}