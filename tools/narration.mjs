#!/usr/bin/env node
// Recorded narration for an experience: lists the lines the page will speak, and fetches the clips.
//
//   node tools/narration.mjs lines <dir> [--voice "Holden"]
//       writes <dir>/narration.json (every line the page speaks, keyed the same way the engine
//       keys them) and prints the lines that still need a recording, as JSON
//   node tools/narration.mjs fetch <dir> <results.json>
//       results.json: [{ "key": "…", "url": "https://…mp3" }] from the text-to-speech jobs;
//       downloads each clip to <dir>/audio/<key>.mp3
//
// tools/build.mjs then embeds the keys that have a clip, and lists the files to publish with the page.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const [cmd, dir, arg] = process.argv.slice(2);
if (!cmd || !dir) { console.error("usage: node tools/narration.mjs lines|fetch <dir> [results.json]"); process.exit(2); }
const listPath = path.join(dir, "narration.json"), audioDir = path.join(dir, "audio");

// must match narrKey in engine/template.html
const narrKey = t => { let h = 0x811c9dc5; for (const ch of t.replace(/\s+/g, " ").trim()) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, "0"); };
const plain = t => String(t || "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/(^|[\s(“"'])_([^_]+)_/g, "$1$2").replace(/\s+/g, " ").trim();
const BREATH = {
  sigh: [["in", 2.5], ["in", 1], ["out", 6], ["hold", 1.5]], resonance: [["in", 5], ["out", 5.5]], extended: [["in", 4], ["out", 7]],
  box: [["in", 4], ["hold", 4], ["out", 4], ["hold", 4]], "4-7-8": [["in", 4], ["hold", 7], ["out", 8]], awaken: [["in", 2], ["out", 1.5]], hum: [["in", 4], ["out", 8, "hum"]]
};
const phrase = (kind, seconds, say) => say || (seconds >= 2.5 ? { in: "breathe in", out: "and out", hold: "hold" }[kind] : "");

if (cmd === "lines") {
  const X = JSON.parse(fs.readFileSync(path.join(dir, "experience.json"), "utf8"));
  const lines = [];
  const add = (t, where) => { if (!t || /\{\{/.test(t)) return; const text = plain(t); if (text && !lines.some(l => l.text === text)) lines.push({ key: narrKey(text), text, where }); };
  for (const s of X.steps) {
    if (s.type === "text") (s.lines || []).forEach(l => add(l, s.id));
    if (s.type === "guided") { (s.cues || []).forEach(c => add(typeof c === "string" ? c : c.text, s.id)); add(s.after, s.id); }
    if (s.type === "sit") { add(s.anchor, s.id); add(s.after, s.id); }
    if (s.type === "breath") {
      const ph = Array.isArray(s.pattern) ? s.pattern.map(p => [p.kind || "in", Number(p.seconds) || 4, p.say]) : BREATH[s.pattern || "extended"] || BREATH.extended;
      ph.forEach(([k, sec, say]) => add(phrase(k, sec, say), s.id));
      add(s.after, s.id);
    }
  }
  const prev = fs.existsSync(listPath) ? JSON.parse(fs.readFileSync(listPath, "utf8")) : {};
  const voice = process.argv.includes("--voice") ? process.argv[process.argv.indexOf("--voice") + 1] : prev.voice || null;
  fs.writeFileSync(listPath, JSON.stringify({ voice, lines }, null, 2) + "\n");
  const missing = lines.filter(l => !fs.existsSync(path.join(audioDir, l.key + ".mp3")));
  console.error(`${lines.length} lines (${lines.reduce((a, l) => a + l.text.length, 0)} characters); ${missing.length} still need a recording. Voice: ${voice || "(not set)"}`);
  console.log(JSON.stringify(missing.map(({ key, text }) => ({ key, text })), null, 1));
} else if (cmd === "fetch") {
  const results = JSON.parse(fs.readFileSync(arg, "utf8"));
  fs.mkdirSync(audioDir, { recursive: true });
  let ok = 0;
  for (const { key, url } of results) {
    // curl rather than fetch: it honors the environment's HTTPS proxy
    try { execFileSync("curl", ["-sSfL", "--max-time", "60", "-o", path.join(audioDir, key + ".mp3"), url], { stdio: ["ignore", "ignore", "pipe"] }); ok++; }
    catch (e) { console.error(`  ✗ ${key}: ${String(e.stderr || e.message).trim()}`); }
  }
  console.log(`fetched ${ok}/${results.length} clips into ${audioDir}`);
  if (ok < results.length) process.exit(1);
} else { console.error("unknown command " + cmd); process.exit(2); }
