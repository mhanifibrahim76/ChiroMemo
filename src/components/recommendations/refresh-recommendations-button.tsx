"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { refreshRecommendationsAction } from "@/lib/recommendations/actions";

export function RefreshRecommendationsButton() {
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(async () => {
      await refreshRecommendationsAction();
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isPending}
      className="gap-1.5 text-xs font-medium"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
      <span>{isPending ? "Analyzing..." : "Refresh Insights"}</span>
    </Button>
  );
}

