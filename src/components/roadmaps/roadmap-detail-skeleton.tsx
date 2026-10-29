"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function RoadmapDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading roadmap details">
      <div>
        <Link
          href="/roadmaps"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#1C1917]/65 hover:text-[#166534] transition-colors"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          <span>Back to roadmaps</span>
        </Link>
      </div>

      {/* Editorial Header Skeleton */}
      <div className="border border-[#E5DEC9] bg-[#F7EEDB] p-6 space-y-2.5">
        <Skeleton className="h-3.5 w-36 rounded-none bg-[#E5DEC9]/80" />
        <Skeleton className="h-8 w-72 max-w-full rounded-none bg-[#E5DEC9]/80" />
        <Skeleton className="h-4 w-48 rounded-none bg-[#E5DEC9]/70" />
      </div>

      {/* 4-Column Hairline Ledger Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#E5DEC9] bg-[#FDFCFA] divide-y sm:divide-y-0 sm:divide-x divide-[#E5DEC9]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 space-y-3">
            <Skeleton className="h-3 w-24 rounded-none bg-[#E5DEC9]/70" />
            <Skeleton className="h-7 w-28 rounded-sm bg-[#E5DEC9]/80" />
          </div>
        ))}
      </div>

      {/* Steps Panel Skeleton */}
      <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
        <div className="px-6 py-4 border-b border-[#E5DEC9] bg-[#F7EEDB] flex items-center justify-between">
          <Skeleton className="h-5 w-36 rounded-none bg-[#E5DEC9]/80" />
          <Skeleton className="h-8 w-28 rounded-sm bg-[#E5DEC9]/80" />
        </div>
        <div className="p-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]" />
          ))}
        </div>
      </div>

      {/* Actions Panel Skeleton */}
      <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
        <div className="px-6 py-4 border-b border-[#E5DEC9] bg-[#F7EEDB]">
          <Skeleton className="h-5 w-32 rounded-none bg-[#E5DEC9]/80" />
        </div>
        <div className="p-6 flex flex-wrap gap-3">
          <Skeleton className="h-9 w-28 rounded-sm bg-[#E5DEC9]/70" />
          <Skeleton className="h-9 w-32 rounded-sm bg-[#E5DEC9]/70" />
        </div>
      </div>
    </div>
  );
}
