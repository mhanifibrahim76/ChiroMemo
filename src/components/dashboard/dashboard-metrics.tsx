import Link from "next/link";
import { Target, Compass, BookOpen, FileText, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DashboardMetrics as MetricsType } from "@/lib/dashboard";

interface DashboardMetricsProps {
  metrics: MetricsType;
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  const cards = [
    {
      title: "Active Goals",
      value: String(metrics.activeGoalsCount).padStart(2, "0"),
      description: `${metrics.totalGoalsCount} total goals recorded`,
      href: "/goals",
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Roadmap Progress",
      value: `${metrics.averageRoadmapProgress}%`,
      description: `${metrics.totalRoadmapsCount} roadmaps tracked`,
      href: "/roadmaps",
      icon: Compass,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      progress: metrics.averageRoadmapProgress,
    },
    {
      title: "Saved Resources",
      value: String(metrics.totalResourcesCount).padStart(2, "0"),
      description: "Articles, courses & docs",
      href: "/resources",
      icon: BookOpen,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Personal Notes",
      value: String(metrics.totalNotesCount).padStart(2, "0"),
      description: "Synthesized study notes",
      href: "/notes",
      icon: FileText,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.title}
            href={card.href}
            className="group block transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
          >
            <Card className="h-full transition-all group-hover:border-foreground/30 group-hover:shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor} ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold tracking-tight">
                    {card.value}
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                </div>
                {card.progress !== undefined ? (
                  <div className="mt-2.5 space-y-1.5">
                    <Progress value={card.progress} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {card.description}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

