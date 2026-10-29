import Link from "next/link";
import { Target, Compass, BookOpen, FileText, ArrowUpRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { DashboardMetrics as MetricsType } from "@/lib/dashboard";

interface DashboardMetricsProps {
  metrics: MetricsType;
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  const cards = [
    {
      index: "01",
      title: "Active Goals",
      value: String(metrics.activeGoalsCount).padStart(2, "0"),
      description: `${metrics.totalGoalsCount} total goals recorded`,
      href: "/goals",
      icon: Target,
    },
    {
      index: "02",
      title: "Roadmap Progress",
      value: `${metrics.averageRoadmapProgress}%`,
      description: `${metrics.totalRoadmapsCount} roadmaps tracked`,
      href: "/roadmaps",
      icon: Compass,
      progress: metrics.averageRoadmapProgress,
    },
    {
      index: "03",
      title: "Saved Resources",
      value: String(metrics.totalResourcesCount).padStart(2, "0"),
      description: "Articles, courses & docs",
      href: "/resources",
      icon: BookOpen,
    },
    {
      index: "04",
      title: "Personal Notes",
      value: String(metrics.totalNotesCount).padStart(2, "0"),
      description: "Synthesized study notes",
      href: "/notes",
      icon: FileText,
    },
  ];

  return (
    <div className="grid grid-cols-1 divide-y sm:divide-y-0 sm:divide-x divide-[#E5DEC9] border border-[#E5DEC9] bg-[#FDFCFA] sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.title}
            href={card.href}
            className="group relative flex flex-col justify-between p-5 transition-colors hover:bg-[#F7EEDB] focus-visible:outline-none"
          >
            <div className="flex items-center justify-between pb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#166534]">
                METRIC {card.index} &middot; {card.title}
              </span>
              <Icon className="h-4 w-4 text-[#1C1917]/50 group-hover:text-[#166534] transition-colors" />
            </div>

            <div className="space-y-1 my-2">
              <div className="flex items-baseline justify-between">
                <div className="font-serif font-normal text-4xl lg:text-5xl tracking-[-0.03em] text-[#1C1917]">
                  {card.value}
                </div>
                <ArrowUpRight className="h-4 w-4 text-[#1C1917]/30 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#166534]" />
              </div>

              {card.progress !== undefined ? (
                <div className="pt-2 space-y-1.5">
                  <Progress value={card.progress} className="h-1 bg-[#E5DEC9]" />
                  <p className="font-mono text-[11px] text-[#1C1917]/60">
                    {card.description}
                  </p>
                </div>
              ) : (
                <p className="font-mono text-[11px] text-[#1C1917]/60 pt-1">
                  {card.description}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
