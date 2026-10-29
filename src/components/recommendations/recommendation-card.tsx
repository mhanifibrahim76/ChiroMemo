import Link from "next/link";
import {
  Compass,
  AlertCircle,
  Repeat,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  RecommendationItem,
  RecommendationCategory,
  RecommendationPriority,
} from "@/lib/validations/recommendations";

interface RecommendationCardProps {
  recommendation: RecommendationItem;
}

function getCategoryConfig(category: RecommendationCategory) {
  switch (category) {
    case "NEXT_STEP":
      return {
        label: "NEXT MILESTONE",
        icon: Compass,
        badgeClass: "border-[#166534]/30 bg-[#166534]/10 text-[#166534]",
      };
    case "KNOWLEDGE_GAP":
      return {
        label: "KNOWLEDGE GAP",
        icon: AlertCircle,
        badgeClass: "border-[#D97706]/30 bg-[#D97706]/10 text-[#D97706]",
      };
    case "REVIEW_RECALL":
      return {
        label: "ACTIVE RECALL",
        icon: Repeat,
        badgeClass: "border-[#166534]/25 bg-[#F7EEDB] text-[#166534]",
      };
    case "STUDY_STRATEGY":
      return {
        label: "STUDY STRATEGY",
        icon: Sparkles,
        badgeClass: "border-[#E5DEC9] bg-[#F7EEDB] text-[#1C1917]/75",
      };
  }
}

function getPriorityConfig(priority: RecommendationPriority) {
  switch (priority) {
    case "HIGH":
      return {
        label: "HIGH PRIORITY",
        badgeClass: "border-[#D97706]/40 bg-[#D97706]/10 text-[#D97706]",
        icon: Flame,
      };
    case "MEDIUM":
      return {
        label: "STANDARD",
        badgeClass: "border-[#166534]/25 bg-[#166534]/10 text-[#166534]",
        icon: Sparkles,
      };
    case "LOW":
      return {
        label: "SUPPLEMENTAL",
        badgeClass: "border-[#E5DEC9] bg-[#FAF8F4] text-[#1C1917]/60",
        icon: CheckCircle2,
      };
  }
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const cat = getCategoryConfig(recommendation.category);
  const pri = getPriorityConfig(recommendation.priority);
  const CatIcon = cat.icon;
  const PriIcon = pri.icon;

  return (
    <div className="border border-[#E5DEC9] bg-[#FDFCFA] p-6 transition-colors hover:bg-[#F7EEDB]/60 flex flex-col justify-between gap-5">
      <div className="space-y-4">
        {/* Badges row */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5DEC9] pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${cat.badgeClass}`}
            >
              <CatIcon className="h-3 w-3" />
              {cat.label}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${pri.badgeClass}`}
            >
              <PriIcon className="h-3 w-3" />
              {pri.label}
            </span>
          </div>

          {recommendation.targetEntity?.title && (
            <span className="text-[11px] font-mono text-[#1C1917]/55 truncate max-w-[200px]">
              {recommendation.targetEntity.title}
            </span>
          )}
        </div>

        {/* Title and Description */}
        <div className="space-y-2">
          <h3 className="font-serif font-normal text-2xl text-[#1C1917] tracking-tight leading-snug">
            {recommendation.title}
          </h3>
          <p className="text-sm text-[#1C1917]/70 leading-relaxed">
            {recommendation.description}
          </p>
        </div>

        {/* AI Reasoning callout */}
        {recommendation.reasoning && (
          <div className="flex items-start gap-2.5 rounded-sm border border-[#E5DEC9] bg-[#FAF8F4] p-3 text-xs text-[#1C1917]/80">
            <Sparkles className="h-3.5 w-3.5 mt-0.5 text-[#166534] shrink-0" />
            <span className="leading-relaxed">
              <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-[#166534] mr-1.5">
                Rationale:
              </span>
              {recommendation.reasoning}
            </span>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="pt-2 border-t border-[#E5DEC9] flex items-center justify-end">
        <Button
          asChild
          size="sm"
          className="rounded-sm bg-[#166534] text-[#FAF8F4] hover:bg-[#166534]/90 font-medium gap-1.5 h-8 px-3.5 text-xs shadow-none"
        >
          <Link href={recommendation.actionHref}>
            <span>{recommendation.actionLabel}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}


