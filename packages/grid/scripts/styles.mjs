// Generates dist/styles.css from the token JSON (breakpoints, columns). Runs after tsup.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildGridCss } from "../dist/css.js";

const require = createRequire(import.meta.url);
const tokens = require("@faun-ds/tokens/json");
const root = resolve(import.meta.dirname, "..");
const css = buildGridCss(tokens);
mkdirSync(resolve(root, "dist"), { recursive: true });
writeFileSync(resolve(root, "dist/styles.css"), css);
writeFileSync(resolve(root, "dist/styles.d.ts"), "// Lets TypeScript resolve `import \"@faun-ds/grid/styles.css\"` without ambient CSS typings.\nexport {};\n");
console.log(`styles: ${(css.length / 1024).toFixed(1)} KB`);
