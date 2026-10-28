import Link from "next/link";
import { ArrowLeft, Sparkles, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SummariesListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Static Header renders instantly */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">AI Summaries</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Generate and review concise academic summaries of your study documents with Gemini AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      {/* Dynamic Summary Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="flex flex-col justify-between">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function SummaryDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Static Back Button renders instantly */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-1 h-7 px-2 -ml-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Link href="/summaries">
                <ArrowLeft className="h-3.5 w-3.5" />
                All Summaries
              </Link>
            </Button>
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-44" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left: Original Document text panel */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="h-full">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Original Document
              </CardTitle>
              <CardDescription className="text-xs">
                Source document
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {Array.from({ length: 14 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: AI Summary panel */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Academic Summary
              </CardTitle>
              <CardDescription className="text-xs">
                Structured analysis and high-yield notes.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
