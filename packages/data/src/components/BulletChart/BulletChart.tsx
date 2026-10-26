import { forwardRef } from "react";
import { HAxes, plotBox } from "../ChartKit/axes.js";
import { ChartShell, type ShellDrawing, type ShellSize, type ShellStep } from "../ChartKit/ChartShell.js";
import { Swatch } from "../ChartKit/parts.js";
import { ReliefBlock } from "../ChartKit/relief.js";
import { CHART_DEFAULT_SLOT, defaultFormat, linear, niceTicks, truncate } from "../ChartKit/scale.js";
import type { ChartColor, ChartCommonProps } from "../ChartKit/types.js";

export interface BulletItem {
  /** Stable id. */
  id: string;
  /** Name of the measure, for example "Renewable electricity". */
  label: string;
  /** The measured value. */
  value: number;
  /** The goal, drawn as a tick across the bar. */
  target?: number;
  /** Upper bounds of the qualitative bands behind the bar, ascending, for example `[40, 70, 100]`. Shades step from light to dark. Up to four. */
  ranges?: number[];
}

export interface BulletChartProps extends ChartCommonProps {
  items: BulletItem[];
  /** Names of the bands, in the same order as `ranges`, for example `["Behind", "On track", "Ahead"]`. Used in the legend, tooltip and table. */
  rangeLabels?: string[];
  /** Unit of the values. */
  unit?: string;
  /** Formats a value. Default: thousands separators, up to one decimal. */
  format?: (value: number) => string;
  /** Colour slot for the value bar. Default `cat-7`. */
  color?: ChartColor;
}

const BAND_OPACITY = [0.14, 0.28, 0.44, 0.6];
const ROW = 52;

/** Shows one measure against a goal and a few qualitative bands. Compact enough to stack a dozen KPIs in the space of one bar chart. */
export const BulletChart = forwardRef<HTMLElement, BulletChartProps>(function BulletChart(props, ref) {
  const { items, rangeLabels = [], unit, format = defaultFormat, color = CHART_DEFAULT_SLOT.bullet, height: heightProp, legend, ...rest } = props;
  const height = heightProp ?? Math.max(120, items.length * ROW + 52);
  const withUnit = (v: number) => (unit ? `${format(v)} ${unit}` : format(v));
  const bandName = (_: BulletItem, b: number) => rangeLabels[b] ?? `Band ${b + 1}`;
  const bandsOf = (it: BulletItem) => (it.ranges ?? []).slice(0, 4);

  const layout = ({ width, height, active }: ShellSize): ShellDrawing => {
    const all = items.flatMap((it) => [it.value, it.target ?? 0, ...bandsOf(it)]);
    const { ticks, min, max } = niceTicks(0, Math.max(...all, 0));
    const labels = items.map((it) => truncate(it.label, 28));
    const box = plotBox(width, height, labels, !!unit, 16, 30, 8.6);
    const x = linear(min, max, box.left, box.left + box.w);
    const band = box.h / items.length;
    const yAt = (i: number) => box.top + (i + 0.5) * band;
    const barH = Math.min(band * 0.7, 28);
    const steps: ShellStep[] = items.map((it, i) => ({
      label: it.label, x: x(Math.max(it.value, it.target ?? 0, 0)), y: yAt(i),
      rows: [
        { name: "Value", value: withUnit(it.value), color },
        ...(it.target !== undefined ? [{ name: "Target", value: withUnit(it.target) }] : []),
        ...bandsOf(it).map((r, b) => ({ name: bandName(it, b), value: `up to ${withUnit(r)}` })),
      ],
    }));
    return {
      noun: "measures",
      pointer: "y",
      steps,
      table: {
        head: ["Measure", `Value${unit ? ` (${unit})` : ""}`, "Target", "Bands"],
        rows: items.map((it) => [it.label, format(it.value), it.target === undefined ? "None" : format(it.target), bandsOf(it).length ? bandsOf(it).map((r, b) => `${bandName(it, b)} up to ${format(r)}`).join("; ") : "None"]),
      },
      svg: (
        <>
          <HAxes box={box} ticks={ticks} x={x} format={format} unit={unit} categories={items.map((i) => i.label)} yAt={yAt} />
          {active >= 0 ? <rect className="faun-chart-hover" x={box.left} y={box.top + active * band} width={box.w} height={band} /> : null}
          {items.map((it, i) => {
            const bands = bandsOf(it);
            return (
              <g key={it.id}>
                {[...bands].reverse().map((upper, r) => {
                  const idx = bands.length - 1 - r;
                  return <rect key={idx} className="faun-chart-range" x={x(0)} y={yAt(i) - barH / 2} width={Math.max(x(upper) - x(0), 0)} height={barH} style={{ opacity: BAND_OPACITY[idx] }} />;
                })}
                <ReliefBlock x={x(0)} y={yAt(i) - barH / 6} width={Math.max(x(it.value) - x(0), 1)} height={barH / 3} color={color} dir="right" thin />
                {it.target !== undefined ? <line className="faun-chart-target-mark" x1={x(it.target)} x2={x(it.target)} y1={yAt(i) - barH / 2 - 2} y2={yAt(i) + barH / 2 + 2} /> : null}
              </g>
            );
          })}
        </>
      ),
    };
  };
  const longest = items.reduce((best, it) => (bandsOf(it).length > bandsOf(best).length ? it : best), items[0] ?? { id: "", label: "", value: 0 });
  const key = legend === false || items.length === 0 ? null : (
    <ul className="faun-chart-legend" aria-label="Legend">
      <li className="faun-chart-legend-item"><Swatch color={color} kind="bar" /><span>Value</span></li>
      {items.some((i) => i.target !== undefined) ? <li className="faun-chart-legend-item"><svg className="faun-chart-swatch" data-kind="dot" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><line className="faun-chart-target-mark" x1="6" x2="6" y1="0" y2="12" /></svg><span>Target</span></li> : null}
      {bandsOf(longest).map((_, b) => (
        <li key={b} className="faun-chart-legend-item">
          <svg className="faun-chart-swatch" data-kind="dot" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><rect className="faun-chart-range" width="12" height="12" rx="2" style={{ opacity: BAND_OPACITY[b] }} /></svg>
          <span>{bandName(longest, b)}</span>
        </li>
      ))}
    </ul>
  );
  return <ChartShell ref={ref} height={height} legend={false} legendExtra={key} empty={items.length === 0} layout={layout} {...rest} />;
});
