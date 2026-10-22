import "server-only";

import { PDFParse } from "pdf-parse";

export interface ExtractedDocument {
  text: string;
  pageCount: number;
  characterCount: number;
  wordCount: number;
  title?: string | null;
  author?: string | null;
}

/**
 * Normalizes extracted text: cleans up excessive blank lines and trailing spaces.
 */
function cleanExtractedText(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Counts words in a string.
 */
function countWords(str: string): number {
  if (!str) return 0;
  const matches = str.match(/\b\w+\b/g);
  return matches ? matches.length : 0;
}

/**
 * Extracts text and metadata from a PDF file buffer on the server.
 */
export async function extractTextFromPdf(
  buffer: Buffer | Uint8Array
): Promise<ExtractedDocument> {
  const parser = new PDFParse({ data: buffer });

  try {
    const textResult = await parser.getText();
    const infoResult = await parser.getInfo().catch(() => null);

    const rawText = typeof textResult.text === "string" ? textResult.text : "";
    const cleanedText = cleanExtractedText(rawText);

    const info = infoResult?.info as Record<string, unknown> | undefined;
    const metaTitle = typeof info?.Title === "string" ? info.Title.trim() : null;
    const metaAuthor = typeof info?.Author === "string" ? info.Author.trim() : null;

    return {
      text: cleanedText,
      pageCount: textResult.total || 1,
      characterCount: cleanedText.length,
      wordCount: countWords(cleanedText),
      title: metaTitle && metaTitle.length > 0 ? metaTitle : null,
      author: metaAuthor && metaAuthor.length > 0 ? metaAuthor : null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes("password")) {
      throw new Error(
        "Cannot extract text: The PDF is password-protected or encrypted."
      );
    }
    if (message.toLowerCase().includes("invalid pdf")) {
      throw new Error("Cannot extract text: The uploaded file is not a valid PDF.");
    }
    throw new Error(`Failed to extract text from PDF: ${message}`);
  } finally {
    try {
      await parser.destroy();
    } catch {
      // Ignore destroy cleanup errors
    }
  }
}

/**
 * Extracts text from a plain text buffer.
 */
export function extractTextFromPlainText(
  buffer: Buffer | Uint8Array | string
): ExtractedDocument {
  const rawText =
    typeof buffer === "string" ? buffer : Buffer.from(buffer).toString("utf-8");
  const cleanedText = cleanExtractedText(rawText);

  return {
    text: cleanedText,
    pageCount: 1,
    characterCount: cleanedText.length,
    wordCount: countWords(cleanedText),
    title: null,
    author: null,
  };
}

/**
 * Dispatches extraction according to the file extension or MIME type.
 */
export async function extractDocumentText(input: {
  buffer: Buffer | Uint8Array;
  fileName: string;
  mimeType?: string;
}): Promise<ExtractedDocument> {
  const nameLower = input.fileName.toLowerCase();

  if (nameLower.endsWith(".pdf") || input.mimeType === "application/pdf") {
    return extractTextFromPdf(input.buffer);
  }

  if (
    nameLower.endsWith(".txt") ||
    input.mimeType === "text/plain" ||
    input.mimeType?.startsWith("text/")
  ) {
    return extractTextFromPlainText(input.buffer);
  }

  throw new Error(
    `Unsupported document format for "${input.fileName}". Only PDF and TXT files can be extracted.`
  );
}
