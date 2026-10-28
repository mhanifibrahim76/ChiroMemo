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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      className="gap-1.5 h-8 text-xs"
    >
      <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
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
      className="gap-1.5 h-8 text-xs"
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-1 h-7 px-2 -ml-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Link href="/summaries">
                <ArrowLeft className="h-3.5 w-3.5" />
                All Summaries
              </Link>
            </Button>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-primary" />
              {summary.model || "gemini-2.5-flash"}
            </Badge>
            {summary.resourceType && (
              <Badge variant="outline" className="text-xs">
                {summary.resourceType}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Generated on </span>
            <span suppressHydrationWarning>{formatDate(summary.created_at)}</span>
            {summary.resource_id && (
              <>
                <span className="mx-1">•</span>
                <Link
                  href={`/resources/${summary.resource_id}`}
                  className="flex items-center gap-1 text-primary hover:underline"
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
            className="gap-1.5 h-8 text-xs"
          >
            {copiedSummary ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
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
            className="gap-1.5 h-8 text-xs text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Notification banners */}
      {exportState.status === "success" && (
        <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{exportState.message}</span>
          </div>
          {exportState.noteId && (
            <Button asChild size="sm" variant="outline" className="h-7 text-xs">
              <Link href="/notes">Open Notes</Link>
            </Button>
          )}
        </div>
      )}

      {exportState.status === "error" && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {exportState.message}
        </div>
      )}

      {regenState.status === "error" && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {regenState.message}
        </div>
      )}

      {/* Two-Panel Layout (Figure 4.9 Wireframe) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Original Document / Text */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="h-full border-muted-foreground/20">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Original Document
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {originalText
                      ? `${originalWords.toLocaleString()} words (${originalText.length.toLocaleString()} chars)`
                      : "Source document"}
                  </CardDescription>
                </div>
                {originalText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={handleCopyOriginal}
                  >
                    {copiedOriginal ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-500" />
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
            </CardHeader>
            <CardContent className="pt-4">
              {originalText ? (
                <div className="max-h-[680px] overflow-y-auto rounded-md border bg-muted/20 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap select-text text-foreground">
                  {originalText}
                </div>
              ) : (
                <div className="py-12 text-center space-y-2 text-muted-foreground">
                  <FileText className="mx-auto h-8 w-8 opacity-40" />
                  <p className="text-sm">Original text not stored separately.</p>
                  {summary.resource_id && (
                    <Button asChild variant="link" size="sm">
                      <Link href={`/resources/${summary.resource_id}`}>
                        Open resource page
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: AI-Generated Summary */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Concepts Callout */}
          {summary.key_points && summary.key_points.length > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-primary font-semibold">
                  <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
                  Key Concepts & Highlights
                </CardTitle>
                <CardDescription className="text-xs">
                  Critical concepts extracted by Gemini AI for student review.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="space-y-2">
                  {summary.key_points.map((point, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2.5 text-sm leading-relaxed"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Structured Markdown Summary */}
          <Card>
            <CardHeader className="pb-3 border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Academic Summary
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Structured analysis and high-yield notes.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  Grounded in Document
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <MarkdownPreview content={summary.content} />
              </div>
            </CardContent>
          </Card>
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
