import { forwardRef } from "react";
import { ChartShell, type ShellDrawing, type ShellLegendItem, type ShellSize, type ShellStep } from "../ChartKit/ChartShell.js";
import { ReliefBlock } from "../ChartKit/relief.js";
import { CHART_DEFAULT_SLOT, chartColorVar, type CssVar, defaultFormat, resolveColors } from "../ChartKit/scale.js";
import { toneLabel, toneVar, type StatusTone } from "../ChartKit/tones.js";
import type { ChartColor, ChartCommonProps } from "../ChartKit/types.js";

export interface MeterZone {
  /** The zone starts at this value and runs to the next zone (or the maximum). */
  from: number;
  tone: StatusTone;
  /** Name of the status, used in the tooltip and table. Defaults to a label for the tone. */
  label?: string;
}

export interface MeterSegment {
  id: string;
  label: string;
  value: number;
  color?: ChartColor;
}

export interface MeterChartProps extends ChartCommonProps {
  /** `standard` fills a bar to one value out of a maximum, optionally with status zones. `proportional` splits one bar into the parts of a whole. */
  variant?: "standard" | "proportional";
  /** Standard: the measured value. */
  value?: number;
  /** Standard: the maximum. Proportional: the whole; defaults to the sum of the segments. Default 100. */
  max?: number;
  /** Standard: status zones, ascending by `from`. The bar takes the tone of the zone the value is in, and the status is named in text. */
  zones?: MeterZone[];
  /** Proportional: the parts. */
  segments?: MeterSegment[];
  /** Unit of the values. */
  unit?: string;
  /** Formats a value. Default: thousands separators, up to one decimal. */
  format?: (value: number) => string;
  /** Standard: colour slot when there are no zones. Default `cat-7`. */
  color?: ChartColor;
}

/** Shows progress towards a limit or capacity (standard), or how one whole is divided into parts (proportional), in a single bar. */
export const MeterChart = forwardRef<HTMLElement, MeterChartProps>(function MeterChart(props, ref) {
  const { variant = "standard", value = 0, max: maxProp, zones = [], segments = [], unit, format = defaultFormat, color = CHART_DEFAULT_SLOT.meter, height = 96, title, legend, ...rest } = props;
  const proportional = variant === "proportional";
  const withUnit = (v: number) => (unit ? `${format(v)} ${unit}` : format(v));
  const colors = resolveColors(segments);
  const sum = segments.reduce((n, s) => n + Math.max(s.value, 0), 0);
  const max = maxProp ?? (proportional ? sum : 100);
  const zone = [...zones].sort((a, b) => a.from - b.from).filter((z) => value >= z.from).pop();
  const zoneName = zone ? (zone.label ?? toneLabel[zone.tone]) : undefined;
  const legendItems: ShellLegendItem[] = proportional ? segments.map((s, k) => ({ id: s.id, label: s.label, color: colors[k]! })) : [];

  const layout = ({ width, height, active, isHidden }: ShellSize): ShellDrawing => {
    const padX = 4; const w = Math.max(width - padX * 2, 1);
    const barH = 20; const y0 = Math.max((height - barH) / 2 - 8, 14);
    const sx = (v: number) => padX + (Math.min(Math.max(v, 0), max) / (max || 1)) * w;
    if (!proportional) {
      const fill = zone ? toneVar(zone.tone) : chartColorVar(color);
      return {
        noun: "measure",
        hit: () => 0,
        steps: [{
          label: title, x: sx(value), y: y0 + barH / 2,
          rows: [{ name: "Value", value: `${withUnit(value)} of ${withUnit(max)}`, color: zone ? toneVar(zone.tone) : color }, { name: "Used", value: `${Math.round((value / (max || 1)) * 100)}%` }, ...(zoneName ? [{ name: "Status", value: zoneName }] : [])],
        }],
        table: { head: ["Measure", "Value", "Maximum", "Share", "Status"], rows: [[title, withUnit(value), withUnit(max), `${Math.round((value / (max || 1)) * 100)}%`, zoneName ?? "None"]] },
        svg: (
          <>
            <rect className="faun-chart-track-bar" x={padX} y={y0} width={w} height={barH} rx={4} />
            {zones.map((z, i) => { const next = [...zones].sort((a, b) => a.from - b.from)[i + 1]?.from ?? max; return <rect key={i} x={sx(z.from)} y={y0 + barH + 3} width={Math.max(sx(next) - sx(z.from), 0)} height={3} style={{ fill: toneVar(z.tone) }} />; })}
            {value > 0 ? <ReliefBlock x={padX} y={y0} width={Math.max(sx(value) - padX, 2)} height={barH} color={fill as CssVar} dir="right" thin /> : null}
            <text className="faun-chart-tick" x={padX} y={y0 + barH + 22}>{format(0)}</text>
            <text className="faun-chart-tick" x={padX + w} y={y0 + barH + 22} textAnchor="end">{withUnit(max)}</text>
            <text className="faun-chart-value" x={padX} y={y0 - 6}>{withUnit(value)}{zoneName ? ` · ${zoneName}` : ""}</text>
          </>
        ),
      };
    }
    const shown = segments.map((_, k) => k).filter((k) => !isHidden(segments[k]!.id) && segments[k]!.value > 0);
    let acc = 0;
    const parts = shown.map((k) => { const a = acc; acc += segments[k]!.value; return { k, a, b: acc }; });
    const total = acc;
    const steps: ShellStep[] = parts.map(({ k, a, b }) => ({
      label: segments[k]!.label, x: (sx(a) + sx(b)) / 2, y: y0 + barH / 2,
      rows: [{ name: "Value", value: withUnit(segments[k]!.value), color: colors[k]! }, { name: "Share of whole", value: `${((segments[k]!.value / (max || 1)) * 100).toFixed(1)}%` }],
    }));
    return {
      noun: "segments",
      pointer: "x",
      hit: (x) => parts.findIndex((p) => x >= sx(p.a) && x <= sx(p.b)),
      steps,
      table: { head: ["Segment", `Value${unit ? ` (${unit})` : ""}`, "Share of whole"], rows: parts.map(({ k }) => [segments[k]!.label, format(segments[k]!.value), `${((segments[k]!.value / (max || 1)) * 100).toFixed(1)}%`]), foot: [["Whole", format(max), "100%"]] },
      svg: (
        <>
          <rect className="faun-chart-track-bar" x={padX} y={y0} width={w} height={barH} rx={4} />
          {parts.map(({ k, a, b }, n) => <ReliefBlock key={segments[k]!.id} className="faun-chart-meter-seg" x={sx(a)} y={y0} width={Math.max(sx(b) - sx(a), 1)} height={barH} color={colors[k]!} dir="right" side={false} active={n === active} rectProps={{ "data-active": n === active || undefined }} />)}
          <text className="faun-chart-value" x={padX} y={y0 - 6}>{withUnit(total)} of {withUnit(max)}</text>
          <text className="faun-chart-tick" x={padX} y={y0 + barH + 22}>{format(0)}</text>
          <text className="faun-chart-tick" x={padX + w} y={y0 + barH + 22} textAnchor="end">{withUnit(max)}</text>
        </>
      ),
    };
  };
  return <ChartShell ref={ref} title={title} height={height} legendItems={legendItems} legend={legend} empty={proportional && sum <= 0} layout={layout} {...rest} />;
});
