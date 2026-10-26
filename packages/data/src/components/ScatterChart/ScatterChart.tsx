import { forwardRef } from "react";
import { plotBox, XYAxes } from "../ChartKit/axes.js";
import { ChartShell, type ShellDrawing, type ShellLegendItem, type ShellSize, type ShellStep } from "../ChartKit/ChartShell.js";
import { Marker, ReferenceLines, referenceKindLabel, shapeOf } from "../ChartKit/parts.js";
import { CHART_DEFAULT_SLOT, chartColorVar, defaultFormat, linear, niceTicks, resolveColors } from "../ChartKit/scale.js";
import { MAX_SERIES, type ChartColor, type ChartCommonProps, type ChartReference } from "../ChartKit/types.js";

export interface ScatterPoint {
  x: number;
  y: number;
  /** Bubble variant: the third measure, drawn as the area of the bubble. */
  size?: number;
  /** Names the point in the tooltip and data table, for example a facility. */
  label?: string;
}

export interface ScatterSeries {
  /** Stable id. */
  id: string;
  /** Name shown in the legend, tooltip and data table. */
  label: string;
  points: ScatterPoint[];
  /** Overrides the colour slot. By default series take `cat-1`, `cat-2`, and so on in order. */
  color?: ChartColor;
}

export interface ScatterChartProps extends ChartCommonProps {
  series: ScatterSeries[];
  /** `scatter` marks each point with a per-series shape. `bubble` sizes each point by `size`. */
  variant?: "scatter" | "bubble";
  /** Name of the x measure, shown under the axis and in the tooltip. */
  xTitle?: string;
  /** Name of the y measure, shown above the axis and in the tooltip. */
  yTitle?: string;
  /** Unit of the y values. */
  unit?: string;
  /** Unit of the x values. */
  xUnit?: string;
  /** Name of the size measure (bubble). */
  sizeTitle?: string;
  /** Unit of the size values (bubble). */
  sizeUnit?: string;
  /** Formats y values. Default: thousands separators, up to one decimal. */
  format?: (value: number) => string;
  /** Formats x values. Defaults to `format`. */
  xFormat?: (value: number) => string;
  /** Formats size values. Defaults to `format`. */
  sizeFormat?: (value: number) => string;
  /** Lines on the y axis, such as a target or a limit. */
  references?: ChartReference[];
}

const MAX_R = 26;
const MIN_R = 5;

