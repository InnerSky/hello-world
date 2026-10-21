// Routines (library/routines.json) are tested building blocks. A step with "routine": "<name>"
// takes the routine's title, lines, figure, cues or breath pattern, timing and closing line, except
// for the fields the step sets itself. To personalize without losing the tested poses and timing:
//   "cueText": { "2": "new words for cue 2" }   rewords cues (numbered from 1)
//   "drop": [6, 7]                             leaves cues out
// The routine's lineage joins the experience's credits. build.mjs and narration.mjs both expand
// through here, so the page speaks exactly the lines that were recorded.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const ROUTINES = JSON.parse(fs.readFileSync(path.join(root, "library/routines.json"), "utf8"));
export const routineNames = Object.keys(ROUTINES).filter(k => !k.startsWith("_"));
const NOTES = ["purpose", "minutes", "needs", "cautions", "lineage"]; // for composing, not for the page

export function expand(X) {
  const errors = [], lineage = (X.lineage || []).slice();
  const steps = (X.steps || []).map((s, i) => {
    if (!s.routine) return s;
    const at = `step ${i + 1}${s.id ? ` "${s.id}"` : ""}`, r = ROUTINES[s.routine];
    if (!r || s.routine.startsWith("_")) { errors.push(`${at}: unknown routine "${s.routine}" (known: ${routineNames.join(", ")})`); return s; }
    if (s.type && s.type !== r.type) errors.push(`${at}: routine "${s.routine}" is a ${r.type} step, not ${s.type}`);
    const out = {};
    for (const k in r) if (!NOTES.includes(k)) out[k] = structuredClone(r[k]);
    Object.assign(out, s);
    if (Array.isArray(out.cues) && !s.cues) {
      for (const [n, text] of Object.entries(s.cueText || {})) {
        if (out.cues[n - 1]) out.cues[n - 1].text = text;
        else errors.push(`${at}: cueText "${n}", but "${s.routine}" has cues 1–${out.cues.length}`);
      }
      if (s.drop) out.cues = out.cues.filter((c, n) => !s.drop.includes(n + 1));
    } else if (s.cueText || s.drop) errors.push(`${at}: cueText and drop only apply to a routine's own cues`);
    delete out.cueText; delete out.drop;
    out.name = s.name || out.title;
    if (r.lineage && !lineage.some(l => l.name === r.lineage.name)) lineage.push(r.lineage);
    return out;
  });
  return { X: Object.assign({}, X, { steps, lineage }), errors };
}
