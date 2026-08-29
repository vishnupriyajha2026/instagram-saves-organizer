import test from "node:test";
import assert from "node:assert/strict";
import { findInstagramUrls, normalizeInstagramUrl } from "../src/url.js";

test("normalizes reel URLs and removes tracking parameters", () => {
  assert.deepEqual(normalizeInstagramUrl("https://www.instagram.com/reel/ABC123/?utm_source=test"), {
    id: "reel:ABC123",
    type: "reel",
    shortcode: "ABC123",
    url: "https://www.instagram.com/reel/ABC123/"
  });
});

test("rejects non-Instagram URLs", () => {
  assert.throws(() => normalizeInstagramUrl("https://example.com/reel/ABC123"), /Only Instagram/);
});

test("finds multiple supported links in pasted text", () => {
  const links = findInstagramUrls("See https://instagram.com/p/ONE/ and https://www.instagram.com/reel/TWO/?x=1");
  assert.equal(links.length, 2);
});
