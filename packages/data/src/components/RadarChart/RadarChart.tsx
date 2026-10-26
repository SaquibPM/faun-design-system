import { forwardRef } from "react";
import { ChartShell, type ShellDrawing, type ShellLegendItem, type ShellSize, type ShellStep } from "../ChartKit/ChartShell.js";
import { Marker, referenceKindLabel, shapeOf } from "../ChartKit/parts.js";
import { CHART_DEFAULT_SLOT, chartColorVar, defaultFormat, niceTicks, resolveColors, truncate } from "../ChartKit/scale.js";
import { MAX_SERIES, type ChartBaseProps } from "../ChartKit/types.js";

export interface RadarChartProps extends ChartBaseProps {
  /** Value at the outer ring. Default: the largest value or reference, rounded up to a tidy number. */
  max?: number;
}

/** Compares several measures of one or more subjects on shared axes, for example a supplier's scores across ESG criteria. Needs at least three categories. */
export const RadarChart = forwardRef<HTMLElement, RadarChartProps>(function RadarChart(props, ref) {
  const { categories, series: all, unit, format = defaultFormat, references = [], max: maxProp, height = 340, ...rest } = props;
  const series = all.slice(0, MAX_SERIES);
  const colors = resolveColors(series, CHART_DEFAULT_SLOT.radar);
  const n = categories.length;
  const withUnit = (v: number) => (unit ? `${format(v)} ${unit}` : format(v));
  const legendItems: ShellLegendItem[] = series.map((s, k) => ({ id: s.id, label: s.label, color: colors[k]!, mark: "line", shape: shapeOf(k) }));

  const layout = ({ width, height, active, isHidden }: ShellSize): ShellDrawing => {
    const shown = series.map((_, k) => k).filter((k) => !isHidden(series[k]!.id));
    const vals = [...shown.flatMap((k) => series[k]!.values.filter((v): v is number => v !== null)), ...references.map((r) => r.value)];
    const { ticks, max } = niceTicks(0, maxProp ?? Math.max(...vals, 0), 4);
    const top = maxProp ?? max;
    const cx = width / 2; const cy = height / 2 + 4;
    const r = Math.max(Math.min(width / 2 - 84, height / 2 - 30), 20);
    const ang = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2;
    const at = (i: number, v: number) => { const rad = (Math.min(Math.max(v, 0), top) / top) * r; return [cx + rad * Math.cos(ang(i)), cy + rad * Math.sin(ang(i))] as const; };
    const poly = (k: number) => {
      const pts = series[k]!.values.map((v, i) => (v === null || v === undefined ? null : at(i, v)));
      return pts.filter(Boolean).map((p, j) => `${j === 0 ? "M" : "L"}${p![0].toFixed(1)} ${p![1].toFixed(1)}`).join("") + "Z";
    };
    const steps: ShellStep[] = categories.map((c, i) => {
      const [x, y] = at(i, top);
      return {
        label: c, x, y,
        rows: shown.map((k) => { const v = series[k]!.values[i]; return { name: series[k]!.label, value: v === null || v === undefined ? "No data" : withUnit(v), color: colors[k]!, mark: "line" as const, shape: shapeOf(k), empty: v === null || v === undefined }; }),
      };
    });
    return {
      noun: "axes",
      steps,
      hit: (x, y) => {
        let a = Math.atan2(y - cy, x - cx) + Math.PI / 2;
        if (a < 0) a += Math.PI * 2;
        return Math.round((a / (Math.PI * 2)) * n) % n;
      },
      table: {
        head: ["Category", ...shown.map((k) => series[k]!.label)],
        rows: categories.map((c, i) => [c, ...shown.map((k) => { const v = series[k]!.values[i]; return v === null || v === undefined ? "No data" : withUnit(v); })]),
        foot: references.map((ref) => [`${referenceKindLabel(ref)}: ${ref.label}`, withUnit(ref.value)]),
      },
      svg: (
        <>
          {ticks.filter((t) => t > 0 && t <= top).map((t) => (
            <g key={t}>
              <polygon className="faun-chart-ring" points={categories.map((_, i) => at(i, t).join(",")).join(" ")} />
              <text className="faun-chart-tick faun-chart-knockout" x={cx + 4} y={cy - (t / top) * r} dy="-0.3em">{format(t)}</text>
            </g>
          ))}
          {categories.map((c, i) => {
            const [x, y] = at(i, top); const a = ang(i);
            const lx = cx + (r + 12) * Math.cos(a); const ly = cy + (r + 12) * Math.sin(a);
            const anchor = Math.abs(Math.cos(a)) < 0.2 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
            return (
              <g key={c}>
                <line className="faun-chart-spoke" x1={cx} y1={cy} x2={x} y2={y} />
                <text className="faun-chart-axis-label" x={lx} y={ly} dy={Math.sin(a) > 0.2 ? "0.8em" : Math.sin(a) < -0.2 ? "-0.2em" : "0.32em"} textAnchor={anchor} fontWeight={i === active ? 600 : undefined}>{truncate(c, 18)}</text>
              </g>
            );
          })}
          {active >= 0 ? <line className="faun-chart-guide" x1={cx} y1={cy} x2={at(active, top)[0]} y2={at(active, top)[1]} /> : null}
          {references.map((ref, i) => (
            <g key={`${ref.label}-${i}`}>
              <polygon className="faun-chart-ref" data-kind={ref.kind ?? "reference"} points={categories.map((_, j) => at(j, ref.value).join(",")).join(" ")} />
              <text className="faun-chart-ref-label faun-chart-knockout" x={at(0, ref.value)[0] - 6} y={at(0, ref.value)[1]} dy="0.32em" textAnchor="end">{ref.label}</text>
            </g>
          ))}
          {shown.map((k) => (
            <g key={series[k]!.id}>
              <path className="faun-chart-poly-fill" d={poly(k)} style={{ fill: chartColorVar(colors[k]!) }} />
              <path className="faun-chart-poly" d={poly(k)} style={{ stroke: chartColorVar(colors[k]!), fill: "none" }} />
              {series[k]!.values.map((v, i) => (v === null || v === undefined ? null : <Marker key={i} className="faun-chart-marker" shape={shapeOf(k)} x={at(i, v)[0]} y={at(i, v)[1]} r={i === active ? 5 : 3.5} color={colors[k]!} />))}
            </g>
          ))}
        </>
      ),
    };
  };
  return <ChartShell ref={ref} height={height} legendItems={legendItems} empty={n === 0 || series.length === 0} layout={layout} {...rest} />;
});
