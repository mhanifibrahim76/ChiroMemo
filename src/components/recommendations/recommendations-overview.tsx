import { Sparkles, Compass } from "lucide-react";
import { RefreshRecommendationsButton } from "@/components/recommendations/refresh-recommendations-button";
import type { GeminiRecommendations } from "@/lib/validations/recommendations";

interface RecommendationsOverviewProps {
  data: GeminiRecommendations;
}

export function RecommendationsOverview({ data }: RecommendationsOverviewProps) {
  return (
    <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
      <div className="px-6 py-4 border-b border-[#E5DEC9] bg-[#F7EEDB] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-[#166534]/25 bg-[#166534]/10 text-[#166534]">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-[#166534] uppercase tracking-widest leading-none mb-1">
              GEMINI SYNTHESIS {"//"} OVERVIEW
            </p>
            <h2 className="font-serif font-normal text-xl tracking-tight text-[#1C1917] leading-none">
              AI Academic Advisory
            </h2>
          </div>
        </div>

        <RefreshRecommendationsButton />
      </div>

      <div className="p-6 space-y-4">
        <p className="text-sm leading-relaxed text-[#1C1917]/80">
          {data.overallAssessment}
        </p>

        {data.keyFocusArea && (
          <div className="flex items-start gap-3 rounded-sm bg-[#F7EEDB]/70 p-3.5 border border-[#E5DEC9] text-xs">
            <Compass className="h-4 w-4 text-[#166534] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-[#166534] block mb-0.5">
                Primary Study Focus
              </span>
              <span className="text-[#1C1917]/85">{data.keyFocusArea}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


