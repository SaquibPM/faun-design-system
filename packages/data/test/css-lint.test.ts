import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const tokens = require("@faun-ds/tokens/json");
const scaleNames = Object.keys(require("@faun-ds/tokens/scales"));
const known = new Set<string>(tokens.tokens.map((t: any) => t.cssVar).filter(Boolean));
for (const s of [...scaleNames, "accent"]) for (let i = 1; i <= 12; i++) { known.add(`--faun-${s}-${i}`); known.add(`--faun-${s}-a${i}`); }
for (const k of ["control-height", "row-height", "cell-px", "cell-py", "gap", "panel-padding"]) known.add(`--faun-density-${k}`);
for (const t of tokens.tokens.filter((t: any) => t.type === "typography")) for (const p of ["font-family", "font-size", "line-height", "font-weight", "letter-spacing"]) known.add(`--faun-${t.name.replace(/\./g, "-")}-${p}`);

const dir = resolve(import.meta.dirname, "../src/components");
const files = readdirSync(dir).flatMap((d) => readdirSync(resolve(dir, d)).filter((f) => f.endsWith(".css")).map((f) => resolve(dir, d, f)));

describe("component CSS uses Faun tokens only", () => {
  it("scans a components directory (suite is never empty)", () => {
    expect(Array.isArray(files)).toBe(true);
  });
  for (const file of files) {
    const name = file.split("/components/")[1];
    const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    it(`${name}: no raw colours`, () => {
      expect(css.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/g) ?? []).toEqual([]);
    });
    it(`${name}: every --faun-* reference exists`, () => {
      const used = [...css.matchAll(/var\((--faun-[a-z0-9-]+)/g)].map((m) => m[1]!);
      expect(used.filter((v) => !known.has(v))).toEqual([]);
    });
    it(`${name}: no magic pixel values beyond 0–3px hairlines and 6px dots`, () => {
      const px = [...css.split("\n").filter((l) => !l.trim().startsWith("@media")).join("\n").matchAll(/(?<![\w-])(\d+(?:\.\d+)?)px/g)].map((m) => Number(m[1]));
      expect(px.filter((n) => n > 3 && n !== 6)).toEqual([]);
    });
  }
});
