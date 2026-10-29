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
  const styles = {
    ACTIVE: "border-[#166534]/30 bg-[#166534]/10 text-[#166534]",
    COMPLETED: "border-[#D97706]/30 bg-[#D97706]/10 text-[#D97706]",
    ARCHIVED: "border-[#E5DEC9] bg-[#FAF8F4] text-[#1C1917]/60",
  };
  return (
    <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
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
      <div>
        <Link
          href="/goals"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#1C1917]/65 hover:text-[#166534] transition-colors"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          <span>Back to goals</span>
        </Link>
      </div>

      {/* Editorial Header */}
      <div className="border border-[#E5DEC9] bg-[#F7EEDB] p-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#166534]">
            COURSE OBJECTIVE {"//"} RECORD
          </span>
          <StatusBadge status={goal.status} />
        </div>
        <h1 className="font-serif font-normal text-3xl tracking-tight text-[#1C1917]">{goal.title}</h1>
        <p className="text-xs font-mono text-[#1C1917]/60" suppressHydrationWarning>
          Created {formatDateTime(goal.created_at)}
        </p>
      </div>

      {goal.description && (
        <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
          <div className="px-6 py-3.5 border-b border-[#E5DEC9] bg-[#F7EEDB]">
            <h2 className="font-serif font-normal text-lg text-[#1C1917]">Description</h2>
          </div>
          <div className="p-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#1C1917]/80">{goal.description}</p>
          </div>
        </div>
      )}

      {/* 4-Column Hairline Ledger */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#E5DEC9] bg-[#FDFCFA] divide-y sm:divide-y-0 sm:divide-x divide-[#E5DEC9]">
        <div className="p-5 space-y-2.5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#1C1917]/55">Status</p>
          <form action={statusFormAction} className="space-y-2">
            <input type="hidden" name="id" value={goal.id} />
            <select
              name="status"
              value={goal.status}
              onChange={(e) => (e.currentTarget as HTMLSelectElement).form?.requestSubmit()}
              className="w-full border border-[#E5DEC9] rounded-sm px-2.5 py-1.5 text-xs font-mono bg-[#FAF8F4] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#166534]/40"
              aria-label="Change status"
            >
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </form>
        </div>

        <div className="p-5 space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#1C1917]/55">Priority</p>
          <form action={priorityFormAction} className="space-y-2">
            <input type="hidden" name="id" value={goal.id} />
            <div className="flex items-center gap-2">
              <input
                name="priority"
                type="number"
                min="0"
                step="1"
                defaultValue={goal.priority}
                className="w-20 border border-[#E5DEC9] rounded-sm px-2.5 py-1 text-xs font-mono bg-[#FAF8F4] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#166534]/40"
                aria-label="Priority"
              />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="h-7 rounded-sm border-[#E5DEC9] bg-[#FDFCFA] text-xs shadow-none"
                disabled={Boolean(priorityState.error || priorityState.message)}
              >
                Update
              </Button>
            </div>
            {priorityState.message && <p className="text-[#166534] text-xs font-mono">Priority updated</p>}
            {priorityState.error && <p className="text-destructive text-xs">{priorityState.error}</p>}
          </form>
          <p className="text-[11px] text-[#1C1917]/50">Higher values = higher priority</p>
        </div>

        <div className="p-5 space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#1C1917]/55">Target Date</p>
          <p className="flex items-center gap-2 text-sm text-[#1C1917] pt-1">
            <TargetIcon className="h-4 w-4 text-[#166534]" />
            <span suppressHydrationWarning>{goal.target_date ? formatDate(goal.target_date) : "Not set"}</span>
          </p>
        </div>

        <div className="p-5 space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#1C1917]/55">Last Updated</p>
          <p className="flex items-center gap-2 text-xs font-mono text-[#1C1917]/80 pt-1">
            <CalendarIcon className="h-4 w-4 text-[#166534]" />
            <span suppressHydrationWarning>{formatDateTime(goal.updated_at)}</span>
          </p>
        </div>
      </div>

      <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
        <div className="px-6 py-4 border-b border-[#E5DEC9] bg-[#F7EEDB]">
          <h2 className="font-serif font-normal text-lg text-[#1C1917]">Roadmaps</h2>
          <p className="text-[11px] font-mono text-[#1C1917]/60 mt-0.5">Learning roadmaps connected to this goal</p>
        </div>
        <div className="p-6 space-y-3">
          {roadmaps.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm text-[#1C1917]/60">No roadmaps connected yet.</p>
              <CreateRoadmapDialog preSelectedGoalIds={[goal.id]} />
            </div>
          ) : (
            <div className="space-y-2.5">
              {roadmaps.map((roadmap) => (
                <div key={roadmap.id} className="flex items-center justify-between p-4 rounded-sm border border-[#E5DEC9] bg-[#FAF8F4] hover:bg-[#F7EEDB]/60 transition-colors">
                  <Link href={`/roadmaps/${roadmap.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-normal text-lg text-[#1C1917] truncate">{roadmap.title}</h4>
                      <span className="inline-flex items-center rounded-sm border border-[#166534]/30 bg-[#166534]/10 px-2 py-0.5 text-[10px] font-mono text-[#166534]">
                        {roadmap.progress_percent}%
                      </span>
                    </div>
                    <p className="text-xs text-[#1C1917]/65 truncate mt-0.5">{roadmap.description ?? "No description"}</p>
                  </Link>
                  <form action={removeRoadmapFormAction} className="inline">
                    <input type="hidden" name="goalId" value={goal.id} />
                    <input type="hidden" name="roadmapId" value={roadmap.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="text-[#1C1917]/55 hover:text-destructive rounded-sm"
                      aria-label={`Remove ${roadmap.title} from goal`}
                    >
                      <UnlinkIcon className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              ))}
              {unassociatedRoadmaps.length > 0 && (
                <div className="pt-3 border-t border-[#E5DEC9]">
                  <CreateRoadmapDialog preSelectedGoalIds={[goal.id]} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Learning Resources Panel */}
      <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
        <div className="px-6 py-4 border-b border-[#E5DEC9] bg-[#F7EEDB] flex flex-row items-center justify-between">
          <div>
            <h2 className="font-serif font-normal text-lg text-[#1C1917]">Learning Resources</h2>
            <p className="text-[11px] font-mono text-[#1C1917]/60 mt-0.5">Materials and study links connected to this goal</p>
          </div>
          <CreateResourceDialog
            availableGoals={[{ id: goal.id, title: goal.title }]}
            initialGoalId={goal.id}
            redirectTo={`/goals/${goal.id}`}
            trigger={
              <Button size="sm" variant="outline" className="gap-1.5 text-xs rounded-sm border-[#E5DEC9] bg-[#FDFCFA] shadow-none">
                <PlusIcon className="h-3.5 w-3.5" />
                Add resource
              </Button>
            }
          />
        </div>
        <div className="p-6 space-y-3">
          {resources.length === 0 ? (
            <div className="text-center py-6">
              <BookOpenIcon className="mx-auto h-8 w-8 text-[#1C1917]/30 mb-2" />
              <p className="text-sm text-[#1C1917]/60">No resources connected to this goal yet.</p>
              <div className="mt-3">
                <CreateResourceDialog
                  availableGoals={[{ id: goal.id, title: goal.title }]}
                  initialGoalId={goal.id}
                  redirectTo={`/goals/${goal.id}`}
                  trigger={
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs rounded-sm border-[#E5DEC9] bg-[#FAF8F4]">
                      <PlusIcon className="h-3.5 w-3.5" />
                      Add study material
                    </Button>
                  }
                />
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#E5DEC9] rounded-sm border border-[#E5DEC9]">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-3.5 bg-[#FAF8F4] hover:bg-[#F7EEDB]/60 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <ResourceTypeBadge type={resource.type} />
                      {resource.category && (
                        <span className="inline-flex items-center rounded-sm border border-[#E5DEC9] bg-[#FDFCFA] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#1C1917]/70">
                          {resource.category}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/resources/${resource.id}`}
                      className="mt-1.5 block font-serif font-normal text-lg text-[#1C1917] hover:text-[#166534] truncate"
                    >
                      {resource.title}
                    </Link>
                    {resource.author && (
                      <p className="text-xs font-mono text-[#1C1917]/55">by {resource.author}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1C1917]/55 hover:text-[#166534] p-1"
                        aria-label={`Open link for ${resource.title}`}
                      >
                        <ExternalLinkIcon className="h-4 w-4" />
                      </a>
                    )}
                    <Button asChild size="sm" variant="ghost" className="text-xs rounded-sm">
                      <Link href={`/resources/${resource.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
        <div className="px-6 py-4 border-b border-[#E5DEC9] bg-[#F7EEDB]">
          <h2 className="font-serif font-normal text-lg text-[#1C1917]">Actions</h2>
          <p className="text-[11px] font-mono text-[#1C1917]/60 mt-0.5">Manage this goal</p>
        </div>
        <div className="p-6 flex flex-wrap gap-3">
          <EditGoalDialog goal={goal} />

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="rounded-sm shadow-none">
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
        </div>
      </div>
    </div>
  );
}