import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getGoal } from "@/lib/goals";
import { GoalDetail } from "@/components/goals/goal-detail";
import { GoalDetailSkeleton } from "@/components/goals/goal-detail-skeleton";

interface GoalDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: GoalDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const goal = await getGoal(id);
  return {
    title: goal?.title ?? "Goal not found",
  };
}

export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { id } = await params;
  const goal = await getGoal(id);

  if (!goal) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <Suspense fallback={<GoalDetailSkeleton />}>
        <GoalDetail goal={goal} />
      </Suspense>
    </div>
  );
}