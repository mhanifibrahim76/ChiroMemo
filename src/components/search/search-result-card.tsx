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
import type { SearchResultItem, SearchEntityType } from "@/lib/validations/search";

interface SearchResultCardProps {
  item: SearchResultItem;
}

function getEntityConfig(type: SearchEntityType) {
  switch (type) {
    case "NOTE":
      return {
        label: "NOTE",
        icon: FileText,
        badgeClass: "border-[#E5DEC9] bg-[#F7EEDB] text-[#1C1917]/80",
      };
    case "RESOURCE":
      return {
        label: "RESOURCE",
        icon: BookOpen,
        badgeClass: "border-[#D97706]/30 bg-[#D97706]/10 text-[#D97706]",
      };
    case "SUMMARY":
      return {
        label: "AI SUMMARY",
        icon: Sparkles,
        badgeClass: "border-[#166534]/30 bg-[#166534]/10 text-[#166534]",
      };
    case "GOAL":
      return {
        label: "GOAL",
        icon: Target,
        badgeClass: "border-[#166534]/25 bg-[#F7EEDB] text-[#166534]",
      };
    case "ROADMAP":
      return {
        label: "ROADMAP",
        icon: Map,
        badgeClass: "border-[#E5DEC9] bg-[#FAF8F4] text-[#1C1917]/75",
      };
    default:
      return {
        label: "ITEM",
        icon: FileText,
        badgeClass: "border-[#E5DEC9] bg-[#FAF8F4] text-[#1C1917]/60",
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
    <div className="group border border-[#E5DEC9] bg-[#FDFCFA] p-5 transition-colors hover:bg-[#F7EEDB]/60 space-y-3">
      {/* Header: Entity Type Badge, Date, AI Match Score */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5DEC9] pb-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${config.badgeClass}`}
          >
            <Icon className="h-3 w-3" />
            {config.label}
          </span>

          {item.metadata?.resourceType && (
            <span className="text-[11px] text-[#1C1917]/60 font-mono uppercase">
              {item.metadata.resourceType}
            </span>
          )}

          {item.metadata?.goalStatus && (
            <span className="text-[11px] text-[#1C1917]/60 font-mono uppercase">
              [{item.metadata.goalStatus.toLowerCase()}]
            </span>
          )}

          {item.metadata?.progressPercent !== undefined && (
            <span className="text-[11px] text-[#166534] font-mono">
              {item.metadata.progressPercent}% completed
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 text-[11px] font-mono text-[#1C1917]/55">
          {item.score !== undefined && item.relevanceReason && (
            <span className="inline-flex items-center rounded-sm border border-[#166534]/25 bg-[#166534]/10 px-2 py-0.5 text-[10px] font-mono text-[#166534]">
              MATCH {item.score}%
            </span>
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
          className="group/link inline-flex items-center gap-1.5 font-serif font-normal text-2xl text-[#1C1917] hover:text-[#166534] transition-colors tracking-tight"
        >
          <span>{item.title}</span>
          <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-[#166534]" />
        </Link>
      </div>

      {/* AI Relevance Reason (if analyzed by Gemini) */}
      {item.relevanceReason && (
        <div className="flex items-start gap-2 rounded-sm border border-[#E5DEC9] bg-[#FAF8F4] px-3 py-2 text-xs text-[#1C1917]/80">
          <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-[#166534] shrink-0" />
          <span className="leading-relaxed">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-[#166534] mr-1.5">
              AI Insight:
            </span>
            {item.relevanceReason}
          </span>
        </div>
      )}

      {/* Text Snippet */}
      {item.snippet && (
        <p className="text-sm text-[#1C1917]/70 line-clamp-2 leading-relaxed">
          {item.snippet}
        </p>
      )}

      {/* Tags / Metadata Footer */}
      {item.metadata?.tags && item.metadata.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {item.metadata.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-sm border border-[#E5DEC9] bg-[#FAF8F4] px-2 py-0.5 text-[10px] font-mono text-[#1C1917]/65"
            >
              <Tag className="h-2.5 w-2.5 opacity-60" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}


