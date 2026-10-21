#!/usr/bin/env node
// Recorded narration for an experience: lists the lines the page will speak, fetches and cleans
// the clips, and checks them for the usual text-to-speech failures.
//
//   node tools/narration.mjs lines <dir> [--voice "Arthur"]
//       writes <dir>/narration.json (every line the page speaks, keyed the same way the engine
//       keys it, plus `say`: the text to send to the speech engine) and prints, as JSON, the lines
//       that still need a recording
//   node tools/narration.mjs fetch <dir> <results.json> [--tempo 0.95]
//       results.json: [{ "key": "…", "url": "https://…mp3" }] from the text-to-speech jobs.
//       Downloads each clip, trims silence at both ends, evens out loudness, and writes
//       <dir>/audio/<key>.mp3. --tempo slows (<1) or speeds (>1) speech without changing pitch.
//   node tools/narration.mjs check <dir>
//       flags clips that are probably broken (silent, long lead-in, a stray sound before the
//       sentence, far too slow or fast for their words, a long gap inside) and prints their keys
//       as JSON, ready to re-record
//
// tools/build.mjs then embeds the keys that have a clip, and lists the files to publish with the page.
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const [cmd, dir, arg] = process.argv.slice(2);
if (!cmd || !dir) { console.error("usage: node tools/narration.mjs lines|fetch|check <dir> [results.json]"); process.exit(2); }
const flag = name => process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : null;
const listPath = path.join(dir, "narration.json"), audioDir = path.join(dir, "audio");

