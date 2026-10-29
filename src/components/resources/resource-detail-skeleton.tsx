import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ResourceDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading resource details">
      {/* Back button renders instantly */}
      <div>
        <Link
          href="/resources"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#1C1917]/65 hover:text-[#166534] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to resources
        </Link>
      </div>

      {/* Editorial Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border border-[#E5DEC9] bg-[#F7EEDB] p-6">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-sm bg-[#E5DEC9]/80" />
            <Skeleton className="h-5 w-24 rounded-sm bg-[#E5DEC9]/80" />
          </div>
          <Skeleton className="h-8 w-80 max-w-full rounded-none bg-[#E5DEC9]/80" />
          <Skeleton className="h-4 w-40 rounded-none bg-[#E5DEC9]/70" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-sm bg-[#E5DEC9]/80" />
          <Skeleton className="h-8 w-20 rounded-sm bg-[#E5DEC9]/80" />
          <Skeleton className="h-8 w-20 rounded-sm bg-[#E5DEC9]/80" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
            <div className="px-6 py-3.5 border-b border-[#E5DEC9] bg-[#F7EEDB]">
              <Skeleton className="h-5 w-32 rounded-none bg-[#E5DEC9]/80" />
            </div>
            <div className="p-6">
              <Skeleton className="h-14 w-full rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]" />
            </div>
          </div>

          <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
            <div className="px-6 py-3.5 border-b border-[#E5DEC9] bg-[#F7EEDB] space-y-1.5">
              <Skeleton className="h-5 w-40 rounded-none bg-[#E5DEC9]/80" />
              <Skeleton className="h-3.5 w-60 rounded-none bg-[#E5DEC9]/70" />
            </div>
            <div className="p-6 space-y-2.5">
              <Skeleton className="h-4 w-full rounded-none bg-[#E5DEC9]/60" />
              <Skeleton className="h-4 w-5/6 rounded-none bg-[#E5DEC9]/60" />
              <Skeleton className="h-4 w-2/3 rounded-none bg-[#E5DEC9]/60" />
            </div>
          </div>

          <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
            <div className="px-6 py-3.5 border-b border-[#E5DEC9] bg-[#F7EEDB] flex justify-between items-center">
              <Skeleton className="h-5 w-48 rounded-none bg-[#E5DEC9]/80" />
              <Skeleton className="h-5 w-16 rounded-sm bg-[#E5DEC9]/80" />
            </div>
            <div className="p-6 space-y-3">
              <Skeleton className="h-14 w-full rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]" />
              <Skeleton className="h-14 w-full rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
            <div className="px-6 py-3.5 border-b border-[#E5DEC9] bg-[#F7EEDB] space-y-1.5">
              <Skeleton className="h-5 w-32 rounded-none bg-[#E5DEC9]/80" />
              <Skeleton className="h-3.5 w-48 rounded-none bg-[#E5DEC9]/70" />
            </div>
            <div className="p-6">
              <Skeleton className="h-20 w-full rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]" />
            </div>
          </div>

          <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
            <div className="px-6 py-3.5 border-b border-[#E5DEC9] bg-[#F7EEDB]">
              <Skeleton className="h-5 w-36 rounded-none bg-[#E5DEC9]/80" />
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 rounded-none bg-[#E5DEC9]/60" />
                <Skeleton className="h-4 w-24 rounded-none bg-[#E5DEC9]/60" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded-none bg-[#E5DEC9]/60" />
                <Skeleton className="h-4 w-32 rounded-none bg-[#E5DEC9]/60" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16 rounded-none bg-[#E5DEC9]/60" />
                <Skeleton className="h-4 w-16 rounded-sm bg-[#E5DEC9]/70" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


