"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import {
  Sparkles,
  FileText,
  Upload,
  BookOpen,
  AlertCircle,
  Loader2,
  CheckCircle2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateSummaryAction } from "@/lib/summaries/actions";
import { initialSummaryActionState } from "@/lib/summaries/constants";

export interface SummarizableResourceItem {
  id: string;
  title: string;
  type: string;
  hasExtractedText: boolean;
  textLength: number;
}

interface GenerateSummaryDialogProps {
  resources: SummarizableResourceItem[];
  defaultResourceId?: string;
  trigger?: React.ReactNode;
}

function SubmitButton({ isDirectText }: { isDirectText: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="gap-2 font-medium min-w-[140px]"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
          <span>Generating AI...</span>
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 text-primary-foreground" />
          <span>{isDirectText ? "Summarize Text" : "Summarize Resource"}</span>
        </>
      )}
    </Button>
  );
}

export function GenerateSummaryDialog({
  resources,
  defaultResourceId,
  trigger,
}: GenerateSummaryDialogProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"resource" | "text">(
    defaultResourceId ? "resource" : "resource"
  );
  const [selectedResourceId, setSelectedResourceId] = useState<string>(
    defaultResourceId || (resources[0]?.id ?? "")
  );
  const [pastedText, setPastedText] = useState("");
  const [title, setTitle] = useState("");

  const router = useRouter();
  const [state, formAction] = useActionState(
    generateSummaryAction,
    initialSummaryActionState
  );

  const eligibleResources = resources.filter((r) => r.hasExtractedText);

  useEffect(() => {
    if (state.status === "success" && state.summaryId) {
      router.push(`/summaries/${state.summaryId}`);
    }
  }, [state.status, state.summaryId, router]);

  const selectedResource = resources.find((r) => r.id === selectedResourceId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Summary
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Gemini AI Summarizer
            </span>
          </div>
          <DialogTitle className="text-xl">Generate Document Summary</DialogTitle>
          <DialogDescription>
            Transform complex academic papers, lecture PDFs, or study notes into
            concise, structured summaries with key takeaways.
          </DialogDescription>
        </DialogHeader>

        {state.status === "error" && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Failed to generate summary</p>
              <p className="text-xs mt-0.5">{state.message}</p>
            </div>
          </div>
        )}

        <Tabs
          value={tab}
          onValueChange={(val) => setTab(val as "resource" | "text")}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resource" className="gap-1.5 text-xs sm:text-sm">
              <BookOpen className="h-4 w-4" />
              From Resource
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-1.5 text-xs sm:text-sm">
              <FileText className="h-4 w-4" />
              Paste Text
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: From Saved Resource */}
          <TabsContent value="resource" className="space-y-4 pt-1">
            {eligibleResources.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center space-y-3 bg-muted/20">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">No document resources found</p>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Upload a PDF or text document in Resources, or switch to the
                    &quot;Paste Text&quot; tab to summarize raw text.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTab("text")}
                  className="text-xs"
                >
                  Switch to Paste Text
                </Button>
              </div>
            ) : (
              <form action={formAction} className="space-y-4">
                <input type="hidden" name="resourceId" value={selectedResourceId} />

                <div className="space-y-2">
                  <Label htmlFor="resourceSelect">Select Resource Document</Label>
                  <Select
                    value={selectedResourceId}
                    onValueChange={setSelectedResourceId}
                  >
                    <SelectTrigger id="resourceSelect" className="w-full">
                      <SelectValue placeholder="Choose a resource..." />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleResources.map((res) => (
                        <SelectItem key={res.id} value={res.id}>
                          <span className="font-medium truncate">{res.title}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({res.type}, ~{Math.round(res.textLength / 5)} words)
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedResource && (
                  <div className="rounded-md border bg-muted/40 p-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Document Type:</span>
                      <span className="font-medium text-foreground">
                        {selectedResource.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Extracted Character Count:</span>
                      <span className="font-medium text-foreground">
                        {selectedResource.textLength.toLocaleString()} chars
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 pt-1 border-t">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Ready for AI processing</span>
                    </div>
                  </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <SubmitButton isDirectText={false} />
                </DialogFooter>
              </form>
            )}
          </TabsContent>

          {/* Tab 2: Paste Raw Text */}
          <TabsContent value="text" className="space-y-4 pt-1">
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="documentTitle">Document Title (Optional)</Label>
                <Input
                  id="documentTitle"
                  name="title"
                  placeholder="e.g. Chapter 4: Distributed Systems"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="documentText">Document Content / Study Notes</Label>
                  <span className="text-xs text-muted-foreground">
                    {pastedText.length.toLocaleString()} characters
                  </span>
                </div>
                <Textarea
                  id="documentText"
                  name="text"
                  rows={8}
                  placeholder="Paste lecture notes, study guide, or document text here (minimum 20 characters)..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="font-mono text-xs leading-relaxed"
                  required
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <SubmitButton isDirectText={true} />
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
