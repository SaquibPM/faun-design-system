// Prepends the "use client" directive to built entry files.
// Bundlers (tsup/rollup) drop module-level directives while tree-shaking, so we add it after the build.
// Usage: node ../../scripts/use-client.mjs dist/index.js
import { readFileSync, writeFileSync } from "node:fs";
for (const file of process.argv.slice(2)) {
  const src = readFileSync(file, "utf8");
  if (/^\s*["']use client["']/.test(src)) continue;
  writeFileSync(file, `"use client";\n${src}`);
}
