#!/usr/bin/env node
// Check the movement routines in library/routines.json, screen by screen.
//
//   node tools/routines.mjs [name …]     # default: every routine
//
// For each routine it renders a filmstrip, library/preview/<name>.png (git-ignored): one row per
// cue with its words, every pose the figure takes, and the halfway point of each move between
// poses, so a wrong limb or an odd transition shows up before anyone follows it. It also checks
// that the poses exist and that each cue has time to be spoken. Exits non-zero on any problem.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ROUTINES, routineNames } from "./expand.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "library/preview");
const poses = JSON.parse(fs.readFileSync(path.join(root, "engine/poses.json"), "utf8"));
const figure = fs.readFileSync(path.join(root, "engine/figure.js"), "utf8");
const names = process.argv.slice(2).length ? process.argv.slice(2) : routineNames;
const WPS = 2.35; // recorded narration's pace, words per second
const words = t => String(t || "").split(/\s+/).filter(Boolean).length;
const problems = [];

// rows of frames: [{ head, text, frames: [{ a, b, t, label }] }]
function rows(name, r) {
  const bad = p => { const [n, yaw] = p.split("@"); if (!poses[n] || n.startsWith("_") || (yaw != null && !/^-?\d+$/.test(yaw))) problems.push(`${name}: unknown pose "${p}"`); };
  const out = [], start = [].concat(r.figure || "stand")[0];
  let last = start;
  const strip = list => {
    const frames = [];
    list.forEach(p => { bad(p); if (p !== last) frames.push({ a: last, b: p, t: .5, label: "↝" }); frames.push({ a: p, label: p }); last = p; });
    return frames;
  };
  out.push({ head: "ready", text: r.ready || "", frames: strip([start]) });
  if (r.type === "breath") {
    for (const p of r.pattern || []) out.push({ head: `${p.kind} · ${p.seconds}s`, text: p.label || "", frames: strip([].concat(p.figure || last)) });
    out.push({ head: `× ${r.cycles || 6}, then`, text: r.after || "", frames: strip(["stand"]) });
    return out;
  }
  (r.cues || []).forEach((c, i) => {
    const list = [].concat(c.figure || last), loops = list.length > 1;
    const row = { head: `cue ${i + 1} · ${c.seconds}s${loops ? ` · loop ${c.beat || 2.2}s` : ""}`, text: c.text, frames: strip(list) };
    if (loops) row.frames.push({ a: list[list.length - 1], b: list[0], t: .5, label: "↺" });
    out.push(row);
    const need = words(c.text) / WPS + 1;
    if (need > c.seconds) problems.push(`${name} cue ${i + 1}: about ${need.toFixed(0)}s of speech in ${c.seconds}s`);
  });
  return out;
}

let chromium;
try { ({ chromium } = await import("playwright")); }
catch {
  const globalRoot = execSync("npm root -g").toString().trim();
  ({ chromium } = await import(pathToFileURL(path.join(globalRoot, "playwright", "index.mjs")).href));
}
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const esc = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

for (const name of names) {
  const r = ROUTINES[name];
  if (!r || name.startsWith("_")) { problems.push(`no routine "${name}"`); continue; }
  const R = rows(name, r);
  const html = `<!doctype html><meta charset="utf-8"><style>
:root{--ink:#1b2230;--veil-strong:rgb(255 255 255 / .64);--ink-faint:rgb(27 34 48 / .46)}
body{margin:0;background:#c3c7ca;font:13px/1.35 system-ui;color:#1b2230;padding:12px;width:max-content}
h1{font-size:17px;margin:0 0 2px}p.meta{margin:0 0 10px;max-width:1100px}
.row{display:flex;gap:6px;align-items:stretch;margin-bottom:6px}
.cap{width:250px;flex:none;background:#d9dcdb;border-radius:8px;padding:6px 8px}.cap b{display:block;font-size:12px;opacity:.7}
figure{margin:0;background:#d9dcdb;border-radius:8px;padding:4px;text-align:center;width:112px}figure.mid{background:#cfd3d4;opacity:.85}
figcaption{font-size:11px}.figure{width:104px;height:auto}
.fg-limb,.fg-torso{fill:none;stroke:var(--ink);stroke-linecap:round;stroke-linejoin:round}.fg-limb{stroke-width:7}.fg-torso{stroke-width:11}
.fg-head{fill:var(--veil-strong);stroke:var(--ink);stroke-width:6}.fg-hand{fill:var(--ink)}.fg-ground{stroke:var(--ink-faint);stroke-width:2}
</style><body><h1>${esc(r.title)} <small>(${esc(name)} · ${r.type} · ~${r.minutes} min)</small></h1>
<p class="meta">${esc(r.purpose || "")} <i>${esc((r.lines || []).join(" "))}</i></p><script>${figure}
const POSES = ${JSON.stringify(poses)};
for (const row of ${JSON.stringify(R)}) {
  const div = document.createElement("div"); div.className = "row";
  const cap = document.createElement("div"); cap.className = "cap"; cap.innerHTML = "<b></b>"; cap.firstChild.textContent = row.head; cap.append(row.text); div.append(cap);
  for (const f of row.frames) {
    const fig = makeFigure(POSES, { start: f.a }); if (f.b) fig.blend(f.a, f.b, f.t);
    const box = document.createElement("figure"); if (f.b) box.className = "mid";
    const c = document.createElement("figcaption"); c.textContent = f.label; box.append(fig.el, c); div.append(box);
  }
  document.body.append(div);
}
</script>`;
  const page = await browser.newPage({ viewport: { width: 1400, height: 400 } });
  page.on("pageerror", e => problems.push(`${name}: ${e.message}`));
  await page.setContent(html);
  const file = path.join(outDir, name + ".png");
  await page.screenshot({ path: file, fullPage: true });
  await page.close();
  console.log(`${name.padEnd(18)} ${String(R.length).padStart(2)} rows → ${path.relative(root, file)}`);
}
await browser.close();
if (problems.length) { for (const p of problems) console.error(`  ✗ ${p}`); process.exit(1); }
console.log("✓ every pose exists and every cue has time to be spoken");
