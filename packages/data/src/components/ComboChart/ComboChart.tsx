import { forwardRef } from "react";
import { Axes, plotBox } from "../ChartKit/axes.js";
import { ChartShell, type ShellDrawing, type ShellLegendItem, type ShellSize, type ShellStep } from "../ChartKit/ChartShell.js";
import { Marker, ReferenceLines, shapeOf } from "../ChartKit/parts.js";
import { ReliefBlock } from "../ChartKit/relief.js";
import { chartColorVar, defaultFormat, linear, niceTicks, resolveColors, textWidth } from "../ChartKit/scale.js";
import { MAX_SERIES, type ChartBaseProps, type ChartSeries } from "../ChartKit/types.js";

export interface ComboSeries extends ChartSeries {
  /** `bar` (default) or `line`. */
  type?: "bar" | "line";
  /** `primary` (default) reads against the left axis; `secondary` against the right axis. */
  axis?: "primary" | "secondary";
}

export interface ComboChartProps extends Omit<ChartBaseProps, "series"> {
  series: ComboSeries[];
  /** Unit of the secondary (right) axis, for example "%". */
  secondaryUnit?: string;
  /** Formats values on the secondary axis. Defaults to `format`. */
  secondaryFormat?: (value: number) => string;
}

/** Combines bars and lines in one plot, optionally on two axes: a volume as bars and a rate or intensity as a line. */
export const ComboChart = forwardRef<HTMLElement, ComboChartProps>(function ComboChart(props, ref) {
  const { categories, series: all, unit, format = defaultFormat, secondaryUnit, secondaryFormat = format, references = [], height = 300, ...rest } = props;
  const series = all.slice(0, MAX_SERIES);
  const colors = resolveColors(series);
  const isLine = (s: ComboSeries) => s.type === "line";
  const isSecond = (s: ComboSeries) => s.axis === "secondary";
  const fmtOf = (s: ComboSeries) => (isSecond(s) ? secondaryFormat : format);
  const unitOf = (s: ComboSeries) => (isSecond(s) ? secondaryUnit : unit);
  const text = (s: ComboSeries, v: number | null | undefined) => (v === null || v === undefined ? "No data" : unitOf(s) ? `${fmtOf(s)(v)} ${unitOf(s)}` : fmtOf(s)(v));
  const legendItems: ShellLegendItem[] = series.map((s, k) => ({ id: s.id, label: s.label, color: colors[k]!, mark: isLine(s) ? "line" : "bar", shape: shapeOf(k) }));

  const layout = ({ width, height, active, isHidden }: ShellSize): ShellDrawing => {
    const shown = series.map((_, k) => k).filter((k) => !isHidden(series[k]!.id));
    const range = (second: boolean, extra: number[] = []) => {
      const vs = shown.filter((k) => isSecond(series[k]!) === second).flatMap((k) => series[k]!.values.filter((v): v is number => v !== null));
      return vs.length === 0 && extra.length === 0 ? null : niceTicks(Math.min(0, ...vs, ...extra), Math.max(0, ...vs, ...extra));
    };
    const p = range(false, references.map((r) => r.value)) ?? niceTicks(0, 1);
    const sec = range(true);
    const rightPad = sec ? Math.ceil(Math.max(...sec.ticks.map((t) => textWidth(secondaryFormat(t))))) + 14 : 8;
    const box = plotBox(width, height, p.ticks.map(format), !!(unit || secondaryUnit), rightPad);
    const yP = linear(p.min, p.max, box.top + box.h, box.top);
    const yS = sec ? linear(sec.min, sec.max, box.top + box.h, box.top) : yP;
    const yOf = (s: ComboSeries) => (isSecond(s) ? yS : yP);
    const band = box.w / categories.length;
    const xAt = (i: number) => box.left + (i + 0.5) * band;
    const bars = shown.filter((k) => !isLine(series[k]!));
    const group = Math.min(band * 0.72, bars.length * 56); const bar = group / Math.max(bars.length, 1); const gap = bars.length > 1 ? 2 : 0;
    const steps: ShellStep[] = categories.map((c, i) => ({
      label: c, x: xAt(i),
      rows: shown.map((k) => ({ name: series[k]!.label, value: text(series[k]!, series[k]!.values[i]), color: colors[k]!, mark: isLine(series[k]!) ? "line" as const : "bar" as const, shape: shapeOf(k), empty: series[k]!.values[i] == null })),
    }));
    return {
      noun: "categories",
      pointer: "x",
      steps,
      table: {
        head: ["Category", ...shown.map((k) => `${series[k]!.label}${isSecond(series[k]!) ? " (right axis)" : ""}`)],
        rows: categories.map((c, i) => [c, ...shown.map((k) => text(series[k]!, series[k]!.values[i]))]),
        foot: references.map((r) => [`${(r.kind ?? "reference") === "target" ? "Target" : "Reference"}: ${r.label}`, unit ? `${format(r.value)} ${unit}` : format(r.value)]),
      },
      svg: (
        <>
          <Axes box={box} width={width} ticks={p.ticks} y={yP} format={format} unit={unit} categories={categories} xAt={xAt} />
          {sec ? (
            <g className="faun-chart-axes">
              {secondaryUnit ? <text className="faun-chart-tick" x={width} y={10} textAnchor="end">{secondaryUnit}</text> : null}
              {sec.ticks.map((t) => <text key={t} className="faun-chart-tick" x={width - box.right + 8} y={yS(t)} dy="0.32em">{secondaryFormat(t)}</text>)}
            </g>
          ) : null}
          {active >= 0 ? <rect className="faun-chart-hover" x={box.left + active * band} y={box.top} width={band} height={box.h} /> : null}
          {categories.map((_, i) => bars.map((k, slot) => {
            const s = series[k]!; const v = s.values[i];
            if (v === null || v === undefined) return null;
            const y = yOf(s); const top = Math.min(y(v), y(0));
            return <ReliefBlock key={`${s.id}-${i}`} x={xAt(i) - group / 2 + slot * bar + gap / 2} y={top} width={Math.max(bar - gap, 1)} height={Math.max(Math.abs(y(v) - y(0)), v === 0 ? 0 : 1)} color={colors[k]!} dir={y(v) <= y(0) ? "up" : "down"} />;
          }))}
          {shown.filter((k) => isLine(series[k]!)).map((k) => {
            const s = series[k]!; const y = yOf(s);
            let d = ""; let pen = false;
            s.values.forEach((v, i) => { if (v === null || v === undefined) { pen = false; return; } d += `${pen ? "L" : "M"}${xAt(i).toFixed(1)} ${y(v).toFixed(1)}`; pen = true; });
            return (
              <g key={s.id}>
                <path className="faun-chart-line" d={d} style={{ stroke: chartColorVar(colors[k]!) }} />
                {s.values.map((v, i) => (v === null || v === undefined ? null : <Marker key={i} className="faun-chart-marker" shape={shapeOf(k)} x={xAt(i)} y={y(v)} r={i === active ? 5 : 4} color={colors[k]!} />))}
              </g>
            );
          })}
          <ReferenceLines refs={references} axis="y" at={yP} box={box} width={width} format={format} />
        </>
      ),
    };
  };
  return <ChartShell ref={ref} height={height} legendItems={legendItems} empty={categories.length === 0 || series.length === 0} layout={layout} {...rest} />;
});
