import { Metadata } from "next";
import { Suspense } from "react";

import { listRoadmapsWithGoalCount } from "@/lib/roadmaps";
import { CreateRoadmapDialog } from "@/components/roadmaps/create-roadmap-dialog";
import { RoadmapList, RoadmapCardsSkeleton } from "@/components/roadmaps/roadmap-list";
import { EditorialPageHeader } from "@/components/layout/editorial-page-header";

export const metadata: Metadata = {
  title: "Learning roadmaps · ChiroMemo",
};

async function RoadmapsContent() {
  const roadmaps = await listRoadmapsWithGoalCount();
  return <RoadmapList roadmaps={roadmaps} />;
}

export default function RoadmapsPage() {
  return (
    <div className="space-y-6">
      {/* Editorial Page Header */}
      <EditorialPageHeader
        chapter="CHAPTER 01.2 // SYLLABUS PATHWAYS"
        title="Sequential Study"
        italicWord="Roadmaps."
        description="Deconstruct 14-week syllabi into ordered, trackable steps. Mark progress as lectures unfold and attach study notes directly to each milestone."
        illustrationSrc="/illustrations/goals-roadmap-compass.jpg"
        figureCaption="FIG. 1.2 — MILESTONE SEQUENCE"
        action={<CreateRoadmapDialog />}
      />

      <Suspense fallback={<RoadmapCardsSkeleton />}>
        <RoadmapsContent />
      </Suspense>
    </div>
  );
}
