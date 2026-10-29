import Link from "next/link";
import {
  FileText,
  BookOpen,
  Compass,
  Target,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { ActivityItem, ActivityEntityType } from "@/lib/dashboard";

interface RecentActivityListProps {
  activities: ActivityItem[];
}

function getActivityBadge(type: ActivityEntityType) {
  switch (type) {
    case "NOTE":
      return { icon: FileText, label: "Note" };
    case "RESOURCE":
      return { icon: BookOpen, label: "Resource" };
    case "ROADMAP":
    case "STEP":
      return { icon: Compass, label: "Roadmap" };
    case "GOAL":
      return { icon: Target, label: "Goal" };
    default:
      return { icon: Clock, label: "Log" };
  }
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return "Yesterday";
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  return (
    <div className="h-full flex flex-col justify-between border border-[#E5DEC9] bg-[#FDFCFA]">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#E5DEC9]">
        <div className="space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#166534]">
            TIMELINE // LOG
          </div>
          <h3 className="font-serif font-normal text-2xl tracking-[-0.02em] text-[#1C1917]">
            Recent Activity
          </h3>
        </div>
        <span className="font-mono text-[11px] text-[#1C1917]/55 uppercase">
          {activities.length} entries
        </span>
      </div>

      {/* Body List */}
      <div className="flex-1 p-5">
        {activities.length === 0 ? (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center border border-dashed border-[#E5DEC9] p-6 text-center bg-[#F7EEDB]/30">
            <Sparkles className="h-6 w-6 text-[#1C1917]/30 mb-2" />
            <p className="font-serif text-base text-[#1C1917]">No study activities recorded yet</p>
            <p className="font-mono text-[11px] text-[#1C1917]/60 mt-1 max-w-xs">
              Actions taken across your goals, roadmaps, and notes will be journaled here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#E5DEC9]">
            {activities.map((item) => {
              const meta = getActivityBadge(item.type);
              const Icon = meta.icon;
              return (
                <li key={item.id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={item.href}
                    className="group flex items-start justify-between gap-3 p-1.5 -mx-1.5 transition-colors hover:bg-[#F7EEDB]"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Icon className="h-4 w-4 mt-0.5 text-[#166534] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1C1917] truncate group-hover:underline underline-offset-4">
                          {item.title}
                        </p>
                        <p className="font-mono text-[11px] text-[#1C1917]/60 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <span
                        className="font-mono text-[10px] text-[#1C1917]/50"
                        suppressHydrationWarning
                      >
                        {formatRelativeTime(item.timestamp)}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[#166534] mt-1">
                        [{meta.label}]
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer Links */}
      <div className="border-t border-[#E5DEC9] px-5 py-3 flex items-center justify-between font-mono text-[11px] text-[#1C1917]/65">
        <Link href="/notes" className="hover:text-[#166534] flex items-center gap-1 transition-colors">
          <span>ALL NOTES</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/resources" className="hover:text-[#166534] flex items-center gap-1 transition-colors">
          <span>ALL RESOURCES</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
