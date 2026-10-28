import "server-only";

import { getGeminiClient, parseGeminiJson } from "@/lib/ai/gemini";
import {
  geminiRecommendationsSchema,
  type GeminiRecommendations,
  type StudentAcademicProfile,
  type RecommendationItem,
} from "@/lib/validations/recommendations";

const RECOMMENDATIONS_SYSTEM_INSTRUCTION = `You are the expert academic advisor and personal learning strategist in ChiroMemo, a university student's Personal Learning and Knowledge Management System (PLKMS).
Your task is to analyze the student's current learning profile (active learning goals, roadmaps & pending milestones, notes written, saved study resources, and recent study activity) and produce personalized, high-yield study recommendations.

You MUST respond strictly with a valid JSON object matching the following schema:
{
  "overallAssessment": "A 2-3 sentence overview assessing the student's current learning momentum, strengths, and study balance.",
  "keyFocusArea": "The single most impactful subject, topic, or milestone the student should tackle in their next study block.",
  "recommendations": [
    {
      "id": "rec-1",
      "title": "Actionable recommendation title",
      "category": "NEXT_STEP | KNOWLEDGE_GAP | REVIEW_RECALL | STUDY_STRATEGY",
      "priority": "HIGH | MEDIUM | LOW",
      "description": "Clear explanation of what the student should do next.",
      "actionLabel": "Action CTA button text (e.g. 'Resume Roadmap', 'Review Note', 'Add Resource')",
      "actionHref": "/roadmaps/xxx or /notes?id=xxx or /goals/xxx",
      "targetEntity": {
        "type": "GOAL | ROADMAP | NOTE | RESOURCE | SUMMARY | GENERAL",
        "id": "entity-id-if-applicable",
        "title": "entity-title"
      },
      "reasoning": "Why this specific action will accelerate their academic mastery."
    }
  ]
}

Guidelines:
- Keep recommendations realistic, high-impact, and directly tied to university study success.
- If an active roadmap has incomplete steps, recommend tackling the next milestone ("NEXT_STEP").
- If a goal has few notes or resources, highlight the missing preparation ("KNOWLEDGE_GAP").
- If notes were written days ago, recommend active recall or spaced repetition ("REVIEW_RECALL").
- Do NOT wrap your output in markdown code blocks (\`\`\`json). Output pure JSON only.`;

/**
 * Heuristic fallback when Gemini is offline, rate-limited, or student has minimal data.
 */
