import { FadeDefs, useFadeId, useRelief } from "./relief.js";
import { labelStride, textWidth, truncate } from "./scale.js";

/** Width estimate of an uppercase, letter-spaced category label at caption size. */
const catWidth = (s: string) => s.length * 8.6;

/** Breaks a category label over two lines at the space that balances them, or cuts it, so labels fit their band before any are dropped. */
function wrapLabel(label: string, room: number): string[] {
  if (catWidth(label) <= room) return [label];
  const words = label.split(" ");
  let best: string[] | null = null;
  for (let i = 1; i < words.length; i++) {
    const a = `${words.slice(0, i).join(" ")} `; const b = words.slice(i).join(" ");
    const w = Math.max(catWidth(a.trimEnd()), catWidth(b));
    if (!best || w < Math.max(catWidth(best[0]!.trimEnd()), catWidth(best[1]!))) best = [a, b];
  }
  // When even the best break does not fit, keep the label whole: labelStride then thins the labels instead of cutting words.
  return best ?? [label];
}

export interface PlotBox { left: number; right: number; top: number; bottom: number }

const LABEL_CHARS = 16;

/** Margins that leave room for the widest y tick label and, when present, the unit above the axis. */
export function plotBox(width: number, height: number, tickLabels: string[], hasUnit: boolean, right = 8, bottom = 30, charWidth = 6.5): PlotBox & { w: number; h: number } {
  const left = Math.ceil(Math.max(...tickLabels.map((t) => t.length * charWidth), 0)) + 14;
  const box = { left, right, top: hasUnit ? 22 : 8, bottom };
  return { ...box, w: Math.max(width - box.left - box.right, 1), h: Math.max(height - box.top - box.bottom, 1) };
}

export interface AxesProps {
  box: PlotBox & { w: number; h: number };
  width: number;
  ticks: number[];
  y: (v: number) => number;
  format: (v: number) => string;
  unit?: string;
  categories: string[];
  xAt: (i: number) => number;
}

/** Horizontal grid, y tick labels, the unit and thinned x labels. Decorative: the data table carries the content. */
export function Axes({ box, width, ticks, y, format, unit, categories, xAt }: AxesProps) {
  const lines = categories.map((c) => wrapLabel(truncate(c, LABEL_CHARS), box.w / categories.length - 8));
  const stride = labelStride(categories.length, box.w, Math.max(...lines.flat().map((l) => catWidth(l.trimEnd())), 1) + 10);
  const base = y(Math.max(Math.min(0, ticks[ticks.length - 1]!), ticks[0]!));
  const fadeId = useFadeId();
  const fade = useRelief().appearance === "relief" ? { stroke: `url(#${fadeId})` } : undefined;
  return (
    <g className="faun-chart-axes">
      {fade ? <FadeDefs id={fadeId} axis="x" from={box.left} to={width - box.right} /> : null}
      {unit ? <text className="faun-chart-tick" x={0} y={10} textAnchor="start">{unit}</text> : null}
      {ticks.map((t) => (
        <g key={t}>
          <line className="faun-chart-grid" style={fade} x1={box.left} x2={width - box.right} y1={y(t)} y2={y(t)} />
          <text className="faun-chart-tick" x={box.left - 8} y={y(t)} dy="0.32em" textAnchor="end">{format(t)}</text>
        </g>
      ))}
      <line className="faun-chart-baseline" style={fade} x1={box.left} x2={width - box.right} y1={base} y2={base} />
      {lines.map((ls, i) => (i % stride === 0 ? (
        <text key={i} className="faun-chart-tick faun-chart-axis-cat" x={xAt(i)} y={box.top + box.h + 18} textAnchor="middle">
          {ls.length === 1 ? ls[0] : ls.map((l, j) => <tspan key={j} x={xAt(i)} dy={j === 0 ? 0 : 14}>{l}</tspan>)}
        </text>
      ) : null))}
    </g>
  );
}

export interface HAxesProps {
  box: PlotBox & { w: number; h: number };
  ticks: number[];
  x: (v: number) => number;
  format: (v: number) => string;
  unit?: string;
  categories: string[];
  yAt: (i: number) => number;
}

