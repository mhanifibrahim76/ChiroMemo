export interface DocumentActionState {
  success?: boolean;
  error?: string | null;
  fieldErrors?: Record<string, string[] | undefined>;
  resourceId?: string;
  filePath?: string;
  extractedStats?: {
    pageCount: number;
    characterCount: number;
    wordCount: number;
    snippet?: string;
  };
}

export const initialDocumentActionState: DocumentActionState = {};

