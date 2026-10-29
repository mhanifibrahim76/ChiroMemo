"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ExternalLink,
  MoreVertical,
  Edit2,
  Archive,
  RotateCcw,
  Trash2,
  User,
  Target,
  Route,
  ArrowUpRight,
} from "lucide-react";

import {
  deleteResourceAction,
  toggleArchiveResourceAction,
} from "@/lib/resources/actions";
import { initialResourceActionState } from "@/lib/resources/constants";
import type { ResourceType } from "@/lib/validations/resources";
import { ResourceTypeBadge } from "./resource-type-badge";
import { EditResourceDialog } from "./edit-resource-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

export interface ResourceCardItem {
  id: string;
  title: string;
  type: ResourceType;
  url: string | null;
  file_path: string | null;
  category: string | null;
  author: string | null;
  description: string | null;
  goal_id: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  goalTitle?: string | null;
  stepCount?: number;
}

interface ResourceCardProps {
  resource: ResourceCardItem;
  availableGoals?: { id: string; title: string }[];
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function SubmitDeleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="destructive"
      size="sm"
      className="rounded-none text-xs"
      disabled={pending}
    >
      {pending ? "Deleting..." : "Delete resource"}
    </Button>
  );
}

export function ResourceCard({
  resource,
  availableGoals = [],
}: ResourceCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [deleteState, deleteFormAction] = useActionState(
    deleteResourceAction,
    initialResourceActionState
  );
  const [, archiveFormAction] = useActionState(
    toggleArchiveResourceAction,
    initialResourceActionState
  );

  return (
    <>
      <article className="group relative flex flex-col justify-between border border-[#E5DEC9] bg-[#FDFCFA] p-5 transition-colors hover:bg-[#F7EEDB]">
        <div className="space-y-3">
          {/* Header badges and actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase">
              <ResourceTypeBadge type={resource.type} />
              {resource.category && (
                <span className="border border-[#E5DEC9] bg-[#FAF8F4] px-1.5 py-0.5 text-[#1C1917]/70">
                  {resource.category}
                </span>
              )}
              {resource.is_archived && (
                <span className="bg-[#1C1917]/10 px-1.5 py-0.5 text-[#1C1917]/60">
                  [Archived]
                </span>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-[#1C1917]/50 hover:text-[#1C1917]"
                  aria-label="Resource actions"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 border-[#E5DEC9] bg-[#FAF8F4] rounded-none text-xs font-mono">
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Edit2 className="mr-2 h-3.5 w-3.5" />
                  Edit details
                </DropdownMenuItem>

                {resource.url && (
                  <DropdownMenuItem asChild>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer"
                    >
                      <ExternalLink className="mr-2 h-3.5 w-3.5" />
                      Open link
                    </a>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-[#E5DEC9]" />

                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <form action={archiveFormAction} className="w-full">
                    <input type="hidden" name="id" value={resource.id} />
                    <input
                      type="hidden"
                      name="is_archived"
                      value={resource.is_archived ? "false" : "true"}
                    />
                    <Button
                      type="submit"
                      variant="ghost"
                      className="h-7 w-full justify-start p-0 text-xs font-mono"
                    >
                      {resource.is_archived ? (
                        <>
                          <RotateCcw className="mr-2 h-3.5 w-3.5" />
                          Restore resource
                        </>
                      ) : (
                        <>
                          <Archive className="mr-2 h-3.5 w-3.5" />
                          Archive resource
                        </>
                      )}
                    </Button>
                  </form>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-[#E5DEC9]" />

                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete resource
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title */}
          <div>
            <Link
              href={`/resources/${resource.id}`}
              className="block group-hover:underline underline-offset-4"
            >
              <h3 className="font-serif font-normal text-2xl tracking-[-0.02em] text-[#1C1917] truncate">
                {resource.title}
              </h3>
            </Link>

            {resource.author && (
              <p className="mt-1 flex items-center gap-1 font-mono text-[11px] text-[#1C1917]/60">
                <User className="h-3 w-3" />
                <span>{resource.author}</span>
              </p>
            )}
          </div>

          {/* Description */}
          {resource.description && (
            <p className="line-clamp-2 text-xs sm:text-sm text-[#1C1917]/75 leading-relaxed">
              {resource.description}
            </p>
          )}

          {/* Associations */}
          {(resource.goalTitle || (resource.stepCount !== undefined && resource.stepCount > 0)) && (
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px]">
              {resource.goalTitle && (
                <span className="flex items-center gap-1 text-[#166534]">
                  <Target className="h-3 w-3" />
                  <span className="truncate max-w-[180px]">{resource.goalTitle}</span>
                </span>
              )}
              {resource.stepCount !== undefined && resource.stepCount > 0 && (
                <span className="flex items-center gap-1 text-[#D97706]">
                  <Route className="h-3 w-3" />
                  <span>{resource.stepCount} step{resource.stepCount > 1 ? "s" : ""}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 flex items-center justify-between border-t border-[#E5DEC9] pt-3 font-mono text-[11px] text-[#1C1917]/60">
          <span suppressHydrationWarning>Saved {formatDate(resource.created_at)}</span>

          <div className="flex items-center gap-2">
            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1C1917]/50 hover:text-[#166534] transition-colors"
                aria-label={`Open external link for ${resource.title}`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <Link
              href={`/resources/${resource.id}`}
              className="text-[#1C1917]/50 hover:text-[#166534] transition-colors"
              aria-label={`View details for ${resource.title}`}
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>

      {/* Edit Dialog */}
      <EditResourceDialog
        resource={resource}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        availableGoals={availableGoals}
      />

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md border-[#E5DEC9] bg-[#FAF8F4] rounded-none">
          <DialogHeader>
            <DialogTitle className="font-serif font-normal text-2xl">Delete resource</DialogTitle>
            <DialogDescription className="text-xs text-[#1C1917]/70">
              Are you sure you want to delete &ldquo;{resource.title}&rdquo;?
            </DialogDescription>
          </DialogHeader>

          <form action={deleteFormAction} className="space-y-4">
            <input type="hidden" name="id" value={resource.id} />
            <p className="text-xs text-[#1C1917]/70 leading-relaxed">
              This will remove the resource from your library, disconnect it from any goals or roadmap steps, and delete any uploaded file.
            </p>

            {deleteState.error && (
              <p role="alert" className="text-destructive text-xs font-mono">
                {deleteState.error}
              </p>
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
              <SubmitDeleteButton />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
