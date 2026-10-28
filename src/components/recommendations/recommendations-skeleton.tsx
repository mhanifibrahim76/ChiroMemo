import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RecommendationsOverviewSkeleton() {
  return (
    <Card className="border-primary/20 bg-primary/5 shadow-xs" aria-busy="true" aria-label="Loading overview">
      <CardHeader className="pb-3 border-b border-primary/10 bg-primary/5 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-5 w-44" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

export function RecommendationCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2" aria-busy="true" aria-label="Loading recommendations">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="shadow-xs">
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-12 w-full rounded-md" />
            <div className="flex justify-end pt-1">
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function RecommendationsPageSkeleton() {
  return (
    <div className="space-y-6">
      <RecommendationsOverviewSkeleton />
      <RecommendationCardsSkeleton />
    </div>
  );
}

