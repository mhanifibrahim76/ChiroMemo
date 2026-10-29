import { Skeleton } from "@/components/ui/skeleton";
import { SearchPageSkeleton } from "@/components/search/search-skeleton";
import { EditorialPageHeader } from "@/components/layout/editorial-page-header";

export default function SearchLoading() {
  return (
    <div className="space-y-6">
      {/* Editorial Page Header renders instantly and matches loaded page */}
      <EditorialPageHeader
        chapter="CHAPTER 03.1 // RETRIEVAL & CONSTELLATION"
        title="Intelligent Semantic"
        italicWord="Search."
        description="Query your entire semester knowledge base in natural language. Gemini synthesizes answers directly from your study notes, goals, and PDF summaries."
        illustrationSrc="/illustrations/ai-search-discovery.jpg"
        figureCaption="FIG. 3.1 — KNOWLEDGE DISCOVERY"
      />

      {/* Search Input Bar Skeleton */}
      <div className="flex gap-2 border border-[#E5DEC9] bg-[#FDFCFA] p-2">
        <Skeleton className="h-10 flex-1 rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]" />
        <Skeleton className="h-10 w-28 rounded-sm bg-[#E5DEC9]/80" />
      </div>

      {/* Filter buttons skeleton */}
      <div className="flex flex-wrap gap-1.5 pb-1">
        <Skeleton className="h-8 w-24 rounded-sm bg-[#E5DEC9]/70" />
        <Skeleton className="h-8 w-20 rounded-sm bg-[#FDFCFA] border border-[#E5DEC9]" />
        <Skeleton className="h-8 w-24 rounded-sm bg-[#FDFCFA] border border-[#E5DEC9]" />
        <Skeleton className="h-8 w-28 rounded-sm bg-[#FDFCFA] border border-[#E5DEC9]" />
        <Skeleton className="h-8 w-20 rounded-sm bg-[#FDFCFA] border border-[#E5DEC9]" />
        <Skeleton className="h-8 w-24 rounded-sm bg-[#FDFCFA] border border-[#E5DEC9]" />
      </div>

      {/* Dynamic Data Regions Skeleton */}
      <SearchPageSkeleton />
    </div>
  );
}


