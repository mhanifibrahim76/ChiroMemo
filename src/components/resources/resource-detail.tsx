"use client";

import Link from "next/link";
import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowLeft,
  ExternalLink,
  Edit2,
  Archive,
  RotateCcw,
  Trash2,
  User,
  Calendar,
  Clock,
  Target,
  Route,
  Unlink,
  CheckCircle2,
  Circle,
  Clock3,
} from "lucide-react";

import type { ResourceDetailData } from "@/lib/resources";
import {
  deleteResourceAction,
  toggleArchiveResourceAction,
  dissociateResourceFromStepAction,
} from "@/lib/resources/actions";
import { initialResourceActionState } from "@/lib/resources/constants";
import { ResourceTypeBadge } from "./resource-type-badge";
import { EditResourceDialog } from "./edit-resource-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ResourceDetailProps {
  resource: ResourceDetailData;
  availableGoals?: { id: string; title: string }[];
}

function formatDate(dateString: string): string {
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

function DeleteSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? "Deleting…" : "Delete resource"}
    </Button>
  );
}

function StepStatusIcon({ status }: { status: string }) {
  if (status === "COMPLETED") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
  }
  if (status === "IN_PROGRESS") {
    return <Clock3 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />;
  }
  return <Circle className="h-4 w-4 text-muted-foreground shrink-0" />;
}

export function ResourceDetail({ resource, availableGoals = [] }: ResourceDetailProps) {
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
  const [, unlinkStepFormAction] = useActionState(
    dissociateResourceFromStepAction,
    initialResourceActionState
  );

  return (
    <div className="space-y-6">
      {/* Back button and navigation */}
      <div>
        <Link
          href="/resources"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to resources
        </Link>
      </div>

      {/* Main Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <ResourceTypeBadge type={resource.type} />
            {resource.category && (
              <Badge variant="outline" className="font-normal">
                {resource.category}
              </Badge>
            )}
            {resource.is_archived && (
              <Badge variant="secondary" className="text-muted-foreground">
                Archived
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{resource.title}</h1>
          {resource.author && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>By {resource.author}</span>
            </p>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {resource.url && (
            <Button asChild variant="outline" className="gap-2">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Visit URL
              </a>
            </Button>
          )}

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>

          <form action={archiveFormAction}>
            <input type="hidden" name="id" value={resource.id} />
            <input
              type="hidden"
              name="is_archived"
              value={resource.is_archived ? "false" : "true"}
            />
            <Button variant="outline" type="submit" className="gap-2">
              {resource.is_archived ? (
                <>
                  <RotateCcw className="h-4 w-4" />
                  Restore
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" />
                  Archive
                </>
              )}
            </Button>
          </form>

          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Overview & Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* URL & Source card */}
          {resource.url && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Resource source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-3 p-3 rounded-md bg-muted/50 border">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                      Target Link
                    </p>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline break-all"
                    >
                      {resource.url}
                    </a>
                  </div>
                  <Button asChild size="sm" variant="secondary" className="shrink-0 gap-1.5">
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      Open <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description & Study Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Description & Notes</CardTitle>
              <CardDescription>
                Reference notes, key topics, or reason for saving this material.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resource.description ? (
                <div className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">
                  {resource.description}
                </div>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  No description or notes added yet. Click &ldquo;Edit&rdquo; above to add study notes.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Linked Roadmap Steps */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Roadmap step associations</CardTitle>
                  <CardDescription>
                    Steps in your learning roadmaps where this resource is used.
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {resource.steps.length} {resource.steps.length === 1 ? "step" : "steps"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {resource.steps.length > 0 ? (
                <div className="divide-y rounded-md border">
                  {resource.steps.map((step) => (
                    <div
                      key={step.id}
                      className="flex items-center justify-between gap-3 p-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <StepStatusIcon status={step.status} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-none truncate">
                            {step.title}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Roadmap:{" "}
                            <Link
                              href={`/roadmaps/${step.roadmap.id}`}
                              className="font-medium text-foreground hover:underline"
                            >
                              {step.roadmap.title}
                            </Link>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {step.status.replace("_", " ")}
                        </Badge>
                        <form action={unlinkStepFormAction}>
                          <input type="hidden" name="step_id" value={step.id} />
                          <input type="hidden" name="resource_id" value={resource.id} />
                          <input type="hidden" name="roadmap_id" value={step.roadmap.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            title="Unlink from this step"
                          >
                            <Unlink className="h-3.5 w-3.5" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  <Route className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p>This resource is not attached to any roadmap steps yet.</p>
                  <p className="text-xs mt-1">
                    You can attach resources to roadmap steps from any roadmap detail page.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Goal connection & Metadata */}
        <div className="space-y-6">
          {/* Associated Goal Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Learning Goal
              </CardTitle>
              <CardDescription>
                Target academic or skill objective.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resource.goal ? (
                <div className="p-3 rounded-lg border bg-card space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm leading-snug">
                      {resource.goal.title}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {resource.goal.status}
                    </Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <Button asChild size="sm" variant="outline" className="w-full text-xs">
                      <Link href={`/goals/${resource.goal.id}`}>
                        View goal details
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground space-y-2">
                  <p>Not linked to a specific goal.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setEditDialogOpen(true)}
                  >
                    Link to a goal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Details & History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Added on
                </span>
                <span className="text-foreground font-medium">
                  {formatDate(resource.created_at)}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Last updated
                </span>
                <span className="text-foreground font-medium text-xs">
                  {formatDateTime(resource.updated_at)}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Status</span>
                <Badge variant={resource.is_archived ? "secondary" : "default"} className="text-xs">
                  {resource.is_archived ? "Archived" : "Active"}
                </Badge>
              </div>
              {resource.category && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Category</span>
                  <span className="text-foreground font-medium">{resource.category}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

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
              This will permanently delete the resource from your library and detach it from all associated roadmap steps.
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
    </div>
  );
}
