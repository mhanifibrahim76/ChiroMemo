"use client";

import { CreateRoadmapDialog } from "./create-roadmap-dialog";
import { RoadmapCard } from "./roadmap-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface RoadmapListProps {
  roadmaps: {
    id: string;
    title: string;
    description: string | null;
    progress_percent: number;
    created_at: string;
    updated_at: string;
    goalCount: number;
  }[];
}

export function RoadmapList({ roadmaps }: RoadmapListProps) {
  if (roadmaps.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium">No roadmaps yet</h3>
          <p className="mt-1 text-muted-foreground">Create your first learning roadmap to start planning your learning journey.</p>
          <div className="mt-4 flex justify-center">
            <CreateRoadmapDialog />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {roadmaps.map((roadmap) => (
        <RoadmapCard key={roadmap.id} roadmap={roadmap} />
      ))}
    </div>
  );
}

export function RoadmapCardsSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading roadmaps">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function RoadmapListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Learning roadmaps</h1>
          <p className="text-muted-foreground text-sm">Ordered by creation date (newest first).</p>
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <RoadmapCardsSkeleton />
    </div>
  );
}