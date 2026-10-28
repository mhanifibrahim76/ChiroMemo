import type { Metadata } from "next";
import { Suspense } from "react";
import { Sparkles, SearchX } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { searchKnowledgeBase } from "@/lib/search";
import { searchEntityTypeSchema, type SearchEntityType } from "@/lib/validations/search";
import { SearchBar } from "@/components/search/search-bar";
import { SearchFilters } from "@/components/search/search-filters";
import { AiSynthesisCard } from "@/components/search/ai-synthesis-card";
import { SearchResultCard } from "@/components/search/search-result-card";
import { SearchPageSkeleton } from "@/components/search/search-skeleton";

export const metadata: Metadata = {
  title: "Intelligent Search · ChiroMemo",
  description:
    "Semantic and natural-language search across notes, PDFs, roadmaps, and summaries.",
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
}

async function SearchResultsContent({
  query,
  type,
}: {
  query: string;
  type: SearchEntityType;
}) {
  const result = await searchKnowledgeBase(query, type);

  return (
    <div className="space-y-6">
      {/* AI Semantic Synthesis Card (if synthesized) */}
      {result.synthesis && (
        <AiSynthesisCard
          synthesis={result.synthesis}
          modelUsed={result.modelUsed}
        />
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {query ? (
            <>
              Matches for <span className="text-foreground font-bold">&ldquo;{query}&rdquo;</span> ({result.totalMatches})
            </>
          ) : (
            <>Recently Updated Knowledge Items ({result.totalMatches})</>
          )}
        </h2>
      </div>

      {/* Results List or Empty State */}
      {result.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
            <SearchX className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold">No matching materials found</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            We couldn&apos;t find any notes, resources, or summaries matching &ldquo;{query}&rdquo;. Try checking for typos or searching a broader topic.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {result.items.map((item) => (
            <SearchResultCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  await requireUser();
  const { q = "", type = "ALL" } = await searchParams;

  const parsedType = searchEntityTypeSchema.safeParse(type).success
    ? (type as SearchEntityType)
    : "ALL";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Intelligent Search</h1>
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3 w-3" />
            AI-Powered
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Natural-language semantic search across personal study notes, documents, AI summaries, and goals.
        </p>
      </div>

      {/* Search Input Bar */}
      <SearchBar />

      {/* Entity Filter Pills */}
      <SearchFilters activeType={parsedType} />

      {/* Async Search Execution Boundary */}
      <Suspense key={`${q}-${parsedType}`} fallback={<SearchPageSkeleton />}>
        <SearchResultsContent query={q} type={parsedType} />
      </Suspense>
    </div>
  );
}

