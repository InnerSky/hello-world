#!/usr/bin/env node
// Walk through a built experience in headless Chromium, the way a person would, and save a
// screenshot of every step. Timers run fast; Claude-only features fall back to their offline text.
//
//   node tools/preview.mjs private/sessions/<id>            # phone-sized walk-through
//   node tools/preview.mjs private/sessions/<id> --desktop  # also capture desktop size
//   node tools/preview.mjs private/sessions/<id> --choose probe=1   # take option 2 at step "probe" (repeatable)
//
// Screenshots go to <dir>/preview/ (git-ignored). Console errors are reported and fail the run.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import http from "node:http";
import { pathToFileURL } from "node:url";

const dir = process.argv[2];
const desktop = process.argv.includes("--desktop");
const picks = {}; // step id → option index, for testing branches
process.argv.forEach((a, i) => { if (a === "--choose") { const [id, n] = String(process.argv[i + 1] || "").split("="); picks[id] = Number(n) || 0; } });
if (!dir) { console.error("usage: node tools/preview.mjs <session-dir> [--desktop]"); process.exit(2); }

let chromium;
try { ({ chromium } = await import("playwright")); }
catch {
  const globalRoot = execSync("npm root -g").toString().trim();
  ({ chromium } = await import(pathToFileURL(path.join(globalRoot, "playwright", "index.mjs")).href));
}

const page_ = fs.readFileSync(path.join(dir, "experience.html"), "utf8");
const outDir = path.join(dir, "preview");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
// The Artifact host wraps the page in this skeleton at publish time; mirror it locally.
const shell = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${page_}</body></html>`;
fs.writeFileSync(path.join(outDir, "index.html"), shell);
// Serve the session folder over HTTP so the page can load its narration clips like it does when published.
let clipsServed = 0;
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  const file = url === "/" ? path.join(outDir, "index.html") : path.join(dir, path.normalize(url).replace(/^(\.\.[/\\])+/, ""));
  if (!file.startsWith(path.resolve(dir)) && !file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  if (url.startsWith("/audio/")) clipsServed++;
  res.writeHead(200, { "content-type": file.endsWith(".html") ? "text/html" : file.endsWith(".mp3") ? "audio/mpeg" : "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const pageUrl = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch();
const problems = [];

async function walk(label, viewport) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on("console", m => { if (m.type() === "error" && !/fonts\.(googleapis|gstatic)/.test(m.text())) problems.push(`[${label}] console: ${m.text()}`); });
  page.on("pageerror", e => problems.push(`[${label}] error: ${e.message}`));
  await page.addInitScript(() => { window.__INNERSKY_TIMESCALE = 0.03; try { localStorage.clear(); } catch {} });
  await page.goto(pageUrl);
  await page.waitForTimeout(400);

  const visited = [];
  for (let n = 0; n < 120; n++) {
    const { step, type } = await page.evaluate(() => ({ step: document.body.dataset.step, type: document.body.dataset.type }));
    if (!step) break;
    if (visited.at(-1) !== step) {
      await page.waitForTimeout(700);
      await page.screenshot({ path: path.join(outDir, `${label}-${String(visited.length).padStart(2, "0")}-${step}.png`) });
      visited.push(step);
    }
    const screen = page.locator(".screen").last();
    // act like a person would on each kind of step
    if (type === "write") await screen.locator("textarea").first().fill("A few honest words, written in the preview.");
    if (type === "choose") await screen.locator(".opt").nth(picks[step] || 0).click();
    if (type === "words") { const chips = screen.locator(".chip"); await chips.nth(0).click(); await chips.nth(1).click(); }
    if (type === "scale") await screen.locator("input[type=range]").evaluate(r => { r.value = 6; r.dispatchEvent(new Event("input", { bubbles: true })); });
    if (type === "body") await screen.locator(".chip").nth(2).click();
    if (type === "release") { await screen.locator("textarea").fill("the thing I'm putting down"); await screen.locator(".row .btn").click(); }
    if (["breath", "guided", "sit"].includes(type)) { const b = screen.locator(".btn").first(); if (await b.count()) await b.click(); }
    if (type === "card") {
      await page.waitForTimeout(500);
      // the look-back screen: open it, expand the first step, mark it, and capture it
      await page.locator("#look-back").click();
      await page.locator(".lb-head").first().click();
      await page.locator(".lb-body:not([hidden]) .chip").first().click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(outDir, `${label}-${String(visited.length).padStart(2, "0")}-look-back.png`) });
      await page.locator(".overlay.lookback .actions .btn").click();
      break;
    }
    // wait for Continue (not Skip) to be offered, then take it
    const ok = await page.waitForFunction(() => {
      const b = document.getElementById("next");
      return b && !b.classList.contains("hide") && !b.classList.contains("quiet");
    }, null, { timeout: 15000 }).then(() => true, () => false);
    if (!ok) {
      const label2 = await page.locator("#next").textContent();
      if (label2 && /skip/i.test(label2)) { await page.locator("#next").click(); }
      else { problems.push(`[${label}] stuck on step "${step}" (${type})`); break; }
    } else {
      await page.locator("#next").click();
    }
    await page.waitForTimeout(150);
  }
  // the steady overlay
  await page.locator("#steady").click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(outDir, `${label}-zz-steady.png`) });
  await ctx.close();
  return visited;
}

const visited = await walk("phone", { width: 390, height: 844 });
if (desktop) await walk("desktop", { width: 1280, height: 820 });
await browser.close();
server.close();

console.log(`walked ${visited.length} steps: ${visited.join(" → ")}`);
console.log(`screenshots: ${outDir}`);
if (clipsServed) console.log(`narration clips loaded: ${clipsServed}`);
if (problems.length) { for (const p of problems) console.error("  ✗ " + p); process.exit(1); }
console.log("✓ no console errors");
