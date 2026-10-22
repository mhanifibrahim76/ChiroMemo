"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useState } from "react";

import { updateGoalStatusAction, updateGoalPriorityAction, deleteGoalAction } from "@/lib/goals/actions";
import { initialGoalActionState } from "@/lib/goals/constants";
import { removeGoalFromRoadmapAction } from "@/lib/roadmaps/actions";
import { initialRoadmapActionState } from "@/lib/roadmaps/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { EditGoalDialog } from "./edit-goal-dialog";
import { CreateRoadmapDialog } from "@/components/roadmaps/create-roadmap-dialog";
import { CreateResourceDialog } from "@/components/resources/create-resource-dialog";
import { ResourceTypeBadge } from "@/components/resources/resource-type-badge";
import type { ResourceType } from "@/lib/validations/resources";
import { ArrowLeftIcon, CalendarIcon, TargetIcon, TrashIcon, UnlinkIcon, BookOpenIcon, ExternalLinkIcon, PlusIcon } from "lucide-react";

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
  roadmaps: {
    id: string;
    title: string;
    description: string | null;
    progress_percent: number;
    created_at: string;
    updated_at: string;
  }[];
  availableRoadmaps: {
    id: string;
    title: string;
    description: string | null;
    progress_percent: number;
    created_at: string;
    updated_at: string;
  }[];
  resources?: {
    id: string;
    title: string;
    type: ResourceType;
    url: string | null;
    category: string | null;
    author: string | null;
  }[];
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
    return new Date(dateString).toLocaleDateString("en-US", {
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
    return new Date(dateString).toLocaleString("en-US", {
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

export function GoalDetail({ goal, roadmaps, availableRoadmaps, resources = [] }: GoalDetailProps) {
  const [deleteState, deleteFormAction] = useActionState(deleteGoalAction, initialGoalActionState);
  const [, statusFormAction] = useActionState(updateGoalStatusAction, initialGoalActionState);
  const [priorityState, priorityFormAction] = useActionState(updateGoalPriorityAction, initialGoalActionState);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const unassociatedRoadmaps = availableRoadmaps.filter(
    (r) => !roadmaps.some((rm) => rm.id === r.id)
  );

  const [, removeRoadmapFormAction] = useActionState(removeGoalFromRoadmapAction, initialRoadmapActionState);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/goals" className="text-muted-foreground hover:text-foreground">
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="sr-only">Back to goals</span>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{goal.title}</h1>
          <p className="text-muted-foreground text-sm" suppressHydrationWarning>Created {formatDateTime(goal.created_at)}</p>
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
              <span suppressHydrationWarning>{goal.target_date ? formatDate(goal.target_date) : "Not set"}</span>
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
              <span suppressHydrationWarning>{formatDateTime(goal.updated_at)}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roadmaps</CardTitle>
          <CardDescription>Learning roadmaps connected to this goal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {roadmaps.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No roadmaps connected yet.</p>
              <CreateRoadmapDialog preSelectedGoalIds={[goal.id]} />
            </div>
          ) : (
            <div className="space-y-2">
              {roadmaps.map((roadmap) => (
                <div key={roadmap.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <Link href={`/roadmaps/${roadmap.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{roadmap.title}</h4>
                      <Badge variant="secondary">{roadmap.progress_percent}%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{roadmap.description ?? "No description"}</p>
                  </Link>
                  <form action={removeRoadmapFormAction} className="inline">
                    <input type="hidden" name="goalId" value={goal.id} />
                    <input type="hidden" name="roadmapId" value={roadmap.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${roadmap.title} from goal`}
                    >
                      <UnlinkIcon className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              ))}
              {unassociatedRoadmaps.length > 0 && (
                <div className="pt-2 border-t">
                  <CreateRoadmapDialog preSelectedGoalIds={[goal.id]} />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Resources Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle>Learning Resources</CardTitle>
            <CardDescription>Materials and study links connected to this goal</CardDescription>
          </div>
          <CreateResourceDialog
            availableGoals={[{ id: goal.id, title: goal.title }]}
            initialGoalId={goal.id}
            redirectTo={`/goals/${goal.id}`}
            trigger={
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <PlusIcon className="h-3.5 w-3.5" />
                Add resource
              </Button>
            }
          />
        </CardHeader>
        <CardContent className="space-y-3">
          {resources.length === 0 ? (
            <div className="text-center py-6">
              <BookOpenIcon className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No resources connected to this goal yet.</p>
              <div className="mt-3">
                <CreateResourceDialog
                  availableGoals={[{ id: goal.id, title: goal.title }]}
                  initialGoalId={goal.id}
                  redirectTo={`/goals/${goal.id}`}
                  trigger={
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                      <PlusIcon className="h-3.5 w-3.5" />
                      Add study material
                    </Button>
                  }
                />
              </div>
            </div>
          ) : (
            <div className="divide-y rounded-md border">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <ResourceTypeBadge type={resource.type} />
                      {resource.category && (
                        <Badge variant="outline" className="text-xs font-normal">
                          {resource.category}
                        </Badge>
                      )}
                    </div>
                    <Link
                      href={`/resources/${resource.id}`}
                      className="mt-1 block font-medium text-sm hover:underline truncate"
                    >
                      {resource.title}
                    </Link>
                    {resource.author && (
                      <p className="text-xs text-muted-foreground">by {resource.author}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground p-1"
                        aria-label={`Open link for ${resource.title}`}
                      >
                        <ExternalLinkIcon className="h-4 w-4" />
                      </a>
                    )}
                    <Button asChild size="sm" variant="ghost" className="text-xs">
                      <Link href={`/resources/${resource.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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