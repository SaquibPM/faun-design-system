import { forwardRef } from "react";
import { plotBox, XYAxes } from "../ChartKit/axes.js";
import { ChartShell, type ShellDrawing, type ShellSize, type ShellStep } from "../ChartKit/ChartShell.js";
import { referenceKindLabel } from "../ChartKit/parts.js";
import { ReliefBlock } from "../ChartKit/relief.js";
import { CHART_DEFAULT_SLOT, defaultFormat, linear, niceTicks } from "../ChartKit/scale.js";
import type { ChartColor, ChartCommonProps, ChartReference } from "../ChartKit/types.js";

export interface HistogramChartProps extends ChartCommonProps {
  /** The raw measurements. The chart counts them into bins. */
  values: number[];
  /** Number of bins. Default: Sturges' rule, `ceil(log2(n) + 1)`, between 4 and 20. Ignored when `binWidth` is set. */
  bins?: number;
  /** Width of each bin in the unit of the values. Bins start at a multiple of this width. */
  binWidth?: number;
  /** Name of the measure on the x axis, for example "Supplier emissions intensity". */
  xTitle?: string;
  /** Unit of the measure. */
  unit?: string;
  /** Name of what is counted. Default "Count". */
  countLabel?: string;
  /** Formats a value on the x axis. Default: thousands separators, up to one decimal. */
  format?: (value: number) => string;
  /** Colour slot. Default `cat-2`. */
  color?: ChartColor;
  /** Vertical lines on the measure axis, such as a limit or the mean. */
  references?: ChartReference[];
}

/** Bins raw values into [start, end) ranges; the last bin includes its end. Exported for tests and for charts that need the same counts. */
export function binValues(values: number[], bins?: number, binWidth?: number) {
  const v = values.filter((x) => Number.isFinite(x));
  if (v.length === 0) return [] as { start: number; end: number; count: number }[];
  const lo = Math.min(...v); const hi = Math.max(...v);
  let width: number; let start: number; let count: number;
  if (binWidth && binWidth > 0) {
    width = binWidth; start = Math.floor(lo / width) * width; count = Math.max(1, Math.floor((hi - start) / width) + 1);
  } else {
    count = Math.min(20, Math.max(4, bins ?? Math.ceil(Math.log2(v.length) + 1)));
    const span = hi === lo ? 1 : hi - lo;
    width = span / count; start = lo;
  }
  const out = Array.from({ length: count }, (_, i) => ({ start: start + i * width, end: start + (i + 1) * width, count: 0 }));
  for (const x of v) out[Math.min(Math.floor((x - start) / width), count - 1)]!.count += 1;
  return out;
}

/** Shows how many measurements fall in each range, to reveal the shape of a distribution: where values cluster and where the tail is. */
export const HistogramChart = forwardRef<HTMLElement, HistogramChartProps>(function HistogramChart(props, ref) {
  const { values, bins, binWidth, xTitle, unit, countLabel = "Count", format = defaultFormat, color = CHART_DEFAULT_SLOT.histogram, references = [], height = 280, ...rest } = props;
  const data = binValues(values, bins, binWidth);
  const range = (b: { start: number; end: number }) => `${format(b.start)} to ${format(b.end)}${unit ? ` ${unit}` : ""}`;

  const layout = ({ width, height, active }: ShellSize): ShellDrawing => {
    const xs = [data[0]!.start, data[data.length - 1]!.end, ...references.map((r) => r.value)];
    const xt = niceTicks(Math.min(...xs), Math.max(...xs), 7);
    const lo = Math.min(data[0]!.start, ...references.map((r) => r.value)); const hi = Math.max(data[data.length - 1]!.end, ...references.map((r) => r.value));
    const yt = niceTicks(0, Math.max(...data.map((b) => b.count)), 5);
    const box = plotBox(width, height, yt.ticks.map(String), true, 12, xTitle ? 48 : 30);
    const x = linear(Math.min(xt.min, lo), Math.max(xt.max, hi), box.left, box.left + box.w);
    const y = linear(yt.min, yt.max, box.top + box.h, box.top);
    const steps: ShellStep[] = data.map((b) => ({ label: range(b), x: (x(b.start) + x(b.end)) / 2, rows: [{ name: countLabel, value: String(b.count), color }] }));
    return {
      noun: "bins",
      pointer: "x",
      steps,
      table: {
        head: ["Range", countLabel],
        rows: data.map((b) => [range(b), String(b.count)]),
        foot: references.map((r) => [`${referenceKindLabel(r)}: ${r.label}`, `${format(r.value)}${unit ? ` ${unit}` : ""}`]),
      },
      svg: (
        <>
          <XYAxes box={box} width={width} xTicks={xt.ticks} yTicks={yt.ticks} x={x} y={y} xFormat={format} yFormat={String} xTitle={[xTitle, unit].filter(Boolean).join(" · ") || undefined} yTitle={countLabel} />
          {active >= 0 ? <rect className="faun-chart-hover" x={x(data[active]!.start)} y={box.top} width={x(data[active]!.end) - x(data[active]!.start)} height={box.h} /> : null}
          {data.map((b, i) => (b.count === 0 ? null : (
            <ReliefBlock key={i} x={x(b.start)} y={y(b.count)} width={Math.max(x(b.end) - x(b.start), 1)} height={y(0) - y(b.count)} color={color} />
          )))}
          {references.map((r, i) => {
            const px = x(r.value); const flip = px > box.left + box.w * 0.6;
            return (
              <g key={`${r.label}-${i}`}>
                <line className="faun-chart-ref" data-kind={r.kind ?? "reference"} x1={px} x2={px} y1={box.top} y2={box.top + box.h} />
                <text className="faun-chart-ref-label" x={flip ? px - 5 : px + 5} y={box.top + 12 + i * 14} textAnchor={flip ? "end" : "start"}>{`${r.label}: ${format(r.value)}`}</text>
              </g>
            );
          })}
        </>
      ),
    };
  };
  return <ChartShell ref={ref} height={height} empty={data.length === 0} layout={layout} {...rest} />;
});
