"use client";

import { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  Filter,
  X,
  Plus,
} from "lucide-react";

import type { ResourceWithRelations } from "@/lib/resources";
import { RESOURCE_TYPES } from "@/lib/validations/resources";
import { ResourceCard } from "./resource-card";
import { CreateResourceDialog } from "./create-resource-dialog";
import { UploadDocumentDialog } from "./upload-document-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ResourceListProps {
  resources: ResourceWithRelations[];
  availableGoals?: { id: string; title: string }[];
}

export function ResourceList({ resources, availableGoals = [] }: ResourceListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedGoalId, setSelectedGoalId] = useState<string>("ALL");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Extract unique categories from resources
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const r of resources) {
      if (r.category && r.category.trim().length > 0) {
        cats.add(r.category.trim());
      }
    }
    return Array.from(cats).sort();
  }, [resources]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      // Archive filter
      if (showArchived) {
        if (!resource.is_archived) return false;
      } else {
        if (resource.is_archived) return false;
      }

      // Type filter
      if (selectedType !== "ALL" && resource.type !== selectedType) {
        return false;
      }

      // Goal filter
      if (selectedGoalId !== "ALL" && resource.goal_id !== selectedGoalId) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "ALL" && resource.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = resource.title.toLowerCase().includes(q);
        const matchesAuthor = resource.author?.toLowerCase().includes(q) ?? false;
        const matchesDesc = resource.description?.toLowerCase().includes(q) ?? false;
        const matchesCategory = resource.category?.toLowerCase().includes(q) ?? false;

        if (!matchesTitle && !matchesAuthor && !matchesDesc && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [
    resources,
    showArchived,
    selectedType,
    selectedGoalId,
    selectedCategory,
    searchQuery,
  ]);

  const activeFilterCount =
    (selectedType !== "ALL" ? 1 : 0) +
    (selectedGoalId !== "ALL" ? 1 : 0) +
    (selectedCategory !== "ALL" ? 1 : 0) +
    (searchQuery.trim().length > 0 ? 1 : 0) +
    (showArchived ? 1 : 0);

  const clearFilters = () => {
    setSelectedType("ALL");
    setSelectedGoalId("ALL");
    setSelectedCategory("ALL");
    setSearchQuery("");
    setShowArchived(false);
  };

  const totalActiveResources = resources.filter((r) => !r.is_archived).length;
  const totalArchivedResources = resources.filter((r) => r.is_archived).length;

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col gap-4 border border-[#E5DEC9] bg-[#FDFCFA] p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1C1917]/45" />
            <Input
              type="text"
              placeholder="Search by title, author, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs rounded-sm border-[#E5DEC9] bg-[#FAF8F4] shadow-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1C1917]/50 hover:text-[#1C1917]"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Actions & Controls */}
          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            {/* Goal filter dropdown */}
            {availableGoals.length > 0 && (
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="h-9 rounded-sm border border-[#E5DEC9] bg-[#FAF8F4] px-3 py-1 text-xs text-[#1C1917] transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#166534]/40"
                aria-label="Filter by goal"
              >
                <option value="ALL">All goals</option>
                {availableGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            )}

            {/* Archive toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className={
                showArchived
                  ? "h-9 rounded-sm border-[#166534] bg-[#F7EEDB] text-[#166534] font-mono text-[11px] uppercase tracking-wider shadow-none"
                  : "h-9 rounded-sm border-[#E5DEC9] bg-[#FAF8F4] text-[#1C1917]/75 hover:bg-[#F7EEDB] font-mono text-[11px] uppercase tracking-wider shadow-none"
              }
            >
              {showArchived
                ? `Archived (${totalArchivedResources})`
                : `Archive (${totalArchivedResources})`}
            </Button>

            <CreateResourceDialog availableGoals={availableGoals} />
            <UploadDocumentDialog availableGoals={availableGoals} />
          </div>
        </div>

        {/* Type buttons & Category filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E5DEC9] pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedType("ALL")}
              className={`rounded-sm border px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider transition-colors ${
                selectedType === "ALL"
                  ? "border-[#166534] bg-[#166534] text-[#FAF8F4]"
                  : "border-[#E5DEC9] bg-[#FAF8F4] text-[#1C1917]/70 hover:bg-[#F7EEDB] hover:text-[#166534]"
              }`}
            >
              All Types ({showArchived ? totalArchivedResources : totalActiveResources})
            </button>
            {RESOURCE_TYPES.map((type) => {
              const count = resources.filter(
                (r) => r.type === type && (showArchived ? r.is_archived : !r.is_archived)
              ).length;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`rounded-sm border px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider transition-colors ${
                    selectedType === type
                      ? "border-[#166534] bg-[#166534] text-[#FAF8F4]"
                      : "border-[#E5DEC9] bg-[#FAF8F4] text-[#1C1917]/70 hover:bg-[#F7EEDB] hover:text-[#166534]"
                  }`}
                >
                  {type} ({count})
                </button>
              );
            })}
          </div>

          {/* Category Filter if categories exist */}
          {availableCategories.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#1C1917]/55">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-8 rounded-sm border border-[#E5DEC9] bg-[#FAF8F4] px-2 text-xs text-[#1C1917] focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#166534]/40"
              >
                <option value="ALL">All categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Active Filters Clear Bar */}
        {activeFilterCount > 0 && (
          <div className="flex items-center justify-between text-xs font-mono text-[#1C1917]/70 bg-[#F7EEDB] px-3 py-2 rounded-sm border border-[#E5DEC9]">
            <span>
              Showing {filteredResources.length} of{" "}
              {showArchived ? totalArchivedResources : totalActiveResources} {showArchived ? "archived " : ""}resources
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 font-medium text-[#166534] hover:underline"
            >
              <X className="h-3 w-3" />
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              availableGoals={availableGoals}
            />
          ))}
        </div>
      ) : resources.length === 0 ? (
        /* Empty State: No resources at all */
        <div className="rounded-none border border-[#E5DEC9] bg-[#FDFCFA] p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm border border-[#166534]/25 bg-[#F7EEDB] text-[#166534]">
            <BookOpen className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-serif font-normal text-xl text-[#1C1917]">No learning resources yet</h3>
          <p className="mt-1.5 text-xs text-[#1C1917]/65 max-w-md mx-auto leading-relaxed">
            Collect reference books, online video lectures, documentation websites, and course materials to support your university study goals.
          </p>
          <div className="mt-6">
            <CreateResourceDialog
              availableGoals={availableGoals}
              trigger={
                <Button className="gap-2 rounded-sm bg-[#166534] text-[#FAF8F4] hover:bg-[#166534]/90 shadow-none">
                  <Plus className="h-4 w-4" />
                  Add your first resource
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        /* Empty State: No resources matching filter */
        <div className="rounded-none border border-[#E5DEC9] bg-[#FDFCFA] p-10 text-center">
          <Filter className="mx-auto h-8 w-8 text-[#1C1917]/35" />
          <h3 className="mt-3 font-serif font-normal text-xl text-[#1C1917]">No resources match your filters</h3>
          <p className="mt-1 text-xs text-[#1C1917]/65 max-w-sm mx-auto leading-relaxed">
            Try adjusting your search query, selecting a different resource type, or clearing active filters.
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="rounded-sm border-[#E5DEC9] bg-[#FAF8F4] hover:bg-[#F7EEDB]"
            >
              Clear all filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ResourceCardsSkeleton() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      aria-busy="true"
      aria-label="Loading resources"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col justify-between border border-[#E5DEC9] bg-[#FDFCFA] p-6 space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-2.5">
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-[#E5DEC9]/70 animate-pulse rounded-sm" />
                <div className="h-5 w-20 bg-[#E5DEC9]/60 animate-pulse rounded-sm" />
              </div>
              <div className="h-7 w-7 bg-[#E5DEC9]/60 animate-pulse rounded-sm" />
            </div>
            <div className="h-6 w-3/4 bg-[#E5DEC9]/70 animate-pulse rounded-none" />
            <div className="h-3.5 w-1/3 bg-[#E5DEC9]/60 animate-pulse rounded-none" />
            <div className="space-y-1.5 pt-1">
              <div className="h-3.5 w-full bg-[#E5DEC9]/60 animate-pulse rounded-none" />
              <div className="h-3.5 w-4/5 bg-[#E5DEC9]/60 animate-pulse rounded-none" />
            </div>
          </div>
          <div className="pt-3 border-t border-[#E5DEC9] flex justify-between items-center">
            <div className="h-4 w-24 bg-[#E5DEC9]/60 animate-pulse rounded-none" />
            <div className="h-4 w-16 bg-[#E5DEC9]/60 animate-pulse rounded-none" />
          </div>
        </div>
      ))}
    </div>
  );
}


