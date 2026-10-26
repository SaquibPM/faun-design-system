// Concatenates every component stylesheet into dist/styles.css inside @layer faun.components.
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "..");
const dir = resolve(root, "src/components");
const files = [];
for (const d of readdirSync(dir).sort()) {
  const p = resolve(dir, d);
  for (const f of readdirSync(p).filter((f) => f.endsWith(".css")).sort()) files.push([d, resolve(p, f)]);
}
const shared = existsSync(resolve(root, "src/utils/shared.css")) ? readFileSync(resolve(root, "src/utils/shared.css"), "utf8") : "";
const body = files.map(([d, f]) => `/* ${d} */\n${readFileSync(f, "utf8").trim()}`).join("\n\n");
const out = `/* Faun Design System — @faun-ds/ai styles. Apache-2.0. Import after @faun-ds/tokens/css. */
@layer faun.base, faun.components, faun.utilities;
@layer faun.components {
${shared.trim()}

${body}
}
`;
mkdirSync(resolve(root, "dist"), { recursive: true });
writeFileSync(resolve(root, "dist/styles.css"), out);
writeFileSync(resolve(root, "dist/styles.d.ts"), "// Lets TypeScript resolve `import \"@faun-ds/ai/styles.css\"` without ambient CSS typings.\nexport {};\n");
console.log(`styles: ${files.length} stylesheets, ${(out.length / 1024).toFixed(1)} KB`);
