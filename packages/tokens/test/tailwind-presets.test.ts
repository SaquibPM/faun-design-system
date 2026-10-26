import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const DIST = resolve(import.meta.dirname, "../dist");
const read = (p: string) => readFileSync(resolve(DIST, p), "utf8");
const faun = read("css/faun.css");
const declared = new Set([...faun.matchAll(/^\s*(--faun-[a-z0-9-]+):/gm)].map((m) => m[1]!));
const refs = (css: string) => [...css.matchAll(/var\((--faun-[a-z0-9-]+)/g)].map((m) => m[1]!);


describe("Tailwind presets", () => {
  const std = read("tailwind/faun.css");
  const strict = read("tailwind/faun-strict.css");
  it("reference only declared tokens", () => {
    for (const [file, css] of [["faun.css", std], ["faun-strict.css", strict]] as const)
      for (const ref of refs(css)) expect(declared.has(ref), `${file} → ${ref}`).toBe(true);
  });
  it("strict is the standard preset plus the default resets", () => {
    const body = (css: string) => css.slice(css.indexOf("@theme inline {") + 15, css.indexOf("\n}\n")).split("\n").filter((l) => l.trim() && !/: initial;$/.test(l));
    expect(body(strict)).toEqual(body(std));
    expect((strict.match(/: initial;/g) ?? []).length).toBeGreaterThanOrEqual(7);
  });
  it("exposes layers, every radius and every elevation", () => {
    for (const c of ["layer-background", "layer-01", "layer-02", "layer-03", "layer-accent"]) expect(std, c).toContain(`--color-${c}:`);
    for (const r of ["none", "xs", "sm", "md", "lg", "xl", "full"]) expect(std, r).toContain(`--radius-${r}:`);
    for (const e of ["1", "2", "3", "4", "5"]) expect(std, e).toContain(`--shadow-${e}:`);
  });
  it("maps every Tailwind colour to a declared variable", () => {
    const vars = [...std.matchAll(/--color-([a-z0-9-]+): var\((--faun-[a-z0-9-]+)\)/g)];
    expect(vars.length).toBeGreaterThan(380);
    for (const [, n, v] of vars) expect(declared.has(v!), n).toBe(true);
  });
});
