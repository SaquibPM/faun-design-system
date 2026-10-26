import { createContext, useContext, useEffect, useLayoutEffect, useState, type CSSProperties, type ReactNode, type RefObject, useId } from "react";
import { chartColorVar, type CssVar } from "./scale.js";
import type { ChartAppearance, ChartColor } from "./types.js";
export type { ChartAppearance };

export interface ReliefMetrics {
  appearance: ChartAppearance;
  /** Extrusion in px, read from `--faun-dataviz-relief-depth`. 0 when flat, in high-contrast themes, in print and in forced colours. */
  depth: number;
  /** Extrusion for thin marks, from `--faun-dataviz-relief-depth-sm`. */
  depthSm: number;
  /** Height of the slanted cap on the side of a bar, from `--faun-dataviz-relief-bevel`. */
  bevel: number;
}

const DEFAULTS = { depth: 6, depthSm: 3, bevel: 4 };
const flatMetrics: ReliefMetrics = { appearance: "flat", depth: 0, depthSm: 0, bevel: 0 };
export const ReliefContext = createContext<ReliefMetrics>({ appearance: "relief", ...DEFAULTS });
export const useRelief = () => useContext(ReliefContext);

/**
 * Reads the relief scalars from the plot's computed style, so density, themes, `data-appearance`, print and forced colours all
 * change the geometry through tokens and nothing is hard-coded here.
 */
export function useReliefMetrics(ref: RefObject<HTMLElement | null>, appearance: ChartAppearance, width: number): ReliefMetrics {
  const [metrics, setMetrics] = useState<ReliefMetrics>(appearance === "flat" ? flatMetrics : { appearance, ...DEFAULTS });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const bump = () => setTick((t) => t + 1);
    const queries = [window.matchMedia?.("(forced-colors: active)"), window.matchMedia?.("print")].filter(Boolean) as MediaQueryList[];
    queries.forEach((q) => q.addEventListener?.("change", bump));
    const mo = typeof MutationObserver !== "undefined" ? new MutationObserver(bump) : null;
    mo?.observe(document.documentElement, { attributes: true, attributeFilter: ["data-faun-theme", "data-appearance", "data-faun-density"] });
    return () => { queries.forEach((q) => q.removeEventListener?.("change", bump)); mo?.disconnect(); };
  }, []);
  useLayoutEffect(() => {
    const el = ref.current;
    const read = (name: string, fallback: number) => {
      if (!el || typeof getComputedStyle === "undefined") return fallback;
      const n = Number.parseFloat(getComputedStyle(el).getPropertyValue(name));
      return Number.isFinite(n) ? n : fallback;
    };
    const next: ReliefMetrics = appearance === "flat"
      ? { ...flatMetrics, appearance }
      : { appearance, depth: read("--faun-dataviz-relief-depth", DEFAULTS.depth), depthSm: read("--faun-dataviz-relief-depth-sm", DEFAULTS.depthSm), bevel: read("--faun-dataviz-relief-bevel", DEFAULTS.bevel) };
    setMetrics((m) => (m.appearance === next.appearance && m.depth === next.depth && m.depthSm === next.depthSm && m.bevel === next.bevel ? m : next));
  }, [ref, appearance, width, tick]);
  return metrics;
}

/**
 * The slot a colour belongs to: `cat-1`, `scope-2`, `seq-3`, `div-neg-1` or a status tone. A slot has derived outline, side and wave colours in the
 * tokens (`--faun-dataviz-<slot>-line`, `-shade`, `-tex`). Returns null for a colour that is not a slot.
 */
export function slotOf(color: string): string | null {
  if (!color.startsWith("var(")) return color;
  const m = color.match(/^var\(--faun-([a-z0-9-]+)\)$/);
  return m ? m[1]!.replace(/^dataviz-/, "").replace(/-solid$/, "") : null;
}

/** The wave texture each colour slot wears. Series stay separable without colour: every slot has its own direction, amplitude and frequency. */
const SLOT_WAVE: Record<string, number> = { "scope-1": 7, "scope-2": 1, "scope-3": 5, "scope-outside": 8 };
export function waveOf(color: ChartColor | CssVar | string, fallback = 2): number {
  const raw = slotOf(color);
  if (!raw) return fallback;
  if (SLOT_WAVE[raw]) return SLOT_WAVE[raw]!;
  const cat = raw.match(/^cat-(\d)$/);
  return cat ? Number(cat[1]) : fallback;
}

