import { forwardRef } from "react";
import { Axes, HAxes, plotBox } from "../ChartKit/axes.js";
import { ChartFrame, type ChartLayout, type SeriesVisibility } from "../ChartKit/ChartFrame.js";
import { ReferenceLines, Swatch } from "../ChartKit/parts.js";
import { ReliefBlock, ReliefFace } from "../ChartKit/relief.js";
import { divVar } from "../ChartKit/ramps.js";
import { chartColorVar, type CssVar, defaultFormat, linear, niceTicks, resolveColors, truncate } from "../ChartKit/scale.js";
import { MAX_SERIES, type ChartBaseProps } from "../ChartKit/types.js";

export type BarChartVariant = "simple" | "grouped" | "stacked" | "floating" | "diverging" | "lollipop";

export interface BarChartProps extends ChartBaseProps {
  /**
   * How the bars are built. `simple` and `grouped` draw one bar per series in each category (one series is simple, several are grouped).
   * `stacked` piles series into one bar per category. `floating` draws each bar from `series.base` to `series.values`.
   * `diverging` colours bars by sign with the diverging ramp. `lollipop` replaces bars with a stem and a dot.
   */
  variant?: BarChartVariant;
  /** Writes each value at the end of its bar. Only applies when there is one series and the bars are wide enough. */
  showValues?: boolean;
  /** Stacked only: writes each total above (or beside) its stack when there is room. */
  showTotals?: boolean;
  /**
   * `vertical` (default) puts categories along the bottom. `horizontal` puts them down the left, which suits long names such as
   * suppliers or facilities. A horizontal chart grows with the number of categories unless you set `height`.
   */
  orientation?: "vertical" | "horizontal";
  /** Diverging only: whether a positive value is the better or the worse end. Positive values take the moss (better) or oxblood (worse) side of the ramp. Default `better`. */
  positiveIs?: "better" | "worse";
  /** Diverging only: legend names for the two sides, for example "Under target" and "Over target". */
  divergingLabels?: { negative: string; positive: string };
}

interface Rect { x: number; y: number; w: number; h: number }

/**
 * Compares values across categories. Variants cover simple, grouped, stacked, floating, diverging and lollipop bars, vertical or horizontal.
 * Bars start at zero (except floating bars, which span a range).
 */
