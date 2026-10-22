import { Skeleton } from "@/components/ui/skeleton";

export function NotesSplitSkeleton() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[640px] items-stretch"
      aria-busy="true"
      aria-label="Loading notes"
    >
      {/* Left Pane Skeleton */}
      <div className="md:col-span-5 h-[640px] rounded-lg border bg-card p-3 space-y-3 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>

        {/* Search */}
        <div className="space-y-2 pb-2 border-b">
          <Skeleton className="h-8 w-full rounded-md" />
          <div className="flex gap-1.5 pt-1">
            <Skeleton className="h-4 w-10 rounded-full" />
            <Skeleton className="h-4 w-14 rounded-full" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
        </div>

        {/* Note item cards */}
        <div className="space-y-2.5 flex-1 overflow-hidden pt-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3 rounded-md border space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-3 w-12 rounded" />
              </div>
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-4/5 rounded" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Pane Skeleton */}
      <div className="md:col-span-7 h-[640px] rounded-lg border bg-card p-4 space-y-4 flex flex-col">
        {/* Editor Toolbar */}
        <div className="flex justify-between items-center pb-3 border-b">
          <Skeleton className="h-4 w-28 rounded" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>

        {/* Title */}
        <Skeleton className="h-9 w-3/4 rounded" />

        {/* Metadata grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        </div>

        {/* Editor tabs & box */}
        <div className="flex-1 flex flex-col space-y-2 pt-2 border-t">
          <div className="flex gap-2 pb-2 border-b">
            <Skeleton className="h-6 w-16 rounded" />
            <Skeleton className="h-6 w-18 rounded" />
          </div>
          <Skeleton className="flex-1 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}

