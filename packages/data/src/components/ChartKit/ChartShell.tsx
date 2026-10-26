import { cx, EmptyState, Skeleton, useControllableState, VisuallyHidden } from "@faun-ds/react";
import { forwardRef, useId, useLayoutEffect, useRef, useState, type HTMLAttributes, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { Swatch, type MarkerShape } from "./parts.js";
import type { CssVar } from "./scale.js";
import type { ChartAppearance, ChartColor, ChartPalette } from "./types.js";
import { ReliefContext, useReliefMetrics } from "./relief.js";

/** One legend entry. `id` is what the legend toggles when `toggleSeries` is on. */
export interface ShellLegendItem {
  id: string;
  label: string;
  color: ChartColor | CssVar;
  /** How the key is drawn. Default `bar`. */
  mark?: "bar" | "line" | "dot";
  shape?: MarkerShape;
}

/** One row of the tooltip: a name, a value and an optional key. */
export interface ShellRow { name: string; value: string; color?: ChartColor | CssVar; mark?: "bar" | "line" | "dot"; shape?: MarkerShape; empty?: boolean }

/** One thing a person can step to with the keyboard or point at: a category, a point, a slice, a cell, a flow. */
export interface ShellStep {
  /** Title of the tooltip and the start of the announcement. */
  label: string;
  rows: ShellRow[];
  /** Where the tooltip anchors, relative to the plot. */
  x: number;
  /** Vertical anchor. Without it the tooltip sits at the top of the plot. */
  y?: number;
  /** Replaces the default announcement ("label: name value, …"). */
  say?: string;
}

export interface ShellTable {
  caption?: string;
  head: string[];
  rows: string[][];
  /** Rows after the body, for example target and reference lines. The first cell is the row header. */
  foot?: string[][];
}

export interface ShellDrawing {
  svg: ReactNode;
  steps: ShellStep[];
  table: ShellTable;
  /** What the steps are, for the instructions: "categories", "points", "slices". */
  noun?: string;
  /** For grids: Up and Down move by this many steps; Left and Right by one. */
  columns?: number;
  /** How the pointer picks a step when `hit` is not given. Default `xy`. */
  pointer?: "x" | "y" | "xy";
  /** Index of the step under a plot position, or -1. Overrides `pointer`. */
  hit?: (x: number, y: number) => number;
}

export interface ShellSize { width: number; height: number; active: number; isHidden: (id: string) => boolean }

export interface ChartShellProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: string;
  description?: string;
  hideTitle?: boolean;
  /** `relief` (default) or `flat`. */
  appearance?: ChartAppearance;
  /** Colour option: `default` or a pastel palette (`meadow`, `dawn`, `harbour`). */
  palette?: ChartPalette;
  /** Plot height in px. */
  height: number;
  legendItems?: ShellLegendItem[];
  /** Shows the legend. By default only when there is more than one entry. */
  legend?: boolean;
  /** Extra content after the legend, such as a colour ramp. */
  legendExtra?: ReactNode;
  loading?: boolean;
  /** True when there is nothing to draw. */
  empty?: boolean;
  /** Makes legend entries toggle buttons (`aria-pressed`). At least one always stays visible. */
  toggleSeries?: boolean;
  hiddenSeries?: string[];
  defaultHiddenSeries?: string[];
  onHiddenSeriesChange?: (hidden: string[]) => void;
  /** Draws with no heading or legend and a small plot, for inline use. */
  bare?: boolean;
  /** Replaces the plot instructions in the accessible name. */
  instructions?: string;
  layout: (size: ShellSize) => ShellDrawing;
}

const FALLBACK_WIDTH = 640;
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

function useWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(Math.round(el.getBoundingClientRect().width));
    const ro = new ResizeObserver((entries) => {
      const w = Math.round(entries[0]?.contentRect.width ?? 0);
      if (w > 0) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width || FALLBACK_WIDTH;
}

/**
 * Generic chart structure for everything that is not a plain category-by-series chart: title, legend, a one-tab-stop plot with tooltip and
 * arrow-key reading, live announcements and a visually hidden data table. A chart supplies its drawing, its steps and its table.
 */
export const ChartShell = forwardRef<HTMLElement, ChartShellProps>(function ChartShell(props, ref) {
  const {
    title, description, hideTitle, height, legendItems = [], legend, legendExtra, loading, empty, toggleSeries, hiddenSeries, defaultHiddenSeries, onHiddenSeriesChange,
    bare, instructions, layout, className, appearance = "relief", palette, ...rest
  } = props;
  const id = useId();
  const plot = useRef<HTMLDivElement>(null);
  const width = useWidth(plot);
  const [active, setActive] = useState(-1);
  const relief = useReliefMetrics(plot, appearance, width);
  const [hidden, setHidden] = useControllableState<string[]>({ value: hiddenSeries, defaultValue: defaultHiddenSeries ?? [], onChange: onHiddenSeriesChange });
  const [note, setNote] = useState("");

  const known = legendItems.filter((l) => !hidden.includes(l.id)).length;
  const hideAll = legendItems.length > 0 && known === 0;
  const isHidden = (lid: string) => legendItems.some((l) => l.id === lid) && (hideAll ? legendItems[0]!.id !== lid : hidden.includes(lid));
  const visibleCount = legendItems.filter((l) => !isHidden(l.id)).length;
  const toggle = (item: ShellLegendItem) => {
    const off = isHidden(item.id);
    if (!off && visibleCount === 1) { setNote(`${item.label} stays visible: a chart needs at least one series.`); return; }
    setHidden(off ? hidden.filter((h) => h !== item.id) : [...hidden.filter((h) => legendItems.some((l) => l.id === h)), item.id]);
    setNote(`${item.label} ${off ? "shown" : "hidden"}`);
  };

  const drawn = !loading && !empty ? layout({ width, height, active, isHidden }) : null;
  const steps = drawn?.steps ?? [];
  const last = steps.length - 1;
  const showLegend = !bare && (legend ?? legendItems.length > 1) && !empty && legendItems.length > 0;

  const locate = (x: number, y: number) => {
    if (!drawn || steps.length === 0) return -1;
    if (drawn.hit) return drawn.hit(x, y);
    const mode = drawn.pointer ?? "xy";
    let best = -1; let dist = Infinity;
    steps.forEach((s, i) => {
      const dx = s.x - x; const dy = (s.y ?? y) - y;
      const d = mode === "x" ? Math.abs(dx) : mode === "y" ? Math.abs(dy) : dx * dx + dy * dy;
      if (d < dist) { dist = d; best = i; }
    });
    return best;
  };
  const onPointer = (e: PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    setActive(locate(e.clientX - box.left, e.clientY - box.top));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (steps.length === 0) return;
    const cols = drawn?.columns;
    const move = (d: number) => clamp(active < 0 ? 0 : active + d, 0, last);
    const next = e.key === "ArrowRight" ? (active < 0 ? 0 : move(1))
      : e.key === "ArrowLeft" ? move(-1)
      : e.key === "ArrowDown" ? (active < 0 ? 0 : move(cols ?? 1))
      : e.key === "ArrowUp" ? move(cols ? -cols : -1)
      : e.key === "Home" ? 0 : e.key === "End" ? last : e.key === "Escape" ? -1 : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
  };

  const step = active >= 0 ? steps[active] : undefined;
  const announcement = step ? (step.say ?? `${step.label}: ${step.rows.map((r) => `${r.name} ${r.value}`).join(", ")}`) : note;
  const tx = step?.x ?? 0;
  const ty = step?.y;
  const nounText = drawn?.noun ?? "items";
  const label = instructions ?? `${title}. ${steps.length} ${nounText}. Use the arrow keys to read values.`;
  const table = drawn?.table;

  return (
    <figure ref={ref} className={cx("faun-chart", className)} data-bare={bare || undefined} data-appearance={appearance} data-viz-palette={palette} aria-labelledby={`${id}-title`} {...rest}>
      <figcaption className="faun-chart-head">
        <span id={`${id}-title`} className={hideTitle || bare ? "faun-visually-hidden" : "faun-chart-title"}>{title}</span>
        {description && !hideTitle && !bare ? <span className="faun-chart-description">{description}</span> : null}
      </figcaption>
      {showLegend ? (
        <ul className="faun-chart-legend" aria-label="Legend">
          {legendItems.map((item) => {
            const off = isHidden(item.id);
            const key = <><Swatch color={item.color} kind={item.mark ?? "bar"} shape={item.shape} /><span>{item.label}</span></>;
            return (
              <li key={item.id} className="faun-chart-legend-item">
                {toggleSeries ? (
                  <button type="button" className="faun-chart-legend-button" aria-pressed={!off} aria-disabled={!off && visibleCount === 1 ? true : undefined} onClick={() => toggle(item)}>{key}</button>
                ) : key}
              </li>
            );
          })}
        </ul>
      ) : null}
      {!bare && !empty && legendExtra ? legendExtra : null}
      {loading ? (
        <div className="faun-chart-state" role="status" aria-label={`Loading ${title}`} style={{ blockSize: height }}><Skeleton shape="rect" width="100%" height="100%" /></div>
      ) : empty ? (
        <div className="faun-chart-state" style={{ minBlockSize: height }}><EmptyState size="sm" kind="no-results" level={3} title="No data to chart" description="Values appear here once they are reported." /></div>
      ) : (
        <>
          <div
            ref={plot}
            className="faun-chart-plot"
            style={{ blockSize: height }}
            tabIndex={0}
            role="group"
            aria-roledescription="chart"
            aria-label={label}
            onPointerMove={onPointer}
            onPointerDown={onPointer}
            onPointerLeave={() => { if (document.activeElement !== plot.current) setActive(-1); }}
            onFocus={() => setActive((a) => (a < 0 && steps.length > 0 ? 0 : a))}
            onBlur={() => setActive(-1)}
            onKeyDown={onKeyDown}
          >
            <svg className="faun-chart-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false"><ReliefContext.Provider value={relief}>{drawn?.svg}</ReliefContext.Provider></svg>
            {step ? (
              <div
                className="faun-chart-tooltip"
                data-side={tx > width / 2 ? "left" : "right"}
                data-orient={ty !== undefined ? "horizontal" : undefined}
                style={{ insetInlineStart: clamp(tx, 0, width), ...(ty !== undefined ? { insetBlockStart: clamp(ty, 56, height - 56) } : null) }}
                aria-hidden="true"
              >
                <p className="faun-chart-tooltip-title">{step.label}</p>
                <ul>
                  {step.rows.map((r, i) => (
                    <li key={`${r.name}-${i}`}>
                      {r.color ? <Swatch color={r.color} kind={r.mark ?? "bar"} shape={r.shape} /> : null}
                      <span className="faun-chart-tooltip-name">{r.name}</span>
                      <span className="faun-chart-tooltip-value" data-empty={r.empty || undefined}>{r.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <VisuallyHidden role="status" aria-live="polite">{announcement}</VisuallyHidden>
          {table ? (
            <table className="faun-visually-hidden">
              <caption>{table.caption ?? title}</caption>
              <thead><tr>{table.head.map((h, i) => <th key={`${h}-${i}`} scope="col">{h}</th>)}</tr></thead>
              <tbody>
                {table.rows.map((row, r) => (
                  <tr key={r}>{row.map((c, i) => (i === 0 ? <th key={i} scope="row">{c}</th> : <td key={i}>{c}</td>))}</tr>
                ))}
              </tbody>
              {table.foot && table.foot.length > 0 ? (
                <tfoot>
                  {table.foot.map((row, r) => (
                    <tr key={r}>{row.map((c, i) => (i === 0 ? <th key={i} scope="row">{c}</th> : <td key={i} colSpan={i === row.length - 1 ? Math.max(1, table.head.length - i) : 1}>{c}</td>))}</tr>
                  ))}
                </tfoot>
              ) : null}
            </table>
          ) : null}
        </>
      )}
    </figure>
  );
});
