import { RecommendationsPageSkeleton } from "@/components/recommendations/recommendations-skeleton";
import { EditorialPageHeader } from "@/components/layout/editorial-page-header";

export default function RecommendationsLoading() {
  return (
    <div className="space-y-6">
      {/* Editorial Page Header renders instantly and matches loaded page */}
      <EditorialPageHeader
        chapter="CHAPTER 03.2 // ACADEMIC ADVISORY"
        title="Personalized Study"
        italicWord="Strategy."
        description="Tailored milestone progressions, active recall reviews, and curriculum gap alerts synthesized from your study activity and roadmaps by Gemini AI."
        illustrationSrc="/illustrations/ai-search-discovery.jpg"
        figureCaption="FIG. 3.2 — STUDY STRATEGY"
      />

      {/* Dynamic Data Regions Skeleton */}
      <RecommendationsPageSkeleton />
    </div>
  );
}


