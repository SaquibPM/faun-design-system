/** Colour-vision-deficiency maths shared by the data-viz tests: Machado, Oliveira & Fernandes (2009) severity 1.0; ΔE = Euclidean OKLab × 100. */
import { rgba } from "../scripts/lib.ts";

const M = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
};
export type Cvd = keyof typeof M;
const lin = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const oklab = ([r, g, b]: number[]) => {
  const l = Math.cbrt(0.4122214708 * r! + 0.5363325363 * g! + 0.0514459929 * b!), m = Math.cbrt(0.2119034982 * r! + 0.6806995451 * g! + 0.1073969566 * b!), s = Math.cbrt(0.0883024619 * r! + 0.2817188376 * g! + 0.6299787005 * b!);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
};
const sim = (h: string, k?: Cvd) => { const v = rgba(h).slice(0, 3).map(lin); return k ? oklab(M[k].map((row) => Math.min(1, Math.max(0, row[0]! * v[0]! + row[1]! * v[1]! + row[2]! * v[2]!)))) : oklab(v); };
export const dE = (a: string, b: string, k?: Cvd) => { const x = sim(a, k), y = sim(b, k); return Math.hypot(x[0]! - y[0]!, x[1]! - y[1]!, x[2]! - y[2]!) * 100; };
/** OKLab lightness and chroma of a hex colour. */
export const lc = (h: string) => { const [L, a, b] = sim(h); return { l: L!, c: Math.hypot(a!, b!) }; };
export const hueOf = (h: string) => { const [, a, b] = sim(h); return ((Math.atan2(b!, a!) * 180) / Math.PI + 360) % 360; };
