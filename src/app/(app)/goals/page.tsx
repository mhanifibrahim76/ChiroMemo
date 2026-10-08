import { Metadata } from "next";
import { Suspense } from "react";

import { listGoals } from "@/lib/goals";
import { GoalList, GoalListSkeleton } from "@/components/goals/goal-list";

export const metadata: Metadata = {
  title: "Learning goals",
};

export default async function GoalsPage() {
  const goals = await listGoals();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <Suspense fallback={<GoalListSkeleton />}>
        <GoalList goals={goals} />
      </Suspense>
    </div>
  );
}