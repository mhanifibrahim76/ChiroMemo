import { Skeleton } from "@/components/ui/skeleton";
import { DashboardRecommendationsWidgetSkeleton } from "@/components/recommendations/dashboard-recommendations-widget";

export function DashboardMetricsSkeleton() {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#E5DEC9] bg-[#FDFCFA] divide-y sm:divide-y-0 sm:divide-x divide-[#E5DEC9]"
      aria-busy="true"
      aria-label="Loading summary metrics"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-32 rounded-none bg-[#E5DEC9]/70" />
            <Skeleton className="h-3.5 w-3.5 rounded-none bg-[#E5DEC9]/70" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-10 w-20 rounded-none bg-[#E5DEC9]/80" />
            <Skeleton className="h-3.5 w-36 rounded-none bg-[#E5DEC9]/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardChartSkeleton() {
  return (
    <div
      className="h-full flex flex-col border border-[#E5DEC9] bg-[#FDFCFA]"
      aria-busy="true"
      aria-label="Loading learning progress chart"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 border-b border-[#E5DEC9] bg-[#F7EEDB]">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-36 rounded-none bg-[#E5DEC9]/80" />
          <Skeleton className="h-5 w-44 rounded-none bg-[#E5DEC9]/80" />
        </div>
        <Skeleton className="h-8 w-36 rounded-sm bg-[#E5DEC9]/80" />
      </div>
      <div className="flex-1 p-6">
        <Skeleton className="h-[260px] w-full rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]" />
      </div>
    </div>
  );
}

export function DashboardActivitySkeleton() {
  return (
    <div
      className="h-full flex flex-col border border-[#E5DEC9] bg-[#FDFCFA]"
      aria-busy="true"
      aria-label="Loading recent activities"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5DEC9] bg-[#F7EEDB]">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-32 rounded-none bg-[#E5DEC9]/80" />
          <Skeleton className="h-5 w-40 rounded-none bg-[#E5DEC9]/80" />
        </div>
        <Skeleton className="h-5 w-16 rounded-sm bg-[#E5DEC9]/80" />
      </div>
      <div className="flex-1 divide-y divide-[#E5DEC9]">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="flex items-start gap-3 px-6 py-4">
            <Skeleton className="h-7 w-7 rounded-sm bg-[#E5DEC9]/70 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32 rounded-none bg-[#E5DEC9]/70" />
                <Skeleton className="h-3 w-12 rounded-none bg-[#E5DEC9]/60" />
              </div>
              <Skeleton className="h-3.5 w-44 rounded-none bg-[#E5DEC9]/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      {/* Metrics Cards Skeleton */}
      <DashboardMetricsSkeleton />

      {/* AI Recommendations Skeleton */}
      <DashboardRecommendationsWidgetSkeleton />

      {/* Main Grid: Chart and Recent Activities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Chart Skeleton */}
        <div className="lg:col-span-7">
          <DashboardChartSkeleton />
        </div>

        {/* Right: Recent Activity Skeleton */}
        <div className="lg:col-span-5">
          <DashboardActivitySkeleton />
        </div>
      </div>
    </div>
  );
}


