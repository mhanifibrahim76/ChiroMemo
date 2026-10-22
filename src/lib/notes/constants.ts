export type NoteActionState = {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
  noteId?: string;
};

export const initialNoteActionState: NoteActionState = {};

