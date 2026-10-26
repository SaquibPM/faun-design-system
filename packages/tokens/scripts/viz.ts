/**
 * Faun data-viz palette, derived from Faun's own colour scales (scales.ts) and pinned into src/scales/viz.json by generate-viz.ts.
 *
 *   categorical  moss (slot 1 = the brand solid step, exactly) → lagoon → ochre → plum → oxblood → blue → grass → warm grey
 *   sequential   moss ramp (and warm-grey, lagoon, mauve and ochre ramps, one hue per chart type, ADR 0008), seven steps, evenly spaced in OKLCH lightness, hue and chroma read off the scale
 *   diverging    moss ↔ oxblood through warm grey (default) and blue ↔ amber (the colour-blind-safe alternative)
 *
 * A categorical colour is a scale's solid step (9) unless the scale's solid cannot hold 3:1 against the chart surface or cannot be told from
 * a neighbour (amber's light solid is too pale for white; lagoon's dark solid sits on top of moss's). Those two keep the scale's hue and chroma
 * and move only lightness. Tests (test/dataviz.test.ts) hold the palette to the contract; this file only proposes values.
 */
import { SCALES, hex, stepColour, type ScaleDef } from "./scales.ts";
import { converter, type Oklch } from "culori";

export type Mode = "light" | "dark";
const oklch = converter("oklch");

/** Slot order of the categorical palette. Series 1 is the brand. */
export const ORDER = ["moss", "lagoon", "ochre", "plum", "ember", "blue", "grass", "warmgray"] as const;
type CatName = (typeof ORDER)[number];

/** Where each categorical colour comes from: a scale and either its solid step or a lightness override on that scale's hue and chroma. */
export const CATEGORICAL: Record<CatName, { scale: string; l?: Partial<Record<Mode, number>>; why: string }> = {
  moss: { scale: "moss", why: "Brand. The solid step of the brand scale." },
  lagoon: { scale: "lagoon", l: { dark: 0.6 }, why: "Lagoon solid; the dark one is deepened so it parts from moss." },
  ochre: { scale: "amber", l: { light: 0.62 }, why: "Amber hue; the light one is deepened to ochre so it holds 3:1 on paper." },
  plum: { scale: "plum", why: "Plum solid." },
  ember: { scale: "ember", why: "Oxblood solid." },
  blue: { scale: "blue", why: "Blue solid." },
  grass: { scale: "grass", why: "Grass solid." },
  warmgray: { scale: "gray", why: "Warm paper grey, the solid step. Always the last slot: quiet, neutral, “other”." },
};

const solid = (scale: string, mode: Mode, l?: number): Oklch => {
  const c = stepColour(SCALES[scale]!, mode, 9);
  return l == null ? c : { ...c, l };
};
export const categorical = (name: CatName, mode: Mode) => hex(solid(CATEGORICAL[name].scale, mode, CATEGORICAL[name].l?.[mode]));

/** Lightness, chroma and hue of the listed scale steps, ordered by lightness: the curve a ramp follows. */
function curve(scale: string, mode: Mode, steps: number[]) {
  const def = SCALES[scale]!;
  return steps.map((s) => stepColour(def, mode, s)).sort((a, b) => a.l - b.l);
}
function along(points: Oklch[], l: number): { c: number; h: number } {
  const lo = points.filter((p) => p.l <= l).at(-1) ?? points[0]!;
  const hi = points.find((p) => p.l >= l) ?? points.at(-1)!;
  const t = hi.l === lo.l ? 0 : (l - lo.l) / (hi.l - lo.l);
  return { c: lo.c + (hi.c - lo.c) * t, h: lo.h! + (hi.h! - lo.h!) * t };
}

/** Seven lightness stops, light to dark in light themes and dark to light in dark themes (more ink, more value). */
export const SEQ_L: Record<Mode, number[]> = {
  light: [0.94, 0.83, 0.72, 0.61, 0.5, 0.385, 0.262],
  dark: [0.3, 0.408, 0.516, 0.624, 0.732, 0.84, 0.948],
};
export const SEQ_HUES = { lagoon: "lagoon", mauve: "plum", ochre: "amber" } as const;
export function sequential(scale: "moss" | "gray" | (typeof SEQ_HUES)[keyof typeof SEQ_HUES], mode: Mode): string[] {
  const pts = curve(scale, mode, [4, 6, 7, 8, 9, 12]);
  return SEQ_L[mode].map((l, i) => {
    if (scale === "moss" && mode === "light" && i === 5) return hex(solid("moss", "light")); // the brand solid, exactly
    const { c, h } = along(pts, l);
    return hex({ mode: "oklch", l, c, h });
  });
}

