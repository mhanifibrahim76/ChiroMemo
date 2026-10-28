import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getSummary } from "@/lib/summaries";
import { SummarySplitView } from "@/components/summaries/summary-split-view";
import { SummaryDetailSkeleton } from "@/components/summaries/summaries-skeleton";

interface SummaryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function SummaryDetailContent({ id }: { id: string }) {
  const summary = await getSummary(id);

  if (!summary) {
    notFound();
  }

  return <SummarySplitView summary={summary} />;
}

export default async function SummaryDetailPage({ params }: SummaryDetailPageProps) {
  await requireUser();
  const { id } = await params;

  return (
    <Suspense fallback={<SummaryDetailSkeleton />}>
      <SummaryDetailContent id={id} />
    </Suspense>
  );
}

