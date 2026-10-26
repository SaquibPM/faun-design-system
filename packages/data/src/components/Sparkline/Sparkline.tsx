import { forwardRef } from "react";
import { ChartShell, type ShellDrawing, type ShellSize, type ShellStep } from "../ChartKit/ChartShell.js";
import { CHART_DEFAULT_SLOT, chartColorVar, defaultFormat, linear } from "../ChartKit/scale.js";
import type { ChartColor, ChartCommonProps } from "../ChartKit/types.js";

export interface SparklineProps extends Omit<ChartCommonProps, "description" | "hideTitle" | "legend" | "toggleSeries" | "hiddenSeries" | "defaultHiddenSeries" | "onHiddenSeriesChange"> {
  /** The values, oldest first. `null` leaves a gap. */
  values: (number | null)[];
  /** Names for the points, same length as `values`, for example months. Used in the tooltip and data table. */
  labels?: string[];
  /** `line` (default), `area` (filled) or `bar`. */
  variant?: "line" | "area" | "bar";
  /** Unit of the values. */
  unit?: string;
  /** Formats a value. Default: thousands separators, up to one decimal. */
  format?: (value: number) => string;
  /** Colour slot. Default `cat-2`. */
  color?: ChartColor;
  /** Width in px. Default 120. */
  width?: number;
  /** Marks the last value with a dot. Default true. */
  showEnd?: boolean;
}

/** A word-sized trend with no axes, for a table cell or beside a figure. It still has a tooltip, keyboard reading and a data table, so title it with what it shows. */
export const Sparkline = forwardRef<HTMLElement, SparklineProps>(function Sparkline(props, ref) {
  const { values, labels, variant = "line", unit, format = defaultFormat, color = CHART_DEFAULT_SLOT.sparkline, width: fixed = 120, height = 32, showEnd = true, style, ...rest } = props;
  const nameOf = (i: number) => labels?.[i] ?? `Point ${i + 1}`;
  const text = (v: number | null | undefined) => (v === null || v === undefined ? "No data" : unit ? `${format(v)} ${unit}` : format(v));
  const stroke = chartColorVar(color);

  const layout = ({ width, height, active }: ShellSize): ShellDrawing => {
    const nums = values.filter((v): v is number => v !== null);
    const lo = Math.min(...nums, variant === "line" ? Infinity : 0); const hi = Math.max(...nums);
    const pad = 4;
    const y = linear(lo === hi ? lo - 1 : lo, hi === lo ? hi + 1 : hi, height - pad, pad);
    const n = values.length;
    const x = (i: number) => (variant === "bar" ? pad + ((i + 0.5) / n) * (width - pad * 2) : n === 1 ? width / 2 : pad + (i / (n - 1)) * (width - pad * 2));
    const steps: ShellStep[] = values.map((v, i) => ({ label: nameOf(i), x: x(i), rows: [{ name: "Value", value: text(v), empty: v === null, color }] }));
    let d = ""; let pen = false;
    values.forEach((v, i) => { if (v === null) { pen = false; return; } d += `${pen ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`; pen = true; });
    const lastIdx = values.map((v) => v !== null).lastIndexOf(true);
    const bw = Math.max(((width - pad * 2) / n) * 0.7, 1);
    return {
      noun: "points",
      pointer: "x",
      steps,
      table: { head: ["Point", `Value${unit ? ` (${unit})` : ""}`], rows: values.map((v, i) => [nameOf(i), v === null ? "No data" : format(v)]) },
      svg: (
        <>
          {variant === "area" ? (() => {
            let a = ""; let run: number[] = [];
            const flush = () => { if (run.length) a += `M${x(run[0]!).toFixed(1)} ${height - pad}${run.map((i) => `L${x(i).toFixed(1)} ${y(values[i]!).toFixed(1)}`).join("")}L${x(run[run.length - 1]!).toFixed(1)} ${height - pad}Z`; run = []; };
            values.forEach((v, i) => { if (v === null) flush(); else run.push(i); }); flush();
            return <path className="faun-chart-area" d={a} style={{ fill: stroke }} />;
          })() : null}
          {variant === "bar"
            ? values.map((v, i) => (v === null ? null : <rect key={i} className="faun-chart-bar" x={x(i) - bw / 2} y={Math.min(y(v), y(Math.max(lo, 0)))} width={bw} height={Math.max(Math.abs(y(v) - y(Math.max(lo, 0))), 1)} style={{ fill: stroke, opacity: i === active ? 1 : 0.85 }} />))
            : <path className="faun-chart-spark-line" d={d} style={{ stroke }} />}
          {variant !== "bar" && showEnd && lastIdx >= 0 ? <circle className="faun-chart-dot" cx={x(lastIdx)} cy={y(values[lastIdx]!)} r={3} style={{ fill: stroke }} /> : null}
          {active >= 0 && values[active] !== null ? <circle className="faun-chart-active-ring" cx={x(active)} cy={y(values[active]!)} r={variant === "bar" ? 0 : 5} /> : null}
        </>
      ),
    };
  };
  // The plot is the figure's only child, so the figure takes the sparkline width.
  return <ChartShell ref={ref} bare height={height} empty={values.every((v) => v === null)} layout={layout} style={{ inlineSize: fixed, ...style }} instructions={`${props.title}. ${values.length} points. Use the arrow keys to read values.`} {...rest} />;
});
