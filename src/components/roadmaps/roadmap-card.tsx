"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useState } from "react";

import { deleteRoadmapAction } from "@/lib/roadmaps/actions";
import { initialRoadmapActionState } from "@/lib/roadmaps/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { TrashIcon, EditIcon, MapIcon, ArrowRightIcon } from "lucide-react";

interface RoadmapCardProps {
  roadmap: {
    id: string;
    title: string;
    description: string | null;
    progress_percent: number;
    created_at: string;
    updated_at: string;
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
  return <Button type="submit" variant="ghost" className="w-full justify-start text-left" disabled={pending}>{pending ? "Deleting…" : "Delete roadmap"}</Button>;
}

export function RoadmapCard({ roadmap }: RoadmapCardProps) {
  const [deleteState, deleteFormAction] = useActionState(deleteRoadmapAction, initialRoadmapActionState);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <article className="border rounded-lg p-4 bg-card transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link href={`/roadmaps/${roadmap.id}`} className="block">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg truncate">{roadmap.title}</h3>
              <Badge variant="secondary">{roadmap.progress_percent}%</Badge>
            </div>
          </Link>
          {roadmap.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{roadmap.description}</p>
          )}
          <dl className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <dt className="sr-only">Progress</dt>
            <dd className="flex items-center gap-1">
              <MapIcon className="h-3 w-3" aria-hidden="true" />
              <span>{roadmap.progress_percent}% complete</span>
            </dd>
            {roadmap.goalCount > 0 && (
              <dd className="flex items-center gap-1">
                <ArrowRightIcon className="h-3 w-3" aria-hidden="true" />
                <span>{roadmap.goalCount} Goal{roadmap.goalCount > 1 ? "s" : ""}</span>
              </dd>
            )}
            <dt className="sr-only">Created</dt>
            <dd className="text-xs" suppressHydrationWarning>Created {formatDate(roadmap.created_at)}</dd>
          </dl>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Roadmap actions">
              <EditIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/roadmaps/${roadmap.id}`}>
                <EditIcon className="mr-2 h-4 w-4" />
                View details & steps
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" asChild>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-destructive focus:text-destructive">
                    <TrashIcon className="h-4 w-4" />
                    Delete roadmap
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Delete roadmap</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to permanently delete &ldquo;{roadmap.title}&rdquo;? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <form action={deleteFormAction} className="space-y-4">
                    <input type="hidden" name="id" value={roadmap.id} />
                    <p className="text-sm text-muted-foreground">
                      This will permanently delete the roadmap and all its steps.
                      Goal & Roadmap associations will be removed.
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
    </article>
  );
}