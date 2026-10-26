#!/usr/bin/env node
// Prepares the built docs site for GitHub Pages under a subpath:
//
//   node scripts/prepare-pages.mjs --dist apps/docs/dist --base /<repo>/
//
//   * checks that every asset URL in index.html starts with the base (the site must be built with
//     `vite build --base /<repo>/`; the default `./` base is for file:// and artifact use)
//   * writes 404.html: a copy of index.html plus a tiny redirect, so a path typed or shared without the hash
//     (/<repo>/foundations/colour) lands on /<repo>/#/foundations/colour. GitHub Pages serves 404.html for unknown paths.
//   * writes .nojekyll
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const opt = (n) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : undefined);
const dist = resolve(opt("dist") ?? "apps/docs/dist");
const base = opt("base") ?? "/";
if (!base.startsWith("/") || !base.endsWith("/")) { console.error(`--base must start and end with "/", got "${base}"`); process.exit(2); }

const html = readFileSync(join(dist, "index.html"), "utf8");
const urls = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((m) => m[1]).filter((u) => !/^(?:https?:|data:|mailto:|#)/i.test(u));
const bad = urls.filter((u) => !u.startsWith(base));
if (bad.length) {
  console.error(`index.html has asset URLs that do not start with "${base}":\n  ${bad.join("\n  ")}\nBuild with: pnpm --filter ./apps/docs exec vite build --base ${base}`);
  process.exit(1);
}

const redirect = `<script>/* GitHub Pages fallback: /path -> #/path */(function(){var b=${JSON.stringify(base)},p=location.pathname;if(p.indexOf(b)===0&&!location.hash){var r=p.slice(b.length).replace(/^\\/+/,"");if(r&&r!=="index.html"&&r!=="404.html")location.replace(b+"#/"+r+location.search);}})();</script>`;
writeFileSync(join(dist, "404.html"), html.replace("<head>", `<head>\n    ${redirect}`));
writeFileSync(join(dist, ".nojekyll"), "");
console.log(`pages: ${urls.length} asset URL(s) under ${base}; wrote 404.html and .nojekyll in ${dist}`);
