import { Sparkles, Compass } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshRecommendationsButton } from "@/components/recommendations/refresh-recommendations-button";
import type { GeminiRecommendations } from "@/lib/validations/recommendations";

interface RecommendationsOverviewProps {
  data: GeminiRecommendations;
}

export function RecommendationsOverview({ data }: RecommendationsOverviewProps) {
  return (
    <Card className="border-primary/20 bg-primary/5 shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b border-primary/10 bg-primary/5 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-semibold tracking-tight">
            AI Academic Advisory
          </CardTitle>
        </div>

        <RefreshRecommendationsButton />
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        <p className="text-sm leading-relaxed text-foreground">
          {data.overallAssessment}
        </p>

        {data.keyFocusArea && (
          <div className="flex items-center gap-2 rounded-lg bg-background/80 p-3 border border-primary/15 text-xs shadow-2xs">
            <Compass className="h-4 w-4 text-primary shrink-0" />
            <div>
              <span className="font-semibold text-foreground">Next Primary Study Focus: </span>
              <span className="text-muted-foreground">{data.keyFocusArea}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

