"use client";

import { useState, useRef, useTransition, type DragEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  validateDocumentFile,
} from "@/lib/validations/documents";
import { uploadDocumentAction } from "@/lib/documents/actions";
import {
  type DocumentActionState,
  initialDocumentActionState,
} from "@/lib/documents/constants";

interface UploadDocumentDialogProps {
  availableGoals?: { id: string; title: string }[];
  defaultGoalId?: string;
}

export function UploadDocumentDialog({
  availableGoals = [],
  defaultGoalId,
}: UploadDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [goalId, setGoalId] = useState(defaultGoalId ?? "none");
  const [category, setCategory] = useState("Lecture Notes");
  const [description, setDescription] = useState("");

  const [state, setState] = useState<DocumentActionState>(initialDocumentActionState);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function resetForm() {
    setFile(null);
    setIsDragging(false);
    setFileError(null);
    setTitle("");
    setGoalId(defaultGoalId ?? "none");
    setCategory("Lecture Notes");
    setDescription("");
    setState(initialDocumentActionState);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileSelect(selectedFile: File) {
    setFileError(null);
    const validation = validateDocumentFile(selectedFile);
    if (!validation.valid) {
      setFileError(validation.error || "Invalid file.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    // Auto-fill title if not filled yet
    if (!title) {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(cleanName);
    }
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setFileError("Please select a document to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (title.trim()) formData.append("title", title.trim());
    if (goalId && goalId !== "none") formData.append("goalId", goalId);
    if (category.trim()) formData.append("category", category.trim());
    if (description.trim()) formData.append("description", description.trim());

    startTransition(async () => {
      const result = await uploadDocumentAction(state, formData);
      setState(result);
      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 shadow-xs">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Learning Document
          </DialogTitle>
          <DialogDescription>
            Upload a PDF or plain text document. ChiroMemo will store the file
            securely and extract its text for study analysis and AI summarization.
          </DialogDescription>
        </DialogHeader>

        {state.success ? (
          <div className="py-4 space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
                  Document uploaded and processed successfully!
                </p>
                <p className="text-xs text-emerald-800 dark:text-emerald-200">
                  Text extracted: {state.extractedStats?.pageCount ?? 1} pages ·{" "}
                  {state.extractedStats?.wordCount ?? 0} words (
                  {state.extractedStats?.characterCount ?? 0} characters)
                </p>
              </div>
            </div>

            {state.extractedStats?.snippet && (
              <div className="rounded-md border bg-muted/30 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Extracted Text Preview
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    Ready for AI
                  </Badge>
                </div>
                <p className="text-xs font-mono text-muted-foreground line-clamp-4 leading-relaxed bg-background p-2 rounded border">
                  {state.extractedStats.snippet}
                </p>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  resetForm();
                  setOpen(false);
                }}
              >
                Done
              </Button>
              {state.resourceId && (
                <Button
                  size="sm"
                  onClick={() => {
                    const id = state.resourceId;
                    setOpen(false);
                    router.push(`/resources/${id}`);
                  }}
                >
                  View Resource Detail
                </Button>
              )}
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Error alerts */}
            {(state.error || fileError) && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{state.error || fileError}</p>
              </div>
            )}

            {/* Drop Zone */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[0.99]"
                  : file
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_DOCUMENT_EXTENSIONS.join(",")}
                onChange={onFileChange}
                className="hidden"
              />

              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB · Click to replace
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Drag & drop a document here, or{" "}
                      <span className="text-primary underline">browse</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF (.pdf) or Plain Text (.txt) up to 10 MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Metadata Fields */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="doc-title" className="text-xs">
                  Document Title (optional)
                </Label>
                <Input
                  id="doc-title"
                  placeholder="Defaults to filename"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="doc-category" className="text-xs">
                    Category
                  </Label>
                  <Input
                    id="doc-category"
                    placeholder="e.g. Lecture Notes, Paper"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="doc-goal" className="text-xs">
                    Link to Goal (optional)
                  </Label>
                  <select
                    id="doc-goal"
                    value={goalId}
                    onChange={(e) => setGoalId(e.target.value)}
                    className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="none">None (Standalone)</option>
                    {availableGoals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="doc-desc" className="text-xs">
                  Description / Study Notes (optional)
                </Label>
                <Textarea
                  id="doc-desc"
                  placeholder="Brief context or key points about this document..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[60px] text-xs resize-none"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!file || isPending}
                className="gap-1.5"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Extracting & Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    Upload & Extract
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

