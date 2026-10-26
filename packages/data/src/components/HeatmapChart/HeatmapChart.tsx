import { forwardRef } from "react";
import { ChartShell, type ShellDrawing, type ShellSize, type ShellStep } from "../ChartKit/ChartShell.js";
import { divRamp, divVar, seqRamp, seqVar } from "../ChartKit/ramps.js";
import { RampLegend } from "../ChartKit/RampLegend.js";
import { defaultFormat, textWidth, truncate } from "../ChartKit/scale.js";
import type { ChartCommonProps } from "../ChartKit/types.js";
import { CHART_DEFAULT_RAMP } from "../ChartKit/scale.js";
const HUE = CHART_DEFAULT_RAMP.heatmap;

export interface HeatmapChartProps extends Omit<ChartCommonProps, "toggleSeries" | "hiddenSeries" | "defaultHiddenSeries" | "onHiddenSeriesChange" | "legend"> {
  /** Row names, top to bottom. */
  rows: string[];
  /** Column names, left to right. */
  columns: string[];
  /** One array per row, one value per column. `null` means no data (an empty, dashed cell). */
  values: (number | null)[][];
  /**
   * `sequential` shades low to high with one hue: use it for magnitudes that are all positive or all negative.
   * `diverging` shades two ways from a neutral midpoint: use it for variance, change or deviation from a target.
   */
  scale?: "sequential" | "diverging";
  /** Diverging: the neutral value. Default 0. */
  midpoint?: number;
  /** Lowest and highest value of the scale. Default: the data's range. */
  domain?: [number, number];
  /** Diverging: whether values above the midpoint are the better or the worse end. Default `better`. */
  positiveIs?: "better" | "worse";
  /** Writes the value in each cell when cells are big enough. */
  showValues?: boolean;
  /** Name of what the rows are, used in the tooltip and table. Default "Row". */
  rowTitle?: string;
  /** Name of what the columns are. Default "Column". */
  columnTitle?: string;
  /** Name of the measure. Default "Value". */
  measure?: string;
  /** Unit of the values. */
  unit?: string;
  /** Formats a value. Default: thousands separators, up to one decimal. */
  format?: (value: number) => string;
  /** Hides the colour key. */
  legend?: boolean;
}

/** Shows a measure for every pair of two categories as a grid of shaded cells: for example emissions by site and month, or risk by supplier and topic. */
export const HeatmapChart = forwardRef<HTMLElement, HeatmapChartProps>(function HeatmapChart(props, ref) {
  const { rows, columns, values, scale = "sequential", midpoint = 0, domain, positiveIs = "better", showValues, rowTitle = "Row", columnTitle = "Column", measure = "Value", unit, format = defaultFormat, legend = true, height: heightProp, ...rest } = props;
  const withUnit = (v: number) => (unit ? `${format(v)} ${unit}` : format(v));
  const all = values.flat().filter((v): v is number => v !== null && v !== undefined);
  const lo = domain?.[0] ?? Math.min(...all); const hi = domain?.[1] ?? Math.max(...all);
  const half = Math.max(Math.abs(lo - midpoint), Math.abs(hi - midpoint)) || 1;
  const diverging = scale === "diverging";
  const height = heightProp ?? Math.max(160, rows.length * 34 + 56);
  const colour = (v: number) => {
    if (!diverging) return seqVar(hi === lo ? 1 : (v - lo) / (hi - lo), HUE);
    const t = (v - midpoint) / half;
    return divVar(positiveIs === "better" ? t : -t);
  };

  const layout = ({ width, height, active }: ShellSize): ShellDrawing => {
    const left = Math.min(Math.ceil(Math.max(...rows.map((r) => textWidth(truncate(r, 22))), 0)) + 14, width * 0.4);
    const top = 26;
    const cw = (width - left) / columns.length; const ch = Math.min((height - top) / rows.length, 44);
    const stride = Math.max(1, Math.ceil((Math.max(...columns.map((c) => textWidth(truncate(c, 12))), 1) + 8) / cw));
    const cells = rows.flatMap((r, ri) => columns.map((c, ci) => ({ r, c, ri, ci, v: values[ri]?.[ci] ?? null })));
    const steps: ShellStep[] = cells.map(({ r, c, ri, ci, v }) => ({
      label: `${r}, ${c}`, x: left + (ci + 0.5) * cw, y: top + (ri + 0.5) * ch,
      rows: [{ name: measure, value: v === null ? "No data" : withUnit(v), color: v === null ? undefined : colour(v), empty: v === null }],
    }));
    return {
      noun: "cells",
      columns: columns.length,
      steps,
      hit: (x, y) => {
        const ci = Math.floor((x - left) / cw); const ri = Math.floor((y - top) / ch);
        return ci < 0 || ri < 0 || ci >= columns.length || ri >= rows.length ? -1 : ri * columns.length + ci;
      },
      table: { caption: `${props.title}: ${measure} by ${rowTitle.toLowerCase()} and ${columnTitle.toLowerCase()}${unit ? ` (${unit})` : ""}`, head: [rowTitle, ...columns], rows: rows.map((r, ri) => [r, ...columns.map((_, ci) => { const v = values[ri]?.[ci]; return v === null || v === undefined ? "No data" : format(v); })]) },
      svg: (
        <>
          {columns.map((c, ci) => (ci % stride === 0 ? <text key={c} className="faun-chart-tick" x={left + (ci + 0.5) * cw} y={top - 8} textAnchor="middle">{truncate(c, 12)}</text> : null))}
          {rows.map((r, ri) => <text key={r} className="faun-chart-tick" x={left - 8} y={top + (ri + 0.5) * ch} dy="0.32em" textAnchor="end">{truncate(r, 22)}</text>)}
          {cells.map(({ ri, ci, v }, n) => (
            v === null
              ? <rect key={n} className="faun-chart-cell" data-active={n === active || undefined} x={left + ci * cw + 1} y={top + ri * ch + 1} width={Math.max(cw - 2, 1)} height={Math.max(ch - 2, 1)} style={{ fill: "none", strokeDasharray: "3 3" }} />
              : <rect key={n} className="faun-chart-cell" data-active={n === active || undefined} x={left + ci * cw} y={top + ri * ch} width={cw} height={ch} style={{ fill: colour(v) }} />
          ))}
          {showValues && cw > 34 && ch > 18 ? cells.map(({ ri, ci, v }, n) => (v === null ? null : <text key={n} className="faun-chart-cell-text" x={left + (ci + 0.5) * cw} y={top + (ri + 0.5) * ch} dy="0.32em" textAnchor="middle">{format(v)}</text>)) : null}
        </>
      ),
    };
  };
  const key = legend ? (
    diverging
      ? <RampLegend ramp={divRamp()} label={`Colour key: ${measure}`} from={withUnit(midpoint - half)} mid={withUnit(midpoint)} to={withUnit(midpoint + half)} />
      : <RampLegend ramp={seqRamp(HUE)} label={`Colour key: ${measure}`} from={withUnit(lo)} to={withUnit(hi)} />
  ) : null;
  return <ChartShell ref={ref} height={height} legend={false} legendExtra={key} empty={rows.length === 0 || columns.length === 0 || all.length === 0} layout={layout} {...rest} />;
});
