"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const initialQuery = searchParams.get("q") ?? "";
  const currentType = searchParams.get("type") ?? "ALL";
  const [query, setQuery] = useState(initialQuery);
  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);

  if (prevInitialQuery !== initialQuery) {
    setPrevInitialQuery(initialQuery);
    setQuery(initialQuery);
  }

  const handleSearch = (targetQuery: string) => {
    const trimmed = targetQuery.trim();
    startTransition(() => {
      const params = new URLSearchParams();
      if (trimmed) params.set("q", trimmed);
      if (currentType && currentType !== "ALL") params.set("type", currentType);

      router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(query);
    }
  };

  const handleClear = () => {
    setQuery("");
    startTransition(() => {
      const params = new URLSearchParams();
      if (currentType && currentType !== "ALL") params.set("type", currentType);
      router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
    });
  };

  return (
    <div className="relative flex w-full items-center gap-2 border border-[#E5DEC9] bg-[#FDFCFA] p-2">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1C1917]/45 pointer-events-none" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a natural-language question or search notes, PDFs, goals, summaries..."
          className="pl-10 pr-10 h-10 text-sm rounded-sm border-[#E5DEC9] bg-[#FAF8F4] text-[#1C1917] placeholder:text-[#1C1917]/45 shadow-none focus-visible:ring-[#166534]/30"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-1 text-[#1C1917]/50 hover:text-[#1C1917] hover:bg-[#F7EEDB] transition-colors"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <Button
        onClick={() => handleSearch(query)}
        disabled={isPending}
        className="h-10 px-5 rounded-sm bg-[#166534] text-[#FAF8F4] hover:bg-[#166534]/90 font-medium text-xs shrink-0 shadow-none"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            Searching
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-3.5 w-3.5 text-[#FAF8F4]/90" />
            AI Search
          </>
        )}
      </Button>
    </div>
  );
}

