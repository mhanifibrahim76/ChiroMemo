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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DailyLearningActivity, RoadmapProgressSummary } from "@/lib/dashboard";

interface LearningProgressChartProps {
  dailyActivity: DailyLearningActivity[];
  roadmaps: RoadmapProgressSummary[];
}

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
    <div className="h-full flex flex-col justify-between border border-[#E5DEC9] bg-[#FDFCFA]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 border-b border-[#E5DEC9] gap-3">
        <div className="space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#166534]">
            ANALYTICS // 7-DAY TRAJECTORY
          </div>
          <h3 className="font-serif font-normal text-2xl tracking-[-0.02em] text-[#1C1917] flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#166534]" />
            Study Momentum
          </h3>
          <p className="font-mono text-[11px] text-[#1C1917]/60">
            {view === "activity"
              ? `${totalWeeklyActivities} cumulative study actions this week`
              : `${roadmaps.length} active syllabus roadmaps mapped`}
          </p>
        </div>

        {roadmaps.length > 0 && (
          <Tabs
            value={view}
            onValueChange={(val) => setView(val as "activity" | "roadmaps")}
            className="w-auto"
          >
            <TabsList className="h-8 rounded-sm bg-[#F7EEDB] border border-[#E5DEC9] p-0.5">
              <TabsTrigger
                value="activity"
                className="text-[11px] font-mono uppercase tracking-wider px-2.5 h-6 rounded-none data-[state=active]:bg-[#166534] data-[state=active]:text-[#FAF8F4]"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Activity
              </TabsTrigger>
              <TabsTrigger
                value="roadmaps"
                className="text-[11px] font-mono uppercase tracking-wider px-2.5 h-6 rounded-none data-[state=active]:bg-[#166534] data-[state=active]:text-[#FAF8F4]"
              >
                <BarChart2 className="h-3 w-3 mr-1" />
                Roadmaps
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 min-h-[260px] p-5">
        {!isClient ? (
          <div className="flex h-[260px] items-center justify-center font-mono text-xs text-[#1C1917]/50">
            Rendering academic diagram...
          </div>
        ) : view === "activity" ? (
          totalWeeklyActivities === 0 ? (
            <div className="flex h-[260px] flex-col items-center justify-center border border-dashed border-[#E5DEC9] p-6 text-center bg-[#F7EEDB]/30">
              <Activity className="h-6 w-6 text-[#1C1917]/30 mb-2" />
              <p className="font-serif text-base text-[#1C1917]">No activity logged this week</p>
              <p className="font-mono text-[11px] text-[#1C1917]/60 mt-1 max-w-sm">
                Add learning resources, write notes, or check off roadmap steps to plot your rhythm.
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
                    <linearGradient id="editorialActivityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#166534" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#166534" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5DEC9" opacity={0.7} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={{ stroke: "#E5DEC9" }}
                    tick={{ fontSize: 11, fill: "#57534E", fontFamily: "var(--font-mono)" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={{ stroke: "#E5DEC9" }}
                    tick={{ fontSize: 11, fill: "#57534E", fontFamily: "var(--font-mono)" }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload as DailyLearningActivity;
                      return (
                        <div className="border border-[#E5DEC9] bg-[#FAF8F4] px-3 py-2 text-xs shadow-none">
                          <p className="font-serif font-medium text-[#1C1917] mb-1">
                            {data.label} ({data.day})
                          </p>
                          <p className="font-mono text-[#166534] font-semibold text-[11px]">
                            TOTAL ACTIONS: {data.total}
                          </p>
                          <div className="mt-1 space-y-0.5 font-mono text-[10px] text-[#1C1917]/70">
                            <p>• Notes updated: {data.notes}</p>
                            <p>• Resources added: {data.resources}</p>
                            <p>• Roadmaps updated: {data.roadmaps}</p>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#166534"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#editorialActivityGradient)"
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5DEC9" opacity={0.7} />
                <XAxis
                  dataKey="title"
                  tickLine={false}
                  axisLine={{ stroke: "#E5DEC9" }}
                  tick={{ fontSize: 11, fill: "#57534E", fontFamily: "var(--font-mono)" }}
                  tickFormatter={(val: string) =>
                    val.length > 12 ? `${val.slice(0, 12)}…` : val
                  }
                />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={{ stroke: "#E5DEC9" }}
                  tick={{ fontSize: 11, fill: "#57534E", fontFamily: "var(--font-mono)" }}
                  tickFormatter={(val: number) => `${val}%`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload as RoadmapProgressSummary;
                    return (
                      <div className="border border-[#E5DEC9] bg-[#FAF8F4] px-3 py-2 text-xs shadow-none">
                        <p className="font-serif font-medium text-[#1C1917]">
                          {data.title}
                        </p>
                        <p className="font-mono text-[#D97706] text-[11px] font-semibold mt-1">
                          COMPLETION: {data.progressPercent}%
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="progressPercent"
                  fill="#D97706"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
