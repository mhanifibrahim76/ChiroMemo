"use client";

import { useState, useSyncExternalStore } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, BarChart2, Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DailyLearningActivity, RoadmapProgressSummary } from "@/lib/dashboard";

interface LearningProgressChartProps {
  dailyActivity: DailyLearningActivity[];
  roadmaps: RoadmapProgressSummary[];
}

// Hydration helper using useSyncExternalStore
const emptySubscribe = () => () => {};
function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function LearningProgressChart({
  dailyActivity,
  roadmaps,
}: LearningProgressChartProps) {
  const isClient = useIsClient();
  const [view, setView] = useState<"activity" | "roadmaps">("activity");

  const totalWeeklyActivities = dailyActivity.reduce((acc, d) => acc + d.total, 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Learning Progress
          </CardTitle>
          <CardDescription>
            {view === "activity"
              ? `${totalWeeklyActivities} activities recorded in the last 7 days`
              : `${roadmaps.length} learning roadmaps tracked`}
          </CardDescription>
        </div>

        {roadmaps.length > 0 && (
          <Tabs
            value={view}
            onValueChange={(val) => setView(val as "activity" | "roadmaps")}
            className="w-auto"
          >
            <TabsList className="h-8">
              <TabsTrigger value="activity" className="text-xs px-2.5 h-6">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="roadmaps" className="text-xs px-2.5 h-6">
                <BarChart2 className="h-3.5 w-3.5 mr-1" />
                Roadmaps
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </CardHeader>

      <CardContent className="flex-1 min-h-[260px] pt-2">
        {!isClient ? (
          <div className="flex h-[260px] items-center justify-center text-muted-foreground text-xs">
            Loading chart visualization...
          </div>
        ) : view === "activity" ? (
          totalWeeklyActivities === 0 ? (
            <div className="flex h-[260px] flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
              <Activity className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">
                No activity recorded yet this week
              </p>
              <p className="text-xs text-muted-foreground/80 mt-1 max-w-sm">
                Add learning resources, write notes, or update roadmap steps to
                track your learning trajectory here.
              </p>
            </div>
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyActivity}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload as DailyLearningActivity;
                      return (
                        <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
                          <p className="font-semibold text-popover-foreground mb-1">
                            {data.label} ({data.day})
                          </p>
                          <p className="text-primary font-medium">
                            Total actions: {data.total}
                          </p>
                          <div className="mt-1 space-y-0.5 text-muted-foreground">
                            <p>• Notes updated: {data.notes}</p>
                            <p>• Resources added: {data.resources}</p>
                            <p>• Roadmaps touched: {data.roadmaps}</p>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#activityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={roadmaps}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis
                  dataKey="title"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(val: string) =>
                    val.length > 12 ? `${val.slice(0, 12)}…` : val
                  }
                />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  tickFormatter={(val: number) => `${val}%`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload as RoadmapProgressSummary;
                    return (
                      <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
                        <p className="font-semibold text-popover-foreground">
                          {data.title}
                        </p>
                        <p className="text-emerald-500 font-medium mt-1">
                          Completion: {data.progressPercent}%
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="progressPercent"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

