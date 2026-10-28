import "server-only";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/lib/supabase/database.types";

export interface DashboardMetrics {
  activeGoalsCount: number;
  totalGoalsCount: number;
  averageRoadmapProgress: number; // 0-100 integer
  totalRoadmapsCount: number;
  totalResourcesCount: number;
  totalNotesCount: number;
}

export type ActivityEntityType = "NOTE" | "RESOURCE" | "ROADMAP" | "GOAL" | "STEP";

export interface ActivityItem {
  id: string;
  type: ActivityEntityType;
  title: string;
  description: string;
  timestamp: string; // ISO 8601 string
  href: string;
}

export interface DailyLearningActivity {
  date: string; // YYYY-MM-DD
  day: string; // e.g. "Mon"
  label: string; // e.g. "22 Oct"
  total: number;
  notes: number;
  resources: number;
  roadmaps: number;
}

export interface RoadmapProgressSummary {
  id: string;
  title: string;
  progressPercent: number;
  updatedAt: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  recentActivities: ActivityItem[];
  dailyActivity: DailyLearningActivity[];
  roadmaps: RoadmapProgressSummary[];
}

/**
 * 1. Fetch summary counters for the top dashboard metric cards.
 * Uses exact count headers or narrow column projection to resolve in minimal time (<40ms).
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const user = await requireUser();
  const supabase = await createClient();

  const [goalsResult, roadmapsResult, resourcesResult, notesResult] =
    await Promise.all([
      supabase
        .from("learning_goals")
        .select("status")
        .eq("user_id", user.id),
      supabase
        .from("roadmaps")
        .select("progress_percent")
        .eq("user_id", user.id),
      supabase
        .from("resources")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_archived", false),
      supabase
        .from("notes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  const anyError =
    goalsResult.error ||
    roadmapsResult.error ||
    resourcesResult.error ||
    notesResult.error;

  if (anyError) {
    if (
      anyError.code === "42501" ||
      anyError.message.toLowerCase().includes("permission denied")
    ) {
      redirect("/login");
    }
    throw new Error(`Could not load dashboard metrics: ${anyError.message}`);
  }

  const goals = goalsResult.data ?? [];
  const roadmaps = roadmapsResult.data ?? [];
  const totalResourcesCount = resourcesResult.count ?? 0;
  const totalNotesCount = notesResult.count ?? 0;

  const totalGoalsCount = goals.length;
  const activeGoalsCount = goals.filter((g) => g.status === "ACTIVE").length;

  const totalRoadmapsCount = roadmaps.length;
  const averageRoadmapProgress =
    totalRoadmapsCount > 0
      ? Math.round(
          roadmaps.reduce((acc, r) => acc + (r.progress_percent ?? 0), 0) /
            totalRoadmapsCount
        )
      : 0;

  return {
    activeGoalsCount,
    totalGoalsCount,
    averageRoadmapProgress,
    totalRoadmapsCount,
    totalResourcesCount,
    totalNotesCount,
  };
}

/**
 * 2. Fetch 7-day activity trajectory and roadmap progress summaries for the analytics chart.
 * Scoped to records created or updated within the last 7 days to avoid unbounded table scans.
 */
