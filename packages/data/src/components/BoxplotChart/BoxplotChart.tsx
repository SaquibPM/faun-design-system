import { forwardRef } from "react";
import { Axes, HAxes, plotBox } from "../ChartKit/axes.js";
import { ChartShell, type ShellDrawing, type ShellSize, type ShellStep } from "../ChartKit/ChartShell.js";
import { ReferenceLines, referenceKindLabel } from "../ChartKit/parts.js";
import { ReliefBlock } from "../ChartKit/relief.js";
import { CHART_DEFAULT_SLOT, chartColorVar, defaultFormat, linear, niceTicks, truncate } from "../ChartKit/scale.js";
import type { ChartColor, ChartCommonProps, ChartReference } from "../ChartKit/types.js";

export interface BoxplotGroup {
  /** Name of the group, for example a region or a year. */
  label: string;
  /** Raw measurements. The chart works out the quartiles, whiskers and outliers (whiskers reach the furthest value within 1.5 times the interquartile range). */
  values?: number[];
  /** Or give the summary yourself. All five are needed together. */
  min?: number;
  q1?: number;
  median?: number;
  q3?: number;
  max?: number;
  /** With a summary: values beyond the whiskers. */
  outliers?: number[];
}

export interface BoxplotChartProps extends ChartCommonProps {
  groups: BoxplotGroup[];
  /** `vertical` puts groups along the bottom; `horizontal` puts them down the side. Default `vertical`. */
  orientation?: "vertical" | "horizontal";
  /** Unit of the values. */
  unit?: string;
  /** Formats a value. Default: thousands separators, up to one decimal. */
  format?: (value: number) => string;
  /** Colour slot for the boxes. Default `cat-6`. */
  color?: ChartColor;
  /** Lines on the measure axis, such as a limit. */
  references?: ChartReference[];
}

export interface BoxStats { min: number; q1: number; median: number; q3: number; max: number; outliers: number[]; n?: number }

const quantile = (sorted: number[], p: number) => {
  const i = (sorted.length - 1) * p; const lo = Math.floor(i); const hi = Math.ceil(i);
  return sorted[lo]! + (sorted[hi]! - sorted[lo]!) * (i - lo);
};

/** Five-number summary with Tukey whiskers (1.5 times the interquartile range) and the outliers beyond them. */
export function boxStats(g: BoxplotGroup): BoxStats | null {
  if (g.values && g.values.length > 0) {
    const v = [...g.values].filter(Number.isFinite).sort((a, b) => a - b);
    if (v.length === 0) return null;
    const q1 = quantile(v, 0.25); const median = quantile(v, 0.5); const q3 = quantile(v, 0.75);
    const iqr = q3 - q1;
    const inside = v.filter((x) => x >= q1 - 1.5 * iqr && x <= q3 + 1.5 * iqr);
    return { min: inside[0]!, q1, median, q3, max: inside[inside.length - 1]!, outliers: v.filter((x) => x < q1 - 1.5 * iqr || x > q3 + 1.5 * iqr), n: v.length };
  }
  if ([g.min, g.q1, g.median, g.q3, g.max].every((x) => typeof x === "number")) return { min: g.min!, q1: g.q1!, median: g.median!, q3: g.q3!, max: g.max!, outliers: g.outliers ?? [] };
  return null;
}

