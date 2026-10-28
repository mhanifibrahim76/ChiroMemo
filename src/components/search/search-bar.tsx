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
    <div className="relative flex w-full items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a natural-language question or search notes, PDFs, goals, summaries..."
          className="pl-10 pr-10 h-11 text-base shadow-xs"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Button
        onClick={() => handleSearch(query)}
        disabled={isPending}
        className="h-11 px-5 font-medium shrink-0"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Searching
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4 text-primary-foreground/90" />
            AI Search
          </>
        )}
      </Button>
    </div>
  );
}