/** One side of a diverging ramp, from the step beside the midpoint out to the extreme. */
function side(scale: string, mode: Mode, ls: number[], boost = 1): string[] {
  const def: ScaleDef = SCALES[scale]!;
  const base = oklch(stepColour(def, mode, 9))!;
  const f = [0.45, 0.75, 1];
  return ls.map((l, i) => hex({ mode: "oklch", l, c: base.c * f[i]! * boost, h: base.h }));
}
const MID = (mode: Mode) => hex(stepColour(SCALES.gray!, mode, 6));

/**
 * Diverging ramps, neg-3 … neg-1, mid, pos-1 … pos-3. Negative is the worse end, positive the better, as in every chart.
 * Moss and oxblood are both dark at equal magnitude and meet under deuteranopia, so the two sides are set at different lightness
 * (oxblood lighter, moss darker in light themes, the reverse in dark themes) and the ends part by lightness as well as hue.
 * The blue and amber ramp is symmetric and keeps every mirrored pair apart for colour-blind readers.
 */
const DIV_L = {
  primary: {
    light: { neg: [0.78, 0.65, 0.54], pos: [0.8, 0.59, 0.33] },
    dark: { neg: [0.46, 0.57, 0.68], pos: [0.52, 0.68, 0.84] },
  },
  alt: {
    light: { neg: [0.82, 0.68, 0.54], pos: [0.8, 0.65, 0.5] },
    dark: { neg: [0.52, 0.63, 0.74], pos: [0.52, 0.63, 0.74] },
  },
};
export function diverging(kind: "primary" | "alt", mode: Mode) {
  const [neg, pos, boost] = kind === "primary" ? ["ember", "moss", 1.45] : ["amber", "blue", 1];
  const L = DIV_L[kind][mode];
  const n = side(neg!, mode, L.neg).reverse();
  const p = side(pos!, mode, L.pos, boost as number);
  return { "neg-3": n[0]!, "neg-2": n[1]!, "neg-1": n[2]!, mid: MID(mode), "pos-1": p[0]!, "pos-2": p[1]!, "pos-3": p[2]! };
}

/**
 * Pastel palettes (ADR 0007). Each keeps moss as slot 1 and replaces slots 2 to 8 with a soft family. A palette slot is two colours:
 *
 *   deep  the series colour (`--faun-dataviz-cat-N`): same lightness band, 3:1 against the chart surface and canvas, and adjacent-slot CVD
 *         separation as the default palette. Strokes, points, outlines, side faces and wave lines derive from it. Slot 1 is the brand solid step, exactly.
 *   face  the pastel (`--faun-dataviz-cat-N-face`): the fill of a relief mark. Not held to 3:1, because the outline and the side carry the
 *         boundary; held instead to a looser adjacent separation, and every series also keeps its own wave texture.
 *
 * Deep colours were found by a coordinate search over lightness and hue (±14°) that maximises the tightest adjacent-slot margin; the results are pinned
 * here so the palette is reviewable, and test/dataviz.test.ts holds them to the contract.
 */
