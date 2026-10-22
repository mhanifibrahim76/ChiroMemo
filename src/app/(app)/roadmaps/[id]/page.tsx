import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getRoadmap, listRoadmapSteps, getRoadmapGoals } from "@/lib/roadmaps";
import { listGoals } from "@/lib/goals";
import { listResources, getStepResourcesMapForRoadmap } from "@/lib/resources";
import { RoadmapDetail } from "@/components/roadmaps/roadmap-detail";
import { RoadmapDetailSkeleton } from "@/components/roadmaps/roadmap-detail-skeleton";

interface RoadmapDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RoadmapDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const roadmap = await getRoadmap(id);
  return {
    title: roadmap?.title ?? "Roadmap not found",
  };
}

export default async function RoadmapDetailPage({ params }: RoadmapDetailPageProps) {
  const { id } = await params;
  const roadmap = await getRoadmap(id);

  if (!roadmap) {
    notFound();
  }

  const [steps, currentGoals, allGoals, stepResourcesMap, allResources] = await Promise.all([
    listRoadmapSteps(id),
    getRoadmapGoals(id),
    listGoals(),
    getStepResourcesMapForRoadmap(id),
    listResources({ isArchived: false }),
  ]);

  // Get goal count for this roadmap
  const goalCount = currentGoals.length;

  // Transform steps to use roadmapId instead of roadmap_id
  const transformedSteps = steps.map((step) => ({
    ...step,
    roadmapId: step.roadmap_id,
  }));

  // Transform goals to match expected types
  const transformedCurrentGoals = currentGoals.map((goal) => ({
    id: goal.id,
    title: goal.title,
    status: goal.status,
  }));

  const transformedAvailableGoals = allGoals.map((goal) => ({
    id: goal.id,
    title: goal.title,
    status: goal.status,
  }));

  return (
    <Suspense fallback={<RoadmapDetailSkeleton />}>
      <RoadmapDetail
        roadmap={{ ...roadmap, goalCount }}
        steps={transformedSteps}
        currentGoals={transformedCurrentGoals}
        availableGoals={transformedAvailableGoals}
        stepResourcesMap={stepResourcesMap}
        allUserResources={allResources}
      />
    </Suspense>
  );
}