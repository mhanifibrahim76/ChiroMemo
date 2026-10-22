import { NotesSplitSkeleton } from "@/components/notes/notes-skeleton";

export default function NotesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Personal notes</h1>
        <p className="text-muted-foreground text-sm">
          Capture insights, lecture notes, and chapter summaries linked to your learning materials.
        </p>
      </div>

      <NotesSplitSkeleton />
    </div>
  );
}

