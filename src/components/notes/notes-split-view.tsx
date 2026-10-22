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
  // If initial note id is provided, select it; otherwise default to first note or null
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
    // Select first remaining note or new note mode
    const remaining = notes.filter((n) => n.id !== selectedNoteId);
    setSelectedNoteId(remaining.length > 0 ? remaining[0].id : null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[640px] items-stretch">
      {/* Left Pane: Notes List (5 cols on md+) */}
      <div className="md:col-span-5 h-[640px] flex flex-col">
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

      {/* Right Pane: Note Editor & Resource Linker (7 cols on md+) */}
      <div className="md:col-span-7 h-[640px] flex flex-col">
        <NoteEditorPane
          key={activeNote ? activeNote.id : "new-note"}
          note={activeNote}
          resources={resources}
          onNoteSaved={handleNoteSaved}
          onNoteDeleted={handleNoteDeleted}
        />
      </div>
    </div>
  );
}

