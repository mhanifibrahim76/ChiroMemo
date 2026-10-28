import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardMetricsSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      aria-busy="true"
      aria-label="Loading summary metrics"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-8 w-14" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DashboardChartSkeleton() {
  return (
    <Card className="h-full flex flex-col" aria-busy="true" aria-label="Loading learning progress chart">
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-8 w-32 rounded-lg" />
      </CardHeader>
      <CardContent className="flex-1 pt-2">
        <Skeleton className="h-[260px] w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

export function DashboardActivitySkeleton() {
  return (
    <Card className="h-full flex flex-col" aria-busy="true" aria-label="Loading recent activities">
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </CardHeader>
      <CardContent className="flex-1 space-y-4 pt-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
        ))}
        <div className="pt-4 mt-auto border-t flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      {/* Metrics Cards Skeleton */}
      <DashboardMetricsSkeleton />

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

