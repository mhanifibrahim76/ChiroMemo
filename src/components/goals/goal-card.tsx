"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useState } from "react";

import { updateGoalStatusAction, deleteGoalAction } from "@/lib/goals/actions";
import { initialGoalActionState } from "@/lib/goals/constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  TrashIcon,
  EditIcon,
  CheckCircleIcon,
  ArchiveIcon,
  RotateCcwIcon,
  CalendarIcon,
  ArrowUpRight,
} from "lucide-react";

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
    return new Date(dateString).toLocaleDateString("en-US", {
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
  return (
    <Button
      type="submit"
      variant="ghost"
      className="w-full justify-start text-left text-destructive"
      disabled={pending}
    >
      {pending ? "Deleting…" : "Delete goal"}
    </Button>
  );
}

export function GoalCard({ goal }: GoalCardProps) {
  const [deleteState, deleteFormAction] = useActionState(deleteGoalAction, initialGoalActionState);
  const [, statusFormAction] = useActionState(updateGoalStatusAction, initialGoalActionState);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const statusLabel =
    goal.status === "ACTIVE" ? "Active" : goal.status === "COMPLETED" ? "Completed" : "Archived";

  return (
    <article className="group relative flex flex-col justify-between border border-[#E5DEC9] bg-[#FDFCFA] p-5 transition-colors hover:bg-[#F7EEDB]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header Priority & Status */}
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em]">
            <span className="text-[#166534] font-semibold">PRIORITY P{goal.priority}</span>
            <span className="text-[#E5DEC9]">|</span>
            <span
              className={
                goal.status === "ACTIVE"
                  ? "text-[#166534]"
                  : goal.status === "COMPLETED"
                  ? "text-[#D97706]"
                  : "text-[#1C1917]/50"
              }
            >
              [{statusLabel}]
            </span>
          </div>

          {/* Goal Title */}
          <Link href={`/goals/${goal.id}`} className="block group-hover:underline underline-offset-4">
            <h3 className="font-serif font-normal text-2xl tracking-[-0.02em] text-[#1C1917] truncate">
              {goal.title}
            </h3>
          </Link>

          {goal.description && (
            <p className="text-xs sm:text-sm text-[#1C1917]/75 line-clamp-2 leading-relaxed">
              {goal.description}
            </p>
          )}

          {/* Metadata Footer */}
          <dl className="pt-2 flex flex-wrap items-center gap-3 font-mono text-[11px] text-[#1C1917]/60">
            <dt className="sr-only">Status</dt>
            <dd>
              <form action={statusFormAction}>
                <input type="hidden" name="id" value={goal.id} />
                <select
                  name="status"
                  value={goal.status}
                  onChange={(e) => (e.currentTarget as HTMLSelectElement).form?.requestSubmit()}
                  className="border border-[#E5DEC9] rounded-none px-2 py-0.5 text-[11px] font-mono uppercase bg-[#FAF8F4] text-[#1C1917] focus:outline-none"
                  aria-label="Goal status"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </form>
            </dd>

            {goal.target_date && (
              <>
                <dt className="sr-only">Target date</dt>
                <dd className="flex items-center gap-1 text-[#1C1917]/70">
                  <CalendarIcon className="h-3 w-3 text-[#166534]" aria-hidden="true" />
                  <span suppressHydrationWarning>Target: {formatDate(goal.target_date)}</span>
                </dd>
              </>
            )}

            <dt className="sr-only">Created</dt>
            <dd suppressHydrationWarning>Created {formatDate(goal.created_at)}</dd>
          </dl>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Link
            href={`/goals/${goal.id}`}
            className="p-1.5 text-[#1C1917]/40 hover:text-[#166534] transition-colors"
            aria-label="View goal"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#1C1917]/60 hover:text-[#1C1917]"
                aria-label="Goal actions"
              >
                <EditIcon className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-[#E5DEC9] bg-[#FAF8F4] rounded-none text-xs font-mono">
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <form action={statusFormAction}>
                  <input type="hidden" name="id" value={goal.id} />
                  <input type="hidden" name="status" value="ACTIVE" />
                  <Button
                    type="submit"
                    variant="ghost"
                    className="w-full justify-start gap-2 h-7 text-xs font-mono"
                    disabled={goal.status === "ACTIVE"}
                  >
                    <RotateCcwIcon className="h-3.5 w-3.5" />
                    Mark active
                  </Button>
                </form>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <form action={statusFormAction}>
                  <input type="hidden" name="id" value={goal.id} />
                  <input type="hidden" name="status" value="COMPLETED" />
                  <Button
                    type="submit"
                    variant="ghost"
                    className="w-full justify-start gap-2 h-7 text-xs font-mono"
                    disabled={goal.status === "COMPLETED"}
                  >
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                    Mark completed
                  </Button>
                </form>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <form action={statusFormAction}>
                  <input type="hidden" name="id" value={goal.id} />
                  <input type="hidden" name="status" value="ARCHIVED" />
                  <Button
                    type="submit"
                    variant="ghost"
                    className="w-full justify-start gap-2 h-7 text-xs font-mono"
                    disabled={goal.status === "ARCHIVED"}
                  >
                    <ArchiveIcon className="h-3.5 w-3.5" />
                    Archive
                  </Button>
                </form>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#E5DEC9]" />
              <DropdownMenuItem variant="destructive" asChild>
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 h-7 text-xs font-mono text-destructive"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      Delete goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md border-[#E5DEC9] bg-[#FAF8F4] rounded-none">
                    <DialogHeader>
                      <DialogTitle className="font-serif font-normal text-2xl">Delete goal</DialogTitle>
                      <DialogDescription className="text-xs text-[#1C1917]/70">
                        Are you sure you want to permanently delete &ldquo;{goal.title}&rdquo;?
                      </DialogDescription>
                    </DialogHeader>
                    <form action={deleteFormAction} className="space-y-4">
                      <input type="hidden" name="id" value={goal.id} />
                      <p className="text-xs text-[#1C1917]/70 leading-relaxed">
                        This removes the goal record and its roadmap linkages. The roadmaps themselves and all other notes remain intact.
                      </p>
                      {deleteState.error && (
                        <p role="alert" className="text-destructive text-xs font-mono">{deleteState.error}</p>
                      )}
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-none border-[#E5DEC9]"
                          onClick={() => setDeleteDialogOpen(false)}
                        >
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
