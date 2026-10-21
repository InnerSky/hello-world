#!/usr/bin/env node
// Render every named pose in engine/poses.json to one contact sheet, for checking how they look.
//
//   node tools/poses.mjs [out.png]      # default: engine/preview/poses.png (git-ignored)
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.resolve(process.argv[2] || path.join(root, "engine/preview/poses.png"));
fs.mkdirSync(path.dirname(out), { recursive: true });

let chromium;
try { ({ chromium } = await import("playwright")); }
catch {
  const globalRoot = execSync("npm root -g").toString().trim();
  ({ chromium } = await import(pathToFileURL(path.join(globalRoot, "playwright", "index.mjs")).href));
}

const poses = JSON.parse(fs.readFileSync(path.join(root, "engine/poses.json"), "utf8"));
const figure = fs.readFileSync(path.join(root, "engine/figure.js"), "utf8");
const names = Object.keys(poses).filter(k => !k.startsWith("_"));
const html = `<!doctype html><meta charset="utf-8"><style>
:root{--ink:#1b2230;--veil-strong:rgb(255 255 255 / .64);--ink-faint:rgb(27 34 48 / .46)}
body{margin:0;background:#c3c7ca;font:13px system-ui;display:grid;grid-template-columns:repeat(6,180px);gap:8px;padding:12px}
figure{margin:0;background:#d9dcdb;border-radius:8px;padding:6px;text-align:center}
.figure{width:160px;height:auto}
.fg-limb,.fg-torso{fill:none;stroke:var(--ink);stroke-linecap:round;stroke-linejoin:round}.fg-limb{stroke-width:7}.fg-torso{stroke-width:11}
.fg-head{fill:var(--veil-strong);stroke:var(--ink);stroke-width:6}.fg-hand{fill:var(--ink)}.fg-ground{stroke:var(--ink-faint);stroke-width:2}
</style><body><script>${figure}
const POSES = ${JSON.stringify(poses)};
for (const n of ${JSON.stringify(names)}) { const f = makeFigure(POSES, { start: n }); const fig = document.createElement("figure"); fig.append(f.el); const c = document.createElement("figcaption"); c.textContent = n; fig.append(c); document.body.append(fig); }
</script>`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1180, height: 400 } });
const errors = [];
page.on("pageerror", e => errors.push(e.message));
await page.setContent(html);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`${names.length} poses → ${out}`);
