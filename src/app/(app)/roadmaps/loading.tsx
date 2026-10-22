import { RoadmapCardsSkeleton } from "@/components/roadmaps/roadmap-list";
import { Skeleton } from "@/components/ui/skeleton";

export default function RoadmapsLoading() {
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