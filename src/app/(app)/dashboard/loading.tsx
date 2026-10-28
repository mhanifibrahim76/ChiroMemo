import Link from "next/link";
import { Target, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Static Header renders instantly */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard
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

      {/* Dynamic Data Regions Skeleton */}
      <DashboardSkeleton />
    </div>
  );
}
