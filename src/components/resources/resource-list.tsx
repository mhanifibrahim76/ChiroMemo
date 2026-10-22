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
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title, author, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Actions & Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Goal filter dropdown */}
            {availableGoals.length > 0 && (
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
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
              variant={showArchived ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className="text-xs"
            >
              {showArchived
                ? `Archived (${totalArchivedResources})`
                : `Archive (${totalArchivedResources})`}
            </Button>

            <CreateResourceDialog availableGoals={availableGoals} />
            <UploadDocumentDialog availableGoals={availableGoals} />
          </div>
        </div>

        {/* Type pills & Category filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedType("ALL")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedType === "ALL"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              All Types
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
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedType === type
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {type.charAt(0) + type.slice(1).toLowerCase()} ({count})
                </button>
              );
            })}
          </div>

          {/* Category Filter if categories exist */}
          {availableCategories.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-8 rounded-md border border-input bg-transparent px-2 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
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
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
            <span>
              Showing {filteredResources.length} of{" "}
              {showArchived ? totalArchivedResources : totalActiveResources} {showArchived ? "archived " : ""}resources
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
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
        <div className="rounded-lg border border-dashed p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-medium">No learning resources yet</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
            Collect reference books, online video lectures, documentation websites, and course materials to support your university study goals.
          </p>
          <div className="mt-6">
            <CreateResourceDialog
              availableGoals={availableGoals}
              trigger={
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add your first resource
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        /* Empty State: No resources matching filter */
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Filter className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <h3 className="mt-3 text-base font-medium">No resources match your filters</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search query, selecting a different resource type, or clearing active filters.
          </p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={clearFilters}>
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
          className="flex flex-col justify-between rounded-lg border bg-card p-5 space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                <div className="h-5 w-20 bg-muted animate-pulse rounded-md" />
              </div>
              <div className="h-8 w-8 bg-muted animate-pulse rounded-md" />
            </div>
            <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-3 w-1/3 bg-muted animate-pulse rounded" />
            <div className="space-y-1 pt-1">
              <div className="h-3 w-full bg-muted animate-pulse rounded" />
              <div className="h-3 w-4/5 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="pt-3 border-t flex justify-between items-center">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

