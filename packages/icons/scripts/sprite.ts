/** Builds dist/sprite.svg for non-React consumers (<svg><use href="sprite.svg#faun-scope-1"/></svg>) and copies the manifest. */
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const toKebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const src = readFileSync(resolve(ROOT, "src/generated/icons.ts"), "utf8");

const out: string[] = [];
for (const m of src.matchAll(/createIcon\("([^"]+)", (\[.*\])\);/g)) {
  const nodes: [string, Record<string, string>][] = JSON.parse(m[2]!);
  const inner = nodes.map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${toKebab(k)}="${v}"`).join(" ")}/>`).join("");
  out.push(`<symbol id="faun-${m[1]}" viewBox="0 0 24 24">${inner}</symbol>`);
}
writeFileSync(
  resolve(ROOT, "dist/sprite.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none">\n${out.join("\n")}\n</svg>\n`,
);
copyFileSync(resolve(ROOT, "src/generated/manifest.json"), resolve(ROOT, "dist/manifest.json"));
console.log(`sprite: ${out.length} symbols`);