/** Axes for horizontal bars: vertical grid and value ticks along the bottom, category labels down the left. */
export function HAxes({ box, ticks, x, format, unit, categories, yAt }: HAxesProps) {
  const labels = categories.map((c) => truncate(c, LABEL_CHARS * 2));
  const stride = labelStride(categories.length, box.h, 18);
  const base = x(Math.max(Math.min(0, ticks[ticks.length - 1]!), ticks[0]!));
  const fadeId = useFadeId();
  const fade = useRelief().appearance === "relief" ? { stroke: `url(#${fadeId})` } : undefined;
  return (
    <g className="faun-chart-axes">
      {fade ? <FadeDefs id={fadeId} axis="y" from={box.top} to={box.top + box.h} /> : null}
      {unit ? <text className="faun-chart-tick" x={box.left} y={10} textAnchor="start">{unit}</text> : null}
      {ticks.map((t) => (
        <g key={t}>
          <line className="faun-chart-grid" style={fade} x1={x(t)} x2={x(t)} y1={box.top} y2={box.top + box.h} />
          <text className="faun-chart-tick" x={x(t)} y={box.top + box.h + 18} textAnchor="middle">{format(t)}</text>
        </g>
      ))}
      <line className="faun-chart-baseline" style={fade} x1={base} x2={base} y1={box.top} y2={box.top + box.h} />
      {labels.map((l, i) => (i % stride === 0 ? (
        <text key={i} className="faun-chart-tick faun-chart-axis-cat" x={box.left - 8} y={yAt(i)} dy="0.32em" textAnchor="end">{l}</text>
      ) : null))}
    </g>
  );
}

export interface XYAxesProps {
  box: PlotBox & { w: number; h: number };
  width: number;
  xTicks: number[];
  yTicks: number[];
  x: (v: number) => number;
  y: (v: number) => number;
  xFormat: (v: number) => string;
  yFormat: (v: number) => string;
  /** Title under the x axis. */
  xTitle?: string;
  /** Title above the y axis (with its unit). */
  yTitle?: string;
}

/** Axes for two numeric scales (scatter, bubble, histogram): grid both ways, tick labels, and titles. Decorative: the data table carries the content. */
export function XYAxes({ box, width, xTicks, yTicks, x, y, xFormat, yFormat, xTitle, yTitle }: XYAxesProps) {
  const idX = useFadeId(); const idY = useFadeId();
  const relief = useRelief().appearance === "relief";
  const fadeH = relief ? { stroke: `url(#${idX})` } : undefined;
  const fadeV = relief ? { stroke: `url(#${idY})` } : undefined;
  return (
    <g className="faun-chart-axes">
      {relief ? <><FadeDefs id={idX} axis="x" from={box.left} to={width - box.right} /><FadeDefs id={idY} axis="y" from={box.top} to={box.top + box.h} /></> : null}
      {yTitle ? <text className="faun-chart-tick" x={0} y={10} textAnchor="start">{yTitle}</text> : null}
      {yTicks.map((t) => (
        <g key={`y${t}`}>
          <line className="faun-chart-grid" style={fadeH} x1={box.left} x2={width - box.right} y1={y(t)} y2={y(t)} />
          <text className="faun-chart-tick" x={box.left - 8} y={y(t)} dy="0.32em" textAnchor="end">{yFormat(t)}</text>
        </g>
      ))}
      {xTicks.map((t) => (
        <g key={`x${t}`}>
          <line className="faun-chart-grid" style={fadeV} x1={x(t)} x2={x(t)} y1={box.top} y2={box.top + box.h} />
          <text className="faun-chart-tick" x={x(t)} y={box.top + box.h + 18} textAnchor="middle">{xFormat(t)}</text>
        </g>
      ))}
      <line className="faun-chart-baseline" x1={box.left} x2={width - box.right} y1={box.top + box.h} y2={box.top + box.h} />
      <line className="faun-chart-baseline" x1={box.left} x2={box.left} y1={box.top} y2={box.top + box.h} />
      {xTitle ? <text className="faun-chart-tick" x={box.left + box.w / 2} y={box.top + box.h + 36} textAnchor="middle">{xTitle}</text> : null}
    </g>
  );
}
