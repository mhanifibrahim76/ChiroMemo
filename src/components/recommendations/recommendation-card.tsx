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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        label: "Next Milestone",
        icon: Compass,
        badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
      };
    case "KNOWLEDGE_GAP":
      return {
        label: "Knowledge Gap",
        icon: AlertCircle,
        badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      };
    case "REVIEW_RECALL":
      return {
        label: "Active Recall",
        icon: Repeat,
        badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      };
    case "STUDY_STRATEGY":
      return {
        label: "Study Strategy",
        icon: Sparkles,
        badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      };
  }
}

function getPriorityConfig(priority: RecommendationPriority) {
  switch (priority) {
    case "HIGH":
      return {
        label: "High Priority",
        badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
        icon: Flame,
      };
    case "MEDIUM":
      return {
        label: "Medium Priority",
        badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        icon: Sparkles,
      };
    case "LOW":
      return {
        label: "Supplemental",
        badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800",
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
    <Card className="hover:border-foreground/30 transition-all shadow-xs overflow-hidden">
      <CardContent className="p-5 space-y-4">
        {/* Badges row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs font-medium gap-1 py-0.5 ${cat.badgeClass}`}>
              <CatIcon className="h-3 w-3" />
              {cat.label}
            </Badge>
            <Badge variant="outline" className={`text-xs font-medium gap-1 py-0.5 ${pri.badgeClass}`}>
              <PriIcon className="h-3 w-3" />
              {pri.label}
            </Badge>
          </div>

          {recommendation.targetEntity?.title && (
            <span className="text-xs text-muted-foreground font-medium truncate max-w-[200px]">
              {recommendation.targetEntity.title}
            </span>
          )}
        </div>

        {/* Title and Description */}
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-foreground tracking-tight">
            {recommendation.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {recommendation.description}
          </p>
        </div>

        {/* AI Reasoning pill */}
        {recommendation.reasoning && (
          <div className="flex items-start gap-2 rounded-md bg-muted/60 p-2.5 text-xs text-foreground/90">
            <Sparkles className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
            <span className="leading-snug">
              <span className="font-semibold text-foreground">Why this matters:</span> {recommendation.reasoning}
            </span>
          </div>
        )}

        {/* CTA Button */}
        <div className="pt-1 flex items-center justify-end">
          <Button asChild size="sm" className="font-medium gap-1.5">
            <Link href={recommendation.actionHref}>
              <span>{recommendation.actionLabel}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

