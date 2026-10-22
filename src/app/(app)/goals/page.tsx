import { Metadata } from "next";
import { Suspense } from "react";

import { listGoals } from "@/lib/goals";
import { CreateGoalDialog } from "@/components/goals/create-goal-dialog";
import { GoalList, GoalCardsSkeleton } from "@/components/goals/goal-list";

export const metadata: Metadata = {
  title: "Learning goals",
};

async function GoalsContent() {
  const goals = await listGoals();
  return <GoalList goals={goals} />;
}

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Learning goals</h1>
          <p className="text-muted-foreground text-sm">Ordered by creation date (newest first).</p>
        </div>
        <CreateGoalDialog />
      </div>

      <Suspense fallback={<GoalCardsSkeleton />}>
        <GoalsContent />
      </Suspense>
    </div>
  );
}