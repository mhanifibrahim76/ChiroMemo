import test from "node:test";
import assert from "node:assert";

import { loginSchema, registerSchema } from "../src/lib/validations/auth.ts";
import { createGoalSchema, updateGoalSchema } from "../src/lib/validations/goals.ts";
import { createResourceSchema, updateResourceSchema } from "../src/lib/validations/resources.ts";
import { createNoteSchema, updateNoteSchema } from "../src/lib/validations/notes.ts";
import { geminiSummaryResultSchema } from "../src/lib/validations/summaries.ts";
import { searchQueryParamsSchema, geminiSearchSynthesisSchema } from "../src/lib/validations/search.ts";
import { geminiRecommendationsSchema } from "../src/lib/validations/recommendations.ts";

test("auth validations: login and register", () => {
  const validRegister = registerSchema.safeParse({
    name: "Hanif Ibrahim",
    email: "student@university.edu",
    password: "StrongPassword123!",
    confirmPassword: "StrongPassword123!",
  });
  assert.strictEqual(validRegister.success, true);

  const mismatchRegister = registerSchema.safeParse({
    name: "Hanif Ibrahim",
    email: "student@university.edu",
    password: "StrongPassword123!",
    confirmPassword: "DifferentPassword123!",
  });
  assert.strictEqual(mismatchRegister.success, false);

  const validLogin = loginSchema.safeParse({
    email: "student@university.edu",
    password: "StrongPassword123!",
  });
  assert.strictEqual(validLogin.success, true);

  const invalidEmail = loginSchema.safeParse({
    email: "invalid-email",
    password: "StrongPassword123!",
  });
  assert.strictEqual(invalidEmail.success, false);
});

test("learning goals validations", () => {
  const validGoal = createGoalSchema.safeParse({
    title: "Master Operating Systems",
    description: "Prepare for final exams covering concurrency and virtual memory.",
    priority: 1,
    status: "ACTIVE",
  });
  assert.strictEqual(validGoal.success, true);

  const validGoalUpdate = updateGoalSchema.safeParse({
    status: "COMPLETED",
    priority: 2,
  });
  assert.strictEqual(validGoalUpdate.success, true);

  const emptyGoal = createGoalSchema.safeParse({
    title: "   ",
  });
  assert.strictEqual(emptyGoal.success, false);
});

test("learning resources validations", () => {
  const validResource = createResourceSchema.safeParse({
    title: "Database System Concepts 7th Edition",
    type: "BOOK",
    author: "Silberschatz, Korth, Sudarshan",
    category: "Computer Science",
  });
  assert.strictEqual(validResource.success, true);

  const validResourceUpdate = updateResourceSchema.safeParse({
    title: "Database System Concepts 8th Edition",
  });
  assert.strictEqual(validResourceUpdate.success, true);

  const invalidType = createResourceSchema.safeParse({
    title: "Random link",
    type: "UNKNOWN_TYPE",
  });
  assert.strictEqual(invalidType.success, false);
});

test("personal notes validations", () => {
  const validNote = createNoteSchema.safeParse({
    title: "B-Tree Indexing Principles",
    content: "## Overview of B-Trees\n\nBalanced search trees optimized for disk I/O.",
    tags: ["database", "algorithms", "exam-prep"],
  });
  assert.strictEqual(validNote.success, true);

  const validNoteUpdate = updateNoteSchema.safeParse({
    content: "Updated notes on node deletion.",
  });
  assert.strictEqual(validNoteUpdate.success, true);

  const emptyTitle = createNoteSchema.safeParse({
    title: "",
    content: "Content with empty title",
  });
  assert.strictEqual(emptyTitle.success, false);
});

test("AI document summary result validation", () => {
  const validSummary = geminiSummaryResultSchema.safeParse({
    overview: "This lecture covers relational database theory and normalization.",
    keyPoints: [
      "1NF eliminates repeating groups",
      "2NF eliminates partial dependencies",
      "3NF eliminates transitive dependencies",
    ],
    detailedSummary: "## Normalization Forms\n\nDetailed breakdown of 1NF through BCNF...",
    actionableTakeaways: [
      "Practice functional dependency decomposition",
      "Review closure algorithm before lab",
    ],
  });
  assert.strictEqual(validSummary.success, true);

  const missingOverview = geminiSummaryResultSchema.safeParse({
    keyPoints: ["Point 1"],
    detailedSummary: "Content",
  });
  assert.strictEqual(missingOverview.success, false);
});

test("AI intelligent search validations", () => {
  const validSearchQuery = searchQueryParamsSchema.safeParse({
    q: "database indexing and performance",
    type: "NOTE",
  });
  assert.strictEqual(validSearchQuery.success, true);

  const validSynthesis = geminiSearchSynthesisSchema.safeParse({
    directAnswer: "Indexing improves retrieval speed via balanced search trees and hash maps.",
    keyInsights: ["B-Tree is best for range queries", "Hash index is best for exact equality"],
    rankedItemExplanations: [
      {
        id: "note-1",
        relevanceExplanation: "Directly details B-Tree indexing algorithms",
        relevanceScore: 95,
      },
    ],
    suggestedFollowUps: ["What is composite indexing?", "How does query optimizer use indexes?"],
  });
  assert.strictEqual(validSynthesis.success, true);
});

test("AI personalized recommendations validation", () => {
  const validRecommendations = geminiRecommendationsSchema.safeParse({
    overallAssessment: "You are making strong progress on your database course with 3 active roadmaps.",
    keyFocusArea: "Relational Query Optimization",
    recommendations: [
      {
        id: "rec-1",
        title: "Complete Roadmap Step: Query Execution Engine",
        category: "NEXT_STEP",
        priority: "HIGH",
        description: "Study how Volcano-style iterator model executes relational operators.",
        actionLabel: "Open Roadmap",
        actionHref: "/roadmaps/rm-123",
        reasoning: "Next milestone in your active course roadmap.",
      },
      {
        id: "rec-2",
        title: "Active Recall: B-Tree Indexing",
        category: "REVIEW_RECALL",
        priority: "MEDIUM",
        description: "Review your notes from last week on node splitting and rotation.",
        actionLabel: "Review Note",
        actionHref: "/notes?id=note-456",
        reasoning: "Spaced repetition cements long-term memory before the exam.",
      },
    ],
  });
  assert.strictEqual(validRecommendations.success, true);
});
