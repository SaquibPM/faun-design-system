/**
 * Faun colour scales.
 *
 * Every scale has 12 steps, each with one job (the Radix convention, which most modern systems now share):
 *   1 app background · 2 subtle background · 3 component background · 4 hovered component · 5 pressed / selected
 *   6 subtle border · 7 component border · 8 hovered / strong border · 9 solid fill · 10 hovered solid
 *   11 low-contrast text · 12 high-contrast text
 *
 * Scales are generated in OKLCH per appearance (light and dark are designed separately, not inverted),
 * then emitted as sRGB hex, as alpha twins (the same colour as a translucent overlay on the app background),
 * and as Display P3 for wide-gamut screens. Run:  pnpm --filter @faun-ds/tokens scales
 */
import { clampChroma, converter, formatHex, type Oklch } from "culori";

export type Appearance = "light" | "dark" | "light-hc" | "dark-hc";
export type ScaleDef = {
  description: string;
  hue: number;
  /** Hue drift from step 1 to step 12 (warmer lights / cooler darks reads more natural). */
  hueShift?: number;
  /** Peak chroma (reached at steps 9–10). */
  chroma: number;
  /** Lightness of the solid step (9) per appearance. */
  solid: { light: number; dark: number };
  /** Optional solid lightness for high-contrast appearances (labels on solids need 7:1). */
  solidHc?: { light: number; dark: number };
  /** Text colour on the solid step: "light" (white-ish) or "dark" (step 1 of the dark scale). */
  onSolid: { light: "light" | "dark"; dark: "light" | "dark" };
  /** Multiplier on the chroma curve; neutrals keep a whisper of hue. */
  tint?: number;
  /** Extra multiplier for dark appearances (dark neutrals need more tint to read as tinted at all). */
  tintDark?: number;
};

const L = {
  light: [0.993, 0.981, 0.958, 0.937, 0.914, 0.885, 0.842, 0.772, 0, 0, 0.49, 0.262],
  dark: [0.168, 0.197, 0.236, 0.266, 0.296, 0.334, 0.39, 0.466, 0, 0, 0.805, 0.948],
  // High contrast: text darker/brighter, borders stronger, backgrounds unchanged so layouts stay familiar.
  "light-hc": [0.995, 0.983, 0.955, 0.93, 0.9, 0.78, 0.66, 0.55, 0, 0, 0.38, 0.17],
  "dark-hc": [0.13, 0.165, 0.215, 0.25, 0.285, 0.46, 0.56, 0.64, 0, 0, 0.88, 0.985],
};
const C = {
  light: [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.62, 0.8, 1, 1, 0.9, 0.5],
  dark: [0.12, 0.16, 0.26, 0.34, 0.42, 0.5, 0.6, 0.74, 1, 1, 0.78, 0.3],
  "light-hc": [0.05, 0.1, 0.2, 0.3, 0.4, 0.6, 0.75, 0.9, 1, 1, 0.95, 0.55],
  "dark-hc": [0.12, 0.16, 0.26, 0.34, 0.42, 0.6, 0.7, 0.8, 1, 1, 0.6, 0.2],
};

export const SCALES: Record<string, ScaleDef> = {
  gray: {
    description: "Warm paper neutral, from the paper ground and surface. Grey with a trace of warmth for layers, rules and text.",
    hue: 88, hueShift: -4, chroma: 0.011, tint: 1, tintDark: 1.6,
    solid: { light: 0.6, dark: 0.56 }, onSolid: { light: "light", dark: "light" },
  },
  moss: {
    description: "Brand. The moss: primary actions, selection, focus, navigation chrome.",
    hue: 132, hueShift: -2, chroma: 0.05,
    solid: { light: 0.385, dark: 0.74 }, onSolid: { light: "light", dark: "dark" },
  },
  grass: {
    description: "Success: complete, verified, healthy.",
    hue: 146, chroma: 0.15,
    solid: { light: 0.52, dark: 0.74 }, onSolid: { light: "light", dark: "dark" },
  },
  blue: {
    description: "Information and human-driven progress.",
    hue: 252, chroma: 0.15,
    solid: { light: 0.53, dark: 0.72 }, onSolid: { light: "light", dark: "dark" },
  },
  lagoon: {
    description: "Running: an agent or job executing right now.",
    hue: 210, chroma: 0.11,
    solid: { light: 0.52, dark: 0.75 }, onSolid: { light: "light", dark: "dark" },
  },
  amber: {
    description: "Warning: estimated, partial, blocked, deprecated.",
    hue: 78, hueShift: -14, chroma: 0.16,
    solid: { light: 0.8, dark: 0.8 }, onSolid: { light: "dark", dark: "dark" },
  },
  ember: {
    description: "Danger: failed, missing, rejected, destructive. Oxblood, as the critical accent.",
    hue: 26, chroma: 0.15,
    solid: { light: 0.45, dark: 0.7 }, onSolid: { light: "light", dark: "dark" },
  },
  plum: {
    description: "Attention: waiting on a person. Approvals, reviews, human-in-the-loop gates.",
    hue: 318, chroma: 0.14,
    solid: { light: 0.5, dark: 0.74 }, onSolid: { light: "light", dark: "dark" },
  },
};

const toOklch = converter("oklch");
const toP3 = converter("p3");

export function stepColour(def: ScaleDef, appearance: Appearance, step: number): Oklch {
  const i = step - 1;
  const base = appearance.startsWith("light") ? "light" : "dark";
  let l = L[appearance][i]!;
  const solidL = appearance.endsWith("hc") && def.solidHc ? def.solidHc[base] : def.solid[base];
  if (step === 9) l = solidL;
  if (step === 10) l = solidL + (base === "light" ? -0.045 : 0.045);
  // Text steps on very light or very dark solids need a nudge so they stay readable as text.
  const mult = C[appearance][i]!;
  const c = def.chroma * mult * (def.tint ?? 1) * (base === "dark" ? (def.tintDark ?? 1) : 1);
  const h = def.hue + ((def.hueShift ?? 0) * i) / 11;
  return { mode: "oklch", l, c, h };
}

export const hex = (c: Oklch) => formatHex(clampChroma(c, "oklch", "rgb"));

/** Display-P3 rendition with ~12% more chroma, clamped to the P3 gamut. */
export function p3(c: Oklch): string {
  const boosted = clampChroma({ ...c, c: c.c * 1.12 }, "oklch", "p3");
  const v = toP3(boosted)!;
  const f = (n: number) => Math.max(0, Math.min(1, n)).toFixed(4);
  return `color(display-p3 ${f(v.r)} ${f(v.g)} ${f(v.b)})`;
}

/** Alpha twin: the colour C and opacity a such that C·a over `bg` composites to `target`. */
export function alphaOver(target: string, bg: string): string {
  const t = rgb(target), b = rgb(bg);
  let a = 0;
  for (let k = 0; k < 3; k++) {
    const need = t[k]! < b[k]! ? (b[k]! - t[k]!) / b[k]! : t[k]! > b[k]! ? (t[k]! - b[k]!) / (255 - b[k]!) : 0;
    a = Math.max(a, need);
  }
  a = Math.min(1, Math.max(a, 0.004));
  const c = t.map((tv, k) => Math.round((tv - b[k]! * (1 - a)) / a));
  const aa = Math.round(a * 255).toString(16).padStart(2, "0");
  return `#${c.map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("")}${aa}`;
}
function rgb(h: string): number[] {
  const x = h.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16));
}

export { toOklch };
