"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  FileText,
  BookOpen,
  Calendar,
  Trash2,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  BookmarkCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MarkdownPreview } from "@/components/notes/markdown-preview";
import {
  exportSummaryToNoteAction,
  deleteSummaryAction,
  generateSummaryAction,
} from "@/lib/summaries/actions";
import { initialSummaryActionState } from "@/lib/summaries/constants";
import type { SummaryWithResource } from "@/lib/summaries";

interface SummarySplitViewProps {
  summary: SummaryWithResource;
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

function ExportNoteButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      variant="outline"
      size="sm"
      type="submit"
      disabled={pending}
      className="gap-1.5 h-8 rounded-sm border-[#E5DEC9] bg-[#FDFCFA] text-[#1C1917] hover:bg-[#F7EEDB] hover:text-[#166534] text-xs shadow-none"
    >
      <BookmarkCheck className="h-3.5 w-3.5 text-[#166534]" />
      <span>{pending ? "Saving..." : "Save as Note"}</span>
    </Button>
  );
}

function RegenerateButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      variant="ghost"
      size="sm"
      type="submit"
      disabled={pending}
      className="gap-1.5 h-8 rounded-sm text-xs text-[#1C1917]/75 hover:bg-[#F7EEDB] hover:text-[#166534]"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} />
      <span>{pending ? "Regenerating..." : "Regenerate"}</span>
    </Button>
  );
}

