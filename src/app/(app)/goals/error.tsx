"use client";

import { Button } from "@/components/ui/button";
import { RefreshCwIcon } from "lucide-react";

export default function GoalsError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8 text-center">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-destructive">Something went wrong</h2>
        <p className="text-muted-foreground">We couldn&apos;t load your learning goals. Please try again.</p>
        <Button variant="outline" onClick={reset} className="gap-2">
          <RefreshCwIcon className="h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}