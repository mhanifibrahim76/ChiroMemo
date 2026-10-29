import type { Metadata } from "next";
import { Suspense } from "react";

import { requireUser } from "@/lib/auth/session";
import { listNotes } from "@/lib/notes";
import { listResources } from "@/lib/resources";
import { NotesSplitView } from "@/components/notes/notes-split-view";
import { NotesSplitSkeleton } from "@/components/notes/notes-skeleton";
import { EditorialPageHeader } from "@/components/layout/editorial-page-header";

export const metadata: Metadata = {
  title: "Personal notes · ChiroMemo",
  description: "Write, organize, and attach markdown study notes to your learning resources.",
};

interface NotesPageProps {
  searchParams: Promise<{ id?: string }>;
}

async function NotesContent({ searchParams }: NotesPageProps) {
  await requireUser();
  const { id: initialNoteId } = await searchParams;

  const [notes, resources] = await Promise.all([
    listNotes(),
    listResources({ isArchived: false }),
  ]);

  const activeResources = resources.map((r) => ({
    id: r.id,
    title: r.title,
    type: r.type,
  }));

  return (
    <NotesSplitView
      notes={notes}
      resources={activeResources}
      initialSelectedNoteId={initialNoteId ?? null}
    />
  );
}

export default function NotesPage({ searchParams }: NotesPageProps) {
  return (
    <div className="space-y-6">
      {/* Editorial Page Header */}
      <EditorialPageHeader
        chapter="CHAPTER 02.2 // WRITTEN SYNTHESIS"
        title="Personal Study"
        italicWord="Notes."
        description="Write structured Markdown notes with live preview. Attach any note to textbook chapters or lecture PDFs, complete with tags for rapid recall."
        illustrationSrc="/illustrations/notes-resources-journal.jpg"
        figureCaption="FIG. 2.2 — MANUSCRIPT NOTEBOOK"
      />

      {/* Two-pane split view with Suspense streaming */}
      <Suspense fallback={<NotesSplitSkeleton />}>
        <NotesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
