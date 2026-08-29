import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export async function readLibrary(filePath) {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Library must contain a JSON array.");
    return parsed;
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

export async function writeLibrary(filePath, saves) {
  await mkdir(dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(saves, null, 2)}\n`, "utf8");
  await rename(temporaryPath, filePath);
}

export function mergeSaves(existing, incoming) {
  const byId = new Map(existing.map((save) => [save.id, save]));
  let added = 0;

  for (const save of incoming) {
    if (byId.has(save.id)) continue;
    byId.set(save.id, save);
    added += 1;
  }

  return {
    saves: [...byId.values()].sort((a, b) => String(b.addedAt).localeCompare(String(a.addedAt))),
    added,
    skipped: incoming.length - added
  };
}
