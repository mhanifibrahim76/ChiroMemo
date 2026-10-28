export interface SummaryActionState {
  status: "idle" | "success" | "error";
  message?: string;
  summaryId?: string;
  noteId?: string;
  fieldErrors?: Record<string, string[]>;
}

export const initialSummaryActionState: SummaryActionState = {
  status: "idle",
};

