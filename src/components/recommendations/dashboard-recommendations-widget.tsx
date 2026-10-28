import Link from "next/link";
import { Sparkles, ArrowRight, Compass } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="border-primary/20 bg-primary/5 shadow-xs overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold tracking-tight">
              AI Study Focus & Recommendations
            </CardTitle>
          </div>
        </div>

        <Button asChild variant="ghost" size="sm" className="text-xs font-medium gap-1 text-primary hover:text-primary">
          <Link href="/recommendations">
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {data.keyFocusArea && (
          <div className="flex items-center gap-2 rounded-lg bg-background/80 p-2.5 border border-primary/10 text-xs">
            <Compass className="h-4 w-4 text-primary shrink-0" />
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">Suggested Primary Focus:</span> {data.keyFocusArea}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {topRecommendations.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardRecommendationsWidgetSkeleton() {
  return (
    <Card className="border-primary/20 bg-primary/5 shadow-xs" aria-busy="true" aria-label="Loading recommendations">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-8 w-20 rounded-md" />
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <Skeleton className="h-8 w-full rounded-lg" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

