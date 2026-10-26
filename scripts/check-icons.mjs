import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."));
const mod = await import(path.resolve("packages/icons/dist/index.js"));
const exp = new Set(Object.keys(mod));
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
for (const f of [...walk("packages/react/src"), ...walk("apps/docs/src"), ...(fs.existsSync("packages/data/src") ? walk("packages/data/src") : []), ...(fs.existsSync("packages/ai/src") ? walk("packages/ai/src") : [])].filter((f) => /\.tsx?$/.test(f))) {
  const s = fs.readFileSync(f, "utf8");
  for (const m of s.matchAll(/import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*"@faun-ds\/icons"/g))
    for (const n of m[1].split(",").map((x) => x.trim().replace(/^type\s+/, "").split(" as ")[0]).filter(Boolean))
      if (!exp.has(n) && n !== "FaunIcon" && !n.endsWith("Props")) console.log(f, n);
}