// must match narrKey in engine/template.html
const narrKey = t => { let h = 0x811c9dc5; for (const ch of t.replace(/\s+/g, " ").trim()) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, "0"); };
const plain = t => String(t || "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/(^|[\s(“"'])_([^_]+)_/g, "$1$2").replace(/\s+/g, " ").trim();
// What the speech engine reads: a whole sentence, capitalized and properly ended. Fragments and
// trailing colons are what make text-to-speech mumble, invent words or trail off.
const sayText = t => {
  let s = t.replace(/\s*·\s*/g, ", ").replace(/[:;]\s*$/, ".").trim();
  s = s.replace(/^(["“'(]*)([a-z])/, (m, q, c) => q + c.toUpperCase());
  if (!/[.!?…"”')]$/.test(s)) s += ".";
  return s;
};
const BREATH = {
  sigh: [["in", 2.5], ["in", 1], ["out", 6], ["hold", 1.5]], resonance: [["in", 5], ["out", 5.5]], extended: [["in", 4], ["out", 7]],
  box: [["in", 4], ["hold", 4], ["out", 4], ["hold", 4]], "4-7-8": [["in", 4], ["hold", 7], ["out", 8]], awaken: [["in", 2], ["out", 1.5]], hum: [["in", 4], ["out", 8, "hum"]]
};
const phrase = (kind, seconds, say) => say || (seconds >= 2.5 ? { in: "breathe in", out: "and out", hold: "hold" }[kind] : "");
// a poem is spoken a stanza at a time (stanzas are separated by "" lines) — must match the engine
const stanzas = lines => { const out = [[]]; for (const l of lines || []) { if (l === "") out.push([]); else out[out.length - 1].push(l); } return out.filter(s => s.length); };

function probe(file) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-af", "silencedetect=noise=-40dB:d=0.25", "-f", "null", "-"], { encoding: "utf8" });
  const o = r.stderr || "", m = o.match(/Duration: (\d+):(\d+):([\d.]+)/);
  const dur = m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : 0;
  const starts = [...o.matchAll(/silence_start: ([\d.]+)/g)].map(x => +x[1]), ends = [...o.matchAll(/silence_end: ([\d.]+)/g)].map(x => +x[1]);
  const speech = []; let t = 0;
  starts.forEach((a, i) => { if (a > t + 0.05) speech.push([t, a]); t = ends[i] != null ? ends[i] : dur; });
  if (dur > t + 0.05) speech.push([t, dur]);
  return { dur, speech };
}

if (cmd === "lines") {
  const X = JSON.parse(fs.readFileSync(path.join(dir, "experience.json"), "utf8"));
  const lines = [];
  const add = (t, where) => { if (!t || /\{\{/.test(t)) return; const text = plain(t); if (text && !lines.some(l => l.text === text)) lines.push({ key: narrKey(text), text, say: sayText(text), where }); };
  for (const s of X.steps) {
    if (s.type === "text") {
      if (/\bpoem\b/.test(s.style || "")) stanzas(s.lines).forEach(st => { if (!st.some(l => /\{\{/.test(l))) add(st.map(plain).join(" "), s.id); });
      else (s.lines || []).forEach(l => add(l, s.id));
    }
    if (s.type === "guided") { (s.cues || []).forEach(c => add(typeof c === "string" ? c : c.text, s.id)); add(s.after, s.id); }
    if (s.type === "sit") { add(s.anchor, s.id); add(s.after, s.id); }
    if (s.type === "teaching") { add(s.title, s.id); (s.lines || []).forEach(l => add(l, s.id)); }
    if (s.type === "breath") {
      const ph = Array.isArray(s.pattern) ? s.pattern.map(p => [p.kind || "in", Number(p.seconds) || 4, p.say]) : BREATH[s.pattern || "extended"] || BREATH.extended;
      ph.forEach(([k, sec, say]) => add(phrase(k, sec, say), s.id));
      add(s.after, s.id);
    }
  }
  const prev = fs.existsSync(listPath) ? JSON.parse(fs.readFileSync(listPath, "utf8")) : {};
  const voice = flag("--voice") || prev.voice || null;
  fs.writeFileSync(listPath, JSON.stringify({ voice, lines }, null, 2) + "\n");
  const missing = lines.filter(l => !fs.existsSync(path.join(audioDir, l.key + ".mp3")));
  console.error(`${lines.length} lines (${lines.reduce((a, l) => a + l.say.length, 0)} characters); ${missing.length} still need a recording. Voice: ${voice || "(not set)"}`);
  console.log(JSON.stringify(missing.map(({ key, say }) => ({ key, say })), null, 1));
} else if (cmd === "fetch") {
  const results = JSON.parse(fs.readFileSync(arg, "utf8"));
  const tempo = Number(flag("--tempo")) || 1;
  fs.mkdirSync(audioDir, { recursive: true });
  const raw = path.join(dir, "audio-raw");
  fs.mkdirSync(raw, { recursive: true });
  // two ffmpeg passes: run as one chain, trimming and loudness normalization can hang on some clips
  const trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12";
  const level = [...(tempo !== 1 ? [`atempo=${tempo}`] : []), "loudnorm=I=-19:TP=-2:LRA=9"].join(",");
  const run = (bin, args) => execFileSync(bin, args, { stdio: ["ignore", "ignore", "pipe"], timeout: 30000 });
  let ok = 0;
  for (const { key, url } of results) {
    const src = path.join(raw, key + ".mp3"), wav = path.join(raw, key + ".wav");
    try {
      // curl rather than fetch: it honors the environment's HTTPS proxy
      if (!fs.existsSync(src)) run("curl", ["-sSfL", "--max-time", "60", "-o", src, url]);
      run("ffmpeg", ["-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-i", src, "-af", [trim, "areverse", trim, "areverse"].join(","), "-ac", "1", "-ar", "44100", wav]);
      run("ffmpeg", ["-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-i", wav, "-af", level, "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "96k", path.join(audioDir, key + ".mp3")]);
      fs.rmSync(wav, { force: true });
      ok++;
    } catch (e) { console.error(`  ✗ ${key}: ${String(e.stderr || e.message).trim().split("\n")[0]}`); }
  }
  console.log(`fetched and cleaned ${ok}/${results.length} clips into ${audioDir}`);
  if (ok < results.length) process.exit(1);
} else if (cmd === "check") {
  const N = JSON.parse(fs.readFileSync(listPath, "utf8")), bad = [];
  for (const l of N.lines) {
    const f = path.join(audioDir, l.key + ".mp3");
    if (!fs.existsSync(f)) continue;
    const { dur, speech } = probe(f), words = l.text.split(/\s+/).filter(Boolean).length, spoken = speech.reduce((a, [s, e]) => a + e - s, 0);
    const why = [];
    if (!speech.length) why.push("no speech");
    else {
      if (speech[0][0] > 0.6) why.push(`silent for ${speech[0][0].toFixed(1)}s before speaking`);
      if (words > 3 && speech.length > 1 && speech[0][1] - speech[0][0] < 0.2 && speech[1][0] - speech[0][1] > 0.35) why.push("a stray sound before the sentence");
      const wps = words / Math.max(0.1, speech[speech.length - 1][1] - speech[0][0]);
      if (words >= 4 && wps < 1.2) why.push(`too slow for its words (${wps.toFixed(1)} words/s)`);
      if (words >= 4 && wps > 4.5) why.push(`too fast, maybe cut short (${wps.toFixed(1)} words/s)`);
      for (let i = 1; i < speech.length; i++) if (speech[i][0] - speech[i - 1][1] > 1.6) { why.push(`a ${(speech[i][0] - speech[i - 1][1]).toFixed(1)}s gap inside`); break; }
      if (spoken < 0.15 * words) why.push("too little speech");
    }
    if (why.length) bad.push({ key: l.key, say: l.say, why: why.join("; "), seconds: +dur.toFixed(2) });
  }
  console.error(bad.length ? `${bad.length} clip(s) to re-record:` : "all clips look sound");
  console.log(JSON.stringify(bad, null, 1));
  if (bad.length) process.exit(1);
} else { console.error("unknown command " + cmd); process.exit(2); }
