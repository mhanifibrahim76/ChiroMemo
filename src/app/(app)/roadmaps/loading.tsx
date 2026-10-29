import { RoadmapCardsSkeleton } from "@/components/roadmaps/roadmap-list";
import { Skeleton } from "@/components/ui/skeleton";
import { EditorialPageHeader } from "@/components/layout/editorial-page-header";

export default function RoadmapsLoading() {
  return (
    <div className="space-y-6">
      <EditorialPageHeader
        chapter="CHAPTER 01.2 // SYLLABUS PATHWAYS"
        title="Sequential Study"
        italicWord="Roadmaps."
        description="Deconstruct 14-week syllabi into ordered, trackable steps. Mark progress as lectures unfold and attach study notes directly to each milestone."
        illustrationSrc="/illustrations/goals-roadmap-compass.jpg"
        figureCaption="FIG. 1.2 — MILESTONE SEQUENCE"
        action={<Skeleton className="h-9 w-28 rounded-sm bg-[#E5DEC9]/80" />}
      />
      <RoadmapCardsSkeleton />
    </div>
  );
}
