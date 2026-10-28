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
      {/* Header toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">AI Summaries</h1>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {summaries.length}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Generate and review concise academic summaries of your study documents with Gemini AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GenerateSummaryDialog resources={summarizableResources} />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3">
        <form className="relative flex-1 max-w-sm" method="GET">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={search ?? ""}
            placeholder="Search summaries by topic, keyword, or key points..."
            className="pl-9 h-9 text-sm"
          />
        </form>
      </div>

      {/* Grid or Empty State */}
      {summaries.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center space-y-4 bg-muted/10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-semibold">
              {search ? "No matching summaries found" : "No AI summaries generated yet"}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {search
                ? `No summaries matched "${search}". Try searching for a different keyword or reset filters.`
                : "Upload lecture slides, research papers, or syllabus documents to automatically distill them into key points, executive overviews, and study takeaways."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {search ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/summaries">Clear search</Link>
              </Button>
            ) : (
              <>
                <GenerateSummaryDialog
                  resources={summarizableResources}
                  trigger={
                    <Button className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      Generate First Summary
                    </Button>
                  }
                />
                <Button asChild variant="outline" className="gap-2">
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
