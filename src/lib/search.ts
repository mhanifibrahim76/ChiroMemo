import "server-only";

import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { synthesizeSearchResults } from "@/lib/ai/search";
import type {
  SearchExecutionResult,
  SearchEntityType,
  SearchResultItem,
} from "@/lib/validations/search";

/**
 * Extracts a concise text snippet around the matched query term,
 * or truncates from the beginning if no exact match offset is found.
 */
function extractSnippet(text: string | null | undefined, query: string, maxLength = 160): string {
  if (!text || !text.trim()) return "";
  const cleaned = text.replace(/[*_#`[\]()]/g, " ").replace(/\s+/g, " ").trim();

  if (!query || !query.trim()) {
    return cleaned.length <= maxLength ? cleaned : cleaned.slice(0, maxLength) + "...";
  }

  const lowerText = cleaned.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    return cleaned.length <= maxLength ? cleaned : cleaned.slice(0, maxLength) + "...";
  }

  const start = Math.max(0, index - 40);
  const end = Math.min(cleaned.length, index + lowerQuery.length + 80);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < cleaned.length ? "..." : "";

  return prefix + cleaned.slice(start, end).trim() + suffix;
}

/**
 * Searches the student's personal knowledge base across notes, resources,
 * summaries, goals, and roadmaps, scoped strictly to the authenticated user.
 * Then enriches candidates with Gemini AI semantic synthesis and re-ranking.
 */
export async function searchKnowledgeBase(
  query: string,
  type: SearchEntityType = "ALL"
): Promise<SearchExecutionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const trimmedQuery = query.trim();
  const candidateItems: SearchResultItem[] = [];

  // Build targeted queries per entity type
  const shouldSearchNotes = type === "ALL" || type === "NOTE";
  const shouldSearchResources = type === "ALL" || type === "RESOURCE";
  const shouldSearchSummaries = type === "ALL" || type === "SUMMARY";
  const shouldSearchGoals = type === "ALL" || type === "GOAL";
  const shouldSearchRoadmaps = type === "ALL" || type === "ROADMAP";

  const promises: Promise<void>[] = [];

  // 1. Search Personal Notes
  if (shouldSearchNotes) {
    promises.push(
      (async () => {
        let req = supabase
          .from("notes")
          .select("id, title, content, tags, updated_at, created_at")
          .eq("user_id", user.id);

        if (trimmedQuery) {
          req = req.or(`title.ilike.%${trimmedQuery}%,content.ilike.%${trimmedQuery}%`);
        } else {
          req = req.order("updated_at", { ascending: false }).limit(6);
        }

        const { data, error } = await req.limit(10);
        if (!error && data) {
          for (const note of data) {
            candidateItems.push({
              id: note.id,
              type: "NOTE",
              title: note.title,
              snippet: extractSnippet(note.content, trimmedQuery),
              href: `/notes?id=${note.id}`,
              updatedAt: note.updated_at,
              metadata: {
                tags: note.tags,
              },
              score: 70,
            });
          }
        }
      })()
    );
  }

  // 2. Search Learning Resources
  if (shouldSearchResources) {
    promises.push(
      (async () => {
        let req = supabase
          .from("resources")
          .select("id, title, type, description, extracted_text, author, updated_at, created_at")
          .eq("user_id", user.id)
          .eq("is_archived", false);

        if (trimmedQuery) {
          req = req.or(
            `title.ilike.%${trimmedQuery}%,description.ilike.%${trimmedQuery}%,extracted_text.ilike.%${trimmedQuery}%,author.ilike.%${trimmedQuery}%`
          );
        } else {
          req = req.order("updated_at", { ascending: false }).limit(6);
        }

        const { data, error } = await req.limit(10);
        if (!error && data) {
          for (const res of data) {
            const body = res.extracted_text || res.description || "";
            candidateItems.push({
              id: res.id,
              type: "RESOURCE",
              title: res.title,
              snippet: extractSnippet(body, trimmedQuery),
              href: `/resources/${res.id}`,
              updatedAt: res.updated_at,
              metadata: {
                resourceType: res.type,
                author: res.author,
              },
              score: 65,
            });
          }
        }
      })()
    );
  }

  // 3. Search AI Summaries
  if (shouldSearchSummaries) {
    promises.push(
      (async () => {
        let req = supabase
          .from("summaries")
          .select("id, content, resource_id, updated_at, created_at, resources(title)")
          .eq("user_id", user.id);

        if (trimmedQuery) {
          req = req.ilike("content", `%${trimmedQuery}%`);
        } else {
          req = req.order("updated_at", { ascending: false }).limit(6);
        }

        const { data, error } = await req.limit(10);
        if (!error && data) {
          for (const s of data) {
            const resourceTitle = (s.resources as { title?: string } | null)?.title;
            const summaryTitle = resourceTitle
              ? `AI Summary: ${resourceTitle}`
              : "AI Document Summary";

            candidateItems.push({
              id: s.id,
              type: "SUMMARY",
              title: summaryTitle,
              snippet: extractSnippet(s.content, trimmedQuery),
              href: `/summaries/${s.id}`,
              updatedAt: s.updated_at,
              score: 75,
            });
          }
        }
      })()
    );
  }

  // 4. Search Learning Goals
  if (shouldSearchGoals) {
    promises.push(
      (async () => {
        let req = supabase
          .from("learning_goals")
          .select("id, title, description, status, updated_at, created_at")
          .eq("user_id", user.id);

        if (trimmedQuery) {
          req = req.or(`title.ilike.%${trimmedQuery}%,description.ilike.%${trimmedQuery}%`);
        } else {
          req = req.order("updated_at", { ascending: false }).limit(4);
        }

        const { data, error } = await req.limit(6);
        if (!error && data) {
          for (const g of data) {
            candidateItems.push({
              id: g.id,
              type: "GOAL",
              title: g.title,
              snippet: extractSnippet(g.description, trimmedQuery),
              href: `/goals/${g.id}`,
              updatedAt: g.updated_at,
              metadata: {
                goalStatus: g.status,
              },
              score: 60,
            });
          }
        }
      })()
    );
  }

  // 5. Search Learning Roadmaps
  if (shouldSearchRoadmaps) {
    promises.push(
      (async () => {
        let req = supabase
          .from("roadmaps")
          .select("id, title, description, progress_percent, updated_at, created_at")
          .eq("user_id", user.id);

        if (trimmedQuery) {
          req = req.or(`title.ilike.%${trimmedQuery}%,description.ilike.%${trimmedQuery}%`);
        } else {
          req = req.order("updated_at", { ascending: false }).limit(4);
        }

        const { data, error } = await req.limit(6);
        if (!error && data) {
          for (const r of data) {
            candidateItems.push({
              id: r.id,
              type: "ROADMAP",
              title: r.title,
              snippet: extractSnippet(r.description, trimmedQuery),
              href: `/roadmaps/${r.id}`,
              updatedAt: r.updated_at,
              metadata: {
                progressPercent: r.progress_percent,
              },
              score: 60,
            });
          }
        }
      })()
    );
  }

  await Promise.all(promises);

  // If no query string, sort by recency and return without AI synthesis
  if (!trimmedQuery) {
    candidateItems.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return {
      query: "",
      activeType: type,
      items: candidateItems.slice(0, 15),
      totalMatches: candidateItems.length,
      synthesis: null,
    };
  }

  // When query is present, call Gemini semantic synthesis to re-rank and summarize
  const { synthesis, rankedItems, modelUsed } = await synthesizeSearchResults(
    trimmedQuery,
    candidateItems
  );

  return {
    query: trimmedQuery,
    activeType: type,
    items: rankedItems,
    totalMatches: rankedItems.length,
    synthesis,
    modelUsed,
  };
}

