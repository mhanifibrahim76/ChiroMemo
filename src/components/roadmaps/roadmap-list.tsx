"use client";

import { CreateRoadmapDialog } from "./create-roadmap-dialog";
import { RoadmapCard } from "./roadmap-card";
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
      <div className="border border-[#E5DEC9] bg-[#FDFCFA] py-12 px-6 text-center">
        <svg className="mx-auto h-10 w-10 text-[#1C1917]/35" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="mt-4 font-serif font-normal text-xl text-[#1C1917]">No roadmaps yet</h3>
        <p className="mt-1 text-xs text-[#1C1917]/65">Create your first learning roadmap to start planning your learning journey.</p>
        <div className="mt-5 flex justify-center">
          <CreateRoadmapDialog />
        </div>
      </div>
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
        <div key={i} className="border border-[#E5DEC9] bg-[#FDFCFA] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-64 rounded-none bg-[#E5DEC9]/70" />
            <Skeleton className="h-5 w-20 rounded-sm bg-[#E5DEC9]/70" />
          </div>
          <Skeleton className="h-4 w-3/4 rounded-none bg-[#E5DEC9]/60" />
          <div className="space-y-2 pt-2 border-t border-[#E5DEC9]">
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-28 rounded-none bg-[#E5DEC9]/60" />
              <Skeleton className="h-3.5 w-16 rounded-none bg-[#E5DEC9]/60" />
            </div>
            <Skeleton className="h-2 w-full rounded-none bg-[#E5DEC9]/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RoadmapListSkeleton() {
  return <RoadmapCardsSkeleton />;
}
