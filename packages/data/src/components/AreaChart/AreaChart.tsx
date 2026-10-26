import { forwardRef } from "react";
import { Axes, plotBox } from "../ChartKit/axes.js";
import { ChartFrame, type ChartLayout, type SeriesVisibility } from "../ChartKit/ChartFrame.js";
import { Marker, ReferenceLines, shapeOf } from "../ChartKit/parts.js";
import { waveOf, reliefVars } from "../ChartKit/relief.js";
import { CHART_DEFAULT_SLOT, chartColorVar, defaultFormat, linear, niceTicks, resolveColors } from "../ChartKit/scale.js";
import { MAX_SERIES, type ChartBaseProps } from "../ChartKit/types.js";

export interface AreaChartProps extends ChartBaseProps {
  /**
   * `simple` fills under each line from the baseline, so series overlap. `stacked` piles series on top of each other so the top edge is the total.
   * Stacked areas treat a missing or negative value as zero.
   */
  variant?: "simple" | "stacked";
  /** Steps the line instead of joining points with straight segments. */
  step?: boolean;
}

/** Shows change over an ordered axis with the volume under the line filled. Stack series to show how a total builds up over time. */
export const AreaChart = forwardRef<HTMLElement, AreaChartProps>(function AreaChart({ variant = "simple", step, ...props }, ref) {
  const { categories, series: all, unit, format = defaultFormat, references = [] } = props;
  const stacked = variant === "stacked";
  const series = all.slice(0, MAX_SERIES);
  const colors = resolveColors(series, CHART_DEFAULT_SLOT.area);

  const layout = ({ width, height, active, visible }: { width: number; height: number; active: number; visible: SeriesVisibility }): ChartLayout => {
    const shown = series.map((_, k) => k).filter((k) => visible[k]);
    const cum = categories.map((_, i) => {
      let acc = 0;
      const out: Record<number, [number, number]> = {};
      shown.forEach((k) => { const v = series[k]!.values[i]; const a = acc; if (stacked) acc += Math.max(v ?? 0, 0); out[k] = stacked ? [a, acc] : [0, v ?? 0]; });
      return out;
    });
    const tops = categories.flatMap((_, i) => shown.map((k) => cum[i]![k]![1]));
    const lows = stacked ? [0] : shown.flatMap((k) => series[k]!.values.filter((v): v is number => v !== null));
    const refs = references.map((r) => r.value);
    const { ticks, min, max } = niceTicks(Math.min(0, ...lows, ...refs), Math.max(0, ...tops, ...refs));
    const box = plotBox(width, height, ticks.map(format), !!unit);
    const y = linear(min, max, box.top + box.h, box.top);
    const band = box.w / categories.length;
    const xAt = (i: number) => box.left + (i + 0.5) * band;
    const base = y(Math.max(min, Math.min(0, max)));

    type P = { x: number; y: number };
    const f = (n: number) => n.toFixed(1);
    const trace = (pts: P[]) => pts.map((p, j) => (j === 0 ? `M${f(p.x)} ${f(p.y)}` : step ? `H${f(p.x)}V${f(p.y)}` : `L${f(p.x)} ${f(p.y)}`)).join("");
    /** The same edge walked right to left, continuing an open path. */
    const back = (pts: P[]) => pts.slice(0, -1).reverse().map((p) => (step ? `V${f(p.y)}H${f(p.x)}` : `L${f(p.x)} ${f(p.y)}`)).join("");
    return {
      xAt,
      svg: (
        <>
          <Axes box={box} width={width} ticks={ticks} y={y} format={format} unit={unit} categories={categories} xAt={xAt} />
          {active >= 0 ? <line className="faun-chart-guide" x1={xAt(active)} x2={xAt(active)} y1={box.top} y2={box.top + box.h} /> : null}
          {shown.map((k) => {
            const s = series[k]!;
            // Runs of consecutive values are drawn separately so missing data shows as a gap (simple areas); stacked areas are continuous.
            const groups: number[][] = [];
            let cur: number[] = [];
            categories.forEach((_, i) => {
              const present = stacked || (s.values[i] !== null && s.values[i] !== undefined);
              if (present) cur.push(i); else { if (cur.length) groups.push(cur); cur = []; }
            });
            if (cur.length) groups.push(cur);
            const color = chartColorVar(colors[k]!);
            return (
              <g key={s.id}>
                {groups.map((g, gi) => {
                  const upper = g.map((i) => ({ x: xAt(i), y: y(cum[i]![k]![1]) }));
                  const lower = g.map((i) => ({ x: xAt(i), y: stacked ? y(cum[i]![k]![0]) : base }));
                  const end = lower[lower.length - 1]!;
                  const area = `${trace(upper)}L${f(end.x)} ${f(end.y)}${back(lower)}Z`;
                  return (
                    <g key={gi} className="faun-relief" style={reliefVars(colors[k]!, waveOf(colors[k]!))}>
                      <path className="faun-chart-area" data-stacked={stacked || undefined} d={area} style={{ fill: color }} />
                      <path className="faun-relief-tex" d={area} />
                      <path className="faun-chart-line" d={trace(upper)} style={{ stroke: color }} />
                    </g>
                  );
                })}
                {categories.map((_, i) => {
                  const v = s.values[i];
                  if (v === null || v === undefined) return null;
                  const on = i === active;
                  if (!on) return null;
                  return (
                    <g key={i}>
                      <circle className="faun-chart-halo" cx={xAt(i)} cy={y(cum[i]![k]![1])} r={9} style={{ stroke: color }} />
                      <Marker className="faun-chart-marker" shape={shapeOf(k)} x={xAt(i)} y={y(cum[i]![k]![1])} r={5} color={colors[k]!} />
                    </g>
                  );
                })}
              </g>
            );
          })}
          <ReferenceLines refs={references} axis="y" at={y} box={box} width={width} format={format} />
        </>
      ),
    };
  };
  return <ChartFrame ref={ref} kind="bar" showTotal={stacked} layout={layout} {...props} />;
});