/** Plots two measures against each other to show how they relate; with `variant="bubble"` a third measure sets the bubble area. */
export const ScatterChart = forwardRef<HTMLElement, ScatterChartProps>(function ScatterChart(props, ref) {
  const {
    series: all, variant = "scatter", xTitle, yTitle, unit, xUnit, sizeTitle, sizeUnit, format = defaultFormat, xFormat = format, sizeFormat = format, references = [], height = 320, ...rest
  } = props;
  const bubble = variant === "bubble";
  const series = all.slice(0, MAX_SERIES);
  const colors = resolveColors(series, CHART_DEFAULT_SLOT.scatter);
  const w = (v: number, u?: string) => (u ? `${v} ${u}` : String(v));
  const legendItems: ShellLegendItem[] = series.map((s, k) => ({ id: s.id, label: s.label, color: colors[k]!, mark: "dot", shape: bubble ? "circle" : shapeOf(k) }));
  const empty = series.every((s) => s.points.length === 0);

  const layout = ({ width, height, active, isHidden }: ShellSize): ShellDrawing => {
    const shown = series.map((_, k) => k).filter((k) => !isHidden(series[k]!.id));
    const pts = shown.flatMap((k) => series[k]!.points.map((p, j) => ({ k, j, p })));
    const xs = pts.map((d) => d.p.x); const ys = [...pts.map((d) => d.p.y), ...references.map((r) => r.value)];
    const xt = niceTicks(Math.min(...xs), Math.max(...xs), Math.max(3, Math.min(6, Math.floor((width - 80) / 70)))); const yt = niceTicks(Math.min(...ys), Math.max(...ys));
    const maxSize = Math.max(...pts.map((d) => d.p.size ?? 0), 1e-9);
    const box = plotBox(width, height, yt.ticks.map(format), !!(yTitle || unit), MAX_R, xTitle ? 48 : 30);
    const x = linear(xt.min, xt.max, box.left + (bubble ? MAX_R / 2 : 6), box.left + box.w - (bubble ? MAX_R / 2 : 6));
    const y = linear(yt.min, yt.max, box.top + box.h, box.top);
    const radius = (s?: number) => MIN_R + (MAX_R - MIN_R) * Math.sqrt(Math.max(s ?? 0, 0) / maxSize);
    const yHead = [yTitle, unit].filter(Boolean).join(" · ");
    const xName = xTitle ?? "X"; const yName = yTitle ?? "Y"; const sName = sizeTitle ?? "Size";
    const steps: ShellStep[] = pts.map(({ k, j, p }) => ({
      label: p.label ?? `${series[k]!.label}, point ${j + 1}`,
      x: x(p.x), y: y(p.y),
      rows: [
        { name: series[k]!.label, value: "", color: colors[k]!, mark: "dot", shape: bubble ? "circle" : shapeOf(k) },
        { name: xName, value: `${xFormat(p.x)}${xUnit ? ` ${xUnit}` : ""}` },
        { name: yName, value: `${format(p.y)}${unit ? ` ${unit}` : ""}` },
        ...(bubble && p.size !== undefined ? [{ name: sName, value: `${sizeFormat(p.size)}${sizeUnit ? ` ${sizeUnit}` : ""}` }] : []),
      ],
    }));
    return {
      noun: "points",
      pointer: "xy",
      steps,
      table: {
        head: ["Series", "Point", `${xName}${xUnit ? ` (${xUnit})` : ""}`, `${yName}${unit ? ` (${unit})` : ""}`, ...(bubble ? [`${sName}${sizeUnit ? ` (${sizeUnit})` : ""}`] : [])],
        rows: pts.map(({ k, j, p }) => [series[k]!.label, p.label ?? String(j + 1), xFormat(p.x), format(p.y), ...(bubble ? [p.size === undefined ? "No data" : sizeFormat(p.size)] : [])]),
        foot: references.map((r) => [`${referenceKindLabel(r)}: ${r.label}`, w(r.value, unit)]),
      },
      svg: (
        <>
          <XYAxes box={box} width={width} xTicks={xt.ticks} yTicks={yt.ticks} x={x} y={y} xFormat={xFormat} yFormat={format} xTitle={[xTitle, xUnit].filter(Boolean).join(" · ") || undefined} yTitle={yHead || undefined} />
          {pts.map(({ k, j, p }, n) => {
            const on = n === active;
            const c = chartColorVar(colors[k]!);
            return bubble
              ? <circle key={`${k}-${j}`} className="faun-chart-bubble" cx={x(p.x)} cy={y(p.y)} r={radius(p.size)} style={{ fill: c, stroke: c }} />
              : <Marker key={`${k}-${j}`} className="faun-chart-marker" shape={shapeOf(k)} x={x(p.x)} y={y(p.y)} r={on ? 6 : 4.5} color={colors[k]!} />;
          })}
          {active >= 0 && pts[active] ? <circle className="faun-chart-active-ring" cx={x(pts[active]!.p.x)} cy={y(pts[active]!.p.y)} r={(bubble ? radius(pts[active]!.p.size) : 5) + 4} /> : null}
          <ReferenceLines refs={references} axis="y" at={y} box={box} width={width} format={format} />
        </>
      ),
    };
  };
  return <ChartShell ref={ref} height={height} legendItems={legendItems} empty={empty} layout={layout} {...rest} />;
});
