"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useState } from "react";

import { deleteRoadmapAction } from "@/lib/roadmaps/actions";
import { initialRoadmapActionState } from "@/lib/roadmaps/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { EditRoadmapDialog } from "./edit-roadmap-dialog";
import { CreateStepDialog } from "./create-step-dialog";
import { RoadmapStepItem } from "./roadmap-step-item";
import { GoalRoadmapAssociations } from "./goal-roadmap-associations";
import type { ResourceRow } from "@/lib/resources";
import { ArrowLeftIcon, MapIcon, TrashIcon, AlertTriangleIcon } from "lucide-react";

interface RoadmapDetailProps {
  roadmap: {
    id: string;
    title: string;
    description: string | null;
    progress_percent: number;
    created_at: string;
    updated_at: string;
    goalCount: number;
  };
  steps: {
    id: string;
    roadmapId: string;
    title: string;
    description: string | null;
    order: number;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    completed_at: string | null;
    created_at: string;
    updated_at: string;
  }[];
  currentGoals: {
    id: string;
    title: string;
    status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  }[];
  availableGoals: {
    id: string;
    title: string;
    status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  }[];
  stepResourcesMap?: Record<string, ResourceRow[]>;
  allUserResources?: ResourceRow[];
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
  return <Button type="submit" variant="ghost" className="w-full justify-start text-left text-destructive" disabled={pending}>{pending ? "Deleting…" : "Delete roadmap"}</Button>;
}

export function RoadmapDetail({
  roadmap,
  steps,
  currentGoals,
  availableGoals,
  stepResourcesMap,
  allUserResources,
}: RoadmapDetailProps) {
  const [deleteState, deleteFormAction] = useActionState(deleteRoadmapAction, initialRoadmapActionState);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/roadmaps" className="text-muted-foreground hover:text-foreground">
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="sr-only">Back to roadmaps</span>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{roadmap.title}</h1>
            <Badge variant="secondary">{roadmap.progress_percent}%</Badge>
          </div>
          <p className="text-muted-foreground text-sm" suppressHydrationWarning>Created {formatDateTime(roadmap.created_at)}</p>
        </div>
      </div>

      {roadmap.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{roadmap.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Completed</span>
                <span className="font-medium">{roadmap.progress_percent}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${roadmap.progress_percent}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-2">
              <MapIcon className="h-4 w-4 text-muted-foreground" />
              <span>{steps.length} step{steps.length !== 1 ? "s" : ""}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Connected Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-2">
              <ArrowLeftIcon className="h-4 w-4 text-muted-foreground" />
              <span>{currentGoals.length} Goal{currentGoals.length !== 1 ? "s" : ""}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Last updated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-2">
              <MapIcon className="h-4 w-4 text-muted-foreground" />
              <span suppressHydrationWarning>{formatDateTime(roadmap.updated_at)}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {currentGoals.length > 1 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <AlertTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Shared Roadmap</p>
            <p className="text-xs text-yellow-700 mt-0.5">
              This Roadmap is shared by {currentGoals.length} Goals. Changes to this Roadmap affect all connected Goals.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Steps</CardTitle>
            <CardDescription>Ordered learning steps ({steps.length})</CardDescription>
          </div>
          <CreateStepDialog roadmapId={roadmap.id} />
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-muted-foreground">No steps yet. Add your first step to get started.</p>
              <CreateStepDialog roadmapId={roadmap.id} />
            </div>
          ) : (
            <>
              {steps.map((step, index) => (
                <RoadmapStepItem
                  key={step.id}
                  step={step}
                  allSteps={steps.map((s) => ({ id: s.id, order: s.order }))}
                  isFirst={index === 0}
                  isLast={index === steps.length - 1}
                  attachedResources={stepResourcesMap?.[step.id] ?? []}
                  allUserResources={allUserResources}
                />
              ))}
              <div className="pt-2 flex justify-center border-t">
                <CreateStepDialog roadmapId={roadmap.id} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Goal Associations</CardTitle>
          <CardDescription>Manage which Goals use this Roadmap</CardDescription>
        </CardHeader>
        <CardContent>
          <GoalRoadmapAssociations
            roadmapId={roadmap.id}
            currentGoals={currentGoals}
            availableGoals={availableGoals}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Manage this roadmap</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <EditRoadmapDialog roadmap={{ ...roadmap, goalCount: currentGoals.length }} />

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <TrashIcon className="mr-2 h-4 w-4" />
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
        </CardContent>
      </Card>
    </div>
  );
}