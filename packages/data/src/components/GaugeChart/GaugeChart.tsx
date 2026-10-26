import { forwardRef } from "react";
import { ChartShell, type ShellDrawing, type ShellSize } from "../ChartKit/ChartShell.js";
import { CHART_DEFAULT_SLOT, defaultFormat } from "../ChartKit/scale.js";
import { toneLabel, toneVar, type StatusTone } from "../ChartKit/tones.js";
import { ReliefArc } from "../ChartKit/relief.js";
import { chartColorVar, type CssVar } from "../ChartKit/scale.js";
import type { ChartColor, ChartCommonProps } from "../ChartKit/types.js";

export interface GaugeChartProps extends Omit<ChartCommonProps, "legend" | "toggleSeries" | "hiddenSeries" | "defaultHiddenSeries" | "onHiddenSeriesChange"> {
  /** The measured value. */
  value: number;
  /** Lowest value on the dial. Default 0. */
  min?: number;
  /** Highest value on the dial. Default 100. */
  max?: number;
  /** Name of what is measured, shown under the value. Default: the title. */
  label?: string;
  /** Unit of the value, for example "%". */
  unit?: string;
  /** Formats a value. Default: thousands separators, up to one decimal. */
  format?: (value: number) => string;
  /** A goal, drawn as a tick on the dial and listed in the data table. */
  target?: number;
  /** Change since the last period, written under the value with its sign and `deltaLabel`. */
  delta?: number;
  /** What the change is measured against, for example "vs FY2025". */
  deltaLabel?: string;
  /** Status colour for the arc, only when the colour means a status. It is named in the tooltip and the table as well. Default: the categorical colour. */
  tone?: StatusTone;
  /** Colour slot when there is no `tone`. Default `cat-7`. */
  color?: ChartColor;
}

const SWEEP = Math.PI;

/** Shows one value on a dial between a minimum and a maximum, with an optional target. Use it for a single headline measure; use a bullet chart to compare several. */
export const GaugeChart = forwardRef<HTMLElement, GaugeChartProps>(function GaugeChart(props, ref) {
  const { value, min = 0, max = 100, label, unit, format = defaultFormat, target, delta, deltaLabel, tone, color = CHART_DEFAULT_SLOT.gauge, height = 200, title, ...rest } = props;
  const withUnit = (v: number) => (unit ? `${format(v)} ${unit}` : format(v));
  const frac = (v: number) => Math.min(Math.max((v - min) / (max - min || 1), 0), 1);
  const stroke = tone ? toneVar(tone) : chartColorVar(color);
  const deltaText = delta === undefined ? null : `${delta > 0 ? "+" : delta < 0 ? "-" : ""}${format(Math.abs(delta))}${unit ? ` ${unit}` : ""}${deltaLabel ? ` ${deltaLabel}` : ""}`;

  const layout = ({ width, height }: ShellSize): ShellDrawing => {
    const thick = 18;
    const r = Math.max(Math.min(width / 2 - thick, height - 54), 30);
    const cx = width / 2; const cy = Math.min(height - 40, r + thick + 8);
    const at = (f: number, rad: number) => { const a = Math.PI + f * SWEEP; return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)] as const; };
    const arc = (f0: number, f1: number) => { const [x0, y0] = at(f0, r); const [x1, y1] = at(f1, r); return `M${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}`; };
    const f = frac(value);
    return {
      noun: "measure",
      pointer: "xy",
      hit: () => 0,
      steps: [{
        label: label ?? title, x: cx, y: cy - r / 2,
        rows: [
          { name: "Value", value: withUnit(value), color: tone ? toneVar(tone) : color },
          { name: "Range", value: `${format(min)} to ${withUnit(max)}` },
          ...(target !== undefined ? [{ name: "Target", value: withUnit(target) }] : []),
          ...(tone ? [{ name: "Status", value: toneLabel[tone] }] : []),
          ...(deltaText ? [{ name: "Change", value: deltaText }] : []),
        ],
      }],
      table: {
        head: ["Measure", "Value", "Minimum", "Maximum", "Target", "Status", "Change"],
        rows: [[label ?? title, withUnit(value), format(min), format(max), target === undefined ? "None" : withUnit(target), tone ? toneLabel[tone] : "None", deltaText ?? "None"]],
      },
      svg: (
        <>
          <path className="faun-chart-track-arc" d={arc(0, 1)} strokeWidth={thick} />
          {f > 0 ? <ReliefArc className="faun-chart-value-arc" d={arc(0, f)} strokeWidth={thick} stroke={stroke} color={(tone ? toneVar(tone) : color) as ChartColor | CssVar} /> : null}
          {target !== undefined ? <line className="faun-chart-target-mark" x1={at(frac(target), r - thick / 2 - 4)[0]} y1={at(frac(target), r - thick / 2 - 4)[1]} x2={at(frac(target), r + thick / 2 + 4)[0]} y2={at(frac(target), r + thick / 2 + 4)[1]} /> : null}
          <text className="faun-chart-tick" x={cx - r} y={cy + 18} textAnchor="middle">{format(min)}</text>
          <text className="faun-chart-tick" x={cx + r} y={cy + 18} textAnchor="middle">{format(max)}</text>
          <text className="faun-chart-big" x={cx} y={cy - 8} textAnchor="middle">{format(value)}{unit ? <tspan className="faun-chart-sub" dx="4">{unit}</tspan> : null}</text>
          <text className="faun-chart-sub" x={cx} y={cy + 10} textAnchor="middle">{deltaText ?? label ?? ""}</text>
        </>
      ),
    };
  };
  return <ChartShell ref={ref} title={title} height={height} layout={layout} {...rest} />;
});
