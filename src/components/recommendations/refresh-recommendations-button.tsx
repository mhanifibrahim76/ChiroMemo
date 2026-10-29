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
      className="gap-1.5 rounded-sm border-[#E5DEC9] bg-[#FDFCFA] text-[#1C1917] hover:bg-[#F7EEDB] hover:text-[#166534] font-mono text-[11px] uppercase tracking-wider h-8 px-3 shadow-none"
    >
      <RefreshCw className={`h-3 w-3 ${isPending ? "animate-spin" : ""}`} />
      <span>{isPending ? "Analyzing..." : "Refresh Advisory"}</span>
    </Button>
  );
}


