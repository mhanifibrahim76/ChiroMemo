import { Metadata } from "next";
import { Suspense } from "react";

import { listRoadmapsWithGoalCount } from "@/lib/roadmaps";
import { CreateRoadmapDialog } from "@/components/roadmaps/create-roadmap-dialog";
import { RoadmapList, RoadmapCardsSkeleton } from "@/components/roadmaps/roadmap-list";

export const metadata: Metadata = {
  title: "Learning roadmaps",
};

async function RoadmapsContent() {
  const roadmaps = await listRoadmapsWithGoalCount();
  return <RoadmapList roadmaps={roadmaps} />;
}

export default function RoadmapsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Learning roadmaps</h1>
          <p className="text-muted-foreground text-sm">Ordered by creation date (newest first).</p>
        </div>
        <CreateRoadmapDialog />
      </div>

      <Suspense fallback={<RoadmapCardsSkeleton />}>
        <RoadmapsContent />
      </Suspense>
    </div>
  );
}