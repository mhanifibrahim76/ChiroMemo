import { Sparkles } from "lucide-react";
import { RecommendationsPageSkeleton } from "@/components/recommendations/recommendations-skeleton";

export default function RecommendationsLoading() {
  return (
    <div className="space-y-6">
      {/* Static Header renders instantly */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Personalized Recommendations</h1>
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3 w-3" />
            Gemini AI
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Tailored study plans, milestone advancements, and active recall reminders synthesized from your academic progress.
        </p>
      </div>

      {/* Dynamic Data Regions Skeleton */}
      <RecommendationsPageSkeleton />
    </div>
  );
}