export async function getDashboardChartData(): Promise<{
  dailyActivity: DailyLearningActivity[];
  roadmaps: RoadmapProgressSummary[];
}> {
  const user = await requireUser();
  const supabase = await createClient();

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const sevenDaysAgoIso = sevenDaysAgo.toISOString();

  const [roadmapsResult, notesResult, resourcesResult, activitiesResult] =
    await Promise.all([
      supabase
        .from("roadmaps")
        .select("id, title, progress_percent, updated_at, created_at")
        .eq("user_id", user.id),
      supabase
        .from("notes")
        .select("id, created_at, updated_at")
        .eq("user_id", user.id)
        .gte("created_at", sevenDaysAgoIso),
      supabase
        .from("resources")
        .select("id, created_at")
        .eq("user_id", user.id)
        .eq("is_archived", false)
        .gte("created_at", sevenDaysAgoIso),
      supabase
        .from("learning_activities")
        .select("id, occurred_at")
        .eq("user_id", user.id)
        .gte("occurred_at", sevenDaysAgoIso),
    ]);

  const anyError =
    roadmapsResult.error ||
    notesResult.error ||
    resourcesResult.error ||
    activitiesResult.error;

  if (anyError) {
    if (
      anyError.code === "42501" ||
      anyError.message.toLowerCase().includes("permission denied")
    ) {
      redirect("/login");
    }
    throw new Error(`Could not load chart analytics: ${anyError.message}`);
  }

  const roadmaps = roadmapsResult.data ?? [];
  const notes = notesResult.data ?? [];
  const resources = resourcesResult.data ?? [];
  const loggedActivities = activitiesResult.data ?? [];

  const dailyActivity: DailyLearningActivity[] = [];
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - i);
    const dateStr = targetDate.toISOString().slice(0, 10); // YYYY-MM-DD
    const dayStr = targetDate.toLocaleDateString("en-US", { weekday: "short" });
    const labelStr = targetDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    let notesCount = 0;
    let resourcesCount = 0;
    let roadmapsCount = 0;

    for (const n of notes) {
      const d = (n.updated_at ?? n.created_at).slice(0, 10);
      if (d === dateStr) notesCount++;
    }

    for (const r of resources) {
      const d = (r.created_at ?? "").slice(0, 10);
      if (d === dateStr) resourcesCount++;
    }

    for (const rm of roadmaps) {
      const d = (rm.updated_at ?? rm.created_at).slice(0, 10);
      if (d === dateStr) roadmapsCount++;
    }

    let loggedCount = 0;
    for (const act of loggedActivities) {
      const d = (act.occurred_at ?? "").slice(0, 10);
      if (d === dateStr) loggedCount++;
    }

    const total = notesCount + resourcesCount + roadmapsCount + loggedCount;

    dailyActivity.push({
      date: dateStr,
      day: dayStr,
      label: labelStr,
      total,
      notes: notesCount,
      resources: resourcesCount,
      roadmaps: roadmapsCount,
    });
  }

  const roadmapSummaries: RoadmapProgressSummary[] = roadmaps.map((r) => ({
    id: r.id,
    title: r.title,
    progressPercent: r.progress_percent,
    updatedAt: r.updated_at,
  }));

  return {
    dailyActivity,
    roadmaps: roadmapSummaries,
  };
}

/**
 * 3. Fetch synthesized recent activity stream.
 * Scoped with strict .limit(10) / .limit(5) to prevent unbounded memory consumption.
 */
