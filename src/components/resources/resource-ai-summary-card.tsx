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
import { Button } from "@/components/ui/button";
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
      className={
        isRegen
          ? "gap-2 rounded-sm border-[#E5DEC9] bg-[#FDFCFA] text-[#1C1917] hover:bg-[#F7EEDB] text-xs h-8 shadow-none"
          : "gap-2 rounded-sm bg-[#166534] text-[#FAF8F4] hover:bg-[#166534]/90 text-xs h-9 shadow-none"
      }
    >
      {pending ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Analyzing with Gemini...</span>
        </>
      ) : isRegen ? (
        <>
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Regenerate</span>
        </>
      ) : (
        <>
          <Sparkles className="h-3.5 w-3.5" />
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
      className="gap-1.5 h-8 rounded-sm border-[#E5DEC9] bg-[#FDFCFA] text-[#1C1917] hover:bg-[#F7EEDB] text-xs shadow-none"
    >
      <BookmarkCheck className="h-3.5 w-3.5 text-[#166534]" />
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
    <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
      <div className="px-6 py-4 bg-[#F7EEDB] border-b border-[#E5DEC9]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif font-normal text-lg flex items-center gap-2 text-[#1C1917]">
              <Sparkles className="h-4 w-4 text-[#166534]" />
              AI Document Summary
            </h2>
            <p className="text-[11px] font-mono text-[#1C1917]/60 mt-0.5">
              Distill key concepts and study takeaways for {resourceTitle} with Google Gemini AI.
            </p>
          </div>
          {initialSummary && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-sm border border-[#E5DEC9] bg-[#FDFCFA] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#1C1917]/75">
                {initialSummary.model || "gemini-2.5-flash"}
              </span>
              <span className="inline-flex items-center rounded-sm border border-[#166534]/30 bg-[#166534]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#166534]">
                Ready
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Error notification */}
        {generateState.status === "error" && (
          <div className="p-3 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-xs">Failed to generate summary</p>
              <p className="text-xs mt-0.5">{generateState.message}</p>
            </div>
          </div>
        )}

        {/* Note export notification */}
        {exportState.status === "success" && (
          <div className="p-3 rounded-sm bg-[#166534]/10 border border-[#166534]/30 text-[#166534] text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#166534]" />
              <span>{exportState.message}</span>
            </div>
            <Button asChild size="sm" variant="link" className="h-6 px-1 text-xs text-[#166534]">
              <Link href="/notes">View in Notes</Link>
            </Button>
          </div>
        )}

        {initialSummary ? (
          <div className="space-y-4">
            {/* Key concepts highlight */}
            {initialSummary.key_points && initialSummary.key_points.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-mono font-medium text-[#1C1917]/65 flex items-center gap-1.5 uppercase tracking-wider">
                  <Lightbulb className="h-3.5 w-3.5 text-[#D97706]" />
                  Key Highlights ({initialSummary.key_points.length})
                </p>
                <ul className="space-y-1.5 text-xs">
                  {initialSummary.key_points.slice(0, 3).map((kp, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[#1C1917]/85 leading-relaxed">
                      <span className="text-[#166534] font-mono font-bold">
                        {String(idx + 1).padStart(2, "0")}.
                      </span>
                      <span>{kp}</span>
                    </li>
                  ))}
                  {initialSummary.key_points.length > 3 && (
                    <li className="text-[#1C1917]/55 font-mono text-[11px] pl-5">
                      +{initialSummary.key_points.length - 3} more key points in full view
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Actions toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E5DEC9]">
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  size="sm"
                  className="gap-1.5 h-8 rounded-sm bg-[#166534] text-[#FAF8F4] hover:bg-[#166534]/90 text-xs shadow-none"
                >
                  <Link href={`/summaries/${initialSummary.id}`}>
                    <span>Open Two-Panel View</span>
                    <ExternalLink className="h-3 w-3" />
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-serif font-normal text-base text-[#1C1917]">
                Document is extracted and ready for AI
              </p>
              <p className="text-xs text-[#1C1917]/65 max-w-md leading-relaxed">
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
      </div>
    </div>
  );
}

