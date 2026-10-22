import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { getResource } from "@/lib/resources";
import { listGoals } from "@/lib/goals";
import { ResourceDetail } from "@/components/resources/resource-detail";

interface ResourceDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ResourceDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const resource = await getResource(id);
  return {
    title: resource ? `${resource.title} | ChiroMemo` : "Resource not found | ChiroMemo",
  };
}

export default async function ResourceDetailPage({ params }: ResourceDetailPageProps) {
  await requireUser();
  const { id } = await params;

  const [resource, goals] = await Promise.all([
    getResource(id),
    listGoals(),
  ]);

  if (!resource) {
    notFound();
  }

  const activeGoals = goals
    .filter((g) => g.status === "ACTIVE")
    .map((g) => ({ id: g.id, title: g.title }));

  return <ResourceDetail resource={resource} availableGoals={activeGoals} />;
}

