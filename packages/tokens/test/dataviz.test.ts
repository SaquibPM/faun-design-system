import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { THEMES, collectSemantic, contrast, scales, viz, type ThemeName } from "../scripts/lib.ts";
import { ORDER, buildViz } from "../scripts/viz.ts";
import { PALETTE_IDS, paletteScopeCss, paletteValues } from "../scripts/relief.ts";
import { dE, hueOf, lc } from "./cvd.ts";

const by = new Map(collectSemantic().map((s) => [s.name, s]));
const val = (name: string, t: ThemeName) => by.get(name)!.value[t];
const MODES = ["light", "dark"] as const;
const CAT = Array.from({ length: 8 }, (_, i) => `dataviz.cat-${i + 1}`);
const SCOPES = ["scope-1", "scope-2", "scope-3", "scope-outside"].map((s) => `dataviz.${s}`);
const ramp = (prefix: string, names: string[], t: ThemeName) => names.map((n) => val(`dataviz.${prefix}${n}`, t));
const SEQ = ["1", "2", "3", "4", "5", "6", "7"];
const DIV = ["neg-3", "neg-2", "neg-1", "mid", "pos-1", "pos-2", "pos-3"];

describe("data-viz palette is Faun's own", () => {
  it("is the pinned output of the generator (edit scripts/viz.ts, then `pnpm --filter @faun-ds/tokens viz`)", () => {
    expect(viz).toEqual(JSON.parse(JSON.stringify(buildViz())));
  });
  it("orders the categorical slots moss, lagoon, ochre, plum, oxblood, blue, grass, warm grey", () => {
    expect(viz.order).toEqual(["moss", "lagoon", "ochre", "plum", "ember", "blue", "grass", "warmgray"]);
    expect([...ORDER]).toEqual(viz.order);
    viz.order.forEach((n: string, i: number) => expect(by.get(`dataviz.cat-${i + 1}`)!.expr.light, n).toBe(`{viz.${n}}`));
  });
  for (const mode of MODES) {
    it(`${mode}: categorical slot 1 is exactly the brand scale's solid step`, () => {
      expect(val("dataviz.cat-1", mode)).toBe(scales.moss[mode].steps["9"]);
      expect(viz[mode].moss).toBe(scales.moss[mode].steps["9"]);
    });
    it(`${mode}: slots keep the hue of the Faun scale they come from`, () => {
      const src: Record<string, string> = { moss: "moss", lagoon: "lagoon", ochre: "amber", plum: "plum", ember: "ember", blue: "blue", grass: "grass", warmgray: "gray" };
      for (const n of viz.order) {
        const sc = hueOf(scales[src[n]!][mode].steps["9"]);
        const d = Math.abs(((hueOf(viz[mode][n]) - sc + 540) % 360) - 180);
        expect(d, `${mode} ${n}`).toBeLessThanOrEqual(n === "warmgray" ? 1 : 8);
      }
    });
  }
  it("keeps the dark neutral and the warm paper grey on the gray scale's solid step", () => {
    for (const m of MODES) expect(viz[m].warmgray).toBe(scales.gray[m].steps["9"]);
  });
});

describe("data-viz lightness band and chroma floor", () => {
  const BAND = { light: [0.36, 0.66], dark: [0.55, 0.82] } as const;
  for (const mode of MODES) {
    it(`${mode}: every categorical colour sits in the lightness band and above the chroma floor (warm grey is the neutral, exempt)`, () => {
      for (const n of viz.order) {
        const { l, c } = lc(viz[mode][n]);
        expect(l, `${n} L`).toBeGreaterThanOrEqual(BAND[mode][0]);
        expect(l, `${n} L`).toBeLessThanOrEqual(BAND[mode][1]);
        if (n !== "warmgray") expect(c, `${n} chroma`).toBeGreaterThanOrEqual(0.04);
      }
    });
  }
});

describe("data-viz marks against the chart surface and the canvas", () => {
  for (const t of THEMES) {
    it(`${t}: every categorical and scope colour is at least 3:1 against dataviz.surface and bg.canvas`, () => {
      const bad: string[] = [];
      for (const n of [...CAT, ...SCOPES]) for (const bg of ["dataviz.surface", "bg.canvas"]) {
        const r = contrast(val(n, t), val(bg, t));
        if (r < 3) bad.push(`${n} on ${bg} ${r.toFixed(2)}`);
      }
      expect(bad).toEqual([]);
    });
  }
});

