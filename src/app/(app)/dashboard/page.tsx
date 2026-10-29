import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Target, BookOpen, FileText } from "lucide-react";

import { requireUser } from "@/lib/auth/session";
import {
  getDashboardMetrics,
  getDashboardChartData,
  getDashboardRecentActivities,
} from "@/lib/dashboard";
import { Button } from "@/components/ui/button";
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";
import { LearningProgressChart } from "@/components/dashboard/learning-progress-chart";
import { RecentActivityList } from "@/components/dashboard/recent-activity-list";
import {
  DashboardMetricsSkeleton,
  DashboardChartSkeleton,
  DashboardActivitySkeleton,
} from "@/components/dashboard/dashboard-skeleton";
import { getPersonalizedRecommendations } from "@/lib/recommendations";
import {
  DashboardRecommendationsWidget,
  DashboardRecommendationsWidgetSkeleton,
} from "@/components/recommendations/dashboard-recommendations-widget";
import { EditorialPageHeader } from "@/components/layout/editorial-page-header";

export const metadata: Metadata = {
  title: "Dashboard · ChiroMemo",
  description:
    "Personal learning progress, roadmap milestones, and recent study activities.",
};

async function DashboardMetricsSection() {
  const metrics = await getDashboardMetrics();
  return <DashboardMetrics metrics={metrics} />;
}

async function DashboardRecommendationsSection() {
  const recommendations = await getPersonalizedRecommendations();
  return <DashboardRecommendationsWidget data={recommendations} />;
}

async function DashboardChartSection() {
  const { dailyActivity, roadmaps } = await getDashboardChartData();
  return (
    <LearningProgressChart
      dailyActivity={dailyActivity}
      roadmaps={roadmaps}
    />
  );
}

async function DashboardActivitySection() {
  const activities = await getDashboardRecentActivities();
  return <RecentActivityList activities={activities} />;
}

export default async function DashboardPage() {
  const user = await requireUser();
  const displayName = user.name || user.email?.split("@")[0] || "Student";

  return (
    <div className="space-y-6">
      {/* Editorial Page Header with Vignette Illustration */}
      <EditorialPageHeader
        chapter="CHAPTER 00 // MISSION CONTROL"
        title="Welcome back,"
        italicWord={`${displayName}.`}
        description="Track active semester objectives, observe roadmap completion velocity, and synthesize study notes in one focused room."
        illustrationSrc="/illustrations/dashboard-progress.jpg"
        figureCaption="FIG. 0.2 — STUDY MOMENTUM"
        aspectRatio="landscape"
        action={
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button asChild variant="outline" size="sm" className="h-8 rounded-sm text-xs bg-card">
              <Link href="/goals">
                <Target className="mr-1.5 h-3.5 w-3.5 text-primary" />
                Goals
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-8 rounded-sm text-xs bg-card">
              <Link href="/resources">
                <BookOpen className="mr-1.5 h-3.5 w-3.5 text-primary" />
                Resources
              </Link>
            </Button>
            <Button asChild size="sm" className="h-8 rounded-sm text-xs bg-primary text-primary-foreground shadow-none">
              <Link href="/notes">
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                New Note
              </Link>
            </Button>
          </div>
        }
      />

      {/* 1. Summary Cards: Independent Granular Suspense Boundary */}
      <Suspense fallback={<DashboardMetricsSkeleton />}>
        <DashboardMetricsSection />
      </Suspense>

      {/* 2. AI Personalized Study Recommendations: Independent Granular Suspense Boundary */}
      <Suspense fallback={<DashboardRecommendationsWidgetSkeleton />}>
        <DashboardRecommendationsSection />
      </Suspense>

      {/* 3. Main Analytics & Activity Grid: Independent Granular Suspense Boundaries */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Recharts Learning Progress Chart */}
        <div className="lg:col-span-7">
          <Suspense fallback={<DashboardChartSkeleton />}>
            <DashboardChartSection />
          </Suspense>
        </div>

        {/* Right: Recent Activity Feed */}
        <div className="lg:col-span-5">
          <Suspense fallback={<DashboardActivitySkeleton />}>
            <DashboardActivitySection />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
