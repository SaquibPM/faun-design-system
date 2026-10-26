import { forwardRef } from "react";
import { Axes, plotBox } from "../ChartKit/axes.js";
import { ChartFrame, type ChartLayout, type SeriesVisibility } from "../ChartKit/ChartFrame.js";
import { Marker, ReferenceLines, shapeOf } from "../ChartKit/parts.js";
import { CHART_DEFAULT_SLOT, chartColorVar, defaultFormat, linear, niceTicks, resolveColors } from "../ChartKit/scale.js";
import { MAX_SERIES, type ChartBaseProps } from "../ChartKit/types.js";

export interface LineChartProps extends ChartBaseProps {
  /**
   * Starts the value axis at zero (default). Turn off to fit the axis to the data when the changes you want to show
   * are small next to the values; say so in the description.
   */
  zeroBaseline?: boolean;
  /**
   * `line` joins points with straight segments. `step` holds each value until the next point, then steps to it: use it for values that
   * change at a moment and stay there, such as a tariff, a limit or a headcount.
   */
  variant?: "line" | "step";
}

/** Shows change over an ordered axis such as months or years. Each series has its own marker shape, so lines are told apart without colour. A null value breaks the line. */
export const LineChart = forwardRef<HTMLElement, LineChartProps>(function LineChart({ zeroBaseline = true, variant = "line", ...props }, ref) {
  const { categories, series: all, unit, format = defaultFormat, references = [] } = props;
  const series = all.slice(0, MAX_SERIES);
  const colors = resolveColors(series, CHART_DEFAULT_SLOT.line);

  const layout = ({ width, height, active, visible }: { width: number; height: number; active: number; visible: SeriesVisibility }): ChartLayout => {
    const values = [...series.flatMap((s, k) => (visible[k] ? s.values.filter((v): v is number => v !== null) : [])), ...references.map((r) => r.value)];
    const lo = zeroBaseline ? Math.min(0, ...values) : Math.min(...values);
    const { ticks, min, max } = niceTicks(Number.isFinite(lo) ? lo : 0, Math.max(...values, 0));
    const box = plotBox(width, height, ticks.map(format), !!unit);
    const y = linear(min, max, box.top + box.h, box.top);
    const band = box.w / categories.length;
    const xAt = (i: number) => box.left + (i + 0.5) * band;
    const showAll = categories.length <= 24;
    return {
      xAt,
      svg: (
        <>
          <Axes box={box} width={width} ticks={ticks} y={y} format={format} unit={unit} categories={categories} xAt={xAt} />
          {active >= 0 ? <line className="faun-chart-guide" x1={xAt(active)} x2={xAt(active)} y1={box.top} y2={box.top + box.h} /> : null}
          {series.map((s, k) => {
            if (!visible[k]) return null;
            // Runs of consecutive values are separate subpaths so missing data shows as a gap.
            let d = ""; let pen = false;
            s.values.forEach((v, i) => {
              if (v === null || v === undefined) { pen = false; return; }
              // A step holds the previous value until this x, then moves vertically to the new one.
              d += !pen ? `M${xAt(i).toFixed(1)} ${y(v).toFixed(1)}` : variant === "step" ? `H${xAt(i).toFixed(1)}V${y(v).toFixed(1)}` : `L${xAt(i).toFixed(1)} ${y(v).toFixed(1)}`;
              pen = true;
            });
            return <path key={s.id} className="faun-chart-line" d={d} style={{ stroke: chartColorVar(colors[k]!) }} />;
          })}
          {series.map((s, k) => s.values.map((v, i) => {
            if (!visible[k] || v === null || v === undefined) return null;
            const on = i === active;
            if (!showAll && !on) return null;
            return (
              <g key={`${s.id}-${i}`}>
                {on ? <circle className="faun-chart-halo" cx={xAt(i)} cy={y(v)} r={9} style={{ stroke: chartColorVar(colors[k]!) }} /> : null}
                <Marker className="faun-chart-marker" shape={shapeOf(k)} x={xAt(i)} y={y(v)} r={on ? 5 : 4} color={colors[k]!} />
              </g>
            );
          }))}
          <ReferenceLines refs={references} axis="y" at={y} box={box} width={width} format={format} />
        </>
      ),
    };
  };
  return <ChartFrame ref={ref} kind="line" layout={layout} {...props} />;
});
