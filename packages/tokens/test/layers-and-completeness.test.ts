import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { THEMES, collectFoundations, collectSemantic, foundations, contrast, composite, rgba } from "../scripts/lib.ts";

const semantic = collectSemantic();
const by = new Map(semantic.map((s) => [s.name, s]));
const found = new Map(collectFoundations().map((f) => [f.name, f]));
const DIST = resolve(import.meta.dirname, "../dist");

describe("layer tokens", () => {
  const MAP: Record<string, string> = {
    "layer.background": "bg.canvas", "layer.01": "bg.surface", "layer.02": "bg.surface-nested", "layer.03": "bg.sunken",
    "layer.accent": "bg.brand-soft", "layer.hover": "bg.hover", "layer.selected": "bg.selected",
  };
  for (const [layer, role] of Object.entries(MAP)) {
    it(`${layer} aliases ${role} in every theme`, () => {
      const l = by.get(layer)!, r = by.get(role)!;
      expect(l.aliasOf).toBe(role);
      expect(l.css.light).toBe(`var(${r.cssVar})`);
      for (const t of THEMES) expect(l.value[t], t).toBe(r.value[t]);
    });
  }
  it("separates layers 01, 02 and the ground in light and dark", () => {
    for (const t of ["light", "dark"] as const) {
      const [g, a, b] = ["layer.background", "layer.01", "layer.02"].map((n) => by.get(n)!.value[t]);
      expect(new Set([g, a, b]).size, t).toBe(3);
    }
  });
  it("keeps text readable on every layer in every theme", () => {
    for (const t of THEMES) for (const l of ["layer.background", "layer.01", "layer.02", "layer.03", "layer.accent"]) {
      let bg = by.get(l)!.value[t];
      if (rgba(bg)[3] < 1) bg = composite(bg, by.get("bg.surface")!.value[t]);
      expect(contrast(by.get("fg.default")!.value[t], bg), `${t} default on ${l}`).toBeGreaterThanOrEqual(7);
      expect(contrast(by.get("fg.muted")!.value[t], bg), `${t} muted on ${l}`).toBeGreaterThanOrEqual(4.5);
    }
  });
  it("emits layer variables in the CSS and the JSON", () => {
    const css = readFileSync(resolve(DIST, "css/faun.css"), "utf8");
    expect(css).toContain("--faun-layer-01: var(--faun-bg-surface);");
    const tokens = JSON.parse(readFileSync(resolve(DIST, "json/tokens.json"), "utf8")).tokens;
    expect(tokens.find((t: any) => t.name === "layer.03")?.cssVar).toBe("--faun-layer-03");
  });
});

describe("radius and elevation scales", () => {
  it("orders radii and raises elevation monotonically", () => {
    const px = (n: string) => parseFloat(found.get(`radius.${n}`)!.css);
    const order = ["none", "xs", "sm", "md", "lg", "xl", "full"].map(px);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(found.get("elevation.0")!.css).toBe("none");
    const blur = (n: number) => Math.max(...[...found.get(`elevation.${n}`)!.css.matchAll(/ (\d+)px (-?\d+)px var/g)].map((m) => Number(m[1])));
    for (let i = 2; i <= 5; i++) expect(blur(i), `elevation ${i}`).toBeGreaterThan(blur(i - 1));
  });
  it("keeps the documented role radii (ADR 0005)", () => {
    expect(["xs", "sm", "md", "lg", "xl"].map((n) => found.get(`radius.${n}`)!.css)).toEqual(["4px", "6px", "9px", "14px", "20px"]);
  });
});

/* Every planned token category (surfaces, layers, radius, elevation, type, space, grid, motion, themes) either exists or has a documented decision (ADR 0005). */
describe("token completeness", () => {
  const has = (n: string) => by.has(n) || found.has(n);
  const categories: { item: string; tokens: string[] }[] = [
    { item: "1 background / layer-01..03 / layer-accent", tokens: ["layer.background", "layer.01", "layer.02", "layer.03", "layer.accent"] },
    { item: "1 border-strong, border-subtle", tokens: ["border.strong", "border.subtle", "border.control"] },
    { item: "1 text-*", tokens: ["fg.default", "fg.muted", "fg.subtle", "fg.placeholder", "fg.on-accent", "fg.inverse", "status.danger.fg"] },
    { item: "1 link-*", tokens: ["fg.link", "fg.link-hover"] },
    { item: "1 support-* (status)", tokens: ["success", "warning", "danger", "info"].map((t) => `status.${t}.fg`) },
    { item: "1 focus, highlight, overlay", tokens: ["focus.ring", "focus.halo", "bg.selected", "bg.scrim"] },
    { item: "2 radius", tokens: ["xs", "sm", "md", "lg", "xl", "full"].map((r) => `radius.${r}`) },
    { item: "2 elevation", tokens: ["1", "2", "3", "4", "5"].map((e) => `elevation.${e}`) },
    { item: "3 type: serif figures and sans product set", tokens: ["type.figure-lg.font-size", "type.display-md.font-size", "type.body-md.font-size", "type.code-sm.font-size"] },
    { item: "4 spacing 2…160", tokens: ["space.0-5", "space.1", "space.2", "space.40"] },
    { item: "4 layout and container", tokens: ["layout.content-max", "layout.reading-max", "layout.nav-width", "grid.max-width", "grid.margin.md"] },
    { item: "5 grid", tokens: ["base", "sm", "md", "lg", "xl", "2xl"].flatMap((b) => [`grid.columns.${b}`, `grid.gutter.${b}`, `grid.gutter-narrow.${b}`, `grid.margin.${b}`]).concat(["grid.gutter-condensed"]) },
    { item: "5 breakpoints", tokens: ["sm", "md", "lg", "xl", "2xl"].map((b) => `breakpoint.${b}`) },
    { item: "6 motion durations and curves", tokens: ["fast", "moderate", "slow", "deliberate"].map((d) => `motion.duration.${d}`).concat(["standard", "enter", "exit", "emphasized"].map((e) => `motion.easing.${e}`), ["motion.spring.snappy", "motion.spring.gentle"]) },
  ];
  for (const c of categories) it(`item ${c.item} exists`, () => { for (const t of c.tokens) expect(has(t), t).toBe(true); });

  it("documents every deliberate deviation in ADR 0005", () => {
    const adr = readFileSync(resolve(import.meta.dirname, "../../../docs/adr/0005-radius-elevation-layers-grid.md"), "utf8");
    for (const d of ["field-01..03", "border-subtle-01..03", "icon-*", "productive and expressive", "fluid display", "2x mini-unit", "16-column", "layer-03"]) expect(adr, d).toContain(d);
  });
  it("ties grid columns and gutters to the Grid foundations page", () => {
    const c = (b: string) => Number(found.get(`grid.columns.${b}`)!.css);
    expect(["base", "sm", "md", "lg", "xl", "2xl"].map(c)).toEqual([4, 4, 8, 12, 12, 12]);
    expect(["sm", "md", "lg", "xl", "2xl"].map((b) => found.get(`grid.gutter.${b}`)!.css)).toEqual(["16px", "16px", "24px", "24px", "24px"]);
    expect(["sm", "md", "lg", "xl", "2xl"].map((b) => found.get(`breakpoint.${b}`)!.css)).toEqual(["640px", "768px", "1024px", "1280px", "1536px"]);
    expect(foundations.grid.columns.$type).toBe("number");
  });
});