export const PALETTE_NAMES = ["meadow", "dawn", "harbour"] as const;
export type PaletteName = (typeof PALETTE_NAMES)[number];
type PSlot = { name: string; h: number; c: number; l: Record<Mode, number> };
export const PALETTES: Record<PaletteName, { label: string; description: string; slots: PSlot[] }> = {
  meadow: {
    label: "Meadow",
    description: "Soft greens and sage with sky, butter, blush and lilac. The calmest option, closest to the brand.",
    slots: [
      { name: "sage", h: 158, c: 0.1, l: { light: 0.62, dark: 0.57 } },
      { name: "butter", h: 92, c: 0.11, l: { light: 0.5, dark: 0.73 } },
      { name: "sky", h: 228, c: 0.1, l: { light: 0.54, dark: 0.69 } },
      { name: "blush", h: 20, c: 0.11, l: { light: 0.44, dark: 0.57 } },
      { name: "lilac", h: 300, c: 0.1, l: { light: 0.54, dark: 0.71 } },
      { name: "seafoam", h: 190, c: 0.08, l: { light: 0.62, dark: 0.81 } },
      { name: "stone", h: 80, c: 0.02, l: { light: 0.48, dark: 0.65 } },
    ],
  },
  dawn: {
    label: "Dawn",
    description: "Warm peach, lilac, butter and rose with a teal and a sky blue to cool them. The warmest option.",
    slots: [
      { name: "peach", h: 58, c: 0.12, l: { light: 0.54, dark: 0.57 } },
      { name: "lilac", h: 305, c: 0.1, l: { light: 0.54, dark: 0.69 } },
      { name: "butter", h: 90, c: 0.11, l: { light: 0.5, dark: 0.63 } },
      { name: "teal", h: 200, c: 0.08, l: { light: 0.58, dark: 0.77 } },
      { name: "rose", h: 10, c: 0.11, l: { light: 0.48, dark: 0.59 } },
      { name: "sky", h: 246, c: 0.1, l: { light: 0.48, dark: 0.57 } },
      { name: "clay", h: 45, c: 0.025, l: { light: 0.6, dark: 0.73 } },
    ],
  },
  harbour: {
    label: "Harbour",
    description: "Cool sky, lavender, mint and periwinkle with a sand and a blush for warmth. The coolest option.",
    slots: [
      { name: "sky", h: 238, c: 0.1, l: { light: 0.54, dark: 0.57 } },
      { name: "sand", h: 82, c: 0.08, l: { light: 0.5, dark: 0.63 } },
      { name: "lavender", h: 292, c: 0.1, l: { light: 0.54, dark: 0.71 } },
      { name: "mint", h: 164, c: 0.1, l: { light: 0.48, dark: 0.61 } },
      { name: "periwinkle", h: 262, c: 0.12, l: { light: 0.54, dark: 0.69 } },
      { name: "blush", h: 20, c: 0.09, l: { light: 0.44, dark: 0.57 } },
      { name: "slate", h: 250, c: 0.02, l: { light: 0.6, dark: 0.73 } },
    ],
  },
};
/** The pastel of a slot: a light, low-chroma colour of the same hue. Lightness alternates between neighbours so adjacent faces part by lightness as well as hue. */
const FACE = { light: { l: [0.82, 0.92], c: 0.07 }, dark: { l: [0.33, 0.43], c: 0.05 } } as const;
export function paletteSlots(name: PaletteName, mode: Mode): { deep: string; face: string; name: string }[] {
  const moss = oklch(stepColour(SCALES.moss!, mode, 9))!;
  const f = FACE[mode];
  const faceOf = (i: number, h: number, c: number) => hex({ mode: "oklch", l: f.l[i % 2]!, c: Math.min(c, f.c), h });
  return [
    { name: "moss", deep: hex(solid("moss", mode)), face: hex({ mode: "oklch", l: mode === "light" ? 0.86 : 0.38, c: mode === "light" ? 0.05 : 0.04, h: moss.h }) },
    ...PALETTES[name].slots.map((s, i) => ({ name: s.name, deep: hex({ mode: "oklch", l: s.l[mode], c: s.c, h: s.h }), face: faceOf(i + 1, s.h, s.c) })),
  ];
}

export function buildViz() {
  const out: Record<string, any> = {
    $description:
      "Data-viz palette, generated by scripts/generate-viz.ts from the Faun scales (scripts/viz.ts) and pinned here. Categorical slot 1 is the brand moss solid step. Validated by test/dataviz.test.ts: lightness band, chroma floor, 3:1 against the chart surface and canvas, adjacent CVD separation (ΔE ≥ 8, protan/deutan, Machado 2009), normal-vision separation (ΔE ≥ 15), ramp ordering and diverging colour-blind checks. Edit viz.ts and regenerate; do not hand-edit.",
    order: [...ORDER],
    source: Object.fromEntries(ORDER.map((n) => [n, { scale: CATEGORICAL[n].scale, ...(CATEGORICAL[n].l ? { lightness: CATEGORICAL[n].l } : {}), why: CATEGORICAL[n].why }])),
  };
  for (const mode of ["light", "dark"] as Mode[]) {
    const m: Record<string, string> = {};
    for (const n of ORDER) m[n] = categorical(n, mode);
    sequential("moss", mode).forEach((v, i) => (m[`seq-${i + 1}`] = v));
    sequential("gray", mode).forEach((v, i) => (m[`seqn-${i + 1}`] = v));
    for (const [hue, scale] of Object.entries(SEQ_HUES)) sequential(scale, mode).forEach((v, i) => (m[`seq${hue}-${i + 1}`] = v));
    for (const [k, v] of Object.entries(diverging("primary", mode))) m[`div-${k}`] = v;
    for (const [k, v] of Object.entries(diverging("alt", mode))) m[`divalt-${k}`] = v;
    out[mode] = m;
  }
  out.palettes = Object.fromEntries(PALETTE_NAMES.map((p) => [p, {
    label: PALETTES[p].label,
    description: PALETTES[p].description,
    names: ["moss", ...PALETTES[p].slots.map((x) => x.name)],
    ...Object.fromEntries((["light", "dark"] as Mode[]).map((mode) => [mode, Object.fromEntries(paletteSlots(p, mode).flatMap((x, i) => [[`cat-${i + 1}`, x.deep], [`face-${i + 1}`, x.face]]))])),
  }]));
  return out;
}