export const BarChart = forwardRef<HTMLElement, BarChartProps>(function BarChart(
  { variant = "simple", showValues, showTotals, orientation = "vertical", positiveIs = "better", divergingLabels = { negative: "Below", positive: "Above" }, ...props }, ref,
) {
  const { categories, series: all, unit, format = defaultFormat, references = [] } = props;
  const horizontal = orientation === "horizontal";
  const stacked = variant === "stacked";
  const floating = variant === "floating";
  const diverging = variant === "diverging";
  const lollipop = variant === "lollipop";
  const series = all.slice(0, MAX_SERIES);
  const colors = resolveColors(series);
  const withUnit = (v: number) => (unit ? `${format(v)} ${unit}` : format(v));
  const height = props.height ?? (horizontal ? Math.max(280, categories.length * ((stacked ? 1 : Math.max(series.length, 1)) * 18 + 14) + 56) : undefined);

  const layout = ({ width, height, active, visible }: { width: number; height: number; active: number; visible: SeriesVisibility }): ChartLayout => {
    const shown = series.map((_, k) => k).filter((k) => visible[k]);
    const n = stacked ? 1 : shown.length;
    const num = (v: number | null | undefined): v is number => v !== null && v !== undefined;

    // Measure-axis extent.
    let lo = 0; let hi = 0;
    const totals = categories.map((_, i) => shown.reduce((s, k) => s + (series[k]!.values[i] ?? 0), 0));
    if (stacked) {
      categories.forEach((_, i) => {
        const pos = shown.reduce((s, k) => s + Math.max(series[k]!.values[i] ?? 0, 0), 0);
        const neg = shown.reduce((s, k) => s + Math.min(series[k]!.values[i] ?? 0, 0), 0);
        hi = Math.max(hi, pos); lo = Math.min(lo, neg);
      });
    } else if (floating) {
      const ends = shown.flatMap((k) => categories.flatMap((_, i) => { const v = series[k]!.values[i]; const b = series[k]!.base?.[i]; return num(v) && num(b) ? [v, b] : []; }));
      lo = ends.length ? Math.min(...ends) : 0; hi = ends.length ? Math.max(...ends) : 1;
    } else {
      const vs = shown.flatMap((k) => series[k]!.values.filter(num));
      lo = Math.min(0, ...vs); hi = Math.max(0, ...vs);
    }
    const refs = references.map((r) => r.value);
    const { ticks, min, max } = niceTicks(Math.min(lo, ...refs), Math.max(hi, ...refs));
    const maxAbs = Math.max(Math.abs(lo), Math.abs(hi), 1e-9);

    const labels = horizontal ? categories.map((c) => truncate(c, 32)) : [];
    const endLabels = horizontal && n === 1 && (showValues || (stacked && showTotals));
    const box = horizontal ? plotBox(width, height, labels, !!unit, endLabels ? 56 : 12, 30, 8.6) : plotBox(width, height, ticks.map(format), !!unit);
    const pos = horizontal ? linear(min, max, box.left, box.left + box.w) : linear(min, max, box.top + box.h, box.top);
    const band = (horizontal ? box.h : box.w) / categories.length;
    const centre = (i: number) => (horizontal ? box.top : box.left) + (i + 0.5) * band;
    const group = horizontal ? Math.min(band * (stacked ? 0.64 : 0.72), stacked ? 36 : n * 28) : stacked ? Math.min(band * 0.64, 72) : Math.min(band * 0.78, n * 96);
    const bar = group / Math.max(n, 1);
    const gap = n > 1 ? 2 : 0;
    const slotOf = (k: number) => shown.indexOf(k);

    /** The rectangle of a bar covering [a, b] on the measure axis, in slot `slot` of category `i`. */
    const rectFor = (i: number, slot: number, a: number, b: number): Rect => {
      const p0 = pos(a); const p1 = pos(b);
      const off = centre(i) - group / 2 + slot * bar + gap / 2;
      const thick = Math.max(bar - gap, 1);
      return horizontal ? { x: Math.min(p0, p1), y: off, w: Math.max(Math.abs(p1 - p0), a === b ? 0 : 1), h: thick } : { x: off, y: Math.min(p0, p1), w: thick, h: Math.max(Math.abs(p1 - p0), a === b ? 0 : 1) };
    };
    const fillFor = (k: number, v: number) => {
      if (!diverging) return chartColorVar(colors[k]!);
      const m = Math.abs(v) / maxAbs;
      const step = m > 2 / 3 ? 1 : m > 1 / 3 ? 0.67 : 0.33;
      const sign = v >= 0 ? 1 : -1;
      return divVar((positiveIs === "better" ? sign : -sign) * step);
    };

    const marks = categories.map((_, i) => {
      if (stacked) {
        let up = 0; let down = 0;
        const withValue = shown.filter((k) => { const v = series[k]!.values[i]; return num(v) && v !== 0; });
        const lastUp = [...withValue].reverse().find((k) => series[k]!.values[i]! > 0);
        const lastDown = [...withValue].reverse().find((k) => series[k]!.values[i]! < 0);
        return shown.map((k) => {
          const s = series[k]!; const v = s.values[i];
          if (!num(v) || v === 0) return null;
          const a = v > 0 ? up : down; const b = a + v;
          if (v > 0) up = b; else down = b;
          const r = rectFor(i, 0, a, b);
          return <ReliefBlock key={`${s.id}-${i}`} {...r} width={r.w} height={r.h} color={colors[k]!} dir={horizontal ? (v > 0 ? "right" : "left") : v > 0 ? "up" : "down"} cap={k === (v > 0 ? lastUp : lastDown)} fixedDepth rectProps={{ "data-stacked": "" }} />;
        });
      }
      return shown.map((k) => {
        const s = series[k]!; const v = s.values[i];
        if (!num(v)) return null;
        if (floating) {
          const b = s.base?.[i];
          if (!num(b)) return null;
          const r = rectFor(i, slotOf(k), Math.min(b, v), Math.max(b, v));
          return <ReliefBlock key={`${s.id}-${i}`} {...r} width={r.w} height={r.h} color={colors[k]!} dir={horizontal ? "right" : "up"} />;
        }
        const r = rectFor(i, slotOf(k), Math.min(0, v), Math.max(0, v));
        const label = showValues && n === 1 && (horizontal ? bar > 14 : bar > 36);
        const text = label ? (horizontal
          ? <text className="faun-chart-value" x={v >= 0 ? r.x + r.w + 6 : r.x - 6} y={r.y + r.h / 2} dy="0.32em" textAnchor={v >= 0 ? "start" : "end"}>{format(v)}</text>
          : <text className="faun-chart-value" x={r.x + r.w / 2} y={v >= 0 ? r.y - 6 : r.y + r.h + 14} textAnchor="middle">{format(v)}</text>) : null;
        if (lollipop) {
          const cx = r.x + r.w / 2; const cy = r.y + r.h / 2;
          const end = horizontal ? { x: pos(v), y: cy } : { x: cx, y: pos(v) };
          const start = horizontal ? { x: pos(0), y: cy } : { x: cx, y: pos(0) };
          return (
            <g key={`${s.id}-${i}`}>
              <line className="faun-chart-stem" x1={start.x} y1={start.y} x2={end.x} y2={end.y} style={{ stroke: chartColorVar(colors[k]!) }} />
              <ReliefFace tag="circle" geom={{ cx: end.x, cy: end.y, r: 6 }} color={colors[k]!} className="faun-chart-dot" extrude />
              {label ? (horizontal
                ? <text className="faun-chart-value" x={v >= 0 ? end.x + 10 : end.x - 10} y={end.y} dy="0.32em" textAnchor={v >= 0 ? "start" : "end"}>{format(v)}</text>
                : <text className="faun-chart-value" x={end.x} y={v >= 0 ? end.y - 10 : end.y + 18} textAnchor="middle">{format(v)}</text>) : null}
            </g>
          );
        }
        return (
          <g key={`${s.id}-${i}`}>
            <ReliefBlock {...r} width={r.w} height={r.h} color={fillFor(k, v) as CssVar} wave={diverging ? (v >= 0 ? 2 : 4) : undefined} dir={horizontal ? (v >= 0 ? "right" : "left") : v >= 0 ? "up" : "down"} />
            {text}
          </g>
        );
      });
    });

    const totalLabels = stacked && showTotals && n === 1 ? categories.map((_, i) => {
      const up = shown.reduce((s, k) => s + Math.max(series[k]!.values[i] ?? 0, 0), 0);
      const r = rectFor(i, 0, 0, up);
      if (horizontal) return bar > 14 ? <text key={i} className="faun-chart-value" x={r.x + r.w + 6} y={r.y + r.h / 2} dy="0.32em">{format(totals[i]!)}</text> : null;
      return bar > 40 ? <text key={i} className="faun-chart-value" x={r.x + r.w / 2} y={r.y - 6} textAnchor="middle">{format(totals[i]!)}</text> : null;
    }) : null;

    const hover = active >= 0 ? (horizontal
      ? <rect className="faun-chart-hover" x={box.left} y={box.top + active * band} width={box.w} height={band} />
      : <rect className="faun-chart-hover" x={box.left + active * band} y={box.top} width={band} height={box.h} />) : null;
    const reachOf = (i: number) => {
      const vs = shown.map((k) => series[k]!.values[i]).filter(num);
      return stacked ? shown.reduce((s, k) => s + Math.max(series[k]!.values[i] ?? 0, 0), 0) : Math.max(0, ...vs);
    };

    return {
      orientation: horizontal ? "horizontal" : "vertical",
      xAt: horizontal ? () => box.left : centre,
      yAt: horizontal ? centre : undefined,
      tipAt: horizontal ? (i) => ({ x: pos(reachOf(i)), y: centre(i) }) : undefined,
      svg: (
        <>
          {horizontal
            ? <HAxes box={box} ticks={ticks} x={pos} format={format} unit={unit} categories={categories} yAt={centre} />
            : <Axes box={box} width={width} ticks={ticks} y={pos} format={format} unit={unit} categories={categories} xAt={centre} />}
          {hover}
          {marks}
          {totalLabels}
          <ReferenceLines refs={references} axis={horizontal ? "x" : "y"} at={pos} box={box} width={width} format={format} />
        </>
      ),
    };
  };

  const describe = floating
    ? (k: number, i: number) => {
      const s = series[k]; const v = s?.values[i]; const b = s?.base?.[i];
      return v === null || v === undefined || b === null || b === undefined ? null : `${format(Math.min(b, v))} to ${withUnit(Math.max(b, v))}`;
    }
    : undefined;
  const sideLegend = diverging ? (() => {
    const neg = positiveIs === "better" ? divVar(-1) : divVar(1);
    const pos = positiveIs === "better" ? divVar(1) : divVar(-1);
    return (
      <ul className="faun-chart-legend" aria-label="Colour key">
        <li className="faun-chart-legend-item"><Swatch color={neg} kind="bar" /><span>{divergingLabels.negative}</span></li>
        <li className="faun-chart-legend-item"><Swatch color={pos} kind="bar" /><span>{divergingLabels.positive}</span></li>
      </ul>
    );
  })() : undefined;
  const kind = lollipop ? "dot" : "bar";
  return <ChartFrame ref={ref} kind={kind} showTotal={stacked} layout={layout} describe={describe} legendExtra={sideLegend} {...props} legend={diverging ? false : props.legend} height={height} />;
});
