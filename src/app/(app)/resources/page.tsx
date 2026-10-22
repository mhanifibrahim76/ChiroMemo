import type { Metadata } from "next";
import { Suspense } from "react";

import { listResources } from "@/lib/resources";
import { listGoals } from "@/lib/goals";
import { ResourceList, ResourceCardsSkeleton } from "@/components/resources/resource-list";

export const metadata: Metadata = {
  title: "Learning resources | ChiroMemo",
  description: "Collect, organize, and attach study materials to your goals and roadmaps.",
};

async function ResourcesContent() {
  const [resources, goals] = await Promise.all([
    listResources(),
    listGoals(),
  ]);

  const activeGoals = goals
    .filter((g) => g.status === "ACTIVE")
    .map((g) => ({ id: g.id, title: g.title }));

  return <ResourceList resources={resources} availableGoals={activeGoals} />;
}

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      {/* Stable Header toolbar */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Learning resources</h1>
        <p className="text-muted-foreground text-sm">
          Collect, organize, and link textbooks, video lectures, web documentation, and course materials.
        </p>
      </div>

      {/* Content skeleton during streaming/loading */}
      <Suspense fallback={<ResourceCardsSkeleton />}>
        <ResourcesContent />
      </Suspense>
    </div>
  );
}