/** Custom properties a relief mark carries: the series colour and its wave. The face, outline and side are derived from them in CSS. */
export function reliefVars(color: ChartColor | CssVar, wave?: number): CSSProperties {
  const n = wave ?? waveOf(color);
  const c = chartColorVar(color);
  const slot = slotOf(color);
  const derived = (kind: string) => (slot ? `var(--faun-dataviz-${slot}-${kind}, ${c})` : c);
  // The pastel face of a palette (ADR 0007): a slot with `-face` tokens in scope washes the series colour with its pastel at `-face-op`; every other slot keeps the surface wash.
  const face = slot ? `var(--faun-dataviz-${slot}-face, var(--faun-dataviz-surface))` : "var(--faun-dataviz-surface)";
  const faceOp = slot ? `var(--faun-dataviz-${slot}-face-op, calc(100% - var(--faun-dataviz-relief-face-mix)))` : "calc(100% - var(--faun-dataviz-relief-face-mix))";
  return { "--_c": c, "--_face": face, "--_face-op": faceOp, "--_line": derived("line"), "--_shade": derived("shade"), "--_tex": derived("tex"), "--_wave": `var(--faun-dataviz-relief-wave-${n})`, "--_wave-size": `var(--faun-dataviz-relief-wave-${n}-size)` } as CSSProperties;
}

export type ReliefDir = "up" | "down" | "left" | "right";

interface BlockProps {
  x: number; y: number; width: number; height: number;
  color: ChartColor | CssVar;
  /** Which way the bar grows from its baseline: `up` and `down` for vertical bars, `left` and `right` for horizontal ones. */
  dir?: ReliefDir;
  /** False for an inner segment of a stack: the side face is a straight strip instead of a slanted cap. */
  cap?: boolean;
  /** Draws no side face (stack segments that touch another mark, boxes). */
  side?: boolean;
  wave?: number;
  /** Extrusion override in px. Default `--faun-dataviz-relief-depth`. */
  depth?: number;
  /** Keeps the extrusion the same however short the mark is (stack segments, so the side faces line up). */
  fixedDepth?: boolean;
  /** Uses `--faun-dataviz-relief-depth-sm`, for thin marks such as bullet bars, meters and boxes. */
  thin?: boolean;
  /** Class of the semantic rect (the one tests and tooling look for). Default `faun-chart-bar`. */
  className?: string;
  /** Extra attributes for the semantic rect. */
  rectProps?: Record<string, unknown>;
  /** Highlights the outline. */
  active?: boolean;
}

/**
 * A bar, box or segment drawn as a shallow block. The footprint (x, y, width, height) is what the mark covers on the chart: the side face
 * is drawn inside it, so labels and tooltips line up the same in relief and flat.
 */
export function ReliefBlock({ x, y, width, height, color, dir = "up", cap = true, side = true, wave, depth, fixedDepth, thin, className = "faun-chart-bar", rectProps, active }: BlockProps) {
  const m = useRelief();
  const vertical = dir === "up" || dir === "down";
  const thick = vertical ? width : height;
  const length = vertical ? height : width;
  const want = depth ?? (thin ? m.depthSm : m.depth);
  const d = side && want > 0 ? Math.max(Math.min(want, thick * 0.34, fixedDepth ? Infinity : length * 0.6), 0) : 0;
  const b = Math.min(m.bevel, d);
  const fw = vertical ? Math.max(width - d, 1) : width;
  const fh = vertical ? height : Math.max(height - d, 1);
  const fx = x; const fy = y;
  let points = "";
  if (d > 0) {
    const r = fx + fw; const bt = fy + fh;
    const bv = cap ? Math.min(b, length) : 0;
    points = dir === "up" ? `${r},${fy} ${r + d},${fy + bv} ${r + d},${bt} ${r},${bt}`
      : dir === "down" ? `${r},${fy} ${r + d},${fy} ${r + d},${bt - bv} ${r},${bt}`
      : dir === "right" ? `${r},${bt} ${r - bv},${bt + d} ${fx},${bt + d} ${fx},${bt}`
      : `${fx},${bt} ${fx + bv},${bt + d} ${r},${bt + d} ${r},${bt}`;
  }
  const geom = { x: fx, y: fy, width: fw, height: fh };
  return (
    <g className="faun-relief" data-active={active || undefined} style={reliefVars(color, wave)}>
      {d > 0 ? <polygon className="faun-relief-side" points={points} /> : null}
      <rect className={className} {...geom} style={{ fill: chartColorVar(color) }} {...rectProps} />
      <rect className="faun-relief-wash" {...geom} />
      <rect className="faun-relief-tex" {...geom} />
      <rect className="faun-relief-line" {...geom} />
    </g>
  );
}

