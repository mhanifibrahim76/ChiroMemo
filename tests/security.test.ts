import test from "node:test";
import assert from "node:assert";
import { safeRedirectPath } from "../src/lib/auth/redirect.ts";

test("safeRedirectPath prevents open redirects", () => {
  // Valid local relative paths
  assert.strictEqual(safeRedirectPath("/dashboard"), "/dashboard");
  assert.strictEqual(safeRedirectPath("/goals/123"), "/goals/123");
  assert.strictEqual(safeRedirectPath("/notes?id=xyz"), "/notes?id=xyz");
  assert.strictEqual(safeRedirectPath("/resources"), "/resources");
  assert.strictEqual(safeRedirectPath("/recommendations"), "/recommendations");

  // Invalid external URLs, protocol-relative, or null
  assert.strictEqual(safeRedirectPath(null), "/dashboard");
  assert.strictEqual(safeRedirectPath(""), "/dashboard");
  assert.strictEqual(safeRedirectPath("https://malicious.com"), "/dashboard");
  assert.strictEqual(safeRedirectPath("http://evil.com/phish"), "/dashboard");
  assert.strictEqual(safeRedirectPath("//evil.com"), "/dashboard");
  assert.strictEqual(safeRedirectPath("javascript:alert(1)"), "/dashboard");
  assert.strictEqual(safeRedirectPath("data:text/html,evil"), "/dashboard");

  // Custom fallback
  assert.strictEqual(safeRedirectPath("https://evil.com", "/login"), "/login");
});
