import { Suspense } from "react";
import Link from "next/link";
import { Sparkles, Search, BookOpen } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listSummaries } from "@/lib/summaries";
import { listResources } from "@/lib/resources";
import { SummaryCard } from "@/components/summaries/summary-card";
import {
  GenerateSummaryDialog,
  type SummarizableResourceItem,
} from "@/components/summaries/generate-summary-dialog";
import { SummariesListSkeleton } from "@/components/summaries/summaries-skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EditorialPageHeader } from "@/components/layout/editorial-page-header";

interface SummariesPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

async function SummariesContent({ search }: { search?: string }) {
  const [summaries, resources] = await Promise.all([
    listSummaries({ search }),
    listResources({ isArchived: false }),
  ]);

  const summarizableResources: SummarizableResourceItem[] = resources.map((r) => ({
    id: r.id,
    title: r.title,
    type: r.type,
    hasExtractedText: Boolean(
      (r.extracted_text && r.extracted_text.trim().length > 0) ||
        (r.description && r.description.trim().length > 0)
    ),
    textLength: r.extracted_text ? r.extracted_text.length : (r.description?.length ?? 0),
  }));

  return (
    <div className="space-y-6">
      {/* Editorial Page Header */}
      <EditorialPageHeader
        chapter="CHAPTER 02.3 // AI COMPREHENSION"
        title="Document Exam"
        italicWord="Summaries."
        description="Distill dense university readings into exam-focused overviews, high-yield conceptual points, and actionable study takeaways using Gemini AI."
        illustrationSrc="/illustrations/notes-resources-journal.jpg"
        figureCaption="FIG. 2.3 — DISTILLED READING"
        action={<GenerateSummaryDialog resources={summarizableResources} />}
      />

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3">
        <form className="relative flex-1 max-w-sm" method="GET">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={search ?? ""}
            placeholder="Search summaries by topic or keyword..."
            className="pl-9 h-9 text-sm rounded-sm bg-card border-[#E5DEC9]"
          />
        </form>
      </div>

      {/* Grid or Empty State */}
      {summaries.length === 0 ? (
        <div className="rounded-none border border-[#E5DEC9] p-12 text-center space-y-4 bg-[#FDFCFA]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm border border-[#166534]/25 bg-[#F7EEDB] text-[#166534]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-serif font-normal text-xl text-[#1C1917]">
              {search ? "No matching summaries found" : "No AI summaries generated yet"}
            </h3>
            <p className="text-xs text-[#1C1917]/65 leading-relaxed">
              {search
                ? `No summaries matched "${search}". Try searching for a different keyword or reset filters.`
                : "Upload lecture slides, research papers, or syllabus documents to automatically distill them into key points, executive overviews, and study takeaways."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {search ? (
              <Button asChild variant="outline" size="sm" className="rounded-sm border-[#E5DEC9] bg-[#FAF8F4]">
                <Link href="/summaries">Clear search</Link>
              </Button>
            ) : (
              <>
                <GenerateSummaryDialog
                  resources={summarizableResources}
                  trigger={
                    <Button className="rounded-sm bg-[#166534] text-[#FAF8F4] hover:bg-[#166534]/90 gap-2 shadow-none">
                      <Sparkles className="h-4 w-4" />
                      Generate First Summary
                    </Button>
                  }
                />
                <Button asChild variant="outline" className="rounded-sm border-[#E5DEC9] bg-[#FAF8F4] hover:bg-[#F7EEDB] gap-2 shadow-none">
                  <Link href="/resources">
                    <BookOpen className="h-4 w-4" />
                    Browse Resources
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map((summary) => (
            <SummaryCard key={summary.id} summary={summary} />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function SummariesPage({ searchParams }: SummariesPageProps) {
  await requireUser();
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense fallback={<SummariesListSkeleton />}>
      <SummariesContent search={resolvedSearchParams.search} />
    </Suspense>
  );
}
