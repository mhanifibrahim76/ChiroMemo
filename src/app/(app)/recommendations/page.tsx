import type { Metadata } from "next";
import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getPersonalizedRecommendations } from "@/lib/recommendations";
import { RecommendationsOverview } from "@/components/recommendations/recommendations-overview";
import { RecommendationCard } from "@/components/recommendations/recommendation-card";
import { RecommendationsPageSkeleton } from "@/components/recommendations/recommendations-skeleton";

export const metadata: Metadata = {
  title: "AI Recommendations · ChiroMemo",
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
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
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
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Personalized Recommendations</h1>
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3 w-3" />
            Gemini AI
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Tailored study plans, milestone advancements, and active recall reminders synthesized from your academic progress.
        </p>
      </div>

      {/* Streaming Content Boundary */}
      <Suspense fallback={<RecommendationsPageSkeleton />}>
        <RecommendationsContent />
      </Suspense>
    </div>
  );
}

