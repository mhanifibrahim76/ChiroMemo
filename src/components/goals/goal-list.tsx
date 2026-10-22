"use client";

import { CreateGoalDialog } from "./create-goal-dialog";
import { GoalCard } from "./goal-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface GoalListProps {
  goals: {
    id: string;
    title: string;
    description: string | null;
    status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
    priority: number;
    target_date: string | null;
    created_at: string;
    updated_at: string;
  }[];
}

export function GoalList({ goals }: GoalListProps) {
  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="mt-4 text-lg font-medium">No goals yet</h3>
          <p className="mt-1 text-muted-foreground">Create your first learning goal to start tracking your progress.</p>
          <div className="mt-4 flex justify-center">
            <CreateGoalDialog />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
}

export function GoalCardsSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading goals">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function GoalListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Learning goals</h1>
          <p className="text-muted-foreground text-sm">Ordered by creation date (newest first).</p>
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <GoalCardsSkeleton />
    </div>
  );
}