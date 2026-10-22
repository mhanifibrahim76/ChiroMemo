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
import { Badge } from "@/components/ui/badge";
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
  description: string | null;
  author: string | null;
  goal_id: string | null;
  goalTitle?: string | null;
  stepCount?: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface ResourceCardProps {
  resource: ResourceCardItem;
  availableGoals?: { id: string; title: string }[];
}

function formatDate(dateString: string): string {
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

function DeleteSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? "Deleting…" : "Delete resource"}
    </Button>
  );
}

export function ResourceCard({ resource, availableGoals = [] }: ResourceCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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
      <article className="group relative flex flex-col justify-between rounded-lg border bg-card p-5 text-card-foreground shadow-xs transition-all hover:shadow-md">
        <div>
          {/* Header badges and actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <ResourceTypeBadge type={resource.type} />
              {resource.category && (
                <Badge variant="outline" className="text-xs font-normal">
                  {resource.category}
                </Badge>
              )}
              {resource.is_archived && (
                <Badge variant="secondary" className="text-xs text-muted-foreground">
                  Archived
                </Badge>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 group-hover:opacity-100"
                  aria-label="Resource actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit details
                </DropdownMenuItem>

                {resource.url && (
                  <DropdownMenuItem asChild>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open source
                    </a>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem onSelect={(e) => e.preventDefault()} asChild>
                  <form action={archiveFormAction} className="w-full">
                    <input type="hidden" name="id" value={resource.id} />
                    <input
                      type="hidden"
                      name="is_archived"
                      value={resource.is_archived ? "false" : "true"}
                    />
                    <button type="submit" className="flex w-full items-center text-left cursor-pointer">
                      {resource.is_archived ? (
                        <>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Restore resource
                        </>
                      ) : (
                        <>
                          <Archive className="mr-2 h-4 w-4" />
                          Archive resource
                        </>
                      )}
                    </button>
                  </form>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete resource
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title */}
          <h3 className="mt-3 font-semibold text-base leading-snug tracking-tight">
            <Link
              href={`/resources/${resource.id}`}
              className="hover:text-primary transition-colors focus:underline focus:outline-hidden"
            >
              {resource.title}
            </Link>
          </h3>

          {/* Author */}
          {resource.author && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>{resource.author}</span>
            </p>
          )}

          {/* Description */}
          {resource.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {resource.description}
            </p>
          )}
        </div>

        {/* Footer meta */}
        <div className="mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2">
            {resource.goalTitle && resource.goal_id ? (
              <Link
                href={`/goals/${resource.goal_id}`}
                className="inline-flex items-center gap-1 rounded bg-secondary/80 px-2 py-0.5 text-xs font-medium text-secondary-foreground hover:bg-secondary transition-colors"
                title={`Linked to goal: ${resource.goalTitle}`}
              >
                <Target className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="max-w-[120px] truncate">{resource.goalTitle}</span>
              </Link>
            ) : null}

            {(resource.stepCount ?? 0) > 0 && (
              <span
                className="inline-flex items-center gap-1 text-xs"
                title={`${resource.stepCount} roadmap steps linked`}
              >
                <Route className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span>
                  {resource.stepCount} {resource.stepCount === 1 ? "step" : "steps"}
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span>Added {formatDate(resource.created_at)}</span>
            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors p-1"
                aria-label={`Open ${resource.title} in new tab`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </article>

      {/* Edit Dialog */}
      <EditResourceDialog
        resource={resource}
        availableGoals={availableGoals}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete resource</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete &ldquo;{resource.title}&rdquo;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <form action={deleteFormAction} className="space-y-4">
            <input type="hidden" name="id" value={resource.id} />
            <p className="text-sm text-muted-foreground">
              This will remove the resource from your library and detach it from all associated roadmap steps. Notes referencing this resource will be preserved.
            </p>
            {deleteState.error && (
              <p role="alert" className="text-destructive text-sm">
                {deleteState.error}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <DeleteSubmitButton />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

