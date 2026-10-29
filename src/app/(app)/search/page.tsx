import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { searchKnowledgeBase } from "@/lib/search";
import { searchEntityTypeSchema, type SearchEntityType } from "@/lib/validations/search";
import { SearchBar } from "@/components/search/search-bar";
import { SearchFilters } from "@/components/search/search-filters";
import { AiSynthesisCard } from "@/components/search/ai-synthesis-card";
import { SearchResultCard } from "@/components/search/search-result-card";
import { SearchPageSkeleton } from "@/components/search/search-skeleton";
import { EditorialPageHeader } from "@/components/layout/editorial-page-header";

export const metadata: Metadata = {
  title: "Intelligent search · ChiroMemo",
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
      <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-2">
        <h2 className="text-xs font-mono font-medium text-[#1C1917]/70 uppercase tracking-wider">
          {query ? (
            <>
              Matches for <span className="text-[#1C1917] font-bold">&ldquo;{query}&rdquo;</span> ({result.totalMatches})
            </>
          ) : (
            <>Recently Updated Knowledge Items ({result.totalMatches})</>
          )}
        </h2>
      </div>

      {/* Results List or Empty State */}
      {result.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-none border border-[#E5DEC9] p-12 text-center bg-[#FDFCFA]">
          <div className="flex h-11 w-11 items-center justify-center rounded-sm border border-[#E5DEC9] bg-[#F7EEDB] text-[#1C1917]/60 mb-4">
            <SearchX className="h-5 w-5" />
          </div>
          <h3 className="font-serif font-normal text-xl text-[#1C1917]">No matching materials found</h3>
          <p className="mt-1.5 text-xs text-[#1C1917]/65 max-w-sm leading-relaxed">
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
      {/* Editorial Page Header */}
      <EditorialPageHeader
        chapter="CHAPTER 03.1 // RETRIEVAL & CONSTELLATION"
        title="Intelligent Semantic"
        italicWord="Search."
        description="Query your entire semester knowledge base in natural language. Gemini synthesizes answers directly from your study notes, goals, and PDF summaries."
        illustrationSrc="/illustrations/ai-search-discovery.jpg"
        figureCaption="FIG. 3.1 — KNOWLEDGE DISCOVERY"
      />

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
