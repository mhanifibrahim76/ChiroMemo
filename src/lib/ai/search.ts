import "server-only";

import { getGeminiClient, parseGeminiJson } from "@/lib/ai/gemini";
import {
  geminiSearchSynthesisSchema,
  type GeminiSearchSynthesis,
  type SearchResultItem,
} from "@/lib/validations/search";

const SEARCH_SYSTEM_INSTRUCTION = `You are the intelligent academic search assistant in ChiroMemo, a Personal Learning and Knowledge Management System (PLKMS) for university students.
A student has searched their personal knowledge base using a natural-language query. You are provided with their search query and an array of candidate learning items (notes, resources, AI summaries, learning goals, roadmaps) that were retrieved from their database.

Your task is to:
1. Synthesize a direct, high-value academic answer (2-4 sentences) answering the student's query based directly on their retrieved study materials.
2. Extract 1-3 key conceptual insights or connections between the materials.
3. Evaluate each item's relevance to the student's intent, providing a concise 1-sentence relevance explanation and a score (0 to 100).
4. Suggest 2-3 logical follow-up study questions or search queries.

You MUST respond strictly with a valid JSON object matching the following schema:
{
  "directAnswer": "A concise 2-4 sentence academic answer synthesized directly from their notes and materials.",
  "keyInsights": [
    "Insight 1 explaining key connection",
    "Insight 2 explaining practical application"
  ],
  "rankedItemExplanations": [
    {
      "id": "<matching item id>",
      "relevanceExplanation": "Explains why this item matches the student's question",
      "relevanceScore": 95
    }
  ],
  "suggestedFollowUps": [
    "Next query suggestion 1",
    "Next query suggestion 2"
  ]
}

Guidelines:
- If the items provide clear information, cite the concepts clearly.
- If the items are only tangentially related, explain what was found and how it connects to the broader topic.
- Do NOT hallucinate information completely absent from the student's domain.
- Do NOT wrap your output in markdown code blocks (\`\`\`json). Output pure JSON only.`;

export interface SemanticSynthesisResponse {
  synthesis: GeminiSearchSynthesis | null;
  rankedItems: SearchResultItem[];
  modelUsed?: string;
}

export async function synthesizeSearchResults(
  query: string,
  candidateItems: SearchResultItem[]
): Promise<SemanticSynthesisResponse> {
  if (!query.trim() || candidateItems.length === 0) {
    return {
      synthesis: null,
      rankedItems: candidateItems,
    };
  }

  // Build condensed representation for Gemini context window
  const itemsContext = candidateItems.map((item, index) => ({
    index: index + 1,
    id: item.id,
    type: item.type,
    title: item.title,
    snippet: item.snippet.slice(0, 300),
    tags: item.metadata?.tags,
  }));

  const prompt = [
    `Student Search Query: "${query}"`,
    "",
    "Retrieved Study Items from Student's Knowledge Base:",
    JSON.stringify(itemsContext, null, 2),
  ].join("\n");

  const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let successfulModel = "";
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
            systemInstruction: SEARCH_SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        if (response && response.text) {
          rawResponseText = response.text;
          successfulModel = model;
          break;
        }
      } catch (err) {
        // If critical API key error, don't keep hammering
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.toLowerCase().includes("api key not valid") ||
          msg.toLowerCase().includes("invalid_argument")
        ) {
          console.warn("Gemini API key invalid for search synthesis, falling back to direct results:", msg);
          break;
        }
        // Try fallback model
        continue;
      }
    }
  } catch (clientError) {
    // If client initialization fails (e.g. placeholder key), gracefully fall back
    console.warn("Gemini client not initialized for search synthesis:", clientError);
    return {
      synthesis: null,
      rankedItems: candidateItems,
    };
  }

  if (!rawResponseText || !successfulModel) {
    return {
      synthesis: null,
      rankedItems: candidateItems,
    };
  }

  try {
    const parsedJson = parseGeminiJson(rawResponseText);
    const validation = geminiSearchSynthesisSchema.safeParse(parsedJson);

    if (!validation.success) {
      console.warn("AI search response schema validation failed:", validation.error.format());
      return {
        synthesis: null,
        rankedItems: candidateItems,
      };
    }

    const synthesisData = validation.data;

    // Map AI evaluations back to candidate items
    const scoreMap = new Map<string, { explanation: string; score: number }>();
    for (const expl of synthesisData.rankedItemExplanations) {
      scoreMap.set(expl.id, {
        explanation: expl.relevanceExplanation,
        score: expl.relevanceScore,
      });
    }

    // Re-rank items according to AI score while keeping non-evaluated items at the end
    const rankedItems: SearchResultItem[] = candidateItems
      .map((item) => {
        const aiEvaluation = scoreMap.get(item.id);
        return {
          ...item,
          relevanceReason: aiEvaluation?.explanation,
          score: aiEvaluation?.score ?? item.score ?? 50,
        };
      })
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    return {
      synthesis: synthesisData,
      rankedItems,
      modelUsed: successfulModel,
    };
  } catch (parseError) {
    console.warn("Failed to parse Gemini search synthesis JSON:", parseError);
    return {
      synthesis: null,
      rankedItems: candidateItems,
    };
  }
}

