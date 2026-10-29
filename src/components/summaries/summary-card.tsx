"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Sparkles,
  ExternalLink,
  MoreVertical,
  Trash2,
  BookOpen,
  Calendar,
  FileText,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteSummaryAction } from "@/lib/summaries/actions";
import { initialSummaryActionState } from "@/lib/summaries/constants";
import type { SummaryWithResource } from "@/lib/summaries";

interface SummaryCardProps {
  summary: SummaryWithResource;
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

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button variant="destructive" type="submit" disabled={pending}>
      {pending ? "Deleting..." : "Delete Summary"}
    </Button>
  );
}

export function SummaryCard({ summary }: SummaryCardProps) {
  const [deleteOpen, setDeleteDialogOpen] = useState(false);
  const [state, formAction] = useActionState(
    deleteSummaryAction,
    initialSummaryActionState
  );

  const title = summary.resourceTitle || "AI Document Summary";
  const displayModel = summary.model || "gemini-2.5-flash";

  return (
    <>
      <div className="flex flex-col justify-between border border-[#E5DEC9] bg-[#FDFCFA] p-6 transition-colors hover:bg-[#F7EEDB]/60 gap-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-[#E5DEC9] pb-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-sm border border-[#166534]/30 bg-[#166534]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#166534]">
                <Sparkles className="h-3 w-3 text-[#166534]" />
                {displayModel}
              </span>
              {summary.resourceType && (
                <span className="inline-flex items-center rounded-sm border border-[#E5DEC9] bg-[#FAF8F4] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#1C1917]/65">
                  {summary.resourceType}
                </span>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm text-[#1C1917]/60 hover:text-[#1C1917] hover:bg-[#F7EEDB]">
                  <MoreVertical className="h-3.5 w-3.5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete summary
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            <Link
              href={`/summaries/${summary.id}`}
              className="hover:text-[#166534] transition-colors focus:outline-none"
            >
              <h3 className="font-serif font-normal text-2xl text-[#1C1917] tracking-tight line-clamp-1">
                {title}
              </h3>
            </Link>
            <p className="flex items-center gap-1.5 text-[11px] font-mono text-[#1C1917]/55 mt-1">
              <Calendar className="h-3 w-3 shrink-0" />
              <span suppressHydrationWarning>{formatDate(summary.created_at)}</span>
            </p>
          </div>

          {summary.key_points && summary.key_points.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-mono uppercase tracking-wider font-medium text-[#1C1917]/65 flex items-center gap-1.5">
                <Lightbulb className="h-3 w-3 text-[#D97706]" />
                Key Concepts ({summary.key_points.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {summary.key_points.slice(0, 3).map((kp, idx) => (
                  <span
                    key={idx}
                    className="inline-block max-w-full truncate rounded-sm border border-[#E5DEC9] bg-[#FAF8F4] px-2 py-0.5 text-[11px] text-[#1C1917]/75 font-mono"
                  >
                    {kp}
                  </span>
                ))}
                {summary.key_points.length > 3 && (
                  <span className="text-[10px] font-mono text-[#1C1917]/55 self-center px-1">
                    +{summary.key_points.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#E5DEC9]">
          {summary.resource_id ? (
            <Link
              href={`/resources/${summary.resource_id}`}
              className="text-[11px] font-mono uppercase tracking-wider text-[#1C1917]/60 hover:text-[#166534] flex items-center gap-1.5 truncate max-w-[150px]"
            >
              <BookOpen className="h-3 w-3 shrink-0" />
              <span className="truncate">Source Resource</span>
            </Link>
          ) : (
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#1C1917]/55 flex items-center gap-1.5">
              <FileText className="h-3 w-3" />
              Direct text
            </span>
          )}

          <Button
            asChild
            size="sm"
            className="gap-1.5 h-8 px-3 rounded-sm bg-[#166534] text-[#FAF8F4] hover:bg-[#166534]/90 text-xs shadow-none"
          >
            <Link href={`/summaries/${summary.id}`}>
              View summary
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete AI Summary?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this summary for &quot;{title}&quot;?
              This action cannot be undone. The original resource and any notes
              you exported will remain intact.
            </DialogDescription>
          </DialogHeader>

          {state.status === "error" && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <form action={formAction}>
            <input type="hidden" name="id" value={summary.id} />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <DeleteButton />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}


