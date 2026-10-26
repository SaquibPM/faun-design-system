import { forwardRef, useEffect } from "react";
import { ChartShell, type ShellDrawing, type ShellLegendItem, type ShellSize, type ShellStep } from "../ChartKit/ChartShell.js";
import { ReliefFace } from "../ChartKit/relief.js";
import { defaultFormat, resolveColors } from "../ChartKit/scale.js";
import { MAX_SERIES, type ChartColor, type ChartCommonProps } from "../ChartKit/types.js";

export interface PieSlice {
  /** Stable id. A slice with id `scope-1`, `scope-2` or `scope-3` takes the GHG scope colour. */
  id: string;
  /** Name shown in the legend, tooltip and data table. */
  label: string;
  /** Zero or positive. */
  value: number;
  /** Overrides the colour slot. */
  color?: ChartColor;
}

export interface PieChartProps extends ChartCommonProps {
  slices: PieSlice[];
  /** `pie` is a full disc. `donut` leaves a hole that can carry the total. Default `pie`. */
  variant?: "pie" | "donut";
  /** Unit of the values, for example "tCO₂e". */
  unit?: string;
  /** Formats a value. Default: thousands separators, up to one decimal. */
  format?: (value: number) => string;
  /** Donut: the small label under the total in the hole. Default "Total". */
  centerLabel?: string;
  /** Donut: replaces the total in the hole. */
  centerValue?: string;
  /** Writes each share on its slice when the slice is wide enough. */
  showShares?: boolean;
}

const pct = (f: number) => `${(f * 100).toFixed(f < 0.1 ? 1 : 0)}%`;

/** Shows how a whole divides into a few parts. Keep to five or six slices; group the tail as "Other". */
export const PieChart = forwardRef<HTMLElement, PieChartProps>(function PieChart(props, ref) {
  const { slices: all, variant = "pie", unit, format = defaultFormat, centerLabel = "Total", centerValue, showShares, height = 280, ...rest } = props;
  const donut = variant === "donut";
  const slices = all.slice(0, MAX_SERIES);
  useEffect(() => {
    if (all.length > MAX_SERIES && typeof console !== "undefined") console.warn(`Faun chart "${props.title}": only ${MAX_SERIES} slices are drawn; group the rest as "Other".`);
  }, [all.length, props.title]);
  const colors = resolveColors(slices);
  const withUnit = (v: number) => (unit ? `${format(v)} ${unit}` : format(v));
  const legendItems: ShellLegendItem[] = slices.map((s, k) => ({ id: s.id, label: s.label, color: colors[k]! }));
  const empty = slices.length === 0 || slices.every((s) => s.value <= 0);

  const layout = ({ width, height, active, isHidden }: ShellSize): ShellDrawing => {
    const shown = slices.map((_, k) => k).filter((k) => !isHidden(slices[k]!.id) && slices[k]!.value > 0);
    const total = shown.reduce((n, k) => n + slices[k]!.value, 0);
    const cx = width / 2; const cy = height / 2;
    const r = Math.max(Math.min(width, height) / 2 - 8, 10);
    const r0 = donut ? r * 0.62 : 0;
    let angle = -Math.PI / 2;
    const pt = (rad: number, a: number) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)] as const;
    const arcs = shown.map((k) => {
      const f = slices[k]!.value / total;
      const a0 = angle; const a1 = angle + f * Math.PI * 2; angle = a1;
      return { k, f, a0, a1 };
    });
    const path = (a0: number, a1: number) => {
      const full = a1 - a0 >= Math.PI * 2 - 1e-6;
      const mid = full ? a0 + Math.PI : a1;
      const seg = (from: number, to: number, first: boolean) => {
        const [x0, y0] = pt(r, from); const [x1, y1] = pt(r, to); const [x2, y2] = pt(r0, to); const [x3, y3] = pt(r0, from);
        const large = to - from > Math.PI ? 1 : 0;
        return `${first ? `M${x0} ${y0}` : ""}A${r} ${r} 0 ${large} 1 ${x1} ${y1}${r0 > 0 ? `L${x2} ${y2}A${r0} ${r0} 0 ${large} 0 ${x3} ${y3}` : `L${cx} ${cy}`}`;
      };
      return full ? `M${pt(r, a0)[0]} ${pt(r, a0)[1]}${seg(a0, mid, false)}${seg(mid, a1, false)}Z` : `${seg(a0, a1, true)}Z`;
    };
    const steps: ShellStep[] = arcs.map(({ k, f, a0, a1 }) => {
      const [x, y] = pt((r + r0) / 2, (a0 + a1) / 2);
      const s = slices[k]!;
      return { label: s.label, x, y, rows: [{ name: "Value", value: withUnit(s.value), color: colors[k]! }, { name: "Share", value: pct(f) }] };
    });
    return {
      noun: "slices",
      pointer: "xy",
      steps,
      hit: (x, y) => {
        const d = Math.hypot(x - cx, y - cy);
        if (d > r || d < r0) return -1;
        let a = Math.atan2(y - cy, x - cx); if (a < -Math.PI / 2) a += Math.PI * 2;
        return arcs.findIndex((s) => a >= s.a0 && a <= s.a1 + 1e-9);
      },
      table: { head: ["Slice", `Value${unit ? ` (${unit})` : ""}`, "Share"], rows: arcs.map(({ k, f }) => [slices[k]!.label, format(slices[k]!.value), pct(f)]), foot: [["Total", format(total), "100%"]] },
      svg: (
        <>
          {arcs.map(({ k, a0, a1 }) => <ReliefFace key={`side-${slices[k]!.id}`} part="side" extrude tag="path" geom={{ d: path(a0, a1) }} color={colors[k]!} className="faun-chart-slice" />)}
          {arcs.map(({ k, a0, a1, f }, n) => {
            const [lx, ly] = pt((r + r0) / 2, (a0 + a1) / 2);
            return (
              <g key={slices[k]!.id}>
                <ReliefFace part="front" tag="path" geom={{ d: path(a0, a1) }} color={colors[k]!} className="faun-chart-slice" active={n === active} shapeProps={{ "data-active": n === active || undefined }} />
                {showShares && f >= 0.07 ? <text className="faun-chart-cell-text" x={lx} y={ly} dy="0.32em" textAnchor="middle">{pct(f)}</text> : null}
              </g>
            );
          })}
          {donut ? (
            <>
              <text className="faun-chart-big" x={cx} y={cy} dy="0.1em" textAnchor="middle">{centerValue ?? format(total)}</text>
              <text className="faun-chart-sub" x={cx} y={cy + 20} textAnchor="middle">{centerLabel}{unit && !centerValue ? ` (${unit})` : ""}</text>
            </>
          ) : null}
        </>
      ),
    };
  };
  return <ChartShell ref={ref} height={height} legendItems={legendItems} legend={rest.legend ?? true} empty={empty} layout={layout} {...rest} />;
});
