"use client";

import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { BookOpen, Plus, Trash2, ExternalLink, LinkIcon } from "lucide-react";

import type { ResourceRow } from "@/lib/resources";
import {
  associateResourceWithStepAction,
  dissociateResourceFromStepAction,
} from "@/lib/resources/actions";
import { initialResourceActionState } from "@/lib/resources/constants";
import { ResourceTypeBadge } from "./resource-type-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface StepResourceDialogProps {
  stepId: string;
  roadmapId: string;
  stepTitle: string;
  attachedResources: ResourceRow[];
  allUserResources: ResourceRow[];
  trigger?: React.ReactNode;
}

function AttachSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="secondary" disabled={pending} className="h-7 text-xs gap-1">
      <Plus className="h-3 w-3" />
      {pending ? "Attaching…" : "Attach"}
    </Button>
  );
}

function DetachSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="icon"
      variant="ghost"
      disabled={pending}
      className="h-7 w-7 text-muted-foreground hover:text-destructive"
      title="Detach resource"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}

export function StepResourceDialog({
  stepId,
  roadmapId,
  stepTitle,
  attachedResources,
  allUserResources,
  trigger,
}: StepResourceDialogProps) {
  const [open, setOpen] = useState(false);

  const [, attachFormAction] = useActionState(
    associateResourceWithStepAction,
    initialResourceActionState
  );
  const [, detachFormAction] = useActionState(
    dissociateResourceFromStepAction,
    initialResourceActionState
  );

  const attachedIds = new Set(attachedResources.map((r) => r.id));
  const unattachedResources = allUserResources.filter((r) => !attachedIds.has(r.id));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
            <BookOpen className="h-3.5 w-3.5" />
            Resources ({attachedResources.length})
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-primary" />
            Step Resources
          </DialogTitle>
          <DialogDescription>
            Attach learning resources and study materials to &ldquo;{stepTitle}&rdquo;.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Attached Resources Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">
                Attached materials ({attachedResources.length})
              </h4>
            </div>

            {attachedResources.length > 0 ? (
              <div className="divide-y rounded-md border">
                {attachedResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between gap-3 p-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <ResourceTypeBadge type={resource.type} />
                        {resource.category && (
                          <Badge variant="outline" className="text-xs font-normal">
                            {resource.category}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium leading-snug truncate">
                        {resource.title}
                      </p>
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5"
                        >
                          Open link <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                    <form action={detachFormAction} className="shrink-0">
                      <input type="hidden" name="step_id" value={stepId} />
                      <input type="hidden" name="resource_id" value={resource.id} />
                      <input type="hidden" name="roadmap_id" value={roadmapId} />
                      <DetachSubmitButton />
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                No resources currently attached to this step.
              </div>
            )}
          </div>

          {/* Available Unattached Resources Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">
              Available from your library ({unattachedResources.length})
            </h4>

            {unattachedResources.length > 0 ? (
              <div className="max-h-60 overflow-y-auto divide-y rounded-md border">
                {unattachedResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between gap-3 p-2.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <ResourceTypeBadge type={resource.type} />
                        <span className="text-xs font-medium text-foreground truncate">
                          {resource.title}
                        </span>
                      </div>
                      {resource.author && (
                        <p className="text-xs text-muted-foreground truncate pl-1">
                          by {resource.author}
                        </p>
                      )}
                    </div>

                    <form action={attachFormAction} className="shrink-0">
                      <input type="hidden" name="step_id" value={stepId} />
                      <input type="hidden" name="resource_id" value={resource.id} />
                      <input type="hidden" name="roadmap_id" value={roadmapId} />
                      <AttachSubmitButton />
                    </form>
                  </div>
                ))}
              </div>
            ) : allUserResources.length === 0 ? (
              <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                <p>Your resource library is empty.</p>
                <Link
                  href="/resources"
                  className="mt-1.5 inline-block text-primary font-medium hover:underline"
                >
                  Go to Resources to add your first material
                </Link>
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                All existing library resources are already attached to this step!
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

