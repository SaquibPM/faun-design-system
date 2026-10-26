#!/usr/bin/env node
// Consumer smoke test: proves the published packages work for someone who only has the tarballs.
//
//   pnpm build && node scripts/consumer-smoke.mjs [--only vite|next] [--react 18|19] [--keep] [--dir <path>]
//   node scripts/consumer-smoke.mjs --registry [--tag next|latest|<version>] [--registry-url <url>]   (no build needed)
//
// --registry installs the packages from the npm registry instead of local tarballs. Use it after publishing under
// the `next` dist-tag and before promoting to `latest` (docs/RELEASING.md). --tag picks the dist-tag or version to
// install (default: the version in packages/react/package.json). The README quick start is still taken from the
// local README.md, so run it from the commit that was released.
//
// 1. `pnpm pack` every publishable package.
// 2. Create a fresh Vite + React + TypeScript app and a fresh Next.js App Router app outside the repo,
//    install ONLY the tarballs (plus react and the optional Fontsource fonts) with npm.
// 3. Use the README quick start literally: src/main.tsx, src/App.tsx and app/layout.tsx are extracted from
//    README.md, so this test fails when the README drifts from what works.
// 4. `tsc --noEmit`, `vite build` / `next build`, then load the built app in Chromium and check for console
//    errors, applied styles, loaded fonts and horizontal overflow. A screenshot is kept.
//
// Needs Chromium: `pnpm exec playwright install chromium`, or set PLAYWRIGHT_CHROMIUM=/path/to/chrome.
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { packageScope, readManifests } from "./lib/publish-lib.mjs";

const root = resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : undefined);
const only = opt("only");
const registry = flag("registry");
const tag = opt("tag");
const registryUrl = opt("registry-url");
// --react 18 runs the same apps against React 18 (the peer range is ^18.2.0 || ^19.0.0). Default 19.
const reactMajor = opt("react") ?? "19";
if (!["18", "19"].includes(reactMajor)) throw new Error("--react must be 18 or 19");
const R = `^${reactMajor}.0.0`;
if (registryUrl) process.env.npm_config_registry = registryUrl;
// The npm scope comes from the manifests, so renaming the scope (scripts/rename-scope.mjs) needs no change here.
const scope = packageScope(readManifests(resolve(import.meta.dirname, ".."))) ?? "@faun-ds";
const keep = flag("keep") || Boolean(opt("dir"));
const work = opt("dir") ? resolve(opt("dir")) : mkdtempSync(join(tmpdir(), "faun-consumer-"));
mkdirSync(work, { recursive: true });

const UI = ["tokens", "icons", "grid", "react", "data", "ai"];
const PUBLISHABLE = [...UI, "eslint-plugin", "mcp"];
const FONTS = { "@fontsource/ibm-plex-sans": "^5.0.0", "@fontsource/ibm-plex-serif": "^5.0.0", "@fontsource/ibm-plex-mono": "^5.0.0" };

const log = (m) => console.log(`\n== ${m}`);
const run = (cmd, a, cwd, env = {}) => execFileSync(cmd, a, { cwd, stdio: "inherit", env: { ...process.env, ...env } });
const freePort = () => new Promise((ok) => { const s = createServer().listen(0, () => { const { port } = s.address(); s.close(() => ok(port)); }); });

// README extraction ----------------------------------------------------------------------------------------
const readme = readFileSync(join(root, "README.md"), "utf8");
const blocks = [...readme.matchAll(/```(\w+)\n([\s\S]*?)```/g)].map((m) => ({ lang: m[1], code: m[2] }));
const fromReadme = (lang, firstLine) => {
  const b = blocks.find((x) => x.lang === lang && x.code.startsWith(firstLine));
  if (!b) throw new Error(`README.md has no \`\`\`${lang} block starting with: ${firstLine}`);
  return b.code;
};
const mainTsx = fromReadme("tsx", 'import { StrictMode } from "react";');
const appTsx = fromReadme("tsx", 'import { useState } from "react";\nimport {\n  AppShell');
const layoutTsx = fromReadme("tsx", 'import type { ReactNode } from "react";');
const indexHtmlAttrs = fromReadme("html", '<html lang="en" data-faun-theme').trim();

