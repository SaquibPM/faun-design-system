/** Writes src/scales/viz.json from scripts/viz.ts. Committed so every value is reviewable; run after editing scales.ts or viz.ts. */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildViz } from "./viz.ts";

const viz = buildViz();
writeFileSync(resolve(import.meta.dirname, "../src/scales/viz.json"), JSON.stringify(viz, null, 2) + "\n");
for (const mode of ["light", "dark"]) {
  console.log(mode);
  for (const [k, v] of Object.entries<string>(viz[mode])) console.log("  ", k.padEnd(14), v);
}
