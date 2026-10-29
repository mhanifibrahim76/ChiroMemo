import { Skeleton } from "@/components/ui/skeleton";

export function NotesSplitSkeleton() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-12 border border-[#E5DEC9] bg-[#FDFCFA] md:divide-x md:divide-[#E5DEC9] min-h-[660px] items-stretch"
      aria-busy="true"
      aria-label="Loading notes"
    >
      {/* Left Pane Skeleton */}
      <div className="md:col-span-5 lg:col-span-4 flex flex-col bg-[#FAF8F4]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#E5DEC9] bg-[#F7EEDB]">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-sm bg-[#E5DEC9]/80" />
            <Skeleton className="h-5 w-28 rounded-none bg-[#E5DEC9]/80" />
            <Skeleton className="h-4 w-6 rounded-sm bg-[#E5DEC9]/80" />
          </div>
          <Skeleton className="h-8 w-24 rounded-sm bg-[#E5DEC9]/80" />
        </div>

        {/* Search */}
        <div className="p-3.5 space-y-2.5 border-b border-[#E5DEC9] bg-[#FDFCFA]">
          <Skeleton className="h-8 w-full rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]" />
          <div className="flex gap-1.5 pt-0.5">
            <Skeleton className="h-5 w-10 rounded-sm bg-[#E5DEC9]/70" />
            <Skeleton className="h-5 w-14 rounded-sm bg-[#E5DEC9]/60" />
            <Skeleton className="h-5 w-12 rounded-sm bg-[#E5DEC9]/60" />
          </div>
        </div>

        {/* Note item rows */}
        <div className="divide-y divide-[#E5DEC9] flex-1 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 bg-[#FDFCFA] space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-36 rounded-none bg-[#E5DEC9]/70" />
                <Skeleton className="h-3 w-12 rounded-none bg-[#E5DEC9]/60" />
              </div>
              <Skeleton className="h-3.5 w-full rounded-none bg-[#E5DEC9]/60" />
              <Skeleton className="h-3.5 w-4/5 rounded-none bg-[#E5DEC9]/60" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-4 w-20 rounded-sm bg-[#E5DEC9]/60" />
                <Skeleton className="h-4 w-12 rounded-sm bg-[#E5DEC9]/60" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Pane Skeleton */}
      <div className="md:col-span-7 lg:col-span-8 flex flex-col bg-[#FDFCFA]">
        {/* Editor Toolbar */}
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-[#E5DEC9] bg-[#F7EEDB]">
          <Skeleton className="h-4 w-36 rounded-none bg-[#E5DEC9]/80" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 rounded-sm bg-[#E5DEC9]/80" />
            <Skeleton className="h-8 w-28 rounded-sm bg-[#E5DEC9]/80" />
          </div>
        </div>

        <div className="p-5 space-y-5 flex-1 flex flex-col">
          {/* Title */}
          <Skeleton className="h-11 w-full rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]" />

          {/* Metadata grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#E5DEC9]">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-24 rounded-none bg-[#E5DEC9]/70" />
              <Skeleton className="h-8 w-full rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-24 rounded-none bg-[#E5DEC9]/70" />
              <Skeleton className="h-8 w-full rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]" />
            </div>
          </div>

          {/* Editor tabs & box */}
          <div className="flex-1 flex flex-col space-y-3 pt-3 border-t border-[#E5DEC9]">
            <div className="flex gap-2 pb-2.5 border-b border-[#E5DEC9]">
              <Skeleton className="h-7 w-20 rounded-sm bg-[#E5DEC9]/70" />
              <Skeleton className="h-7 w-20 rounded-sm bg-[#E5DEC9]/60" />
            </div>
            <Skeleton className="flex-1 min-h-[360px] w-full rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]" />
          </div>
        </div>
      </div>
    </div>
  );
}


