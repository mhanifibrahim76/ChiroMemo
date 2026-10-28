"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  Sparkles,
  ExternalLink,
  Lightbulb,
  CheckCircle2,
  BookmarkCheck,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  generateSummaryAction,
  exportSummaryToNoteAction,
} from "@/lib/summaries/actions";
import { initialSummaryActionState } from "@/lib/summaries/constants";
import type { SummaryRow } from "@/lib/summaries";

interface ResourceAiSummaryCardProps {
  resourceId: string;
  resourceTitle: string;
  hasText: boolean;
  initialSummary?: SummaryRow | null;
}

function GenerateButton({ isRegen }: { isRegen: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      size={isRegen ? "sm" : "default"}
      variant={isRegen ? "outline" : "default"}
      className="gap-2"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
          <span>Analyzing with Gemini...</span>
        </>
      ) : isRegen ? (
        <>
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Regenerate</span>
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          <span>Summarize with Gemini AI</span>
        </>
      )}
    </Button>
  );
}

function SaveNoteButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      variant="outline"
      size="sm"
      className="gap-1.5 h-8 text-xs"
    >
      <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
      <span>{pending ? "Saving..." : "Save to Note"}</span>
    </Button>
  );
}

export function ResourceAiSummaryCard({
  resourceId,
  resourceTitle,
  hasText,
  initialSummary,
}: ResourceAiSummaryCardProps) {
  const [generateState, generateAction] = useActionState(
    generateSummaryAction,
    initialSummaryActionState
  );

  const [exportState, exportAction] = useActionState(
    exportSummaryToNoteAction,
    initialSummaryActionState
  );

  if (!hasText) {
    return null;
  }

  return (
    <Card className="border-primary/30 shadow-xs">
      <CardHeader className="pb-3 bg-muted/20 border-b">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Document Summary
            </CardTitle>
            <CardDescription className="text-xs">
              Distill key concepts and study takeaways for {resourceTitle} with Google Gemini AI.
            </CardDescription>
          </div>
          {initialSummary && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {initialSummary.model || "gemini-2.5-flash"}
              </Badge>
              <Badge variant="outline" className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                Ready
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Error notification */}
        {generateState.status === "error" && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-xs">Failed to generate summary</p>
              <p className="text-xs mt-0.5">{generateState.message}</p>
            </div>
          </div>
        )}

        {/* Note export notification */}
        {exportState.status === "success" && (
          <div className="p-2.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>{exportState.message}</span>
            </div>
            <Button asChild size="sm" variant="link" className="h-6 px-1 text-xs">
              <Link href="/notes">View in Notes</Link>
            </Button>
          </div>
        )}

        {initialSummary ? (
          <div className="space-y-3">
            {/* Key concepts highlight */}
            {initialSummary.key_points && initialSummary.key_points.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                  Key Highlights ({initialSummary.key_points.length})
                </p>
                <ul className="space-y-1 text-xs">
                  {initialSummary.key_points.slice(0, 3).map((kp, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-foreground/90">
                      <span className="text-primary font-bold">•</span>
                      <span>{kp}</span>
                    </li>
                  ))}
                  {initialSummary.key_points.length > 3 && (
                    <li className="text-muted-foreground italic text-[11px] pl-3">
                      +{initialSummary.key_points.length - 3} more key points in full view
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Actions toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t">
              <div className="flex items-center gap-2">
                <Button asChild size="sm" className="gap-1.5 h-8 text-xs">
                  <Link href={`/summaries/${initialSummary.id}`}>
                    <span>Open Two-Panel View</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>

                <form action={exportAction}>
                  <input type="hidden" name="summaryId" value={initialSummary.id} />
                  <SaveNoteButton />
                </form>
              </div>

              <form action={generateAction}>
                <input type="hidden" name="resourceId" value={resourceId} />
                <GenerateButton isRegen={true} />
              </form>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-muted/30 border border-dashed">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-sm font-medium text-foreground">
                Document is extracted and ready for AI
              </p>
              <p className="text-xs text-muted-foreground max-w-md">
                Click below to generate an executive overview, bullet-point key
                theories, and student study takeaways.
              </p>
            </div>

            <form action={generateAction} className="shrink-0">
              <input type="hidden" name="resourceId" value={resourceId} />
              <GenerateButton isRegen={false} />
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