interface FaceProps {
  tag: "rect" | "circle" | "path";
  geom: Record<string, unknown>;
  color: ChartColor | CssVar;
  /** Class of the semantic shape. */
  className: string;
  /** Extra attributes for the semantic shape (data-*, ids). */
  shapeProps?: Record<string, unknown>;
  wave?: number;
  active?: boolean;
  /** Pie and donut slices: draws the side face as a copy shifted down by 70% of `--faun-dataviz-relief-depth`. `side` draws only that copy, `front` only the face. */
  part?: "all" | "side" | "front";
  extrude?: boolean;
  /** Fill of the semantic shape, when it is not the series colour itself. */
  children?: ReactNode;
}

/** A textured, outlined tile or slice. Used for treemap tiles, circle packs, pie and donut slices, and area fills. Optionally extruded downwards. */
export function ReliefFace({ tag, geom, color, className, shapeProps, wave, active, part = "all", extrude }: FaceProps) {
  const m = useRelief();
  const T = tag as "path";
  const g = geom as { d?: string };
  const dy = extrude ? Math.round(m.depth * 0.7) : 0;
  const side = dy > 0 && part !== "front" ? <T className="faun-relief-side" {...g} transform={`translate(0 ${dy})`} /> : null;
  if (part === "side") return <g className="faun-relief" style={reliefVars(color, wave)}>{side}</g>;
  return (
    <g className="faun-relief" data-active={active || undefined} style={reliefVars(color, wave)}>
      {part === "all" ? side : null}
      <T className={className} {...g} style={{ fill: chartColorVar(color) }} {...shapeProps} />
      <T className="faun-relief-wash" {...g} />
      <T className="faun-relief-tex" {...g} />
      <T className="faun-relief-line" {...g} />
    </g>
  );
}

/** A thick arc (gauge fill) drawn as a rounded block: outline, extruded copy below, tint, wave. The semantic path keeps the series stroke. */
export function ReliefArc({ d, strokeWidth, color, stroke, className, wave }: { d: string; strokeWidth: number; color: ChartColor | CssVar; stroke: string; className: string; wave?: number }) {
  const m = useRelief();
  return (
    <g className="faun-relief" style={reliefVars(color, wave)}>
      {m.depthSm > 0 ? <path className="faun-relief-arc-side" d={d} strokeWidth={strokeWidth + 2} transform={`translate(0 ${m.depthSm})`} /> : null}
      <path className="faun-relief-arc-line" d={d} strokeWidth={strokeWidth + 2} />
      <path className={className} d={d} strokeWidth={strokeWidth} style={{ stroke }} />
      <path className="faun-relief-arc-wash" d={d} strokeWidth={strokeWidth} />
      <path className="faun-relief-arc-tex" d={d} strokeWidth={strokeWidth} />
    </g>
  );
}

/** Legend and tooltip key for bar-like marks: a tiny relief block that wears the same wave as the series. */
export function ReliefSwatch({ color, wave }: { color: ChartColor | CssVar; wave?: number }) {
  return (
    <svg className="faun-chart-swatch" data-kind="bar" viewBox="0 0 14 12" aria-hidden="true" focusable="false">
      <g className="faun-relief" style={reliefVars(color, wave)}>
        <polygon className="faun-relief-side" points="10.5,2.5 13.5,4 13.5,11.5 10.5,11.5" />
        <rect className="faun-relief-solid" x="0.5" y="0.5" width="10" height="11" style={{ fill: chartColorVar(color) }} />
        <rect className="faun-relief-wash" x="0.5" y="0.5" width="10" height="11" />
        <rect className="faun-relief-tex" x="0.5" y="0.5" width="10" height="11" />
        <rect className="faun-relief-line" x="0.5" y="0.5" width="10" height="11" />
      </g>
    </svg>
  );
}

/** Gradient that fades a hairline at both ends. `axis` is the direction the line runs. */
export function FadeDefs({ id, axis, from, to }: { id: string; axis: "x" | "y"; from: number; to: number }) {
  return (
    <defs>
      <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={axis === "x" ? from : 0} x2={axis === "x" ? to : 0} y1={axis === "y" ? from : 0} y2={axis === "y" ? to : 0}>
        <stop offset="0" style={{ stopColor: "var(--faun-dataviz-grid)", stopOpacity: 0 }} />
        <stop offset="0.14" style={{ stopColor: "var(--faun-dataviz-grid)", stopOpacity: 1 }} />
        <stop offset="0.86" style={{ stopColor: "var(--faun-dataviz-grid)", stopOpacity: 1 }} />
        <stop offset="1" style={{ stopColor: "var(--faun-dataviz-grid)", stopOpacity: 0 }} />
      </linearGradient>
    </defs>
  );
}

/** A stable id for an svg gradient (React ids contain colons, which `url(#…)` does not like). */
export function useFadeId() {
  return `faun-fade-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
}
