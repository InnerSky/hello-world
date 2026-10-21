#!/usr/bin/env node
// Build an experience: validates <dir>/experience.json and writes <dir>/experience.html,
// a single self-contained page (engine + skies + script) ready to publish as an Artifact.
//
//   node tools/build.mjs private/sessions/2026-10-21-after-the-rain
//
// Exits non-zero on errors. Warnings are printed but don't block the build.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = process.argv[2];
if (!dir) { console.error("usage: node tools/build.mjs <session-dir>"); process.exit(2); }

const src = path.join(dir, "experience.json");
let X;
try { X = JSON.parse(fs.readFileSync(src, "utf8")); }
catch (e) { console.error(`✗ can't read ${src}: ${e.message}`); process.exit(1); }

const skies = JSON.parse(fs.readFileSync(path.join(root, "engine/skies.json"), "utf8"));
const template = fs.readFileSync(path.join(root, "engine/template.html"), "utf8");

const errors = [], warnings = [];
const err = m => errors.push(m), warn = m => warnings.push(m);

const TYPES = {
  threshold: [], text: ["lines"], breath: [], guided: ["cues"], sit: ["seconds"], write: ["prompt"],
  choose: ["prompt", "options"], words: ["prompt", "words"], scale: ["prompt"], body: ["prompt"],
  release: ["prompt"], companion: ["instruction", "fallback"], card: []
};
const BREATH = ["sigh", "resonance", "extended", "box", "4-7-8", "awaken", "hum"];
const skyNames = Object.keys(skies).filter(k => !k.startsWith("_"));

for (const k of ["id", "title", "movements", "steps"]) if (X[k] == null) err(`missing top-level "${k}"`);
if (X.id && !/^[A-Za-z0-9._~-]+$/.test(X.id)) err(`id "${X.id}" may only use letters, digits and . _ ~ -`);
if (X.title && X.title.split(/\s+/).length > 5) warn(`title "${X.title}" is long; aim for a 2–4 word name`);
const moves = Array.isArray(X.movements) ? X.movements : [];
const moveIds = new Set();
for (const m of moves) {
  if (!m.id) err("a movement is missing its id");
  if (moveIds.has(m.id)) err(`duplicate movement id "${m.id}"`);
  moveIds.add(m.id);
  if (!skyNames.includes(m.sky)) err(`movement "${m.id}" has unknown sky "${m.sky}" (known: ${skyNames.join(", ")})`);
}