function generateHeuristicRecommendations(
  profile: StudentAcademicProfile
): GeminiRecommendations {
  const recommendations: RecommendationItem[] = [];

  // 1. Roadmap next milestone
  if (profile.activeRoadmaps.length > 0) {
    const rm = profile.activeRoadmaps[0];
    recommendations.push({
      id: "rec-roadmap-next",
      title: `Advance Milestone: ${rm.title}`,
      category: "NEXT_STEP",
      priority: "HIGH",
      description: rm.pendingStepTitle
        ? `Complete your next milestone: "${rm.pendingStepTitle}" to maintain learning momentum.`
        : `Continue working through your milestones in "${rm.title}" (${rm.progressPercent}% completed).`,
      actionLabel: "Open Roadmap",
      actionHref: `/roadmaps/${rm.id}`,
      targetEntity: {
        type: "ROADMAP",
        id: rm.id,
        title: rm.title,
      },
      reasoning: "Consistently advancing sequential milestones ensures steady progress toward your semester objectives.",
    });
  }

  // 2. Goal focus or creation
  if (profile.activeGoals.length > 0) {
    const goal = profile.activeGoals[0];
    recommendations.push({
      id: "rec-goal-focus",
      title: `Review Academic Objective: ${goal.title}`,
      category: "KNOWLEDGE_GAP",
      priority: "MEDIUM",
      description: `Ensure you have linked lecture notes and study resources to support "${goal.title}".`,
      actionLabel: "View Goal",
      actionHref: `/goals/${goal.id}`,
      targetEntity: {
        type: "GOAL",
        id: goal.id,
        title: goal.title,
      },
      reasoning: "Aligning your daily study notes directly with high-priority goals prevents study time fragmentation.",
    });
  } else {
    recommendations.push({
      id: "rec-create-goal",
      title: "Set Your First Academic Goal",
      category: "STUDY_STRATEGY",
      priority: "HIGH",
      description: "Define an academic target (e.g. midterm exam prep, thesis chapter, course mastery) to track your study progress.",
      actionLabel: "Create Learning Goal",
      actionHref: "/goals",
      targetEntity: {
        type: "GOAL",
      },
      reasoning: "Students with clearly defined learning goals achieve significantly higher study consistency.",
    });
  }

  // 3. Spaced repetition / Note review
  if (profile.recentNotes.length > 0) {
    const note = profile.recentNotes[0];
    recommendations.push({
      id: "rec-note-review",
      title: `Active Recall Review: ${note.title}`,
      category: "REVIEW_RECALL",
      priority: "MEDIUM",
      description: `Test yourself on the key principles from your study note "${note.title}".`,
      actionLabel: "Review Note",
      actionHref: `/notes?id=${note.id}`,
      targetEntity: {
        type: "NOTE",
        id: note.id,
        title: note.title,
      },
      reasoning: "Reviewing lecture notes within 48-72 hours cements concepts into long-term memory via spaced repetition.",
    });
  }

  // 4. Summarization or AI search
  if (profile.recentResources.length > 0) {
    const res = profile.recentResources[0];
    recommendations.push({
      id: "rec-resource-synth",
      title: `Synthesize Material: ${res.title}`,
      category: "STUDY_STRATEGY",
      priority: "LOW",
      description: `Generate an AI summary or write personal synthesis notes for "${res.title}".`,
      actionLabel: "Open Resource",
      actionHref: `/resources/${res.id}`,
      targetEntity: {
        type: "RESOURCE",
        id: res.id,
        title: res.title,
      },
      reasoning: "Transforming passive reading materials into active study summaries dramatically increases comprehension.",
    });
  }

  return {
    overallAssessment:
      profile.activeGoals.length > 0
        ? `You have ${profile.activeGoals.length} active learning objectives and ${profile.activeRoadmaps.length} tracked roadmaps. Your learning trajectory is well-structured.`
        : "Welcome to ChiroMemo! Begin by defining your academic objectives and study roadmaps to unlock personalized AI recommendations.",
    keyFocusArea:
      profile.activeRoadmaps[0]?.title ||
      profile.activeGoals[0]?.title ||
      "Establish primary academic study goals",
    recommendations,
  };
}

export async function generatePersonalizedRecommendations(
  profile: StudentAcademicProfile
): Promise<GeminiRecommendations> {
  // If user has zero data across all entities, return the clean onboarding heuristic directly
  if (
    profile.activeGoals.length === 0 &&
    profile.activeRoadmaps.length === 0 &&
    profile.recentNotes.length === 0 &&
    profile.recentResources.length === 0
  ) {
    return generateHeuristicRecommendations(profile);
  }

  const prompt = [
    "Student Current Academic Profile:",
    JSON.stringify(profile, null, 2),
    "",
    "Based on this profile, generate high-yield, personalized university study recommendations.",
  ].join("\n");

  const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let rawResponseText = "";

  try {
    const ai = getGeminiClient();

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          config: {
            systemInstruction: RECOMMENDATIONS_SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        if (response && response.text) {
          rawResponseText = response.text;
          break;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.toLowerCase().includes("api key not valid") ||
          msg.toLowerCase().includes("invalid_argument")
        ) {
          console.warn("Gemini API key invalid for recommendations, using heuristic fallback.");
          break;
        }
        continue;
      }
    }
  } catch (clientErr) {
    console.warn("Gemini client initialization failed for recommendations:", clientErr);
    return generateHeuristicRecommendations(profile);
  }

  if (!rawResponseText) {
    return generateHeuristicRecommendations(profile);
  }

  try {
    const parsedJson = parseGeminiJson(rawResponseText);
    const validation = geminiRecommendationsSchema.safeParse(parsedJson);

    if (!validation.success) {
      console.warn("AI recommendation schema validation failed:", validation.error.format());
      return generateHeuristicRecommendations(profile);
    }

    return validation.data;
  } catch (parseErr) {
    console.warn("Failed to parse Gemini recommendation output:", parseErr);
    return generateHeuristicRecommendations(profile);
  }
}

