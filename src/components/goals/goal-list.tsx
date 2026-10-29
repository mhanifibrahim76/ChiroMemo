"use client";

import { CreateGoalDialog } from "./create-goal-dialog";
import { GoalCard } from "./goal-card";
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
      <div className="border border-[#E5DEC9] bg-[#FDFCFA] py-12 px-6 text-center">
        <svg className="mx-auto h-10 w-10 text-[#1C1917]/35" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <h3 className="mt-4 font-serif font-normal text-xl text-[#1C1917]">No goals yet</h3>
        <p className="mt-1 text-xs text-[#1C1917]/65">Create your first learning goal to start tracking your progress.</p>
        <div className="mt-5 flex justify-center">
          <CreateGoalDialog />
        </div>
      </div>
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
        <div key={i} className="border border-[#E5DEC9] bg-[#FDFCFA] p-6 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-64 rounded-none bg-[#E5DEC9]/70" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-sm bg-[#E5DEC9]/70" />
              <Skeleton className="h-5 w-16 rounded-sm bg-[#E5DEC9]/60" />
            </div>
          </div>
          <Skeleton className="h-4 w-4/5 rounded-none bg-[#E5DEC9]/60" />
          <div className="flex gap-4 pt-2 border-t border-[#E5DEC9]">
            <Skeleton className="h-3.5 w-32 rounded-none bg-[#E5DEC9]/60" />
            <Skeleton className="h-3.5 w-32 rounded-none bg-[#E5DEC9]/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GoalListSkeleton() {
  return <GoalCardsSkeleton />;
}
