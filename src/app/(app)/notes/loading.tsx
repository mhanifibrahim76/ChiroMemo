import { NotesSplitSkeleton } from "@/components/notes/notes-skeleton";
import { EditorialPageHeader } from "@/components/layout/editorial-page-header";

export default function NotesLoading() {
  return (
    <div className="space-y-6">
      <EditorialPageHeader
        chapter="CHAPTER 02.2 // WRITTEN SYNTHESIS"
        title="Personal Study"
        italicWord="Notes."
        description="Write structured Markdown notes with live preview. Attach any note to textbook chapters or lecture PDFs, complete with tags for rapid recall."
        illustrationSrc="/illustrations/notes-resources-journal.jpg"
        figureCaption="FIG. 2.2 — MANUSCRIPT NOTEBOOK"
      />

      <NotesSplitSkeleton />
    </div>
  );
}


