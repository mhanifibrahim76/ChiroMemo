"use client";

import { useState } from "react";
import type { NoteWithRelations } from "@/lib/notes";
import { NoteListPane } from "./note-list-pane";
import { NoteEditorPane } from "./note-editor-pane";

interface NoteResourceOption {
  id: string;
  title: string;
  type: "PDF" | "VIDEO" | "WEBSITE" | "BOOK" | "COURSE";
}

interface NotesSplitViewProps {
  notes: NoteWithRelations[];
  resources: NoteResourceOption[];
  initialSelectedNoteId?: string | null;
}

export function NotesSplitView({
  notes,
  resources,
  initialSelectedNoteId,
}: NotesSplitViewProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    initialSelectedNoteId !== undefined
      ? initialSelectedNoteId
      : notes.length > 0
      ? notes[0].id
      : null
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const activeNote = notes.find((n) => n.id === selectedNoteId) ?? null;

  const handleNoteSaved = (noteId: string) => {
    setSelectedNoteId(noteId);
  };

  const handleNoteDeleted = () => {
    const remaining = notes.filter((n) => n.id !== selectedNoteId);
    setSelectedNoteId(remaining.length > 0 ? remaining[0].id : null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 border border-[#E5DEC9] bg-[#FDFCFA] md:divide-x md:divide-[#E5DEC9] min-h-[660px] items-stretch">
      {/* Left Column: Note Index & Directory */}
      <div className="md:col-span-5 lg:col-span-4 flex flex-col min-h-0 bg-[#FAF8F4]">
        <NoteListPane
          notes={notes}
          selectedNoteId={selectedNoteId}
          onSelectNote={setSelectedNoteId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
        />
      </div>

      {/* Right Column: Active Note Editor & Preview Sheet */}
      <div className="md:col-span-7 lg:col-span-8 flex flex-col min-h-0 bg-[#FDFCFA]">
        <NoteEditorPane
          note={activeNote}
          resources={resources}
          onNoteSaved={handleNoteSaved}
          onNoteDeleted={handleNoteDeleted}
        />
      </div>
    </div>
  );
}
