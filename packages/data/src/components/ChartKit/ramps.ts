import type { CssVar } from "./scale.js";

/** Number of steps in the sequential ramp (`dataviz.seq-1` to `seq-7`). */
export const SEQ_STEPS = 7;
const DIV = ["div-neg-3", "div-neg-2", "div-neg-1", "div-mid", "div-pos-1", "div-pos-2", "div-pos-3"] as const;

/** Hue of a sequential ramp: moss (the brand ramp, `seq-N`) or one of the per-chart hues (`seq-<hue>-N`, ADR 0008). */
export type SeqHue = "moss" | "lagoon" | "mauve" | "ochre";
const seqName = (hue: SeqHue, i: number) => (hue === "moss" ? `seq-${i}` : `seq-${hue}-${i}`);

/** Sequential token for a position `t` in [0, 1]: 0 is the lowest step, 1 the highest. */
export function seqVar(t: number, hue: SeqHue = "moss"): CssVar {
  const i = Math.min(SEQ_STEPS - 1, Math.max(0, Math.floor((Number.isFinite(t) ? t : 0) * SEQ_STEPS)));
  return `var(--faun-dataviz-${seqName(hue, i + 1)})`;
}

/** Index 0 to 6 of the diverging step for a position `t` in [-1, 1]: -1 is the strongest negative, 0 the neutral middle. */
export const divIndex = (t: number) => Math.min(6, Math.max(0, Math.round(((Number.isFinite(t) ? t : 0) + 1) * 3)));

/** Diverging token for a position `t` in [-1, 1]. Negative steps are the "worse" end (oxblood), positive the "better" end (moss). */
export const divVar = (t: number): CssVar => `var(--faun-dataviz-${DIV[divIndex(t)]})`;

/** All seven sequential tokens, low to high, for legends. */
export const seqRamp = (hue: SeqHue = "moss"): CssVar[] => Array.from({ length: SEQ_STEPS }, (_, i) => `var(--faun-dataviz-${seqName(hue, i + 1)})` as CssVar);
/** All seven diverging tokens, negative to positive, for legends. */
export const divRamp = (): CssVar[] => DIV.map((n) => `var(--faun-dataviz-${n})` as CssVar);
