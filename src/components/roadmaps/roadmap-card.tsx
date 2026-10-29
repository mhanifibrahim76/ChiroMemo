"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useState } from "react";

import { deleteRoadmapAction } from "@/lib/roadmaps/actions";
import { initialRoadmapActionState } from "@/lib/roadmaps/constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { TrashIcon, MapIcon, ArrowRightIcon, ArrowUpRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface RoadmapCardProps {
  roadmap: {
    id: string;
    title: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    progress_percent: number;
    goalCount: number;
  };
}

function formatDate(dateString: string): string {
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
      variant="destructive"
      size="sm"
      className="rounded-none text-xs"
      disabled={pending}
    >
      {pending ? "Deleting…" : "Delete roadmap"}
    </Button>
  );
}

export function RoadmapCard({ roadmap }: RoadmapCardProps) {
  const [deleteState, deleteFormAction] = useActionState(deleteRoadmapAction, initialRoadmapActionState);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <article className="group relative flex flex-col justify-between border border-[#E5DEC9] bg-[#FDFCFA] p-5 transition-colors hover:bg-[#F7EEDB]">
      <div className="space-y-3">
        {/* Header Indicator */}
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em]">
          <span className="text-[#166534] font-semibold flex items-center gap-1.5">
            <MapIcon className="h-3 w-3" />
            <span>PROGRESS: {roadmap.progress_percent}%</span>
          </span>

          <div className="flex items-center gap-1">
            <Link
              href={`/roadmaps/${roadmap.id}`}
              className="p-1 text-[#1C1917]/40 hover:text-[#166534] transition-colors"
              aria-label="View roadmap"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-[#1C1917]/50 hover:text-[#1C1917]"
                  aria-label="Roadmap actions"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-[#E5DEC9] bg-[#FAF8F4] rounded-none text-xs font-mono">
                <DropdownMenuItem variant="destructive" asChild>
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 h-7 text-xs font-mono text-destructive"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        Delete roadmap
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md border-[#E5DEC9] bg-[#FAF8F4] rounded-none">
                      <DialogHeader>
                        <DialogTitle className="font-serif font-normal text-2xl">Delete roadmap</DialogTitle>
                        <DialogDescription className="text-xs text-[#1C1917]/70">
                          Are you sure you want to delete &ldquo;{roadmap.title}&rdquo;?
                        </DialogDescription>
                      </DialogHeader>
                      <form action={deleteFormAction} className="space-y-4">
                        <input type="hidden" name="id" value={roadmap.id} />
                        <p className="text-xs text-[#1C1917]/70 leading-relaxed">
                          This deletes the roadmap and all its milestone steps. Goals and attached resources are preserved.
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

        {/* Title */}
        <Link href={`/roadmaps/${roadmap.id}`} className="block group-hover:underline underline-offset-4">
          <h3 className="font-serif font-normal text-2xl tracking-[-0.02em] text-[#1C1917] truncate">
            {roadmap.title}
          </h3>
        </Link>

        {/* Description */}
        {roadmap.description && (
          <p className="line-clamp-2 text-xs sm:text-sm text-[#1C1917]/75 leading-relaxed">
            {roadmap.description}
          </p>
        )}

        {/* Progress bar */}
        <div className="pt-1 space-y-1">
          <Progress value={roadmap.progress_percent} className="h-1 bg-[#E5DEC9]" />
        </div>
      </div>

      {/* Metadata footer */}
      <dl className="mt-4 flex items-center justify-between border-t border-[#E5DEC9] pt-3 font-mono text-[11px] text-[#1C1917]/60">
        <dd className="flex items-center gap-1.5">
          {roadmap.goalCount > 0 ? (
            <span className="text-[#166534] flex items-center gap-1">
              <ArrowRightIcon className="h-3 w-3" />
              <span>{roadmap.goalCount} Linked Goal{roadmap.goalCount > 1 ? "s" : ""}</span>
            </span>
          ) : (
            <span>Independent track</span>
          )}
        </dd>
        <dd suppressHydrationWarning>Created {formatDate(roadmap.created_at)}</dd>
      </dl>
    </article>
  );
}
