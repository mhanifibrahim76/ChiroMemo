import { Metadata } from "next";
import { Suspense } from "react";

import { listGoals } from "@/lib/goals";
import { CreateGoalDialog } from "@/components/goals/create-goal-dialog";
import { GoalList, GoalCardsSkeleton } from "@/components/goals/goal-list";
import { EditorialPageHeader } from "@/components/layout/editorial-page-header";

export const metadata: Metadata = {
  title: "Learning goals · ChiroMemo",
};

async function GoalsContent() {
  const goals = await listGoals();
  return <GoalList goals={goals} />;
}

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      {/* Editorial Page Header */}
      <EditorialPageHeader
        chapter="CHAPTER 01.1 // COURSE OBJECTIVES"
        title="Semester Learning"
        italicWord="Goals."
        description="Establish target completion dates, rank overlapping subjects by priority, and bind sequential roadmaps directly to your curriculum."
        illustrationSrc="/illustrations/goals-roadmap-compass.jpg"
        figureCaption="FIG. 1.1 — SYLLABUS COMPASS"
        action={<CreateGoalDialog />}
      />

      <Suspense fallback={<GoalCardsSkeleton />}>
        <GoalsContent />
      </Suspense>
    </div>
  );
}
