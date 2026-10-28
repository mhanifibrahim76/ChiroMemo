import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchPageSkeleton } from "@/components/search/search-skeleton";

export default function SearchLoading() {
  return (
    <div className="space-y-6">
      {/* Static Header renders instantly */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Intelligent Search</h1>
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3 w-3" />
            AI-Powered
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Natural-language semantic search across personal study notes, documents, AI summaries, and goals.
        </p>
      </div>

      {/* Search Input Bar Skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-11 flex-1 rounded-md" />
        <Skeleton className="h-11 w-28 rounded-md" />
      </div>

      {/* Filter pills skeleton */}
      <div className="flex gap-2 pb-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      {/* Dynamic Data Regions Skeleton */}
      <SearchPageSkeleton />
    </div>
  );
}

