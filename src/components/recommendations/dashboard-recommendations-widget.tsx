import Link from "next/link";
import { Sparkles, ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RecommendationCard } from "@/components/recommendations/recommendation-card";
import type { GeminiRecommendations } from "@/lib/validations/recommendations";

interface DashboardRecommendationsWidgetProps {
  data: GeminiRecommendations;
}

export function DashboardRecommendationsWidget({
  data,
}: DashboardRecommendationsWidgetProps) {
  // Show top 2 high-impact recommendations
  const topRecommendations = data.recommendations.slice(0, 2);

  return (
    <section className="border border-[#E5DEC9] bg-[#F7EEDB] p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[#E5DEC9] gap-3">
        <div className="space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#166534]">
            INTELLIGENCE // ADVISORY
          </div>
          <h2 className="font-serif font-normal text-2xl tracking-[-0.02em] text-[#1C1917] flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#166534]" />
            Personalized Study Next Steps
          </h2>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-sm border-[#1C1917]/20 bg-transparent text-xs font-mono uppercase tracking-[0.12em] text-[#1C1917] hover:bg-[#FAF8F4]"
        >
          <Link href="/recommendations" className="gap-1.5">
            <span>View Full Advisory</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      {data.keyFocusArea && (
        <div className="flex items-center gap-2.5 rounded-none bg-[#FDFCFA] p-3 border border-[#E5DEC9] text-xs">
          <Compass className="h-4 w-4 text-[#166534] shrink-0" />
          <span className="text-[#1C1917]/70">
            <span className="font-semibold text-[#1C1917]">Recommended Primary Focus:</span> {data.keyFocusArea}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {topRecommendations.map((rec) => (
          <RecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </div>
    </section>
  );
}

export function DashboardRecommendationsWidgetSkeleton() {
  return (
    <div className="border border-[#E5DEC9] bg-[#F7EEDB] p-6 space-y-4" aria-busy="true">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
        <Skeleton className="h-6 w-56 rounded-none bg-[#E5DEC9]" />
        <Skeleton className="h-8 w-28 rounded-none bg-[#E5DEC9]" />
      </div>
      <Skeleton className="h-9 w-full rounded-none bg-[#E5DEC9]" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-36 w-full rounded-none bg-[#E5DEC9]" />
        <Skeleton className="h-36 w-full rounded-none bg-[#E5DEC9]" />
      </div>
    </div>
  );
}
