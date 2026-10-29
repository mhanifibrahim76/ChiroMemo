import { Skeleton } from "@/components/ui/skeleton";

export function RecommendationsOverviewSkeleton() {
  return (
    <div
      className="border border-[#E5DEC9] bg-[#FDFCFA]"
      aria-busy="true"
      aria-label="Loading overview"
    >
      <div className="px-6 py-4 border-b border-[#E5DEC9] bg-[#F7EEDB] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-7 w-7 rounded-sm bg-[#E5DEC9]/80" />
          <div className="space-y-1.5">
            <Skeleton className="h-2.5 w-36 rounded-none bg-[#E5DEC9]/80" />
            <Skeleton className="h-5 w-44 rounded-none bg-[#E5DEC9]/80" />
          </div>
        </div>
        <Skeleton className="h-8 w-32 rounded-sm bg-[#E5DEC9]/80" />
      </div>
      <div className="p-6 space-y-4">
        <Skeleton className="h-4 w-full rounded-none bg-[#E5DEC9]/60" />
        <Skeleton className="h-4 w-4/5 rounded-none bg-[#E5DEC9]/60" />
        <Skeleton className="h-12 w-full rounded-sm bg-[#F7EEDB] border border-[#E5DEC9]" />
      </div>
    </div>
  );
}

export function RecommendationCardsSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
      aria-busy="true"
      aria-label="Loading recommendations"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border border-[#E5DEC9] bg-[#FDFCFA] p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[#E5DEC9] pb-3">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24 rounded-sm bg-[#E5DEC9]/70" />
              <Skeleton className="h-5 w-20 rounded-sm bg-[#E5DEC9]/70" />
            </div>
            <Skeleton className="h-3.5 w-24 rounded-none bg-[#E5DEC9]/60" />
          </div>
          <Skeleton className="h-6 w-3/4 rounded-none bg-[#E5DEC9]/70" />
          <Skeleton className="h-4 w-full rounded-none bg-[#E5DEC9]/60" />
          <Skeleton className="h-4 w-5/6 rounded-none bg-[#E5DEC9]/60" />
          <Skeleton className="h-12 w-full rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]" />
          <div className="flex justify-end pt-2 border-t border-[#E5DEC9]">
            <Skeleton className="h-8 w-28 rounded-sm bg-[#E5DEC9]/70" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecommendationsPageSkeleton() {
  return (
    <div className="space-y-6">
      <RecommendationsOverviewSkeleton />
      <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-2">
        <Skeleton className="h-3.5 w-52 rounded-none bg-[#E5DEC9]/70" />
      </div>
      <RecommendationCardsSkeleton />
    </div>
  );
}