const steps = Array.isArray(X.steps) ? X.steps : [];
const seen = new Set();
let movement = moves[0] && moves[0].id;
const usedMoves = new Set();
const refsIn = s => JSON.stringify(s).match(/\{\{\s*([\w-]+)/g)?.map(r => r.replace(/\{\{\s*/, "")) || [];
steps.forEach((s, i) => {
  const at = `step ${i + 1}${s.id ? ` "${s.id}"` : ""}`;
  if (!s.id) err(`${at}: missing id`);
  else if (seen.has(s.id)) err(`${at}: duplicate id`);
  if (!TYPES[s.type]) { err(`${at}: unknown type "${s.type}" (known: ${Object.keys(TYPES).join(", ")})`); }
  else for (const f of TYPES[s.type]) if (s[f] == null) err(`${at}: type "${s.type}" needs "${f}"`);
  if (s.movement) { if (!moveIds.has(s.movement)) err(`${at}: unknown movement "${s.movement}"`); movement = s.movement; }
  usedMoves.add(movement);
  if (s.sky && !skyNames.includes(s.sky)) err(`${at}: unknown sky "${s.sky}"`);
  if (s.type === "breath" && s.pattern && !Array.isArray(s.pattern) && !BREATH.includes(s.pattern)) err(`${at}: unknown breath pattern "${s.pattern}" (known: ${BREATH.join(", ")})`);
  if (s.type === "choose" && Array.isArray(s.options) && s.options.length < 2) warn(`${at}: a choice with fewer than 2 options`);
  if (s.type === "scale" && s.measure && !["before", "after"].includes(s.measure)) err(`${at}: measure must be "before" or "after"`);
  for (const c of [].concat(s.when || [])) {
    if (!c.step) err(`${at}: "when" needs a "step"`);
    else if (!seen.has(c.step)) err(`${at}: "when" refers to "${c.step}", which isn't an earlier step`);
  }
  for (const id of s.include || []) if (!seen.has(id)) warn(`${at}: include "${id}" isn't an earlier step`);
  for (const r of refsIn(s)) if (!seen.has(r) && !(X.vars && r in X.vars)) warn(`${at}: template {{${r}}} isn't an earlier step or a var`);
  if (s.id) seen.add(s.id);
});
if (steps[0] && steps[0].type !== "threshold") warn("the first step is usually a threshold");
const last = steps[steps.length - 1];
if (last && last.type !== "card") warn("the last step is usually a card");
for (const m of moves) if (!usedMoves.has(m.id)) warn(`movement "${m.id}" has no steps`);
const measures = steps.filter(s => s.type === "scale" && s.measure).map(s => s.measure);
if (!measures.includes("before") || !measures.includes("after")) warn("no before/after measure pair; the card can't show the shift");
if (!X.lineage || !X.lineage.length) warn("no lineage credits");

// Duration estimate (minutes), by movement
const words = t => String(t || "").split(/\s+/).filter(Boolean).length;
const BREATH_SEC = { sigh: 11, resonance: 10.5, extended: 11, box: 16, "4-7-8": 19, awaken: 3.5, hum: 12 };
function estimate(s) {
  switch (s.type) {
    case "threshold": return 40;
    case "text": return (s.lines || []).reduce((a, l) => a + Math.min(5.5, 1.2 + words(l) * .26) + 1.5, 0) + (s.hold || 0) + 4;
    case "breath": { const per = Array.isArray(s.pattern) ? s.pattern.reduce((a, p) => a + (Number(p.seconds) || 4), 0) : BREATH_SEC[s.pattern || "extended"]; return per * (s.cycles || 6) + 15; }
    case "guided": return (s.cues || []).reduce((a, c) => a + (typeof c === "string" ? 12 : Number(c.seconds) || 12), 0) + 12;
    case "sit": return Number(s.seconds) + 15;
    case "write": return s.seconds ? Number(s.seconds) + 20 : 100;
    case "release": return 90;
    case "choose": return 25;
    case "words": return 35;
    case "scale": return 12;
    case "body": return 35;
    case "companion": return 75 * (s.turns || 1);
    case "card": return 90;
  }
  return 20;
}
const perMove = new Map(moves.map(m => [m.id, 0]));
movement = moves[0] && moves[0].id;
for (const s of steps) { if (s.movement) movement = s.movement; if (TYPES[s.type]) perMove.set(movement, (perMove.get(movement) || 0) + estimate(s)); }
const total = [...perMove.values()].reduce((a, b) => a + b, 0) / 60;
if (X.duration && Math.abs(total - X.duration) / X.duration > .35) warn(`estimated ${total.toFixed(0)} min vs. stated ${X.duration} min (branches that get skipped count here too)`);

for (const w of warnings) console.log(`  ! ${w}`);
if (errors.length) { for (const e of errors) console.error(`  ✗ ${e}`); console.error(`✗ ${errors.length} error(s); nothing written.`); process.exit(1); }

const json = JSON.stringify(X).replace(/</g, "\\u003c").replace(/[\u2028\u2029]/g, c => "\\u" + c.charCodeAt(0).toString(16));
const skiesJson = JSON.stringify(skies).replace(/</g, "\\u003c");
const escHtml = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const html = template
  .replace("__TITLE__", escHtml(X.title))
  .replace("/*__EXPERIENCE__*/null", () => json)
  .replace("/*__SKIES__*/null", () => skiesJson);
const out = path.join(dir, "experience.html");
fs.writeFileSync(out, html);

console.log(`✓ ${X.title} → ${out} (${(html.length / 1024).toFixed(0)} KB)`);
console.log(`  ${steps.length} steps · ~${total.toFixed(0)} min estimated${X.duration ? ` (stated ${X.duration})` : ""}`);
for (const m of moves) console.log(`    ${String(m.name || m.id).padEnd(12)} ${(perMove.get(m.id) / 60).toFixed(1).padStart(5)} min  · sky: ${m.sky}`);
