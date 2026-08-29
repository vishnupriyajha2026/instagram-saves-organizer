import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { findInstagramUrls, normalizeInstagramUrl } from "./url.js";

function collectStrings(value, output = []) {
  if (typeof value === "string") output.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, output));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectStrings(item, output));
  return output;
}

function uniqueLinks(values) {
  const links = [];
  for (const value of values) {
    for (const match of findInstagramUrls(value)) {
      try {
        links.push(normalizeInstagramUrl(match));
      } catch {
        // Ignore unsupported Instagram routes found inside imported text.
      }
    }
  }
  return [...new Map(links.map((link) => [link.id, link])).values()];
}

export async function importLinks(filePath) {
  const raw = await readFile(filePath, "utf8");
  if (extname(filePath).toLowerCase() === ".json") {
    return uniqueLinks(collectStrings(JSON.parse(raw)));
  }
  return uniqueLinks([raw]);
}

export function toSave(link, details = {}) {
  return {
    ...link,
    title: details.title || "Untitled save",
    creator: details.creator || "",
    note: details.note || "",
    tags: [...new Set(details.tags || [])],
    status: details.status || "inbox",
    addedAt: details.addedAt || new Date().toISOString()
  };
}
