import { ResourceCardsSkeleton } from "@/components/resources/resource-list";
import { Skeleton } from "@/components/ui/skeleton";
import { EditorialPageHeader } from "@/components/layout/editorial-page-header";

export default function ResourcesLoading() {
  return (
    <div className="space-y-6">
      <EditorialPageHeader
        chapter="CHAPTER 02.1 // PRIMARY SOURCES"
        title="Document & Resource"
        italicWord="Library."
        description="Store lecture PDFs, slide decks, research papers, and textbook chapters in private student storage, linked to your roadmap milestones."
        illustrationSrc="/illustrations/notes-resources-journal.jpg"
        figureCaption="FIG. 2.1 — ARCHIVE PLATE"
      />

      <div className="flex flex-col gap-4 border border-[#E5DEC9] bg-[#FDFCFA] p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Skeleton className="h-9 w-full sm:w-80 rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]" />
            <Skeleton className="h-9 w-28 rounded-sm bg-[#E5DEC9]/70" />
            <Skeleton className="h-9 w-28 rounded-sm bg-[#E5DEC9]/80" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-t border-[#E5DEC9] pt-3">
          <Skeleton className="h-7 w-24 rounded-sm bg-[#E5DEC9]/70" />
          <Skeleton className="h-7 w-16 rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]" />
          <Skeleton className="h-7 w-16 rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]" />
          <Skeleton className="h-7 w-20 rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]" />
          <Skeleton className="h-7 w-16 rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]" />
        </div>
      </div>

      <ResourceCardsSkeleton />
    </div>
  );
}


