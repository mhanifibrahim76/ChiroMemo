import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth/session";
import { getPersonalizedRecommendations } from "@/lib/recommendations";
import { RecommendationsOverview } from "@/components/recommendations/recommendations-overview";
import { RecommendationCard } from "@/components/recommendations/recommendation-card";
import { RecommendationsPageSkeleton } from "@/components/recommendations/recommendations-skeleton";
import { EditorialPageHeader } from "@/components/layout/editorial-page-header";

export const metadata: Metadata = {
  title: "AI recommendations · ChiroMemo",
  description:
    "Personalized study advice, milestone next steps, and knowledge gap detection powered by Gemini AI.",
};

async function RecommendationsContent() {
  const data = await getPersonalizedRecommendations();

  return (
    <div className="space-y-6">
      {/* AI Assessment & Focus Area */}
      <RecommendationsOverview data={data} />

      {/* Recommendations Cards Header */}
      <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-2">
        <h2 className="text-xs font-mono font-medium text-[#1C1917]/70 uppercase tracking-wider">
          Actionable Study Priorities ({data.recommendations.length})
        </h2>
      </div>

      {/* Grid of Actionable Recommendations */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data.recommendations.map((rec) => (
          <RecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </div>
    </div>
  );
}

export default async function RecommendationsPage() {
  await requireUser();

  return (
    <div className="space-y-6">
      {/* Editorial Page Header */}
      <EditorialPageHeader
        chapter="CHAPTER 03.2 // ACADEMIC ADVISORY"
        title="Personalized Study"
        italicWord="Strategy."
        description="Tailored milestone progressions, active recall reviews, and curriculum gap alerts synthesized from your study activity and roadmaps by Gemini AI."
        illustrationSrc="/illustrations/ai-search-discovery.jpg"
        figureCaption="FIG. 3.2 — STUDY STRATEGY"
      />

      {/* Streaming Content Boundary */}
      <Suspense fallback={<RecommendationsPageSkeleton />}>
        <RecommendationsContent />
      </Suspense>
    </div>
  );
}
