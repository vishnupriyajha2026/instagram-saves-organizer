import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[character]);
}

function card(save) {
  const tags = (save.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  const searchable = [save.title, save.creator, save.note, ...(save.tags || [])].join(" ").toLowerCase();
  return `<article class="card" data-search="${escapeHtml(searchable)}" data-status="${escapeHtml(save.status)}" data-tags="${escapeHtml((save.tags || []).join(","))}">
    <div class="card-top"><span class="kind">${escapeHtml(save.type)}</span><span class="status">${escapeHtml(save.status)}</span></div>
    <h2>${escapeHtml(save.title)}</h2>
    ${save.creator ? `<p class="creator">@${escapeHtml(save.creator.replace(/^@/, ""))}</p>` : ""}
    ${save.note ? `<p class="note">${escapeHtml(save.note)}</p>` : `<p class="note muted">No note yet.</p>`}
    <div class="tags">${tags || '<span class="tag muted">untagged</span>'}</div>
    <a class="open" href="${escapeHtml(save.url)}" target="_blank" rel="noreferrer">Open on Instagram ↗</a>
  </article>`;
}

export function renderHtml(saves) {
  const statuses = [...new Set(saves.map((save) => save.status).filter(Boolean))];
  const tags = [...new Set(saves.flatMap((save) => save.tags || []))].sort();
  const data = JSON.stringify({ count: saves.length }).replace(/</g, "\\u003c");
  const countLabel = `${saves.length} saved ${saves.length === 1 ? "idea" : "ideas"}`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Save Sorter</title>
<style>
:root{--ink:#1f1c19;--paper:#f6f1e8;--pink:#ff6b8a;--lime:#d9f36b;--blue:#8bd3ff;--line:#292521}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,sans-serif}.shell{max-width:1180px;margin:auto;padding:56px 24px 80px}header{display:grid;grid-template-columns:1fr auto;gap:24px;align-items:end;border-bottom:2px solid var(--line);padding-bottom:26px}h1{font-family:Georgia,serif;font-size:clamp(48px,8vw,96px);line-height:.9;margin:0;letter-spacing:-.05em}.eyebrow{text-transform:uppercase;letter-spacing:.12em;font-weight:800;margin:0 0 14px}.count{background:var(--lime);border:2px solid var(--line);border-radius:999px;padding:10px 16px;font-weight:800;transform:rotate(2deg)}.controls{display:flex;flex-wrap:wrap;gap:10px;margin:24px 0 30px}.controls input,.controls select{background:#fff;border:2px solid var(--line);border-radius:10px;padding:12px 14px;font:inherit;min-width:180px}.controls input{flex:1}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.card{background:#fff;border:2px solid var(--line);border-radius:18px;padding:20px;box-shadow:5px 5px 0 var(--line);min-height:290px;display:flex;flex-direction:column}.card:nth-child(3n+2){transform:rotate(.5deg)}.card:nth-child(3n+3){transform:rotate(-.5deg)}.card-top{display:flex;justify-content:space-between;align-items:center}.kind,.status,.tag{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em}.kind{background:var(--blue);padding:6px 9px;border-radius:999px}.status{border-bottom:2px solid var(--pink)}h2{font-family:Georgia,serif;font-size:28px;line-height:1.05;margin:26px 0 5px}.creator{font-weight:700;margin:0}.note{line-height:1.45}.muted{color:#756e67}.tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:auto;padding:18px 0}.tag{background:#eee7db;border-radius:5px;padding:5px 7px}.open{color:var(--ink);font-weight:850;text-decoration:none}.empty{display:none;padding:40px;border:2px dashed var(--line);text-align:center}footer{margin-top:44px;padding-top:18px;border-top:2px solid var(--line);font-size:14px}.hidden{display:none!important}@media(max-width:850px){.grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:580px){header{grid-template-columns:1fr}.grid{grid-template-columns:1fr}.card{transform:none!important}}
</style></head><body><main class="shell"><header><div><p class="eyebrow">A private reference library</p><h1>Save Sorter</h1></div><div class="count">${countLabel}</div></header>
<section class="controls" aria-label="Filters"><input id="search" type="search" placeholder="Search notes, creators or tags…"><select id="status"><option value="">All statuses</option>${statuses.map((status) => `<option>${escapeHtml(status)}</option>`).join("")}</select><select id="tag"><option value="">All tags</option>${tags.map((tag) => `<option>${escapeHtml(tag)}</option>`).join("")}</select></section>
<section id="grid" class="grid">${saves.map(card).join("")}</section><div id="empty" class="empty">Nothing matches those filters.</div>
<footer>Your links stay in local files on your computer. This page never logs in to Instagram.</footer></main>
<script>const meta=${data};const cards=[...document.querySelectorAll('.card')];const search=document.querySelector('#search');const status=document.querySelector('#status');const tag=document.querySelector('#tag');function filter(){const q=search.value.trim().toLowerCase();let visible=0;for(const card of cards){const ok=(!q||card.dataset.search.includes(q))&&(!status.value||card.dataset.status===status.value)&&(!tag.value||card.dataset.tags.split(',').includes(tag.value));card.classList.toggle('hidden',!ok);if(ok)visible++}document.querySelector('#empty').style.display=visible?'none':'block'}[search,status,tag].forEach(el=>el.addEventListener('input',filter));</script></body></html>`;
}

export async function writeHtml(filePath, saves) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, renderHtml(saves), "utf8");
}
