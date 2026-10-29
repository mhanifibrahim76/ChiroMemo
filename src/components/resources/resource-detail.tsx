"use client";

import Link from "next/link";
import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowLeft,
  ExternalLink,
  Edit2,
  Archive,
  RotateCcw,
  Trash2,
  User,
  Calendar,
  Clock,
  Target,
  Route,
  Unlink,
  CheckCircle2,
  Circle,
  Clock3,
  Download,
  Sparkles,
  Copy,
  Check,
  FileText,
} from "lucide-react";

import type { ResourceDetailData } from "@/lib/resources";
import {
  deleteResourceAction,
  toggleArchiveResourceAction,
  dissociateResourceFromStepAction,
} from "@/lib/resources/actions";
import { initialResourceActionState } from "@/lib/resources/constants";
import { getDocumentSignedUrlAction } from "@/lib/documents/actions";
import { ResourceTypeBadge } from "./resource-type-badge";
import { EditResourceDialog } from "./edit-resource-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SummaryRow } from "@/lib/summaries";
import { ResourceAiSummaryCard } from "./resource-ai-summary-card";

interface ResourceDetailProps {
  resource: ResourceDetailData;
  availableGoals?: { id: string; title: string }[];
  initialSummary?: SummaryRow | null;
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

function formatDateTime(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

function DeleteSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? "Deleting…" : "Delete resource"}
    </Button>
  );
}

function StepStatusIcon({ status }: { status: string }) {
  if (status === "COMPLETED") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
  }
  if (status === "IN_PROGRESS") {
    return <Clock3 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />;
  }
  return <Circle className="h-4 w-4 text-muted-foreground shrink-0" />;
}

