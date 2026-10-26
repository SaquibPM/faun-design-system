#!/usr/bin/env node
// Generated-file drift check. Runs every generator and fails when an output changed, so a committed (or locally built)
// generated file can never silently disagree with its source.
//
//   pnpm check:generated [--twice] [--git]
//
// Works WITHOUT git: it hashes every generated output, regenerates, hashes again and compares.
//   * a file that existed before and now differs, or vanished  -> DRIFT (fails)
//   * a file that did not exist before (gitignored output, fresh clone) -> created, nothing to compare
//   --twice  regenerate a second time and require identical output (catches non-deterministic generators; this is
//            what makes the gitignored outputs, which a fresh checkout does not have, checkable too)
//   --git    also run `git diff --exit-code` and fail on untracked, non-ignored files (CI uses this)
//
// Generators: colour scales, data-viz palettes, tokens build, icons, package barrels, docs props.json, MCP data, llms files.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const twice = args.includes("--twice");
const useGit = args.includes("--git");

// Path filters (./packages/x) instead of package names, so a scope rename does not break this script.
const pnpm = (...a) => ["pnpm", a];
const GENERATORS = [
  { name: "colour scales", cmd: pnpm("--filter", "./packages/tokens", "run", "scales") },
  { name: "data-viz palettes", cmd: pnpm("--filter", "./packages/tokens", "run", "viz") },
  { name: "tokens build (css, json, js, tailwind, contrast)", cmd: pnpm("--filter", "./packages/tokens", "run", "build") },
  { name: "icons", cmd: pnpm("--filter", "./packages/icons", "run", "generate") },
  { name: "package barrels", cmd: ["node", ["-e", ["react", "data", "ai"].map((p) => `require("node:child_process").execFileSync("node",["packages/${p}/scripts/barrel.mjs"],{stdio:"inherit"})`).join(";")]] },
  { name: "docs props.json", cmd: pnpm("--filter", "./apps/docs", "run", "props") },
  { name: "MCP data", cmd: pnpm("--filter", "./packages/mcp", "run", "data") },
  { name: "llms.txt and llms-full.txt", cmd: pnpm("run", "build:llms") },
];
const OUTPUTS = [
  "packages/tokens/src/scales/scales.json",
  "packages/tokens/src/scales/viz.json",
  "packages/tokens/dist",
  "packages/icons/src/generated",
  "packages/react/src/index.ts",
  "packages/data/src/index.ts",
  "packages/ai/src/index.ts",
  "apps/docs/src/generated/props.json",
  "packages/mcp/data",
  "apps/docs/public/llms.txt",
  "apps/docs/public/llms-full.txt",
];

function walk(abs, out) {
  if (!existsSync(abs)) return;
  if (statSync(abs).isDirectory()) { for (const n of readdirSync(abs).sort()) walk(join(abs, n), out); return; }
  out.set(relative(root, abs), createHash("sha256").update(readFileSync(abs)).digest("hex"));
}
const snapshot = () => { const m = new Map(); OUTPUTS.forEach((o) => walk(join(root, o), m)); return m; };
const generate = () => {
  for (const g of GENERATORS) {
    process.stdout.write(`  generating ${g.name} ... `);
    try { execFileSync(g.cmd[0], g.cmd[1], { cwd: root, stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 }); console.log("ok"); }
    catch (e) { console.log("FAILED"); console.error(String(e.stdout ?? "") + String(e.stderr ?? "")); process.exit(2); }
  }
};
const diff = (a, b) => {
  const changed = [], removed = [], added = [];
  for (const [f, h] of a) { if (!b.has(f)) removed.push(f); else if (b.get(f) !== h) changed.push(f); }
  for (const f of b.keys()) if (!a.has(f)) added.push(f);
  return { changed, removed, added };
};

console.log("Generated-file drift check\n");
const before = snapshot();
console.log(`hashed ${before.size} existing generated file(s)\n`);
generate();
const after = snapshot();
const d = diff(before, after);
let bad = false;
if (d.changed.length || d.removed.length) {
  bad = true;
  console.log("\nDRIFT: generated files differ from what the generators produce now:");
  d.changed.forEach((f) => console.log(`  changed  ${f}`));
  d.removed.forEach((f) => console.log(`  removed  ${f}`));
  console.log("Regenerate (pnpm build && pnpm build:llms) and commit the result.");
}
if (d.added.length) console.log(`\n${d.added.length} generated file(s) did not exist before (gitignored outputs); not compared${twice ? "" : " (use --twice to check they are reproducible)"}.`);
if (twice) {
  console.log("\nSecond pass for determinism:");
  generate();
  const d2 = diff(after, snapshot());
  if (d2.changed.length || d2.removed.length || d2.added.length) {
    bad = true;
    console.log("\nNON-DETERMINISTIC: a second run produced different output:");
    [...d2.changed, ...d2.removed, ...d2.added].forEach((f) => console.log(`  ${f}`));
  }
}
if (useGit) {
  try { execFileSync("git", ["rev-parse", "--git-dir"], { cwd: root, stdio: "ignore" }); } catch { console.log("\n--git given but this is not a git checkout; skipped."); }
  try {
    execFileSync("git", ["diff", "--exit-code", "--stat"], { cwd: root, stdio: "inherit" });
    const untracked = execFileSync("git", ["ls-files", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8" }).trim();
    if (untracked) { bad = true; console.log(`\nUntracked, non-ignored files appeared after generating:\n${untracked}`); }
  } catch (e) {
    if (e.status === 1) { bad = true; console.log("\ngit diff shows generated files changed (see above)."); }
  }
}
console.log(bad ? "\nFAILED" : "\nOK: every generator reproduces its committed/built output.");
process.exit(bad ? 1 : 0);
