import { Skeleton } from "@/components/ui/skeleton";

export function SearchAiCardSkeleton() {
  return (
    <div
      className="border border-[#E5DEC9] bg-[#FDFCFA]"
      aria-busy="true"
      aria-label="Loading AI synthesis"
    >
      <div className="px-6 py-4 border-b border-[#E5DEC9] bg-[#F7EEDB] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-7 w-7 rounded-sm bg-[#E5DEC9]/80" />
          <div className="space-y-1.5">
            <Skeleton className="h-2.5 w-36 rounded-none bg-[#E5DEC9]/80" />
            <Skeleton className="h-5 w-44 rounded-none bg-[#E5DEC9]/80" />
          </div>
        </div>
        <Skeleton className="h-5 w-28 rounded-sm bg-[#E5DEC9]/80" />
      </div>
      <div className="p-6 space-y-4">
        <Skeleton className="h-4 w-full rounded-none bg-[#E5DEC9]/60" />
        <Skeleton className="h-4 w-5/6 rounded-none bg-[#E5DEC9]/60" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-[#E5DEC9]">
          <Skeleton className="h-12 w-full rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]" />
          <Skeleton className="h-12 w-full rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]" />
        </div>
      </div>
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading search results">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border border-[#E5DEC9] bg-[#FDFCFA] p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-2.5">
            <Skeleton className="h-5 w-24 rounded-sm bg-[#E5DEC9]/70" />
            <Skeleton className="h-3.5 w-20 rounded-none bg-[#E5DEC9]/60" />
          </div>
          <Skeleton className="h-6 w-2/3 rounded-none bg-[#E5DEC9]/70" />
          <Skeleton className="h-4 w-full rounded-none bg-[#E5DEC9]/60" />
          <Skeleton className="h-4 w-4/5 rounded-none bg-[#E5DEC9]/60" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-14 rounded-sm bg-[#E5DEC9]/60" />
            <Skeleton className="h-5 w-16 rounded-sm bg-[#E5DEC9]/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchPageSkeleton() {
  return (
    <div className="space-y-6">
      <SearchAiCardSkeleton />
      <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-2">
        <Skeleton className="h-3.5 w-52 rounded-none bg-[#E5DEC9]/70" />
      </div>
      <SearchResultsSkeleton />
    </div>
  );
}


