/**
 * Tenant theming. Turns one brand colour into a validated Faun accent scale for every theme.
 *
 *   import { createAccent } from "@faun-ds/tokens/theme";
 *   const acme = createAccent("#0057B8");
 *   acme.css      // paste into a <style> after faun.css, or inject at runtime
 *   acme.report   // contrast checks; acme.ok is false if the seed cannot meet them
 *
 * Faun's semantic tokens read the accent through --faun-accent-1…12 and a1…a12, so replacing that
 * scale re-brands buttons, focus, selection, links and charts without touching anything else.
 */
import { converter } from "culori";
import { alphaOver, hex, p3, stepColour, type Appearance, type ScaleDef } from "../scripts/scales.ts";

const toOklch = converter("oklch");
const APPEARANCES: Appearance[] = ["light", "dark", "light-hc", "dark-hc"];
const THEME_SELECTORS: Record<string, Appearance> = {
  ':root,\n[data-faun-theme="light"],\n[data-faun-theme="print"],\n[data-faun-theme="system"]': "light",
  '[data-faun-theme="dark"]': "dark",
  '[data-faun-theme="light-hc"]': "light-hc",
  '[data-faun-theme="dark-hc"]': "dark-hc",
};

export type AccentScale = Record<Appearance, Record<string, string>>;
export type AccentCheck = { appearance: Appearance; pair: string; ratio: number; min: number; pass: boolean };
export type Accent = { seed: string; scale: AccentScale; css: string; report: AccentCheck[]; ok: boolean };

export function createAccent(seed: string, options: { name?: string } = {}): Accent {
  const o = toOklch(seed);
  if (!o) throw new Error(`createAccent: "${seed}" is not a colour`);
  const hue = o.h ?? 160;
  const chroma = Math.max(0.04, Math.min(0.2, o.c));
  // Keep the brand recognisable but legible: white label on the light solid, dark label on the dark solid.
  const def: ScaleDef = {
    description: options.name ?? "Tenant accent",
    hue,
    chroma,
    solid: { light: Math.min(0.5, Math.max(0.32, o.l)), dark: Math.min(0.82, Math.max(0.68, o.l + 0.25)) },
    onSolid: { light: "light", dark: "dark" },
  };
  def.solidHc = { light: Math.min(def.solid.light, 0.37), dark: Math.max(def.solid.dark, 0.82) };
  const scale = {} as AccentScale;
  const p3s = {} as Record<Appearance, Record<string, string>>;
  for (const ap of APPEARANCES) {
    const steps: Record<string, string> = {};
    const p: Record<string, string> = {};
    const cs = Array.from({ length: 12 }, (_, i) => stepColour(def, ap, i + 1));
    cs.forEach((c, i) => { steps[String(i + 1)] = hex(c); p[String(i + 1)] = p3(c); });
    const bg = ap.startsWith("light") ? "#ffffff" : ap === "dark" ? "#0e100e" : "#0a0c0a";
    cs.forEach((_, i) => { steps[`a${i + 1}`] = alphaOver(steps[String(i + 1)]!, bg); });
    scale[ap] = steps;
    p3s[ap] = p;
  }

  const report: AccentCheck[] = [];
  for (const ap of APPEARANCES) {
    const s = scale[ap];
    const surface = ap.startsWith("light") ? "#ffffff" : ap === "dark" ? "#131614" : "#101210";
    const onSolid = ap.startsWith("light") ? "#ffffff" : s["1"]!;
    const hc = ap.endsWith("hc");
    report.push(check(ap, "label on solid (9)", onSolid, s["9"]!, hc ? 7 : 4.5));
    report.push(check(ap, "label on hovered solid (10)", onSolid, s["10"]!, hc ? 7 : 4.5));
    report.push(check(ap, "text (11) on surface", s["11"]!, surface, hc ? 7 : 4.5));
    report.push(check(ap, "focus ring (9) on surface", s["9"]!, surface, 3));
  }

  const decls = (ap: Appearance, list: Record<string, string>, ind: string) => Object.entries(list).map(([k, val]) => `${ind}--faun-accent-${k}: ${val};`).join("\n");
  const css =
    Object.entries(THEME_SELECTORS).map(([sel, ap]) => `${sel} {\n${decls(ap, scale[ap], "  ")}\n}`).join("\n") +
    `\n@media (prefers-color-scheme: dark) {\n  [data-faun-theme="system"] {\n${decls("dark", scale.dark, "    ")}\n  }\n}` +
    `\n@media (color-gamut: p3) {\n${Object.entries(THEME_SELECTORS).map(([sel, ap]) => `  ${sel.replace(/\n/g, " ")} {\n${decls(ap, p3s[ap], "    ")}\n  }`).join("\n")}\n}\n`;
  return { seed, scale, css, report, ok: report.every((r) => r.pass) };
}

function check(appearance: Appearance, pair: string, fg: string, bg: string, min: number): AccentCheck {
  const ratio = contrast(fg, bg);
  return { appearance, pair, ratio: Math.round(ratio * 100) / 100, min, pass: ratio >= min };
}
function lum(h: string) {
  const x = h.replace("#", "");
  const c = [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16) / 255).map((s) => (s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
}
export function contrast(a: string, b: string) {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
