import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SearchAiCardSkeleton() {
  return (
    <Card className="border-primary/20 bg-primary/5 shadow-xs" aria-busy="true" aria-label="Loading AI synthesis">
      <CardHeader className="pb-3 border-b border-primary/10 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-5 w-44" />
          </div>
          <Skeleton className="h-5 w-24 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading search results">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="shadow-xs">
          <CardContent className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function SearchPageSkeleton() {
  return (
    <div className="space-y-6">
      <SearchAiCardSkeleton />
      <SearchResultsSkeleton />
    </div>
  );
}