// 1. Pack ---------------------------------------------------------------------------------------------------
const version = JSON.parse(readFileSync(join(root, "packages/react/package.json"), "utf8")).version;
const packs = join(work, "packs");
const tarball = (p) => join(packs, `${scope.slice(1)}-${p}-${version}.tgz`);
if (!registry) {
  log("pack publishable packages");
  rmSync(packs, { recursive: true, force: true });
  mkdirSync(packs);
  for (const p of PUBLISHABLE) run("pnpm", ["pack", "--pack-destination", packs], join(root, "packages", p));
  for (const p of PUBLISHABLE) if (!existsSync(tarball(p))) throw new Error(`missing tarball ${tarball(p)}`);
} else {
  log(`registry mode: installing ${scope}/* @ ${tag ?? version} from ${process.env.npm_config_registry ?? "the default npm registry"}`);
  for (const p of UI) {
    const v = execFileSync("npm", ["view", `${scope}/${p}@${tag ?? version}`, "version"], { encoding: "utf8" }).trim();
    console.log(`  ${scope}/${p}@${tag ?? version} -> ${v}`);
  }
}

// No workspace: protocol may leak into a published manifest.
for (const p of registry ? [] : PUBLISHABLE) {
  const dir = join(work, "unpack", p);
  mkdirSync(dir, { recursive: true });
  run("tar", ["-xzf", tarball(p), "-C", dir]);
  const manifest = readFileSync(join(dir, "package", "package.json"), "utf8");
  if (manifest.includes("workspace:")) throw new Error(`${p}: published package.json still contains workspace:`);
}

