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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ActivityItem, ActivityEntityType } from "@/lib/dashboard";

interface RecentActivityListProps {
  activities: ActivityItem[];
}

function getActivityIcon(type: ActivityEntityType) {
  switch (type) {
    case "NOTE":
      return {
        icon: FileText,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        badge: "Note",
      };
    case "RESOURCE":
      return {
        icon: BookOpen,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        badge: "Resource",
      };
    case "ROADMAP":
    case "STEP":
      return {
        icon: Compass,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
        badge: "Roadmap",
      };
    case "GOAL":
      return {
        icon: Target,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        badge: "Goal",
      };
    default:
      return {
        icon: Clock,
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        badge: "Activity",
      };
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
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest learning and study updates</CardDescription>
        </div>
        <Badge variant="outline" className="text-xs">
          {activities.length} items
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-2">
        {activities.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">
              No recent activity
            </p>
            <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs">
              Actions you take across your goals, roadmaps, resources, and notes
              will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {activities.map((item) => {
              const meta = getActivityIcon(item.type);
              const Icon = meta.icon;
              return (
                <li key={item.id} className="py-3 first:pt-0 last:pb-1">
                  <Link
                    href={item.href}
                    className="group flex items-start gap-3 rounded-lg p-1.5 -mx-1.5 transition-colors hover:bg-muted/60"
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${meta.bgColor} ${meta.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">
                          {item.title}
                        </span>
                        <span
                          className="text-[11px] text-muted-foreground shrink-0"
                          suppressHydrationWarning
                        >
                          {formatRelativeTime(item.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4 font-normal"
                        >
                          {meta.badge}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className="pt-4 mt-auto border-t flex items-center justify-between text-xs text-muted-foreground">
          <Link
            href="/notes"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            All notes
            <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/resources"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            All resources
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

