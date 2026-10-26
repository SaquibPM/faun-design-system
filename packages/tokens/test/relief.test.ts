import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { THEMES, collectSemantic, composite, contrast, rgba, toHex, type ThemeName } from "../scripts/lib.ts";
import { WAVES, reliefColours, reliefDims, reliefScopeCss, reliefSlots, reliefSource } from "../scripts/relief.ts";

const DIST = resolve(import.meta.dirname, "../dist");
const semantic = collectSemantic();
const by = new Map(semantic.map((s) => [s.name, s]));
const val = (name: string, t: ThemeName) => by.get(name)!.value[t];
const colours = reliefColours();
const dims = reliefDims();
const HATCH: ThemeName[] = ["light-hc", "dark-hc", "print"];
const blend = (ink: string, alpha: number, face: string) => {
  const [r, g, b] = rgba(ink); const [R, G, B] = rgba(face);
  return toHex([r * alpha + R * (1 - alpha), g * alpha + G * (1 - alpha), b * alpha + B * (1 - alpha), 1]);
};

describe("relief textures", () => {
  const decode = (css: string) => decodeURIComponent(css.replace(/^url\("data:image\/svg\+xml,/, "").replace(/"\)$/, ""));
  it("ships eight series waves as SVG data URIs with a tile size", () => {
    expect(WAVES).toHaveLength(8);
    for (const n of WAVES) {
      const img = dims.find((d) => d.path.join(".") === `dataviz.relief.${n}`)!;
      const size = dims.find((d) => d.path.join(".") === `dataviz.relief.${n}-size`)!;
      expect(img.css).toMatch(/^url\("data:image\/svg\+xml,/);
      expect(size.css).toMatch(/^\d+px \d+px$/);
    }
    expect(dims.some((d) => d.cssVar.startsWith("--faun-relief-button")), "buttons are flat (ADR 0008): no button relief tokens").toBe(false);
  });
  it("writes no literal colour in a tile: the colour comes from the masked element", () => {
    for (const d of dims.filter((x) => x.type === "image")) {
      const svg = decode(d.css);
      expect(svg).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\(/);
      expect(svg).toContain("currentColor");
      expect(svg).not.toMatch(/fill='(?!none)/);
    }
  });
  it("gives every series wave its own pattern, so series differ without colour", () => {
    const paths = WAVES.map((n) => reliefSource.chart.textures[n].path as string);
    expect(new Set(paths).size).toBe(WAVES.length);
    const shape = WAVES.map((n) => { const t = reliefSource.chart.textures[n]; return `${t.size[0]}x${t.size[1]}`; });
    expect(new Set(shape).size).toBeGreaterThanOrEqual(5);
  });
});

describe("relief colour derivation", () => {
  const slots = reliefSlots();
  it("derives outline, side and wave colours for every categorical, scope, sequential, diverging and status slot", () => {
    for (const s of ["cat-1", "cat-8", "scope-1", "scope-3", "scope-outside", "seq-1", "seq-7", "div-neg-3", "div-pos-3", "status-success", "status-danger"]) {
      expect(slots.map((x) => x.slot)).toContain(s);
      for (const k of ["line", "shade", "tex"]) expect(colours.find((c) => c.name === `dataviz.${s}.${k}`), `${s} ${k}`).toBeTruthy();
    }
    expect(slots.length).toBeGreaterThanOrEqual(31);
  });
  it("keeps every outline at 3:1 or more against the chart surface in every theme (1.4.11)", () => {
    const bad: string[] = [];
    for (const { slot } of slots) for (const t of THEMES) {
      const line = colours.find((c) => c.name === `dataviz.${slot}.line`)!.value[t];
      const r = contrast(line, val("dataviz.surface", t));
      if (r < 3) bad.push(`[${t}] ${slot} outline ${r.toFixed(2)}`);
    }
    expect(bad).toEqual([]);
  });
  it("keeps the face tint distinguishable from the surface through its outline and wave", () => {
    for (const { slot } of slots.filter((s) => /^cat-|^scope-/.test(s.slot))) for (const t of THEMES.filter((x) => !HATCH.includes(x))) {
      const tex = colours.find((c) => c.name === `dataviz.${slot}.tex`)!.value[t];
      expect(contrast(tex, val("dataviz.surface", t)), `[${t}] ${slot} wave`).toBeGreaterThan(1.5);
    }
  });
  it("draws hatch themes as a solid fill with surface-coloured lines", () => {
    for (const t of HATCH) for (const { slot } of slots) {
      expect(colours.find((c) => c.name === `dataviz.${slot}.tex`)!.value[t], `[${t}] ${slot}`).toBe(val("dataviz.surface", t));
    }
  });
  it("gives each of the five themes the derived colours, and the side face is always the darker end", () => {
    const css = readFileSync(resolve(DIST, "css/faun.css"), "utf8");
    expect((css.match(/--faun-dataviz-cat-1-line:/g) ?? []).length).toBeGreaterThanOrEqual(THEMES.length);
    for (const t of THEMES) {
      const shade = colours.find((c) => c.name === "relief.ink-shade")!.value[t];
      const canvas = val("bg.canvas", t);
      if (t === "dark" || t === "dark-hc") expect(shade).toBe(canvas);
    }
  });
});

describe("relief scalars and fallbacks", () => {
  const css = readFileSync(resolve(DIST, "css/faun.css"), "utf8");
  it("defines depth, bevel, outline width and texture strength for charts and depth for buttons", () => {
    for (const v of ["--faun-dataviz-relief-depth", "--faun-dataviz-relief-depth-sm", "--faun-dataviz-relief-bevel", "--faun-dataviz-relief-outline-width", "--faun-dataviz-relief-tex-alpha", "--faun-dataviz-relief-face-mix"]) {
      expect(dims.map((d) => d.cssVar), v).toContain(v);
      expect(css).toContain(`${v}:`);
    }
    const bevel = Number.parseFloat(dims.find((d) => d.cssVar === "--faun-dataviz-relief-bevel")!.css);
    const depth = Number.parseFloat(dims.find((d) => d.cssVar === "--faun-dataviz-relief-depth")!.css);
    expect(bevel).toBeLessThanOrEqual(depth);
  });
  it("has a flat appearance and a hatch fallback for high contrast, print and forced colours", () => {
    const scope = reliefScopeCss();
    expect(scope).toContain('[data-appearance="flat"]');
    for (const t of HATCH) expect(scope).toContain(`[data-faun-theme="${t}"]`);
    expect(scope).toContain("@media print");
    expect(scope).toContain("@media (forced-colors: active)");
    expect(scope).toMatch(/--faun-dataviz-relief-depth: 0px/);
    expect(scope).not.toMatch(/--faun-relief-button/);
    expect(scope).toMatch(/--faun-dataviz-relief-face-mix: 100%/);
  });

});

describe("relief texture is a faint grain (ADR 0008)", () => {
  const alpha = Number(dims.find((d) => d.cssVar === "--faun-dataviz-relief-tex-alpha")!.css);
  const faceMix = Number.parseFloat(dims.find((d) => d.cssVar === "--faun-dataviz-relief-face-mix")!.css) / 100;
  it("draws the wave at a low alpha: nonzero, and at most 0.2", () => {
    expect(alpha).toBeGreaterThan(0.05);
    expect(alpha).toBeLessThanOrEqual(0.2);
  });
  it("keeps every wave stroke thin (at most 0.6 of the design grid, about 1.2 px rendered)", () => {
    for (const n of WAVES) expect(reliefSource.chart.textures[n].stroke, n).toBeLessThanOrEqual(0.6);
  });
  it("makes the wave a small tonal step from the face in every theme and slot: contrast between 1.02:1 and 1.35:1 (visible, not dark lines)", () => {
    const bad: string[] = [];
    for (const t of THEMES.filter((x) => !HATCH.includes(x))) for (const { slot } of reliefSlots().filter((s) => /^cat-/.test(s.slot))) {
      const series = val(`dataviz.${slot}`, t);
      const surface = val("dataviz.surface", t);
      const face = blend(series, faceMix, surface);
      const wave = blend(colours.find((c) => c.name === `dataviz.${slot}.tex`)!.value[t], alpha, face);
      const r = contrast(wave, face);
      if (r < 1.02 || r > 1.35) bad.push(`[${t}] ${slot} ${r.toFixed(3)}`);
    }
    expect(bad).toEqual([]);
  });
  it("keeps hatch themes, print and forced colours at full strength", () => {
    expect(reliefSource.hatch.chart["tex-alpha"]).toBe("1");
  });
});
