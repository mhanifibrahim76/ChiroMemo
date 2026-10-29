import type { Metadata } from "next";
import { Suspense } from "react";

import { listResources } from "@/lib/resources";
import { listGoals } from "@/lib/goals";
import { ResourceList, ResourceCardsSkeleton } from "@/components/resources/resource-list";
import { EditorialPageHeader } from "@/components/layout/editorial-page-header";

export const metadata: Metadata = {
  title: "Learning resources · ChiroMemo",
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
      {/* Editorial Page Header */}
      <EditorialPageHeader
        chapter="CHAPTER 02.1 // PRIMARY SOURCES"
        title="Document & Resource"
        italicWord="Library."
        description="Store lecture PDFs, slide decks, research papers, and textbook chapters in private student storage, linked to your roadmap milestones."
        illustrationSrc="/illustrations/notes-resources-journal.jpg"
        figureCaption="FIG. 2.1 — ARCHIVE PLATE"
      />

      {/* Content skeleton during streaming/loading */}
      <Suspense fallback={<ResourceCardsSkeleton />}>
        <ResourcesContent />
      </Suspense>
    </div>
  );
}
