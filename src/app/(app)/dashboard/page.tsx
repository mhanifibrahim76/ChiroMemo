import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Target, BookOpen, FileText } from "lucide-react";

import { requireUser } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/dashboard";
import { Button } from "@/components/ui/button";
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";
import { LearningProgressChart } from "@/components/dashboard/learning-progress-chart";
import { RecentActivityList } from "@/components/dashboard/recent-activity-list";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export const metadata: Metadata = {
  title: "Dashboard · ChiroMemo",
  description:
    "Personal learning progress, roadmap milestones, and recent study activities.",
};

async function DashboardContent() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      {/* 1. Summary Cards */}
      <DashboardMetrics metrics={data.metrics} />

      {/* 2. Main Analytics & Activity Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Recharts Learning Progress Chart */}
        <div className="lg:col-span-7">
          <LearningProgressChart
            dailyActivity={data.dailyActivity}
            roadmaps={data.roadmaps}
          />
        </div>

        {/* Right: Recent Activity Feed */}
        <div className="lg:col-span-5">
          <RecentActivityList activities={data.recentActivities} />
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();

  const displayName = user.name || user.email?.split("@")[0] || "Student";

  return (
    <div className="space-y-6">
      {/* Header with Greeting & Quick Action CTAs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your academic objectives, roadmaps, and personal knowledge base.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/goals">
              <Target className="mr-1.5 h-3.5 w-3.5" />
              Goals
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/resources">
              <BookOpen className="mr-1.5 h-3.5 w-3.5" />
              Resources
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/notes">
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              New Note
            </Link>
          </Button>
        </div>
      </div>

      {/* Async Dashboard Data Boundary */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