describe("GHG scopes", () => {
  it("keep their meaning: oxblood, ochre, blue, warm grey, from the same family as the categorical slots", () => {
    expect(by.get("dataviz.scope-1")!.expr.light).toBe("{viz.ember}");
    expect(by.get("dataviz.scope-2")!.expr.light).toBe("{viz.ochre}");
    expect(by.get("dataviz.scope-3")!.expr.light).toBe("{viz.blue}");
    expect(by.get("dataviz.scope-outside")!.expr.light).toBe("{gray.9}");
  });
  for (const mode of MODES) {
    it(`${mode}: scopes 1 to 3 and the outside colour part for normal vision (ΔE ≥ 12), and scopes 1 to 3 for protan and deutan (ΔE ≥ 8)`, () => {
      const s = SCOPES.map((n) => val(n, mode));
      for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) expect(dE(s[i]!, s[j]!), `${i + 1}/${j + 1}`).toBeGreaterThanOrEqual(12);
      for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) for (const k of ["protan", "deutan"] as const) expect(dE(s[i]!, s[j]!, k), `${k} ${i + 1}/${j + 1}`).toBeGreaterThanOrEqual(8);
    });
  }
});

describe("sequential ramps", () => {
  const lum = (h: string) => lc(h).l;
  for (const t of ["light", "dark"] as ThemeName[]) for (const [name, prefix] of [["moss", "seq-"], ["warm grey", "seq-neutral-"], ["lagoon", "seq-lagoon-"], ["mauve", "seq-mauve-"], ["ochre", "seq-ochre-"]] as const) {
    it(`${t} ${name}: seven steps, ordered by lightness (light to dark in light themes, dark to light in dark), each step ΔE ≥ 8 from the next`, () => {
      const r = ramp(prefix, SEQ, t);
      expect(r).toHaveLength(7);
      for (let i = 0; i < 6; i++) {
        if (t === "light") expect(lum(r[i + 1]!), `${i + 1}`).toBeLessThan(lum(r[i]!)); else expect(lum(r[i + 1]!), `${i + 1}`).toBeGreaterThan(lum(r[i]!));
        expect(dE(r[i]!, r[i + 1]!), `${i + 1}`).toBeGreaterThanOrEqual(8);
        for (const k of ["protan", "deutan"] as const) expect(dE(r[i]!, r[i + 1]!, k), `${k} ${i + 1}`).toBeGreaterThanOrEqual(8);
      }
    });
  }
  it("builds the moss ramp on the moss scale: same hue, and the brand solid is a step in light themes", () => {
    const r = ramp("seq-", SEQ, "light");
    expect(r[5]).toBe(scales.moss.light.steps["9"]);
    for (const h of r) expect(Math.abs(hueOf(h) - hueOf(scales.moss.light.steps["9"])), h).toBeLessThan(12);
  });
});

describe("diverging ramps and colour-vision deficiency", () => {
  const ramps = { "moss to oxblood": "div-", "blue to amber": "div-alt-" } as const;
  for (const mode of MODES) for (const [name, prefix] of Object.entries(ramps)) {
    const r = () => ramp(prefix, DIV, mode);
    it(`${mode} ${name}: runs from the warm-grey midpoint outwards by lightness, and every step parts from the next for normal vision, protan and deutan (ΔE ≥ 8)`, () => {
      const v = r();
      expect(v[3]).toBe(scales.gray[mode].steps["6"]);
      // Light themes: the ends are darkest and the midpoint lightest. Dark themes: the ends are lightest and the midpoint darkest.
      const out = mode === "light" ? 1 : -1;
      for (let i = 0; i < 3; i++) {
        expect((lc(v[i + 1]!).l - lc(v[i]!).l) * out, `neg ${i}`).toBeGreaterThan(0);
        expect((lc(v[5 - i]!).l - lc(v[6 - i]!).l) * out, `pos ${i}`).toBeGreaterThan(0);
      }
      for (let i = 0; i < 6; i++) {
        expect(dE(v[i]!, v[i + 1]!), `${i}`).toBeGreaterThanOrEqual(8);
        for (const k of ["protan", "deutan"] as const) expect(dE(v[i]!, v[i + 1]!, k), `${k} ${i}`).toBeGreaterThanOrEqual(8);
      }
    });
    it(`${mode} ${name}: the two ends part for protan and deutan (ΔE ≥ 8)`, () => {
      const v = r();
      for (const k of ["protan", "deutan"] as const) expect(dE(v[0]!, v[6]!, k), k).toBeGreaterThanOrEqual(8);
    });
  }
  for (const mode of MODES) {
    it(`${mode} blue to amber: every mirrored pair parts for protan and deutan (ΔE ≥ 8), so sign is readable by colour alone`, () => {
      const v = ramp("div-alt-", DIV, mode);
      for (let i = 0; i < 3; i++) for (const k of ["protan", "deutan"] as const) expect(dE(v[i]!, v[6 - i]!, k), `${k} ${i}`).toBeGreaterThanOrEqual(8);
    });
  }
});

