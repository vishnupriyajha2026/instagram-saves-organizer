import test from "node:test";
import assert from "node:assert/strict";
import { escapeHtml, renderHtml } from "../src/render.js";

test("escapes user-written notes before rendering", () => {
  assert.equal(escapeHtml('<script>alert("x")</script>'), "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
});

test("renders an empty library", () => {
  const html = renderHtml([]);
  assert.match(html, /0 saved ideas/);
  assert.doesNotMatch(html, /undefined/);
});

test("uses a singular count for one save", () => {
  const html = renderHtml([{ id: "reel:ONE", type: "reel", url: "https://www.instagram.com/reel/ONE/", title: "One", tags: [], status: "inbox" }]);
  assert.match(html, /1 saved idea</);
  assert.doesNotMatch(html, /1 saved ideas/);
});