export function ResourceDetail({
  resource,
  availableGoals = [],
  initialSummary,
}: ResourceDetailProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  async function handleDownloadDocument() {
    if (!resource.file_path) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const res = await getDocumentSignedUrlAction(resource.file_path);
      if (res.url) {
        window.open(res.url, "_blank");
      } else {
        setDownloadError(res.error || "Failed to generate download link.");
      }
    } catch (err) {
      setDownloadError(
        err instanceof Error ? err.message : "Error generating download link."
      );
    } finally {
      setDownloading(false);
    }
  }

  function handleCopyExtractedText() {
    if (!resource.extracted_text) return;
    navigator.clipboard.writeText(resource.extracted_text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  }

  const [deleteState, deleteFormAction] = useActionState(
    deleteResourceAction,
    initialResourceActionState
  );
  const [, archiveFormAction] = useActionState(
    toggleArchiveResourceAction,
    initialResourceActionState
  );
  const [, unlinkStepFormAction] = useActionState(
    dissociateResourceFromStepAction,
    initialResourceActionState
  );

  return (
    <div className="space-y-6">
      {/* Back button and navigation */}
      <div>
        <Link
          href="/resources"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#1C1917]/65 hover:text-[#166534] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to resources
        </Link>
      </div>

      {/* Main Editorial Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border border-[#E5DEC9] bg-[#F7EEDB] p-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <ResourceTypeBadge type={resource.type} />
            {resource.category && (
              <span className="inline-flex items-center rounded-sm border border-[#E5DEC9] bg-[#FDFCFA] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#1C1917]/75">
                {resource.category}
              </span>
            )}
            {resource.is_archived && (
              <span className="inline-flex items-center rounded-sm border border-[#E5DEC9] bg-[#FAF8F4] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#1C1917]/60">
                Archived
              </span>
            )}
          </div>
          <h1 className="font-serif font-normal text-3xl tracking-tight text-[#1C1917]">
            {resource.title}
          </h1>
          {resource.author && (
            <p className="flex items-center gap-1.5 text-xs font-mono text-[#1C1917]/65">
              <User className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>By {resource.author}</span>
            </p>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {resource.url && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 rounded-sm border-[#E5DEC9] bg-[#FDFCFA] text-[#1C1917] hover:bg-[#FAF8F4] text-xs shadow-none"
            >
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Visit URL
              </a>
            </Button>
          )}

          {resource.file_path && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 rounded-sm border-[#E5DEC9] bg-[#FDFCFA] text-[#1C1917] hover:bg-[#FAF8F4] text-xs shadow-none"
              onClick={handleDownloadDocument}
              disabled={downloading}
            >
              <Download className="h-3.5 w-3.5" />
              {downloading ? "Opening..." : "Download File"}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 rounded-sm border-[#E5DEC9] bg-[#FDFCFA] text-[#1C1917] hover:bg-[#FAF8F4] text-xs shadow-none"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </Button>

          <form action={archiveFormAction}>
            <input type="hidden" name="id" value={resource.id} />
            <input
              type="hidden"
              name="is_archived"
              value={resource.is_archived ? "false" : "true"}
            />
            <Button
              variant="outline"
              size="sm"
              type="submit"
              className="gap-1.5 h-8 rounded-sm border-[#E5DEC9] bg-[#FDFCFA] text-[#1C1917] hover:bg-[#FAF8F4] text-xs shadow-none"
            >
              {resource.is_archived ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore
                </>
              ) : (
                <>
                  <Archive className="h-3.5 w-3.5" />
                  Archive
                </>
              )}
            </Button>
          </form>

          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5 h-8 rounded-sm text-xs shadow-none"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Overview & Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* URL & Source card */}
          {resource.url && (
            <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
              <div className="px-6 py-3.5 border-b border-[#E5DEC9] bg-[#F7EEDB]">
                <h2 className="font-serif font-normal text-lg text-[#1C1917]">Resource Source</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-mono text-[#1C1917]/55 uppercase tracking-wider">
                      Target Link
                    </p>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-[#166534] hover:underline break-all"
                    >
                      {resource.url}
                    </a>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5 h-8 rounded-sm border-[#E5DEC9] bg-[#FDFCFA] text-xs shadow-none"
                  >
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Uploaded Document File Card */}
          {resource.file_path && (
            <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
              <div className="px-6 py-3.5 border-b border-[#E5DEC9] bg-[#F7EEDB]">
                <h2 className="font-serif font-normal text-lg flex items-center gap-2 text-[#1C1917]">
                  <FileText className="h-4 w-4 text-[#166534]" />
                  Uploaded Document File
                </h2>
                <p className="text-[11px] font-mono text-[#1C1917]/60 mt-0.5">
                  Stored securely in ChiroMemo private document storage.
                </p>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-sm bg-[#FAF8F4] border border-[#E5DEC9]">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-mono text-[#1C1917]/55 uppercase tracking-wider">
                      Storage Path
                    </p>
                    <p className="text-xs font-mono text-[#1C1917] truncate mt-0.5">
                      {resource.file_path}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5 h-8 rounded-sm border-[#E5DEC9] bg-[#FDFCFA] text-xs shadow-none"
                    onClick={handleDownloadDocument}
                    disabled={downloading}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {downloading ? "Opening..." : "Download"}
                  </Button>
                </div>
                {downloadError && (
                  <p className="text-xs text-destructive">{downloadError}</p>
                )}
              </div>
            </div>
          )}

          {/* AI Document Summary */}
          {(resource.extracted_text || resource.description) && (
            <ResourceAiSummaryCard
              resourceId={resource.id}
              resourceTitle={resource.title}
              hasText={Boolean(resource.extracted_text || resource.description)}
              initialSummary={initialSummary}
            />
          )}

          {/* Extracted Document Text */}
          {resource.extracted_text && (
            <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
              <div className="px-6 py-3.5 border-b border-[#E5DEC9] bg-[#F7EEDB]">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="font-serif font-normal text-lg flex items-center gap-2 text-[#1C1917]">
                      <Sparkles className="h-4 w-4 text-[#166534]" />
                      Extracted Document Text
                    </h2>
                    <p className="text-[11px] font-mono text-[#1C1917]/60 mt-0.5">
                      Server-extracted text (
                      {
                        resource.extracted_text
                          .split(/\s+/)
                          .filter(Boolean).length
                      }{" "}
                      words, {resource.extracted_text.length} characters).
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-sm border border-[#166534]/30 bg-[#FDFCFA] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#166534]">
                      AI Ready
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs rounded-sm hover:bg-[#FAF8F4]"
                      onClick={handleCopyExtractedText}
                    >
                      {copiedText ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[#166534]" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy text
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="max-h-80 overflow-y-auto rounded-sm border border-[#E5DEC9] bg-[#FAF8F4] p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap select-text text-[#1C1917]/85">
                  {resource.extracted_text}
                </div>
              </div>
            </div>
          )}

          {/* Description & Study Notes */}
          <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
            <div className="px-6 py-3.5 border-b border-[#E5DEC9] bg-[#F7EEDB]">
              <h2 className="font-serif font-normal text-lg text-[#1C1917]">Description & Notes</h2>
              <p className="text-[11px] font-mono text-[#1C1917]/60 mt-0.5">
                Reference notes, key topics, or reason for saving this material.
              </p>
            </div>
            <div className="p-6">
              {resource.description ? (
                <div className="text-sm leading-relaxed whitespace-pre-line text-[#1C1917]/85">
                  {resource.description}
                </div>
              ) : (
                <p className="text-sm italic text-[#1C1917]/55">
                  No description or notes added yet. Click &ldquo;Edit&rdquo; above to add study notes.
                </p>
              )}
            </div>
          </div>

          {/* Linked Roadmap Steps */}
          <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
            <div className="px-6 py-3.5 border-b border-[#E5DEC9] bg-[#F7EEDB]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-normal text-lg text-[#1C1917]">Roadmap Step Associations</h2>
                  <p className="text-[11px] font-mono text-[#1C1917]/60 mt-0.5">
                    Steps in your learning roadmaps where this resource is used.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-sm border border-[#E5DEC9] bg-[#FDFCFA] px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#1C1917]/75">
                  {resource.steps.length} {resource.steps.length === 1 ? "step" : "steps"}
                </span>
              </div>
            </div>
            <div className="p-6">
              {resource.steps.length > 0 ? (
                <div className="divide-y divide-[#E5DEC9] rounded-sm border border-[#E5DEC9]">
                  {resource.steps.map((step) => (
                    <div
                      key={step.id}
                      className="flex items-center justify-between gap-3 p-3.5 bg-[#FAF8F4] hover:bg-[#F7EEDB]/60 transition-colors"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <StepStatusIcon status={step.status} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-none truncate text-[#1C1917]">
                            {step.title}
                          </p>
                          <p className="mt-1 text-xs text-[#1C1917]/65">
                            Roadmap:{" "}
                            <Link
                              href={`/roadmaps/${step.roadmap.id}`}
                              className="font-medium text-[#166534] hover:underline"
                            >
                              {step.roadmap.title}
                            </Link>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center rounded-sm border border-[#E5DEC9] bg-[#FDFCFA] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#1C1917]/70">
                          {step.status.replace("_", " ")}
                        </span>
                        <form action={unlinkStepFormAction}>
                          <input type="hidden" name="step_id" value={step.id} />
                          <input type="hidden" name="resource_id" value={resource.id} />
                          <input type="hidden" name="roadmap_id" value={step.roadmap.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-sm text-[#1C1917]/55 hover:text-destructive"
                            title="Unlink from this step"
                          >
                            <Unlink className="h-3.5 w-3.5" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-[#1C1917]/60">
                  <Route className="mx-auto h-8 w-8 text-[#1C1917]/30 mb-2" />
                  <p>This resource is not attached to any roadmap steps yet.</p>
                  <p className="text-xs mt-1">
                    You can attach resources to roadmap steps from any roadmap detail page.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Goal connection & Metadata */}
        <div className="space-y-6">
          {/* Associated Goal Card */}
          <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
            <div className="px-6 py-3.5 border-b border-[#E5DEC9] bg-[#F7EEDB]">
              <h2 className="font-serif font-normal text-lg flex items-center gap-2 text-[#1C1917]">
                <Target className="h-4 w-4 text-[#166534]" />
                Learning Goal
              </h2>
              <p className="text-[11px] font-mono text-[#1C1917]/60 mt-0.5">
                Target academic or skill objective.
              </p>
            </div>
            <div className="p-6">
              {resource.goal ? (
                <div className="p-3.5 rounded-sm border border-[#E5DEC9] bg-[#FAF8F4] space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-serif font-normal text-lg leading-snug text-[#1C1917]">
                      {resource.goal.title}
                    </span>
                    <span className="inline-flex items-center rounded-sm border border-[#166534]/30 bg-[#166534]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#166534]">
                      {resource.goal.status}
                    </span>
                  </div>
                  <div className="pt-2.5 border-t border-[#E5DEC9]">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="w-full text-xs rounded-sm border-[#E5DEC9] bg-[#FDFCFA] hover:bg-[#F7EEDB] shadow-none"
                    >
                      <Link href={`/goals/${resource.goal.id}`}>
                        View goal details
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-[#1C1917]/60 space-y-2">
                  <p>Not linked to a specific goal.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs rounded-sm border-[#E5DEC9] bg-[#FAF8F4]"
                    onClick={() => setEditDialogOpen(true)}
                  >
                    Link to a goal
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Card */}
          <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
            <div className="px-6 py-3.5 border-b border-[#E5DEC9] bg-[#F7EEDB]">
              <h2 className="font-serif font-normal text-lg text-[#1C1917]">Details & History</h2>
            </div>
            <div className="p-6 space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between text-[#1C1917]/65">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Added on
                </span>
                <span className="text-[#1C1917] font-medium" suppressHydrationWarning>
                  {formatDate(resource.created_at)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#1C1917]/65">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Last updated
                </span>
                <span className="text-[#1C1917] font-medium" suppressHydrationWarning>
                  {formatDateTime(resource.updated_at)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#1C1917]/65">
                <span>Status</span>
                <span className="inline-flex items-center rounded-sm border border-[#166534]/30 bg-[#166534]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#166534]">
                  {resource.is_archived ? "Archived" : "Active"}
                </span>
              </div>
              {resource.category && (
                <div className="flex items-center justify-between text-[#1C1917]/65">
                  <span>Category</span>
                  <span className="text-[#1C1917] font-medium">{resource.category}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <EditResourceDialog
        resource={resource}
        availableGoals={availableGoals}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete resource</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete &ldquo;{resource.title}&rdquo;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <form action={deleteFormAction} className="space-y-4">
            <input type="hidden" name="id" value={resource.id} />
            <p className="text-sm text-muted-foreground">
              This will permanently delete the resource from your library and detach it from all associated roadmap steps.
            </p>
            {deleteState.error && (
              <p role="alert" className="text-destructive text-sm">
                {deleteState.error}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <DeleteSubmitButton />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
