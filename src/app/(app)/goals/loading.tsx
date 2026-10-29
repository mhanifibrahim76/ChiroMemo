import { GoalCardsSkeleton } from "@/components/goals/goal-list";
import { Skeleton } from "@/components/ui/skeleton";
import { EditorialPageHeader } from "@/components/layout/editorial-page-header";

export default function GoalsLoading() {
  return (
    <div className="space-y-6">
      <EditorialPageHeader
        chapter="CHAPTER 01.1 // COURSE OBJECTIVES"
        title="Semester Learning"
        italicWord="Goals."
        description="Establish target completion dates, rank overlapping subjects by priority, and bind sequential roadmaps directly to your curriculum."
        illustrationSrc="/illustrations/goals-roadmap-compass.jpg"
        figureCaption="FIG. 1.1 — SYLLABUS COMPASS"
        action={<Skeleton className="h-9 w-28 rounded-sm bg-[#E5DEC9]/80" />}
      />
      <GoalCardsSkeleton />
    </div>
  );
}
