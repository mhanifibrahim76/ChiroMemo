"use client";

import { useMemo } from "react";
import { Plus, Search, X, FileText, BookOpen } from "lucide-react";

import type { NoteWithRelations } from "@/lib/notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface NoteListPaneProps {
  notes: NoteWithRelations[];
  selectedNoteId: string | null;
  onSelectNote: (id: string | null) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTag: string | null;
  onTagChange: (tag: string | null) => void;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (diffDays === 1) {
      return "Yesterday";
    }
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

/** Strips markdown syntax for clean list preview excerpt */
function stripMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/^#+\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\s*>\s+/gm, "")
    .replace(/\n+/g, " ")
    .trim();
}

export function NoteListPane({
  notes,
  selectedNoteId,
  onSelectNote,
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagChange,
}: NoteListPaneProps) {
  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    for (const note of notes) {
      for (const t of note.tags ?? []) {
        if (t.trim().length > 0) {
          tagsSet.add(t.trim());
        }
      }
    }
    return Array.from(tagsSet).sort();
  }, [notes]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // Tag filter
      if (selectedTag) {
        const hasTag = note.tags?.some(
          (t) => t.toLowerCase() === selectedTag.toLowerCase()
        );
        if (!hasTag) return false;
      }

      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = note.title.toLowerCase().includes(q);
        const matchesContent = note.content.toLowerCase().includes(q);
        const matchesResource = note.resource?.title.toLowerCase().includes(q) ?? false;
        const matchesTags = note.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;

        if (!matchesTitle && !matchesContent && !matchesResource && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [notes, selectedTag, searchQuery]);

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card text-card-foreground shadow-xs">
      {/* Header and New Note action */}
      <div className="flex items-center justify-between border-b p-3 bg-muted/20">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-tight">Personal Notes</h2>
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            {notes.length}
          </Badge>
        </div>

        <Button
          size="sm"
          onClick={() => onSelectNote(null)}
          className={`h-8 gap-1 text-xs ${
            selectedNoteId === null ? "bg-primary text-primary-foreground" : ""
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          New note
        </Button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search notes, tags, resources..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pl-8 pr-7 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Tag filter pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 max-h-16 overflow-y-auto pt-1">
            <button
              type="button"
              onClick={() => onTagChange(null)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                selectedTag === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagChange(selectedTag === tag ? null : tag)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  selectedTag === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto divide-y">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => {
            const isSelected = selectedNoteId === note.id;
            const snippet = stripMarkdown(note.content);

            return (
              <button
                key={note.id}
                type="button"
                onClick={() => onSelectNote(note.id)}
                className={`flex w-full flex-col items-start gap-1 p-3 text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 border-l-4 border-l-primary"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <h3 className="font-semibold text-xs leading-snug line-clamp-1 text-foreground">
                    {note.title || "Untitled note"}
                  </h3>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatDate(note.updated_at)}
                  </span>
                </div>

                {snippet && (
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {snippet}
                  </p>
                )}

                {/* Badges: linked resource and tags */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {note.resource && (
                    <span
                      className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.2 text-[10px] font-medium text-secondary-foreground truncate max-w-[160px]"
                      title={`Linked to: ${note.resource.title}`}
                    >
                      <BookOpen className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{note.resource.title}</span>
                    </span>
                  )}

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      {note.tags.slice(0, 2).map((t, i) => (
                        <span key={i} className="text-[10px] text-muted-foreground">
                          #{t}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{note.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })
        ) : notes.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <h4 className="mt-2 text-xs font-medium text-foreground">No notes yet</h4>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Write study thoughts, chapter summaries, or lecture notes.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSelectNote(null)}
              className="mt-3 text-xs h-7 gap-1"
            >
              <Plus className="h-3 w-3" />
              Write note
            </Button>
          </div>
        ) : (
          <div className="p-6 text-center">
            <Search className="mx-auto h-6 w-6 text-muted-foreground/40" />
            <p className="mt-2 text-xs text-muted-foreground">No matching notes found</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onSearchChange("");
                onTagChange(null);
              }}
              className="mt-2 text-xs h-7 text-primary"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
