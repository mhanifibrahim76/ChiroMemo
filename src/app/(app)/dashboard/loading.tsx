import Link from "next/link";
import { Target, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { EditorialPageHeader } from "@/components/layout/editorial-page-header";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Editorial Page Header renders instantly and matches loaded page */}
      <EditorialPageHeader
        chapter="CHAPTER 00 // MISSION CONTROL"
        title="Welcome back,"
        italicWord="Scholar."
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

      {/* Dynamic Data Regions Skeleton */}
      <DashboardSkeleton />
    </div>
  );
}

