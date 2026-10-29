"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useState } from "react";

import { deleteRoadmapAction } from "@/lib/roadmaps/actions";
import { initialRoadmapActionState } from "@/lib/roadmaps/constants";
import { Button } from "@/components/ui/button";
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
      <div>
        <Link
          href="/roadmaps"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#1C1917]/65 hover:text-[#166534] transition-colors"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          <span>Back to roadmaps</span>
        </Link>
      </div>

      {/* Editorial Header */}
      <div className="border border-[#E5DEC9] bg-[#F7EEDB] p-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#166534]">
            SYLLABUS PATHWAY {"//"} SEQUENCE
          </span>
          <span className="inline-flex items-center rounded-sm border border-[#166534]/30 bg-[#166534]/10 px-2 py-0.5 text-[10px] font-mono text-[#166534]">
            {roadmap.progress_percent}% COMPLETE
          </span>
        </div>
        <h1 className="font-serif font-normal text-3xl tracking-tight text-[#1C1917]">{roadmap.title}</h1>
        <p className="text-xs font-mono text-[#1C1917]/60" suppressHydrationWarning>
          Created {formatDateTime(roadmap.created_at)}
        </p>
      </div>

      {roadmap.description && (
        <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
          <div className="px-6 py-3.5 border-b border-[#E5DEC9] bg-[#F7EEDB]">
            <h2 className="font-serif font-normal text-lg text-[#1C1917]">Description</h2>
          </div>
          <div className="p-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#1C1917]/80">{roadmap.description}</p>
          </div>
        </div>
      )}

      {/* 4-Column Hairline Ledger */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#E5DEC9] bg-[#FDFCFA] divide-y sm:divide-y-0 sm:divide-x divide-[#E5DEC9]">
        <div className="p-5 space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#1C1917]/55">Progress</p>
          <div className="w-full pt-1">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-[#1C1917]/70">Completed</span>
              <span className="font-semibold text-[#166534]">{roadmap.progress_percent}%</span>
            </div>
            <div className="h-2 bg-[#E5DEC9] rounded-none overflow-hidden">
              <div
                className="h-full bg-[#166534] transition-all duration-300"
                style={{ width: `${roadmap.progress_percent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-5 space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#1C1917]/55">Steps</p>
          <p className="flex items-center gap-2 font-serif font-normal text-2xl text-[#1C1917] pt-0.5">
            <MapIcon className="h-4 w-4 text-[#166534]" />
            <span>{steps.length} step{steps.length !== 1 ? "s" : ""}</span>
          </p>
        </div>

        <div className="p-5 space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#1C1917]/55">Connected Goals</p>
          <p className="flex items-center gap-2 font-serif font-normal text-2xl text-[#1C1917] pt-0.5">
            <span>{currentGoals.length} Goal{currentGoals.length !== 1 ? "s" : ""}</span>
          </p>
        </div>

        <div className="p-5 space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#1C1917]/55">Last Updated</p>
          <p className="flex items-center gap-2 text-xs font-mono text-[#1C1917]/80 pt-1.5">
            <span suppressHydrationWarning>{formatDateTime(roadmap.updated_at)}</span>
          </p>
        </div>
      </div>

      {currentGoals.length > 1 && (
        <div className="p-3.5 bg-[#D97706]/10 border border-[#D97706]/30 rounded-sm flex items-start gap-2.5">
          <AlertTriangleIcon className="h-4 w-4 text-[#D97706] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-mono uppercase tracking-wider font-semibold text-[#D97706]">Shared Roadmap</p>
            <p className="text-xs text-[#1C1917]/75 mt-0.5">
              This Roadmap is shared by {currentGoals.length} Goals. Changes to this Roadmap affect all connected Goals.
            </p>
          </div>
        </div>
      )}

      <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
        <div className="px-6 py-4 border-b border-[#E5DEC9] bg-[#F7EEDB] flex flex-row items-center justify-between">
          <div>
            <h2 className="font-serif font-normal text-lg text-[#1C1917]">Steps</h2>
            <p className="text-[11px] font-mono text-[#1C1917]/60 mt-0.5">Ordered learning steps ({steps.length})</p>
          </div>
          <CreateStepDialog roadmapId={roadmap.id} />
        </div>
        <div className="p-6 space-y-3">
          {steps.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-sm text-[#1C1917]/60">No steps yet. Add your first step to get started.</p>
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
              <div className="pt-3 flex justify-center border-t border-[#E5DEC9]">
                <CreateStepDialog roadmapId={roadmap.id} />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
        <div className="px-6 py-4 border-b border-[#E5DEC9] bg-[#F7EEDB]">
          <h2 className="font-serif font-normal text-lg text-[#1C1917]">Goal Associations</h2>
          <p className="text-[11px] font-mono text-[#1C1917]/60 mt-0.5">Manage which Goals use this Roadmap</p>
        </div>
        <div className="p-6">
          <GoalRoadmapAssociations
            roadmapId={roadmap.id}
            currentGoals={currentGoals}
            availableGoals={availableGoals}
          />
        </div>
      </div>

      <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
        <div className="px-6 py-4 border-b border-[#E5DEC9] bg-[#F7EEDB]">
          <h2 className="font-serif font-normal text-lg text-[#1C1917]">Actions</h2>
          <p className="text-[11px] font-mono text-[#1C1917]/60 mt-0.5">Manage this roadmap</p>
        </div>
        <div className="p-6 flex flex-wrap gap-3">
          <EditRoadmapDialog roadmap={{ ...roadmap, goalCount: currentGoals.length }} />

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="rounded-sm shadow-none">
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
        </div>
      </div>
    </div>
  );
}