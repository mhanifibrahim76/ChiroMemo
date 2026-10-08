import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

export default function GoalNotFound() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8 text-center">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Goal not found</h2>
        <p className="text-muted-foreground">
          This goal doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link href="/goals">
          <Button variant="outline" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to goals
          </Button>
        </Link>
      </div>
    </div>
  );
}