/** Compares distributions: the middle half of the values as a box, the median as a line, whiskers for the range and dots for outliers. */
export const BoxplotChart = forwardRef<HTMLElement, BoxplotChartProps>(function BoxplotChart(props, ref) {
  const { groups, orientation = "vertical", unit, format = defaultFormat, color = CHART_DEFAULT_SLOT.boxplot, references = [], height: heightProp, ...rest } = props;
  const horizontal = orientation === "horizontal";
  const height = heightProp ?? (horizontal ? Math.max(260, groups.length * 52 + 56) : 300);
  const stats = groups.map(boxStats);
  const categories = groups.map((g) => g.label);
  const withUnit = (v: number) => (unit ? `${format(v)} ${unit}` : format(v));

  const layout = ({ width, height, active }: ShellSize): ShellDrawing => {
    const all = [...stats.flatMap((s) => (s ? [s.min, s.max, ...s.outliers] : [])), ...references.map((r) => r.value)];
    const { ticks, min, max } = niceTicks(Math.min(...all), Math.max(...all));
    const box = horizontal ? plotBox(width, height, categories.map((c) => truncate(c, 32)), !!unit, 12, 30, 8.6) : plotBox(width, height, ticks.map(format), !!unit);
    const pos = horizontal ? linear(min, max, box.left, box.left + box.w) : linear(min, max, box.top + box.h, box.top);
    const band = (horizontal ? box.h : box.w) / groups.length;
    const centre = (i: number) => (horizontal ? box.top : box.left) + (i + 0.5) * band;
    const thick = Math.min(band * 0.5, horizontal ? 30 : 56);
    const fill = chartColorVar(color);
    const P = (i: number, v: number) => (horizontal ? { x: pos(v), y: centre(i) } : { x: centre(i), y: pos(v) });
    const steps: ShellStep[] = groups.map((g, i) => {
      const s = stats[i];
      const a = horizontal ? { x: s ? pos(s.max) : box.left, y: centre(i) } : { x: centre(i), y: undefined as number | undefined };
      if (!s) return { label: g.label, x: a.x, y: a.y, rows: [{ name: "Summary", value: "No data", empty: true }] };
      return {
        label: g.label, x: a.x, y: a.y,
        rows: [
          { name: "Maximum", value: withUnit(s.max) }, { name: "Upper quartile", value: withUnit(s.q3) }, { name: "Median", value: withUnit(s.median) },
          { name: "Lower quartile", value: withUnit(s.q1) }, { name: "Minimum", value: withUnit(s.min) },
          ...(s.outliers.length ? [{ name: "Outliers", value: String(s.outliers.length) }] : []),
        ],
      };
    });
    return {
      noun: "groups",
      pointer: horizontal ? "y" : "x",
      steps,
      table: {
        head: ["Group", ...(stats.some((s) => s?.n) ? ["Count"] : []), "Minimum", "Lower quartile", "Median", "Upper quartile", "Maximum", "Outliers"],
        rows: groups.map((g, i) => {
          const s = stats[i];
          const n = stats.some((x) => x?.n) ? [s?.n === undefined ? "" : String(s.n)] : [];
          return s ? [g.label, ...n, withUnit(s.min), withUnit(s.q1), withUnit(s.median), withUnit(s.q3), withUnit(s.max), s.outliers.length ? s.outliers.map(format).join(", ") : "None"] : [g.label, ...n, ...Array(6).fill("No data")];
        }),
        foot: references.map((r) => [`${referenceKindLabel(r)}: ${r.label}`, withUnit(r.value)]),
      },
      svg: (
        <>
          {horizontal
            ? <HAxes box={box} ticks={ticks} x={pos} format={format} unit={unit} categories={categories} yAt={centre} />
            : <Axes box={box} width={width} ticks={ticks} y={pos} format={format} unit={unit} categories={categories} xAt={centre} />}
          {active >= 0 ? (horizontal
            ? <rect className="faun-chart-hover" x={box.left} y={box.top + active * band} width={box.w} height={band} />
            : <rect className="faun-chart-hover" x={box.left + active * band} y={box.top} width={band} height={box.h} />) : null}
          {stats.map((s, i) => {
            if (!s) return null;
            const lo = P(i, s.min); const hi = P(i, s.max); const a = P(i, s.q1); const b = P(i, s.q3); const m = P(i, s.median);
            const cap = thick / 4;
            return (
              <g key={i}>
                <line className="faun-chart-whisker" x1={lo.x} y1={lo.y} x2={hi.x} y2={hi.y} />
                {horizontal
                  ? <><line className="faun-chart-whisker" x1={lo.x} x2={lo.x} y1={lo.y - cap} y2={lo.y + cap} /><line className="faun-chart-whisker" x1={hi.x} x2={hi.x} y1={hi.y - cap} y2={hi.y + cap} />
                    <ReliefBlock className="faun-chart-box" x={Math.min(a.x, b.x)} y={a.y - thick / 2} width={Math.abs(b.x - a.x)} height={thick} color={color} dir="right" thin />
                    <line className="faun-chart-median" x1={m.x} x2={m.x} y1={m.y - thick / 2} y2={m.y + thick / 2} /></>
                  : <><line className="faun-chart-whisker" x1={lo.x - cap} x2={lo.x + cap} y1={lo.y} y2={lo.y} /><line className="faun-chart-whisker" x1={hi.x - cap} x2={hi.x + cap} y1={hi.y} y2={hi.y} />
                    <ReliefBlock className="faun-chart-box" x={a.x - thick / 2} y={Math.min(a.y, b.y)} width={thick} height={Math.abs(b.y - a.y)} color={color} dir="up" thin />
                    <line className="faun-chart-median" x1={m.x - thick / 2} x2={m.x + thick / 2} y1={m.y} y2={m.y} /></>}
                {s.outliers.map((o, j) => <circle key={j} className="faun-chart-outlier" cx={P(i, o).x} cy={P(i, o).y} r={3.5} style={{ stroke: fill }} />)}
              </g>
            );
          })}
          <ReferenceLines refs={references} axis={horizontal ? "x" : "y"} at={pos} box={box} width={width} format={format} />
        </>
      ),
    };
  };
  return <ChartShell ref={ref} height={height} empty={groups.length === 0 || stats.every((s) => !s)} layout={layout} {...rest} />;
});
