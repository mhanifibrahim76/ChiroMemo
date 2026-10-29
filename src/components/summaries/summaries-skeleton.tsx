import Link from "next/link";
import { ArrowLeft, Sparkles, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EditorialPageHeader } from "@/components/layout/editorial-page-header";

export function SummariesListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Editorial Page Header renders instantly and matches loaded page */}
      <EditorialPageHeader
        chapter="CHAPTER 02.3 // AI COMPREHENSION"
        title="Document Exam"
        italicWord="Summaries."
        description="Distill dense university readings into exam-focused overviews, high-yield conceptual points, and actionable study takeaways using Gemini AI."
        illustrationSrc="/illustrations/notes-resources-journal.jpg"
        figureCaption="FIG. 2.3 — DISTILLED READING"
        action={<Skeleton className="h-9 w-36 rounded-sm bg-[#E5DEC9]/80" />}
      />

      {/* Search bar skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-full max-w-sm rounded-sm bg-[#FDFCFA] border border-[#E5DEC9]" />
      </div>

      {/* Dynamic Summary Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between border border-[#E5DEC9] bg-[#FDFCFA] p-6 gap-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-2.5">
                <Skeleton className="h-5 w-28 rounded-sm bg-[#E5DEC9]/70" />
                <Skeleton className="h-6 w-6 rounded-sm bg-[#E5DEC9]/60" />
              </div>
              <Skeleton className="h-6 w-3/4 rounded-none bg-[#E5DEC9]/70" />
              <Skeleton className="h-3.5 w-28 rounded-none bg-[#E5DEC9]/60" />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Skeleton className="h-5 w-20 rounded-sm bg-[#E5DEC9]/60" />
                <Skeleton className="h-5 w-24 rounded-sm bg-[#E5DEC9]/60" />
                <Skeleton className="h-5 w-16 rounded-sm bg-[#E5DEC9]/60" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#E5DEC9]">
              <Skeleton className="h-4 w-24 rounded-none bg-[#E5DEC9]/60" />
              <Skeleton className="h-8 w-28 rounded-sm bg-[#E5DEC9]/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SummaryDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Editorial Top Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border border-[#E5DEC9] bg-[#F7EEDB] p-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-1 h-7 px-2 -ml-2 text-xs font-mono uppercase tracking-wider text-[#1C1917]/65 hover:text-[#166534] rounded-sm"
            >
              <Link href="/summaries">
                <ArrowLeft className="h-3.5 w-3.5" />
                All Summaries
              </Link>
            </Button>
            <Skeleton className="h-5 w-28 rounded-sm bg-[#E5DEC9]/80" />
          </div>
          <Skeleton className="h-8 w-72 rounded-none bg-[#E5DEC9]/80" />
          <Skeleton className="h-4 w-44 rounded-none bg-[#E5DEC9]/70" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-sm bg-[#E5DEC9]/80" />
          <Skeleton className="h-8 w-20 rounded-sm bg-[#E5DEC9]/80" />
          <Skeleton className="h-8 w-20 rounded-sm bg-[#E5DEC9]/80" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left: Original Document text panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
            <div className="px-5 py-3.5 border-b border-[#E5DEC9] bg-[#F7EEDB]">
              <h2 className="font-serif font-normal text-lg flex items-center gap-2 text-[#1C1917]">
                <FileText className="h-4 w-4 text-[#1C1917]/60" />
                Original Document
              </h2>
              <p className="text-[11px] font-mono text-[#1C1917]/55">
                Source document
              </p>
            </div>
            <div className="p-5 space-y-2.5">
              {Array.from({ length: 14 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full rounded-none bg-[#E5DEC9]/60" />
              ))}
            </div>
          </div>
        </div>

        {/* Right: AI Summary panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
            <div className="px-6 py-4 border-b border-[#E5DEC9] bg-[#F7EEDB]">
              <h2 className="font-serif font-normal text-lg flex items-center gap-2 text-[#1C1917]">
                <Sparkles className="h-4 w-4 text-[#166534]" />
                AI Academic Summary
              </h2>
              <p className="text-[11px] font-mono text-[#1C1917]/60">
                Structured analysis and high-yield notes.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <Skeleton className="h-20 w-full rounded-sm bg-[#E5DEC9]/60" />
              <Skeleton className="h-32 w-full rounded-sm bg-[#E5DEC9]/60" />
              <Skeleton className="h-40 w-full rounded-sm bg-[#E5DEC9]/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

