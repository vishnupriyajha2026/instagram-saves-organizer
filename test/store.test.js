import test from "node:test";
import assert from "node:assert/strict";
import { mergeSaves } from "../src/store.js";

test("deduplicates saves by Instagram shortcode", () => {
  const first = { id: "reel:ONE", addedAt: "2026-01-01" };
  const duplicate = { id: "reel:ONE", addedAt: "2026-01-02" };
  const result = mergeSaves([first], [duplicate]);
  assert.equal(result.added, 0);
  assert.equal(result.skipped, 1);
  assert.deepEqual(result.saves, [first]);
});
