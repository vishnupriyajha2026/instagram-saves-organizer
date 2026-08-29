#!/usr/bin/env node
import { resolve } from "node:path";
import { importLinks, toSave } from "./src/import.js";
import { writeHtml } from "./src/render.js";
import { mergeSaves, readLibrary, writeLibrary } from "./src/store.js";
import { normalizeInstagramUrl } from "./src/url.js";

const DATA_FILE = resolve("data/saves.json");

function flags(args) {
  const result = { _: [] };
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (!value.startsWith("--")) result._.push(value);
    else result[value.slice(2)] = args[index + 1] && !args[index + 1].startsWith("--") ? args[++index] : true;
  }
  return result;
}

async function add(args) {
  const options = flags(args);
  const link = normalizeInstagramUrl(options._[0]);
  const save = toSave(link, {
    title: options.title,
    creator: options.creator,
    note: options.note,
    tags: options.tags ? options.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : []
  });
  const existing = await readLibrary(DATA_FILE);
  const result = mergeSaves(existing, [save]);
  await writeLibrary(DATA_FILE, result.saves);
  console.log(result.added ? "Added 1 save." : "That link is already in your library.");
}

async function importFile(args) {
  const input = args[0];
  if (!input) throw new Error("Choose a .txt, .csv, or .json file to import.");
  const links = await importLinks(resolve(input));
  const existing = await readLibrary(DATA_FILE);
  const result = mergeSaves(existing, links.map((link) => toSave(link)));
  await writeLibrary(DATA_FILE, result.saves);
  console.log(`Added ${result.added}. Skipped ${result.skipped} duplicate${result.skipped === 1 ? "" : "s"}.`);
}

async function render(args) {
  const options = flags(args);
  const input = options.input ? resolve(options.input) : DATA_FILE;
  const output = resolve(options.output || "inbox.html");
  const saves = await readLibrary(input);
  await writeHtml(output, saves);
  console.log(`Built ${output} with ${saves.length} save${saves.length === 1 ? "" : "s"}.`);
}

async function demo() {
  await render(["--input", "examples/saves.example.json", "--output", "demo/inbox.html"]);
}

function help() {
  console.log(`Save Sorter\n\nCommands:\n  add <instagram-url> [--title text] [--creator handle] [--note text] [--tags a,b]\n  import <file.txt|file.csv|file.json>\n  render [--input file] [--output file]\n  demo`);
}

const [command, ...args] = process.argv.slice(2);
try {
  if (command === "add") await add(args);
  else if (command === "import") await importFile(args);
  else if (command === "render") await render(args);
  else if (command === "demo") await demo();
  else help();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