/* ---------------------------------------------------------------- pastel palettes (ADR 0007) */

describe("pastel palettes: meadow, dawn, harbour", () => {
  const dist = () => readFileSync(resolve(import.meta.dirname, "../dist/css/faun.css"), "utf8");
  const surface = (m: "light" | "dark") => val("dataviz.surface", m);
  const canvas = (m: "light" | "dark") => val("bg.canvas", m);
  const BAND = { light: [0.36, 0.66], dark: [0.55, 0.82] } as const;
  it("ships three options with eight slots each", () => {
    expect(PALETTE_IDS).toEqual(["meadow", "dawn", "harbour"]);
    for (const p of PALETTE_IDS) for (const m of MODES) expect(paletteValues(p, m)).toHaveLength(8);
  });
  for (const p of PALETTE_IDS) for (const mode of MODES) {
    const slots = () => paletteValues(p, mode);
    it(`${p} ${mode}: moss is series 1, exactly the brand solid step, and its pastel is a tint of the same hue`, () => {
      expect(slots()[0]!.deep).toBe(scales.moss[mode].steps["9"]);
      expect(slots()[0]!.name).toBe("moss");
      const d = Math.abs(((hueOf(slots()[0]!.face) - hueOf(slots()[0]!.deep) + 540) % 360) - 180);
      expect(d).toBeLessThanOrEqual(8);
    });
    it(`${p} ${mode}: the deep series colours hold the same contract as the default palette (band, chroma floor, 3:1 on the chart surface and canvas)`, () => {
      const bad: string[] = [];
      for (const s of slots()) {
        const { l, c } = lc(s.deep);
        if (l < BAND[mode][0] || l > BAND[mode][1]) bad.push(`${s.name} L ${l.toFixed(2)}`);
        if (s.name !== "stone" && s.name !== "slate" && s.name !== "clay" && c < 0.04 && s.name !== "moss") bad.push(`${s.name} chroma ${c.toFixed(3)}`);
        for (const bg of [surface(mode), canvas(mode)]) if (contrast(s.deep, bg) < 3) bad.push(`${s.name} ${contrast(s.deep, bg).toFixed(2)}:1`);
      }
      expect(bad).toEqual([]);
    });
    it(`${p} ${mode}: adjacent deep colours part for protan and deutan (ΔE ≥ 8) and normal vision (ΔE ≥ 15), as in the default palette`, () => {
      const d = slots().map((s) => s.deep);
      for (let i = 0; i < 7; i++) {
        for (const k of ["protan", "deutan"] as const) expect(dE(d[i]!, d[i + 1]!, k), `${k} ${i + 1}↔${i + 2}`).toBeGreaterThanOrEqual(8);
        expect(dE(d[i]!, d[i + 1]!), `${i + 1}↔${i + 2}`).toBeGreaterThanOrEqual(15);
      }
    });
    it(`${p} ${mode}: the outline and the wave carry the contrast the pastel face cannot (outline ≥ 3:1 on the surface and canvas, wave ≥ 1.7:1 on the face)`, () => {
      const bad: string[] = [];
      for (const s of slots()) {
        for (const bg of [surface(mode), canvas(mode)]) if (contrast(s.line, bg) < 3) bad.push(`${s.name} outline ${contrast(s.line, bg).toFixed(2)}:1`);
        if (contrast(s.tex, s.face) < 1.7) bad.push(`${s.name} wave on face ${contrast(s.tex, s.face).toFixed(2)}:1`);
      }
      expect(bad).toEqual([]);
    });
    it(`${p} ${mode}: pastel faces are a weaker colour channel and are held to a looser, documented separation (adjacent ΔE ≥ 5 normal, ≥ 2.5 protan/deutan) and stay off the surface`, () => {
      const f = slots().map((s) => s.face);
      for (let i = 0; i < 7; i++) {
        expect(dE(f[i]!, f[i + 1]!), `${i + 1}↔${i + 2}`).toBeGreaterThanOrEqual(5);
        for (const k of ["protan", "deutan"] as const) expect(dE(f[i]!, f[i + 1]!, k), `${k} ${i + 1}↔${i + 2}`).toBeGreaterThanOrEqual(2.5);
      }
      for (const [i, c] of f.entries()) expect(dE(c, surface(mode)), `face ${i + 1} on surface`).toBeGreaterThanOrEqual(8);
    });
    it(`${p} ${mode}: the face is a pastel, lighter than its deep colour in light themes and darker in dark ones`, () => {
      for (const s of slots()) {
        if (mode === "light") { expect(lc(s.face).l, s.name).toBeGreaterThanOrEqual(0.8); expect(lc(s.face).l, s.name).toBeGreaterThan(lc(s.deep).l); }
        else { expect(lc(s.face).l, s.name).toBeLessThanOrEqual(0.45); expect(lc(s.face).l, s.name).toBeLessThan(lc(s.deep).l); }
      }
    });
  }
  it("is switched by data-viz-palette on the same element, an ancestor or a descendant theme, in light, dark and system themes", () => {
    const css = paletteScopeCss();
    for (const p of PALETTE_IDS) {
      expect(css).toContain(`[data-viz-palette="${p}"],`);
      for (const t of ["light", "dark", "system"]) for (const form of [`[data-faun-theme="${t}"][data-viz-palette="${p}"]`, `[data-faun-theme="${t}"] [data-viz-palette="${p}"]`, `[data-viz-palette="${p}"] [data-faun-theme="${t}"]`]) expect(css, form).toContain(form);
    }
    expect(css).toContain("@media (prefers-color-scheme: dark)");
  });
  it("has a `default` scope that puts the default palette back inside a palette scope", () => {
    const css = paletteScopeCss();
    expect(css).toContain('[data-viz-palette="default"],');
    expect(css).toContain('[data-faun-theme="dark"] [data-viz-palette="default"]');
    expect(css).toMatch(/\[data-viz-palette="default"\][^{]*\{[^}]*--faun-dataviz-cat-2: #[0-9a-f]{6};/);
  });
  it("never applies in high-contrast themes or print: the reset blocks put the default colours back and unset the faces", () => {
    const css = paletteScopeCss();
    for (const t of ["light-hc", "dark-hc"]) expect(css).toContain(`[data-faun-theme="${t}"] [data-viz-palette]`);
    expect(css).toContain('@media print');
    expect(css).toMatch(/--faun-dataviz-cat-2-face: initial;/);
    const themed = dist();
    // every theme block starts the faces from "initial", so a nested theme never inherits a pastel from an ancestor palette
    expect((themed.match(/--faun-dataviz-cat-2-face: initial;/g) ?? []).length).toBeGreaterThanOrEqual(THEMES.length);
  });
  it("is part of the build outputs: CSS, JS and JSON", () => {
    const css = dist();
    for (const p of PALETTE_IDS) expect(css).toContain(`[data-viz-palette="${p}"]`);
    const js = readFileSync(resolve(import.meta.dirname, "../dist/js/index.js"), "utf8");
    expect(js).toContain("export const vizPalettes");
    const json = JSON.parse(readFileSync(resolve(import.meta.dirname, "../dist/json/tokens.json"), "utf8"));
    expect(Object.keys(json.vizPalettes)).toEqual([...PALETTE_IDS]);
  });
});
