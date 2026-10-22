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
 * Aggregates all dashboard metrics, recent activities, roadmap progress,
 * and 7-day activity trajectory for the authenticated user.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const user = await requireUser();
  const supabase = await createClient();

  // Run queries concurrently to avoid serial round trips
  const [
    goalsResult,
    roadmapsResult,
    resourcesResult,
    notesResult,
    activitiesResult,
  ] = await Promise.all([
    supabase
      .from("learning_goals")
      .select("id, title, status, updated_at, created_at")
      .eq("user_id", user.id),

    supabase
      .from("roadmaps")
      .select("id, title, progress_percent, updated_at, created_at")
      .eq("user_id", user.id),

    supabase
      .from("resources")
      .select("id, title, type, is_archived, created_at, updated_at")
      .eq("user_id", user.id)
      .eq("is_archived", false),

    supabase
      .from("notes")
      .select("id, title, created_at, updated_at")
      .eq("user_id", user.id),

    supabase
      .from("learning_activities")
      .select("id, type, entity_id, metadata, occurred_at")
      .eq("user_id", user.id)
      .order("occurred_at", { ascending: false })
      .limit(20),
  ]);

  // Auth / Permission check
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
    throw new Error(`Could not load dashboard data: ${anyError.message}`);
  }

  const goals = goalsResult.data ?? [];
  const roadmaps = roadmapsResult.data ?? [];
  const resources = resourcesResult.data ?? [];
  const notes = notesResult.data ?? [];
  const loggedActivities = activitiesResult.data ?? [];

  // 1. Calculate Metrics
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

  const totalResourcesCount = resources.length;
  const totalNotesCount = notes.length;

  const metrics: DashboardMetrics = {
    activeGoalsCount,
    totalGoalsCount,
    averageRoadmapProgress,
    totalRoadmapsCount,
    totalResourcesCount,
    totalNotesCount,
  };

  // 2. Synthesize Recent Activity Feed
  // Combines explicitly logged activities with recent user records to guarantee
  // an up-to-date feed even before activity logs are populated.
  const activityItems: ActivityItem[] = [];

  // Add recorded activities if present
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

  // Add recent notes
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

  // Add recent resources
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

  // Add recent roadmaps
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

  // Add recent goals
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

  // Sort descending by timestamp, remove duplicate links, and take top 6
  const seenHrefs = new Set<string>();
  const recentActivities: ActivityItem[] = activityItems
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

  // 3. Compute 7-day Activity Trajectory for Chart
  const dailyActivity: DailyLearningActivity[] = [];
  const now = new Date();

  // Days array: from 6 days ago up to today
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

    // Also include logged activities on this day
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

  // 4. Roadmap progress summaries
  const roadmapSummaries: RoadmapProgressSummary[] = roadmaps.map((r) => ({
    id: r.id,
    title: r.title,
    progressPercent: r.progress_percent,
    updatedAt: r.updated_at,
  }));

  return {
    metrics,
    recentActivities,
    dailyActivity,
    roadmaps: roadmapSummaries,
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

