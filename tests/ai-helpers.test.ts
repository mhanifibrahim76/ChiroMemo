import test from "node:test";
import assert from "node:assert";
import { parseGeminiJson } from "../src/lib/ai/parser.ts";

test("parseGeminiJson handles pure JSON", () => {
  const input = '{"title": "Database Normalization", "score": 95}';
  const result = parseGeminiJson(input) as { title: string; score: number };
  assert.strictEqual(result.title, "Database Normalization");
  assert.strictEqual(result.score, 95);
});

test("parseGeminiJson strips markdown ```json code fences", () => {
  const input = "```json\n{\n  \"directAnswer\": \"B-Trees maintain sorted keys for fast retrieval.\"\n}\n```";
  const result = parseGeminiJson(input) as { directAnswer: string };
  assert.strictEqual(result.directAnswer, "B-Trees maintain sorted keys for fast retrieval.");
});

test("parseGeminiJson strips generic ``` code fences", () => {
  const input = "```\n{\n  \"keyFocusArea\": \"Relational Algebra\"\n}\n```";
  const result = parseGeminiJson(input) as { keyFocusArea: string };
  assert.strictEqual(result.keyFocusArea, "Relational Algebra");
});

test("parseGeminiJson throws error on non-JSON content", () => {
  assert.throws(() => {
    parseGeminiJson("This is not JSON at all");
  }, SyntaxError);
});