export function SummarySplitView({ summary }: SummarySplitViewProps) {
  const router = useRouter();
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [deleteOpen, setDeleteDialogOpen] = useState(false);

  const [exportState, exportAction] = useActionState(
    exportSummaryToNoteAction,
    initialSummaryActionState
  );

  const [deleteState, deleteAction] = useActionState(
    deleteSummaryAction,
    initialSummaryActionState
  );

  const [regenState, regenAction] = useActionState(
    generateSummaryAction,
    initialSummaryActionState
  );

  useEffect(() => {
    if (deleteState.status === "success") {
      router.push("/summaries");
    }
  }, [deleteState.status, router]);

  const title = summary.resourceTitle || "AI Document Summary";
  const originalText = summary.resourceExtractedText || "";
  const originalWords = originalText
    ? originalText.split(/\s+/).filter(Boolean).length
    : 0;

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary.content);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyOriginal = async () => {
    try {
      await navigator.clipboard.writeText(originalText);
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border border-[#E5DEC9] bg-[#F7EEDB] p-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-1 h-7 px-2 -ml-2 text-xs font-mono uppercase tracking-wider text-[#1C1917]/65 hover:text-[#166534] hover:bg-[#FAF8F4]/60 rounded-sm"
            >
              <Link href="/summaries">
                <ArrowLeft className="h-3.5 w-3.5" />
                All Summaries
              </Link>
            </Button>
            <span className="inline-flex items-center gap-1 rounded-sm border border-[#166534]/30 bg-[#166534]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#166534]">
              <Sparkles className="h-3 w-3 text-[#166534]" />
              {summary.model || "gemini-2.5-flash"}
            </span>
            {summary.resourceType && (
              <span className="inline-flex items-center rounded-sm border border-[#E5DEC9] bg-[#FDFCFA] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#1C1917]/70">
                {summary.resourceType}
              </span>
            )}
          </div>
          <h1 className="font-serif font-normal text-3xl text-[#1C1917] tracking-tight">{title}</h1>
          <p className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-[#1C1917]/60">
            <Calendar className="h-3.5 w-3.5" />
            <span>Generated on </span>
            <span suppressHydrationWarning>{formatDate(summary.created_at)}</span>
            {summary.resource_id && (
              <>
                <span className="mx-1">{"//"}</span>
                <Link
                  href={`/resources/${summary.resource_id}`}
                  className="flex items-center gap-1 text-[#166534] hover:underline"
                >
                  <BookOpen className="h-3 w-3" />
                  View Original Resource
                </Link>
              </>
            )}
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export to Note Form */}
          <form action={exportAction}>
            <input type="hidden" name="summaryId" value={summary.id} />
            <ExportNoteButton />
          </form>

          {/* Copy Summary */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopySummary}
            className="gap-1.5 h-8 rounded-sm border-[#E5DEC9] bg-[#FDFCFA] text-[#1C1917] hover:bg-[#FAF8F4] text-xs shadow-none"
          >
            {copiedSummary ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#166534]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </Button>

          {/* Regenerate Summary (if linked to resource or text) */}
          {summary.resource_id && (
            <form action={regenAction}>
              <input type="hidden" name="resourceId" value={summary.resource_id} />
              <RegenerateButton />
            </form>
          )}

          {/* Delete Dialog Trigger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="gap-1.5 h-8 rounded-sm text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Notification banners */}
      {exportState.status === "success" && (
        <div className="p-3.5 rounded-sm bg-[#166534]/10 border border-[#166534]/30 text-[#166534] text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#166534]" />
            <span>{exportState.message}</span>
          </div>
          {exportState.noteId && (
            <Button asChild size="sm" variant="outline" className="h-7 text-xs rounded-sm border-[#166534]/30 bg-[#FDFCFA]">
              <Link href="/notes">Open Notes</Link>
            </Button>
          )}
        </div>
      )}

      {exportState.status === "error" && (
        <div className="p-3 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {exportState.message}
        </div>
      )}

      {regenState.status === "error" && (
        <div className="p-3 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {regenState.message}
        </div>
      )}

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Original Document / Text */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
            <div className="px-5 py-3.5 border-b border-[#E5DEC9] bg-[#F7EEDB]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-normal text-lg text-[#1C1917] flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#1C1917]/60" />
                    Original Document
                  </h2>
                  <p className="text-[11px] font-mono text-[#1C1917]/55 mt-0.5">
                    {originalText
                      ? `${originalWords.toLocaleString()} words (${originalText.length.toLocaleString()} chars)`
                      : "Source document"}
                  </p>
                </div>
                {originalText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs rounded-sm hover:bg-[#FAF8F4]"
                    onClick={handleCopyOriginal}
                  >
                    {copiedOriginal ? (
                      <>
                        <Check className="h-3 w-3 text-[#166534]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy text</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
            <div className="p-5">
              {originalText ? (
                <div className="max-h-[680px] overflow-y-auto rounded-sm border border-[#E5DEC9] bg-[#FAF8F4] p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap select-text text-[#1C1917]/85">
                  {originalText}
                </div>
              ) : (
                <div className="py-12 text-center space-y-2 text-[#1C1917]/55">
                  <FileText className="mx-auto h-8 w-8 opacity-40" />
                  <p className="text-sm">Original text not stored separately.</p>
                  {summary.resource_id && (
                    <Button asChild variant="link" size="sm" className="text-[#166534]">
                      <Link href={`/resources/${summary.resource_id}`}>
                        Open resource page
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: AI-Generated Summary */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Concepts Callout */}
          {summary.key_points && summary.key_points.length > 0 && (
            <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
              <div className="px-6 py-4 border-b border-[#E5DEC9] bg-[#F7EEDB]">
                <h2 className="font-serif font-normal text-lg flex items-center gap-2 text-[#1C1917]">
                  <Lightbulb className="h-4 w-4 text-[#D97706] shrink-0" />
                  Key Concepts & Highlights
                </h2>
                <p className="text-[11px] font-mono text-[#1C1917]/60 mt-0.5">
                  Critical concepts extracted by Gemini AI for student review.
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-2.5">
                  {summary.key_points.map((point, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm leading-relaxed"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-[#166534]/30 bg-[#166534]/10 text-[#166534] text-[10px] font-mono font-semibold mt-0.5">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[#1C1917]/85">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Structured Markdown Summary */}
          <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
            <div className="px-6 py-4 border-b border-[#E5DEC9] bg-[#F7EEDB]">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-serif font-normal text-lg flex items-center gap-2 text-[#1C1917]">
                    <Sparkles className="h-4 w-4 text-[#166534]" />
                    AI Academic Summary
                  </h2>
                  <p className="text-[11px] font-mono text-[#1C1917]/60 mt-0.5">
                    Structured analysis and high-yield notes.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-sm border border-[#166534]/30 bg-[#FDFCFA] px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#166534]">
                  Grounded in Document
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="prose prose-sm max-w-none text-[#1C1917]">
                <MarkdownPreview content={summary.content} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete AI Summary?</DialogTitle>
            <DialogDescription>
              This will permanently remove this summary from your account. The
              original resource and any notes you created will remain untouched.
            </DialogDescription>
          </DialogHeader>

          {deleteState.status === "error" && (
            <p className="text-sm text-destructive">{deleteState.message}</p>
          )}

          <form action={deleteAction}>
            <input type="hidden" name="id" value={summary.id} />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" type="submit">
                Delete Summary
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

