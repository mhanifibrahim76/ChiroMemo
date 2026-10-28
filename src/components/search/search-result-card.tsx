import Link from "next/link";
import {
  FileText,
  BookOpen,
  Sparkles,
  Target,
  Map,
  ArrowUpRight,
  Tag,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SearchResultItem, SearchEntityType } from "@/lib/validations/search";

interface SearchResultCardProps {
  item: SearchResultItem;
}

function getEntityConfig(type: SearchEntityType) {
  switch (type) {
    case "NOTE":
      return {
        label: "Note",
        icon: FileText,
        badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      };
    case "RESOURCE":
      return {
        label: "Resource",
        icon: BookOpen,
        badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      };
    case "SUMMARY":
      return {
        label: "AI Summary",
        icon: Sparkles,
        badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      };
    case "GOAL":
      return {
        label: "Goal",
        icon: Target,
        badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      };
    case "ROADMAP":
      return {
        label: "Roadmap",
        icon: Map,
        badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
      };
    default:
      return {
        label: "Item",
        icon: FileText,
        badgeClass: "bg-muted text-muted-foreground",
      };
  }
}

export function SearchResultCard({ item }: SearchResultCardProps) {
  const config = getEntityConfig(item.type);
  const Icon = config.icon;

  const formattedDate = new Date(item.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className="group hover:border-foreground/30 transition-all shadow-xs">
      <CardContent className="p-4 sm:p-5 space-y-3">
        {/* Header: Entity Type Badge, Date, AI Match Score */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs font-medium gap-1 py-0.5 ${config.badgeClass}`}>
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>

            {item.metadata?.resourceType && (
              <span className="text-xs text-muted-foreground font-mono">
                {item.metadata.resourceType}
              </span>
            )}

            {item.metadata?.goalStatus && (
              <span className="text-xs text-muted-foreground font-medium">
                ({item.metadata.goalStatus.toLowerCase()})
              </span>
            )}

            {item.metadata?.progressPercent !== undefined && (
              <span className="text-xs text-muted-foreground font-medium">
                {item.metadata.progressPercent}% completed
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {item.score !== undefined && item.relevanceReason && (
              <Badge variant="secondary" className="text-[11px] font-medium bg-secondary/80">
                Score: {item.score}%
              </Badge>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Title Link */}
        <div>
          <Link
            href={item.href}
            className="group/link inline-flex items-center gap-1.5 text-base font-semibold text-foreground hover:text-primary transition-colors"
          >
            <span>{item.title}</span>
            <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-primary" />
          </Link>
        </div>

        {/* AI Relevance Reason (if analyzed by Gemini) */}
        {item.relevanceReason && (
          <div className="flex items-start gap-1.5 rounded-md bg-muted/60 px-2.5 py-1.5 text-xs text-foreground/90">
            <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" />
            <span className="leading-snug">
              <span className="font-semibold text-foreground">AI Insight:</span> {item.relevanceReason}
            </span>
          </div>
        )}

        {/* Text Snippet */}
        {item.snippet && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {item.snippet}
          </p>
        )}

        {/* Tags / Metadata Footer */}
        {item.metadata?.tags && item.metadata.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {item.metadata.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
              >
                <Tag className="h-2.5 w-2.5 opacity-60" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

