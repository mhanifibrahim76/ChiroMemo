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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <Card className="flex flex-col justify-between hover:border-primary/50 transition-colors">
        <CardHeader className="pb-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 text-xs">
                <Sparkles className="h-3 w-3 text-primary" />
                {displayModel}
              </Badge>
              {summary.resourceType && (
                <Badge variant="outline" className="text-xs">
                  {summary.resourceType}
                </Badge>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
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
              className="hover:underline focus:outline-none"
            >
              <CardTitle className="text-lg font-semibold line-clamp-1">
                {title}
              </CardTitle>
            </Link>
            <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span suppressHydrationWarning>{formatDate(summary.created_at)}</span>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {summary.key_points && summary.key_points.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                Key Concepts ({summary.key_points.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {summary.key_points.slice(0, 3).map((kp, idx) => (
                  <span
                    key={idx}
                    className="inline-block max-w-full truncate rounded bg-muted/80 px-2 py-0.5 text-[11px] text-foreground font-mono"
                  >
                    {kp}
                  </span>
                ))}
                {summary.key_points.length > 3 && (
                  <span className="text-[11px] text-muted-foreground self-center px-1">
                    +{summary.key_points.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t">
            {summary.resource_id ? (
              <Link
                href={`/resources/${summary.resource_id}`}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 truncate max-w-[150px]"
              >
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Resource</span>
              </Link>
            ) : (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                Direct text
              </span>
            )}

            <Button asChild size="sm" variant="default" className="gap-1.5 h-8">
              <Link href={`/summaries/${summary.id}`}>
                View summary
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

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