export async function getDashboardRecentActivities(): Promise<ActivityItem[]> {
  const user = await requireUser();
  const supabase = await createClient();

  const [
    activitiesResult,
    notesResult,
    resourcesResult,
    roadmapsResult,
    goalsResult,
  ] = await Promise.all([
    supabase
      .from("learning_activities")
      .select("id, type, entity_id, metadata, occurred_at")
      .eq("user_id", user.id)
      .order("occurred_at", { ascending: false })
      .limit(10),
    supabase
      .from("notes")
      .select("id, title, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("resources")
      .select("id, title, type, created_at")
      .eq("user_id", user.id)
      .eq("is_archived", false)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("roadmaps")
      .select("id, title, progress_percent, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("learning_goals")
      .select("id, title, status, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  const anyError =
    activitiesResult.error ||
    notesResult.error ||
    resourcesResult.error ||
    roadmapsResult.error ||
    goalsResult.error;

  if (anyError) {
    if (
      anyError.code === "42501" ||
      anyError.message.toLowerCase().includes("permission denied")
    ) {
      redirect("/login");
    }
    throw new Error(`Could not load recent activities: ${anyError.message}`);
  }

  const loggedActivities = activitiesResult.data ?? [];
  const notes = notesResult.data ?? [];
  const resources = resourcesResult.data ?? [];
  const roadmaps = roadmapsResult.data ?? [];
  const goals = goalsResult.data ?? [];

  const activityItems: ActivityItem[] = [];

  for (const act of loggedActivities) {
    const meta = (act.metadata ?? {}) as Record<string, unknown>;
    const title =
      typeof meta.title === "string" ? meta.title : `Activity: ${act.type}`;
    let href = "/dashboard";
    let entityType: ActivityEntityType = "NOTE";

    if (act.type.includes("GOAL")) {
      entityType = "GOAL";
      href = act.entity_id ? `/goals/${act.entity_id}` : "/goals";
    } else if (act.type.includes("STEP") || act.type.includes("ROADMAP")) {
      entityType = "ROADMAP";
      href = act.entity_id ? `/roadmaps/${act.entity_id}` : "/roadmaps";
    } else if (act.type.includes("RESOURCE")) {
      entityType = "RESOURCE";
      href = act.entity_id ? `/resources/${act.entity_id}` : "/resources";
    } else if (act.type.includes("NOTE")) {
      entityType = "NOTE";
      href = act.entity_id ? `/notes?id=${act.entity_id}` : "/notes";
    }

    activityItems.push({
      id: `act-${act.id}`,
      type: entityType,
      title,
      description: formatActivityDescription(act.type),
      timestamp: act.occurred_at,
      href,
    });
  }

  for (const n of notes) {
    activityItems.push({
      id: `note-${n.id}`,
      type: "NOTE",
      title: n.title,
      description: "Note updated in knowledge base",
      timestamp: n.updated_at ?? n.created_at,
      href: `/notes?id=${n.id}`,
    });
  }

  for (const r of resources) {
    activityItems.push({
      id: `res-${r.id}`,
      type: "RESOURCE",
      title: r.title,
      description: `${r.type} resource added`,
      timestamp: r.created_at,
      href: `/resources/${r.id}`,
    });
  }

  for (const rm of roadmaps) {
    activityItems.push({
      id: `rm-${rm.id}`,
      type: "ROADMAP",
      title: rm.title,
      description: `Roadmap at ${rm.progress_percent}% completion`,
      timestamp: rm.updated_at ?? rm.created_at,
      href: `/roadmaps/${rm.id}`,
    });
  }

  for (const g of goals) {
    activityItems.push({
      id: `goal-${g.id}`,
      type: "GOAL",
      title: g.title,
      description: `Learning goal (${g.status.toLowerCase()})`,
      timestamp: g.updated_at ?? g.created_at,
      href: `/goals/${g.id}`,
    });
  }

  const seenHrefs = new Set<string>();
  return activityItems
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .filter((item) => {
      if (seenHrefs.has(item.href)) {
        return false;
      }
      seenHrefs.add(item.href);
      return true;
    })
    .slice(0, 6);
}

/**
 * Aggregates all dashboard metrics, recent activities, roadmap progress,
 * and 7-day activity trajectory for the authenticated user.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const [metrics, chartData, recentActivities] = await Promise.all([
    getDashboardMetrics(),
    getDashboardChartData(),
    getDashboardRecentActivities(),
  ]);

  return {
    metrics,
    recentActivities,
    dailyActivity: chartData.dailyActivity,
    roadmaps: chartData.roadmaps,
  };
}

/**
 * Non-blocking helper to log an activity into public.learning_activities.
 */
export async function recordLearningActivity(input: {
  type: Database["public"]["Enums"]["ActivityType"];
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    const user = await requireUser();
    const supabase = await createClient();

    await supabase.from("learning_activities").insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      type: input.type,
      entity_id: input.entityId ?? null,
      metadata: (input.metadata as Json) ?? null,
    });
  } catch (error) {
    // Non-blocking: recording an activity should never disrupt the primary user mutation
    console.error("Failed to record learning activity:", error);
  }
}

function formatActivityDescription(
  type: Database["public"]["Enums"]["ActivityType"]
): string {
  switch (type) {
    case "GOAL_CREATED":
      return "Created a new learning goal";
    case "GOAL_UPDATED":
      return "Updated learning goal";
    case "STEP_COMPLETED":
      return "Completed a roadmap milestone";
    case "RESOURCE_ADDED":
      return "Saved a new learning resource";
    case "NOTE_CREATED":
      return "Wrote a new personal note";
    case "SUMMARY_GENERATED":
      return "Generated AI document summary";
    case "STUDY_SESSION":
      return "Completed a study session";
    default:
      return "Activity recorded";
  }
}

