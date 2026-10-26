import type { ChartColor } from "./types.js";

const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
export const defaultFormat = (n: number) => nf.format(n);

/** A reference to a Faun token, as accepted wherever a chart takes a colour. Never a literal colour. */
export type CssVar = `var(--faun-${string})`;

/** The CSS custom property for a colour slot. A `var(--faun-…)` reference passes through unchanged. */
export const chartColorVar = (c: ChartColor | CssVar): string => (c.startsWith("var(") ? c : `var(--faun-dataviz-${c})`);

/**
 * The default colour slot of each chart type when it draws one series (ADR 0008), so charts side by side are not all moss. Values are categorical
 * token slots (`cat-N`), never literals, so palettes and tenant themes recolour them. Moss (`cat-1`) is the brand anchor: the bar chart uses it, and
 * with two or more series every chart starts at `cat-1` and follows the categorical order. An explicit `color` always wins.
 */
export const CHART_DEFAULT_SLOT = {
  bar: "cat-1", // moss
  line: "cat-2", // lagoon
  scatter: "cat-3", // ochre
  area: "cat-4", // plum
  radar: "cat-6", // blue
  histogram: "cat-2", // lagoon
  boxplot: "cat-6", // blue
  gauge: "cat-7", // grass
  bullet: "cat-7", // grass
  meter: "cat-7", // grass
  sparkline: "cat-2", // lagoon
} as const satisfies Record<string, ChartColor>;

/** Sequential ramp hue of each chart type that shades by value (ADR 0008). The moss ramp stays the brand ramp for custom use. */
export const CHART_DEFAULT_RAMP = { heatmap: "lagoon", treemap: "mauve", circlepack: "ochre" } as const;

/** Resolves the colour slot of each series: explicit, then GHG scope by id, then categorical in order. A lone unstyled series takes `single`, the chart type's default slot. */
export function resolveColors(series: { id: string; color?: ChartColor }[], single?: ChartColor): ChartColor[] {
  let cat = 0;
  const lone = series.length === 1 && !series[0]!.color && !/^scope-[123]$/.test(series[0]!.id);
  return series.map((s) => {
    if (lone && single) return single;
    if (s.color) return s.color;
    if (s.id === "scope-1" || s.id === "scope-2" || s.id === "scope-3") return s.id;
    cat += 1;
    return `cat-${Math.min(cat, 8)}` as ChartColor;
  });
}

/** Rounds a step up to 1, 2, 2.5, 5 or 10 times a power of ten. */
function niceStep(raw: number) {
  const pow = 10 ** Math.floor(Math.log10(raw));
  const f = raw / pow;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * pow;
}

/** Evenly spaced round tick values covering [min, max]. */
export function niceTicks(min: number, max: number, count = 5): { ticks: number[]; min: number; max: number } {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { ticks: [0, 1], min: 0, max: 1 };
  if (min === max) { max = min + (min === 0 ? 1 : Math.abs(min) * 0.1); }
  const step = niceStep((max - min) / Math.max(count - 1, 1));
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v / step) * step);
  return { ticks, min: lo, max: hi };
}

/** Maps a value in [d0, d1] to [r0, r1]. */
export const linear = (d0: number, d1: number, r0: number, r1: number) => (v: number) => (d1 === d0 ? r0 : r0 + ((v - d0) / (d1 - d0)) * (r1 - r0));

/** Keeps every nth label so labels of the given estimated width fit in the available width. */
export function labelStride(count: number, available: number, labelWidth: number) {
  const fit = Math.max(1, Math.floor(available / Math.max(labelWidth, 1)));
  return Math.max(1, Math.ceil(count / fit));
}

export const truncate = (s: string, max: number) => (s.length > max ? `${s.slice(0, Math.max(max - 1, 1))}…` : s);

/** Approximate rendered width of a caption-size label, in px. */
export const textWidth = (s: string) => s.length * 6.5;