// 2. Chromium check -----------------------------------------------------------------------------------------
async function check(name, url) {
  const { chromium } = createRequire(join(root, "package.json"))("playwright");
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM || (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
  const browser = await chromium.launch({ executablePath });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const problems = [];
    page.on("console", (m) => { if ((m.type() === "error" || m.type() === "warning") && !m.text().startsWith("Failed to load resource")) problems.push(`${m.type()}: ${m.text()}`); });
    page.on("response", (r) => { if (r.status() >= 400 && !r.url().endsWith("/favicon.ico")) problems.push(`HTTP ${r.status()}: ${r.url()}`); });
    page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
    page.on("requestfailed", (r) => problems.push(`requestfailed: ${r.url()}`));
    await page.goto(url, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Emissions overview" }).waitFor({ timeout: 10000 });
    const facts = await page.evaluate(async () => {
      await document.fonts.ready;
      const cs = (el) => (el ? getComputedStyle(el) : null);
      return {
        buttonBg: cs(document.querySelector("button.faun-button"))?.backgroundColor,
        sideNavBg: cs(document.querySelector(".faun-side-nav"))?.backgroundColor,
        fonts: [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family),
        chart: Boolean(document.querySelector(".faun-chart")),
        table: Boolean(document.querySelector("[role=grid], table")),
        composer: Boolean(document.querySelector("textarea")),
        overflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });
    const shot = join(work, `${name}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    const fail = [];
    if (!facts.buttonBg || facts.buttonBg === "rgba(0, 0, 0, 0)") fail.push("Button has no background: component styles not applied");
    if (!facts.sideNavBg || facts.sideNavBg === "rgba(0, 0, 0, 0)") fail.push("Side navigation has no background");
    if (!facts.fonts.includes("IBM Plex Sans")) fail.push("IBM Plex Sans did not load");
    if (!facts.chart) fail.push("BarChart did not render");
    if (!facts.table) fail.push("DataTable did not render");
    if (!facts.composer) fail.push("PromptComposer did not render");
    if (facts.overflow) fail.push("page scrolls horizontally at 1440px");
    fail.push(...problems);
    console.log(`${name}: ${JSON.stringify(facts)}\n${name}: screenshot ${shot}`);
    if (fail.length) throw new Error(`${name} check failed:\n  - ${fail.join("\n  - ")}`);
    console.log(`${name}: ok (no console errors, styles applied)`);
  } finally {
    await browser.close();
  }
}

async function serve(cmd, a, cwd, port) {
  const child = spawn(cmd, a, { cwd, stdio: "ignore", env: { ...process.env, PORT: String(port) } });
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) return child; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  child.kill();
  throw new Error(`server ${cmd} ${a.join(" ")} did not start`);
}

const deps = () => Object.fromEntries(UI.map((p) => [`${scope}/${p}`, registry ? (tag ?? version) : `file:${tarball(p)}`]));
// Tarballs depend on each other at an exact version that is not on npm until released; the registry has them.
const overrides = () => (registry ? {} : deps());

// 3. Vite ---------------------------------------------------------------------------------------------------
async function vite() {
  log(`Vite + React ${reactMajor} + TypeScript`);
  const dir = join(work, `vite-app-r${reactMajor}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(dir, "src"), { recursive: true });
  const json = {
    name: "vite-app", private: true, type: "module", scripts: { build: "vite build" },
    dependencies: { react: R, "react-dom": R, ...deps(), ...FONTS },
    overrides: overrides(),
    devDependencies: { vite: "^6.4.0", "@vitejs/plugin-react": "^4.7.0", typescript: "~5.9.0", "@types/react": R, "@types/react-dom": R },
  };
  writeFileSync(join(dir, "package.json"), JSON.stringify(json, null, 2));
  writeFileSync(join(dir, "vite.config.ts"), 'import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\nexport default defineConfig({ plugins: [react()] });\n');
  writeFileSync(join(dir, "tsconfig.json"), JSON.stringify({ compilerOptions: { target: "ES2022", lib: ["ES2022", "DOM"], module: "ESNext", moduleResolution: "bundler", jsx: "react-jsx", strict: true, noEmit: true, skipLibCheck: true, types: ["vite/client"] }, include: ["src"] }, null, 2));
  writeFileSync(join(dir, "index.html"), `<!doctype html>\n${indexHtmlAttrs}\n  <head><meta charset="UTF-8" /><link rel="icon" href="data:," /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Faun Vite</title></head>\n  <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>\n</html>\n`);
  writeFileSync(join(dir, "src/main.tsx"), mainTsx);
  writeFileSync(join(dir, "src/App.tsx"), appTsx);
  run("npm", ["install", "--no-audit", "--no-fund"], dir);
  run("npx", ["tsc", "--noEmit"], dir);
  run("npx", ["vite", "build"], dir);
  const port = await freePort();
  const server = await serve("npx", ["vite", "preview", "--port", String(port), "--strictPort"], dir, port);
  try { await check(`vite-r${reactMajor}`, `http://127.0.0.1:${port}/`); } finally { server.kill(); }
}

// 4. Next.js ------------------------------------------------------------------------------------------------
async function next() {
  log(`Next.js App Router (React ${reactMajor})`);
  const dir = join(work, `next-app-r${reactMajor}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(dir, "app"), { recursive: true });
  const json = {
    name: "next-app", private: true, scripts: { build: "next build", start: "next start" },
    dependencies: { next: "^16.0.0", react: R, "react-dom": R, ...deps(), ...FONTS },
    overrides: overrides(),
    devDependencies: { typescript: "~5.9.0", "@types/node": "^22.0.0", "@types/react": R, "@types/react-dom": R },
  };
  writeFileSync(join(dir, "package.json"), JSON.stringify(json, null, 2));
  writeFileSync(join(dir, "tsconfig.json"), JSON.stringify({ compilerOptions: { target: "ES2022", lib: ["dom", "dom.iterable", "esnext"], allowJs: true, skipLibCheck: true, strict: true, noEmit: true, esModuleInterop: true, module: "esnext", moduleResolution: "bundler", resolveJsonModule: true, isolatedModules: true, jsx: "react-jsx", incremental: true, plugins: [{ name: "next" }] }, include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"], exclude: ["node_modules"] }, null, 2));
  // The layout comes from the README. The page is a Server Component that renders Faun directly, plus the
  // README's App as a client component.
  writeFileSync(join(dir, "app/layout.tsx"), layoutTsx.replace('import "@faun-ds/tokens/css/base";', 'import "@faun-ds/tokens/css/base";\nimport "@faun-ds/data/styles.css";\nimport "@faun-ds/ai/styles.css";'));
  writeFileSync(join(dir, "app/demo.tsx"), `"use client";\n${appTsx.replace("export default function App", "export function Demo")}`);
  writeFileSync(join(dir, "app/page.tsx"), `import { Button, StatusBadge } from "@faun-ds/react";\nimport { BarChart } from "@faun-ds/data";\nimport { Demo } from "./demo";\n\nexport default function Page() {\n  return (\n    <main>\n      <StatusBadge domain="run" state="awaiting_approval" />\n      <Button intent="accent" variant="solid">Server-rendered button</Button>\n      <BarChart title="Server chart" categories={["A", "B"]} series={[{ id: "s", label: "S", values: [1, 2] }]} />\n      <Demo />\n    </main>\n  );\n}\n`);
  run("npm", ["install", "--no-audit", "--no-fund"], dir);
  run("npx", ["next", "build"], dir, { NEXT_TELEMETRY_DISABLED: "1" });
  const port = await freePort();
  const server = await serve("npx", ["next", "start", "-p", String(port)], dir, port);
  try { await check(`next-r${reactMajor}`, `http://127.0.0.1:${port}/`); } finally { server.kill(); }
}

try {
  if (only !== "next") await vite();
  if (only !== "vite") await next();
  console.log("\nConsumer smoke test passed.");
} finally {
  if (keep) console.log(`kept ${work}`);
  else rmSync(work, { recursive: true, force: true });
}
