"use client";

import { useState, useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  Save,
  Trash2,
  BookOpen,
  Tag,
  PenLine,
  Eye,
  Calendar,
  ExternalLink,
} from "lucide-react";

import type { NoteWithRelations } from "@/lib/notes";
import { createNoteAction, updateNoteAction, deleteNoteAction } from "@/lib/notes/actions";
import { initialNoteActionState } from "@/lib/notes/constants";
import { MarkdownPreview } from "./markdown-preview";
import { ResourceTypeBadge } from "@/components/resources/resource-type-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NoteResourceOption {
  id: string;
  title: string;
  type: "PDF" | "VIDEO" | "WEBSITE" | "BOOK" | "COURSE";
}

interface NoteEditorPaneProps {
  note: NoteWithRelations | null;
  resources: NoteResourceOption[];
  onNoteSaved: (noteId: string) => void;
  onNoteDeleted: () => void;
}

function SaveSubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="sm" className="gap-1.5">
      <Save className="h-4 w-4" />
      {pending ? "Saving…" : isNew ? "Create note" : "Save changes"}
    </Button>
  );
}

function DeleteSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? "Deleting…" : "Delete note"}
    </Button>
  );
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function NoteEditorPane({
  note,
  resources,
  onNoteSaved,
  onNoteDeleted,
}: NoteEditorPaneProps) {
  const isNew = note === null;

  // Local form state for live markdown preview
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [tagsInput, setTagsInput] = useState(note?.tags?.join(", ") ?? "");
  const [resourceId, setResourceId] = useState(note?.resource_id ?? "");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [createState, createAction] = useActionState(createNoteAction, initialNoteActionState);
  const [updateState, updateAction] = useActionState(updateNoteAction, initialNoteActionState);
  const [deleteState, deleteAction] = useActionState(deleteNoteAction, initialNoteActionState);

  const activeState = isNew ? createState : updateState;

  // Notify parent on success
  useEffect(() => {
    if (createState.noteId && !createState.error) {
      onNoteSaved(createState.noteId);
    }
  }, [createState, onNoteSaved]);

  useEffect(() => {
    if (updateState.message && !updateState.error && note?.id) {
      onNoteSaved(note.id);
    }
  }, [updateState, note?.id, onNoteSaved]);

  useEffect(() => {
    if (deleteState.message && !deleteState.error) {
      onNoteDeleted();
    }
  }, [deleteState, onNoteDeleted]);

  const selectedResource = resources.find((r) => r.id === resourceId);

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card text-card-foreground shadow-xs">
      <form
        action={isNew ? createAction : updateAction}
        className="flex flex-1 flex-col overflow-hidden"
      >
        {/* Hidden inputs */}
        {!isNew && <input type="hidden" name="id" value={note.id} />}
        <input type="hidden" name="content" value={content} />

        {/* Top Editor Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isNew ? "New Note" : "Editing Note"}
            </span>

            {!isNew && note.updated_at && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground border-l pl-2">
                <Calendar className="h-3 w-3" />
                Updated {formatDate(note.updated_at)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isNew && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                aria-label="Delete this note"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline ml-1 text-xs">Delete</span>
              </Button>
            )}

            <SaveSubmitButton isNew={isNew} />
          </div>
        </div>

        {/* Status / Error feedback banner */}
        {activeState.error && (
          <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 text-xs font-medium text-destructive">
            {activeState.error}
          </div>
        )}
        {activeState.message && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            {activeState.message}
          </div>
        )}

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Note Title Input */}
          <div className="space-y-1">
            <Input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title (e.g. Dynamic Programming Principles)..."
              className="text-lg font-semibold h-11 border-none shadow-none focus-visible:ring-1 px-1"
              required
              aria-invalid={Boolean(activeState.fieldErrors?.title)}
            />
            {activeState.fieldErrors?.title && (
              <p className="text-destructive text-xs px-1">{activeState.fieldErrors.title}</p>
            )}
          </div>

          {/* Metadata Controls: Linked Resource & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t">
            {/* Resource Link Dropdown */}
            <div className="space-y-1.5">
              <Label htmlFor="note-resource" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5" />
                Linked resource
              </Label>
              <select
                id="note-resource"
                name="resource_id"
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                className="flex h-8 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">None (Independent note)</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{r.type}] {r.title}
                  </option>
                ))}
              </select>
              {selectedResource && (
                <div className="flex items-center gap-2 pt-0.5">
                  <ResourceTypeBadge type={selectedResource.type} />
                  <Link
                    href={`/resources/${selectedResource.id}`}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline truncate"
                  >
                    View resource <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Tags Input */}
            <div className="space-y-1.5">
              <Label htmlFor="note-tags" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Tag className="h-3.5 w-3.5" />
                Tags (comma separated)
              </Label>
              <Input
                id="note-tags"
                name="tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. algorithms, cs201, exam"
                className="h-8 text-xs"
              />
              {tagsInput.trim() && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {tagsInput
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((t, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0">
                        #{t}
                      </Badge>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Editor vs Preview Tabs */}
          <div className="flex flex-col flex-1 pt-2 border-t">
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    activeTab === "write"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <PenLine className="h-3.5 w-3.5" />
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    activeTab === "preview"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </button>
              </div>

              <span className="text-[11px] text-muted-foreground">
                Markdown supported (`#`, `**bold**`, `- list`, ```code```)
              </span>
            </div>

            {activeTab === "write" ? (
              <div className="flex-1 min-h-[360px]">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your study notes here in markdown..."
                  className="min-h-[380px] w-full resize-y font-mono text-sm leading-relaxed p-3 border-muted focus-visible:ring-1"
                />
              </div>
            ) : (
              <div className="min-h-[380px] rounded-md border p-4 bg-muted/10">
                <MarkdownPreview content={content} />
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      {!isNew && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete note</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete &ldquo;{note.title}&rdquo;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <form action={deleteAction} className="space-y-4">
              <input type="hidden" name="id" value={note.id} />
              {deleteState.error && (
                <p role="alert" className="text-destructive text-sm">
                  {deleteState.error}
                </p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <DeleteSubmitButton />
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
