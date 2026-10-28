import "server-only";

import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { generatePersonalizedRecommendations } from "@/lib/ai/recommendations";
import type {
  StudentAcademicProfile,
  GeminiRecommendations,
} from "@/lib/validations/recommendations";

/**
 * Compiles the student's holistic academic profile across all learning entities
 * for personalized AI study planning.
 */
export async function getStudentAcademicProfile(): Promise<StudentAcademicProfile> {
  const user = await requireUser();
  const supabase = await createClient();

  const [
    goalsResult,
    roadmapsResult,
    stepsResult,
    notesResult,
    resourcesResult,
    summariesResult,
    activitiesResult,
  ] = await Promise.all([
    supabase
      .from("learning_goals")
      .select("id, title, status, priority")
      .eq("user_id", user.id)
      .eq("status", "ACTIVE")
      .order("priority", { ascending: false })
      .limit(5),

    supabase
      .from("roadmaps")
      .select("id, title, progress_percent, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(4),

    supabase
      .from("roadmap_steps")
      .select("id, roadmap_id, title, status, order")
      .neq("status", "COMPLETED")
      .order("order", { ascending: true })
      .limit(10),

    supabase
      .from("notes")
      .select("id, title, tags, updated_at, resource_id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5),

    supabase
      .from("resources")
      .select("id, title, type, updated_at")
      .eq("user_id", user.id)
      .eq("is_archived", false)
      .order("updated_at", { ascending: false })
      .limit(5),

    supabase
      .from("summaries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),

    supabase
      .from("learning_activities")
      .select("type, occurred_at")
      .eq("user_id", user.id)
      .order("occurred_at", { ascending: false })
      .limit(8),
  ]);

  const rawGoals = goalsResult.data ?? [];
  const rawRoadmaps = roadmapsResult.data ?? [];
  const rawSteps = stepsResult.data ?? [];
  const rawNotes = notesResult.data ?? [];
  const rawResources = resourcesResult.data ?? [];
  const summariesCount = summariesResult.count ?? 0;
  const rawActivities = activitiesResult.data ?? [];

  // Match pending steps to roadmaps
  const pendingStepMap = new Map<string, string>();
  for (const step of rawSteps) {
    if (!pendingStepMap.has(step.roadmap_id)) {
      pendingStepMap.set(step.roadmap_id, step.title);
    }
  }

  const activeRoadmaps = rawRoadmaps.map((r) => ({
    id: r.id,
    title: r.title,
    progressPercent: r.progress_percent,
    pendingStepTitle: pendingStepMap.get(r.id),
  }));

  const activeGoals = rawGoals.map((g) => ({
    id: g.id,
    title: g.title,
    status: g.status,
    priority: g.priority ?? 0,
  }));

  const notesWithResource = new Set(
    rawNotes.map((n) => n.resource_id).filter(Boolean)
  );

  const recentNotes = rawNotes.map((n) => ({
    id: n.id,
    title: n.title,
    tags: n.tags ?? [],
    updatedAt: n.updated_at,
  }));

  const recentResources = rawResources.map((r) => ({
    id: r.id,
    title: r.title,
    type: r.type,
    hasNotes: notesWithResource.has(r.id),
  }));

  const recentActivityTypes = rawActivities.map((a) => a.type);

  // Calculate days since last activity
  let daysSinceLastActivity = 0;
  if (rawActivities.length > 0) {
    const lastDate = new Date(rawActivities[0].occurred_at);
    const diffMs = Date.now() - lastDate.getTime();
    daysSinceLastActivity = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  return {
    activeGoals,
    activeRoadmaps,
    recentNotes,
    recentResources,
    summariesCount,
    recentActivityTypes,
    daysSinceLastActivity,
  };
}

/**
 * Returns personalized academic study recommendations for the current student.
 */
export async function getPersonalizedRecommendations(): Promise<GeminiRecommendations> {
  const profile = await getStudentAcademicProfile();
  return generatePersonalizedRecommendations(profile);
}

