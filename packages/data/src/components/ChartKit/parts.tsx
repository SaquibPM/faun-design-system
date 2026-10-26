import { chartColorVar, type CssVar } from "./scale.js";
import type { ChartColor, ChartReference } from "./types.js";
import type { PlotBox } from "./axes.js";
import { ReliefSwatch } from "./relief.js";

export type MarkerShape = "circle" | "square" | "diamond" | "triangle";
export const SHAPES: MarkerShape[] = ["circle", "square", "diamond", "triangle"];
export const shapeOf = (index: number): MarkerShape => SHAPES[index % SHAPES.length]!;

/** A point marker. Shapes differ per series so lines never rely on colour alone. */
export function Marker({ shape, x, y, r = 4, color, className }: { shape: MarkerShape; x: number; y: number; r?: number; color: ChartColor | CssVar; className?: string }) {
  const style = { fill: chartColorVar(color) };
  if (shape === "circle") return <circle cx={x} cy={y} r={r} style={style} className={className} />;
  if (shape === "square") return <rect x={x - r} y={y - r} width={r * 2} height={r * 2} style={style} className={className} />;
  const d = shape === "diamond"
    ? `M${x} ${y - r * 1.3}L${x + r * 1.3} ${y}L${x} ${y + r * 1.3}L${x - r * 1.3} ${y}Z`
    : `M${x} ${y - r * 1.25}L${x + r * 1.2} ${y + r}L${x - r * 1.2} ${y + r}Z`;
  return <path d={d} style={style} className={className} />;
}

/** Legend and tooltip key: a bar swatch, or a short line with the series' marker. */
export function Swatch({ color, kind, shape = "circle" }: { color: ChartColor | CssVar; kind: "bar" | "line" | "dot"; shape?: MarkerShape }) {
  if (kind === "dot") return <svg className="faun-chart-swatch" data-kind="dot" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><Marker shape={shape} x={6} y={6} r={4} color={color} /></svg>;
  if (kind === "bar") return <ReliefSwatch color={color} />;
  return (
    <svg className="faun-chart-swatch" data-kind="line" viewBox="0 0 20 12" aria-hidden="true" focusable="false">
      <line x1="0" y1="6" x2="20" y2="6" style={{ stroke: chartColorVar(color) }} className="faun-chart-swatch-line" />
      <Marker shape={shape} x={10} y={6} r={3.5} color={color} />
    </svg>
  );
}

export const referenceKindLabel = (r: ChartReference) => ((r.kind ?? "reference") === "target" ? "Target" : "Reference");

/**
 * Target and reference lines. `axis="y"` draws horizontal lines (the measure runs up the page); `axis="x"` draws vertical lines (horizontal bars).
 * Decorative: the same information is in the data table.
 */
export function ReferenceLines({ refs, axis, at, box, width, format }: {
  refs: ChartReference[]; axis: "x" | "y"; at: (v: number) => number; box: PlotBox & { w: number; h: number }; width: number; format: (v: number) => string;
}) {
  // Labels of nearby lines would overlap: walking from the top, push a label down until it clears the one above.
  const labelY: number[] = [];
  if (axis === "y") {
    let prev = -Infinity;
    refs.map((r, i) => ({ i, p: at(r.value) })).sort((a, b) => a.p - b.p).forEach(({ i, p }) => { prev = Math.max(p - 5, prev + 14); labelY[i] = prev; });
  }
  return (
    <g className="faun-chart-references">
      {refs.map((r, i) => {
        const p = at(r.value);
        const text = `${r.label}: ${format(r.value)}`;
        const kind = r.kind ?? "reference";
        if (axis === "y") {
          return (
            <g key={`${r.label}-${i}`}>
              <line className="faun-chart-ref" data-kind={kind} x1={box.left} x2={width - box.right} y1={p} y2={p} />
              <text className="faun-chart-ref-label" x={width - box.right - 4} y={labelY[i]} textAnchor="end">{text}</text>
            </g>
          );
        }
        const flip = p > box.left + box.w * 0.6;
        return (
          <g key={`${r.label}-${i}`}>
            <line className="faun-chart-ref" data-kind={kind} x1={p} x2={p} y1={box.top} y2={box.top + box.h} />
            <text className="faun-chart-ref-label" x={flip ? p - 5 : p + 5} y={box.top + 12 + i * 14} textAnchor={flip ? "end" : "start"}>{text}</text>
          </g>
        );
      })}
    </g>
  );
}
