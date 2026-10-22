import type { Metadata } from "next";
import { Suspense } from "react";

import { requireUser } from "@/lib/auth/session";
import { listNotes } from "@/lib/notes";
import { listResources } from "@/lib/resources";
import { NotesSplitView } from "@/components/notes/notes-split-view";
import { NotesSplitSkeleton } from "@/components/notes/notes-skeleton";

export const metadata: Metadata = {
  title: "Personal notes | ChiroMemo",
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
      {/* Stable Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Personal notes</h1>
        <p className="text-muted-foreground text-sm">
          Capture insights, lecture notes, and chapter summaries linked to your learning materials.
        </p>
      </div>

      {/* Two-pane split view with Suspense streaming */}
      <Suspense fallback={<NotesSplitSkeleton />}>
        <NotesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

