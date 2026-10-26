#!/usr/bin/env node
// Builds data/faun.json, the read-only dataset behind the MCP tools, from the repository:
// component docs and props, token JSON, the status map and the icon manifest.
// Usage: node scripts/build-data.mjs [--root <repo>] [--out <file>]
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defaultRoot, readComponents, readIcons, readProps, readStatusMap, readTokens, sortComponents } from "../../../scripts/lib/faun-docs.mjs";

/** Assembles the dataset. Exported for tests. */
export function buildData({ components, tokens, statusMap, icons }) {
  return {
    schema: 1,
    name: tokens.name,
    version: tokens.version,
    prefix: tokens.prefix,
    themes: Object.keys(tokens.themes),
    components: sortComponents(components).map(({ order, folder, ...c }) => ({ ...c, folder })),
    tokens: tokens.tokens,
    statusMap,
    icons: icons.icons,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined; };
  const root = resolve(arg("--root") ?? defaultRoot);
  const out = resolve(arg("--out") ?? resolve(dirname(fileURLToPath(import.meta.url)), "../data/faun.json"));
  const data = buildData({
    components: readComponents(root, readProps(root)),
    tokens: readTokens(root),
    statusMap: readStatusMap(root),
    icons: readIcons(root),
  });
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(data));
  console.log(`mcp data: ${data.components.length} components, ${data.tokens.length} tokens, ${Object.keys(data.statusMap.domains).length} status domains, ${data.icons.length} icons -> ${out}`);
}
