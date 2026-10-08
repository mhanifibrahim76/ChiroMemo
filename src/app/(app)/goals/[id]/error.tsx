"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon, ArrowLeftIcon } from "lucide-react";

export default function GoalDetailError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8 text-center">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-destructive">Something went wrong</h2>
        <p className="text-muted-foreground">We couldn&apos;t load this goal. Please try again.</p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={reset} className="gap-2">
            <RefreshCwIcon className="h-4 w-4" />
            Try again
          </Button>
          <Link href="/goals">
            <Button variant="outline" className="gap-2">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to goals
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}