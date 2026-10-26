import { cx, EmptyState, Skeleton, useControllableState, VisuallyHidden } from "@faun-ds/react";
import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { Swatch, referenceKindLabel, shapeOf } from "./parts.js";
import { defaultFormat, resolveColors } from "./scale.js";
import { MAX_SERIES, type ChartBaseProps, type ChartColor } from "./types.js";
import { ReliefContext, useReliefMetrics } from "./relief.js";

/** What a chart hands back to the frame: its drawing and where categories sit, so the frame can place the tooltip and read pointers. */
export interface ChartLayout {
  svg: ReactNode;
  /** Pixel x of the centre of category `i`, relative to the plot. */
  xAt: (i: number) => number;
  /** Horizontal bars: categories run down the page. Pointer and tooltip follow `yAt`; Up and Down also move between categories. */
  orientation?: "vertical" | "horizontal";
  /** Pixel y of the centre of category `i`. Required when `orientation` is horizontal. */
  yAt?: (i: number) => number;
  /** Where the tooltip anchors for category `i`. Defaults to `{ x: xAt(i), y: 0 }`. */
  tipAt?: (i: number) => { x: number; y: number };
}

/** Per-series visibility, by index in the drawn series (hidden series are false). At least one entry is always true. */
export type SeriesVisibility = boolean[];

export interface ChartFrameProps extends ChartBaseProps {
  /** How the chart draws marks, for the legend and tooltip keys. */
  kind: "bar" | "line" | "dot";
  /** Adds a total row to the tooltip and a total column to the data table (stacked charts). */
  showTotal?: boolean;
  /** Replaces the text of one value in the tooltip, announcement and data table (for example a floating range). Return null to use the default. */
  describe?: (seriesIndex: number, categoryIndex: number) => string | null;
  /** Extra content after the legend, such as a colour key for sign-coloured bars. */
  legendExtra?: ReactNode;
  /** Draws the chart at the measured width. `active` is the highlighted category index or -1. */
  layout: (size: { width: number; height: number; active: number; visible: SeriesVisibility }) => ChartLayout;
}

const FALLBACK_WIDTH = 640;

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

/** Shared structure of every Faun chart: title, legend, plot with tooltip, keyboard reading, live announcements and a data table fallback. */
export const ChartFrame = forwardRef<HTMLElement, ChartFrameProps>(function ChartFrame(props, ref) {
  const {
    title, description, hideTitle, categories, series: allSeries, unit, format = defaultFormat, height = 280, legend, loading, kind, appearance = "relief", palette, showTotal, layout, references = [], describe, legendExtra, toggleSeries, hiddenSeries, defaultHiddenSeries, onHiddenSeriesChange,
    className, ...rest
  } = props;
  const id = useId();
  const plot = useRef<HTMLDivElement>(null);
  const width = useWidth(plot);
  const [active, setActive] = useState(-1);
  const relief = useReliefMetrics(plot, appearance, width);
  const series = allSeries.slice(0, MAX_SERIES);
  useEffect(() => {
    if (allSeries.length > MAX_SERIES && typeof console !== "undefined") console.warn(`Faun chart "${title}": only ${MAX_SERIES} series are drawn; group the rest as "Other".`);
  }, [allSeries.length, title]);
  const colors = resolveColors(series);
  const empty = categories.length === 0 || series.length === 0;
  const [hidden, setHidden] = useControllableState<string[]>({ value: hiddenSeries, defaultValue: defaultHiddenSeries ?? [], onChange: onHiddenSeriesChange });
  const [note, setNote] = useState("");
  let visible: SeriesVisibility = series.map((s) => !hidden.includes(s.id));
  if (visible.length > 0 && !visible.some(Boolean)) visible = visible.map((_, k) => k === 0);
  const shown = series.filter((_, k) => visible[k]);
  const shownCount = shown.length;
  const toggle = (k: number) => {
    const s = series[k]!;
    if (visible[k] && shownCount === 1) { setNote(`${s.label} stays visible: a chart needs at least one series.`); return; }
    const next = visible[k] ? [...hidden.filter((h) => series.some((x) => x.id === h)), s.id] : hidden.filter((h) => h !== s.id);
    setHidden(next);
    setNote(`${s.label} ${visible[k] ? "hidden" : "shown"}`);
  };
  const drawn = !loading && !empty ? layout({ width, height, active, visible }) : null;
  const horizontal = drawn?.orientation === "horizontal";
  const withUnit = (v: number) => (unit ? `${format(v)} ${unit}` : format(v));
  const cell = (v: number | null | undefined) => (v === null || v === undefined ? "No data" : withUnit(v));
  const cellAt = (k: number, i: number) => describe?.(k, i) ?? cell(series[k]!.values[i]);
  const total = (i: number) => shown.reduce((n, s) => n + (s.values[i] ?? 0), 0);
  const showLegend = legend ?? series.length > 1;

  const nearest = useCallback((x: number) => {
    if (!drawn) return -1;
    let best = -1; let dist = Infinity;
    for (let i = 0; i < categories.length; i++) { const d = Math.abs((horizontal ? drawn.yAt!(i) : drawn.xAt(i)) - x); if (d < dist) { dist = d; best = i; } }
    return best;
  }, [drawn, categories.length, horizontal]);

  const onPointer = (e: PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    setActive(nearest(horizontal ? e.clientY - box.top : e.clientX - box.left));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = categories.length - 1;
    const fwd = e.key === "ArrowRight" || (horizontal && e.key === "ArrowDown");
    const back = e.key === "ArrowLeft" || (horizontal && e.key === "ArrowUp");
    const next = fwd ? Math.min(active + 1, last) : back ? Math.max(active < 0 ? 0 : active - 1, 0)
      : e.key === "Home" ? 0 : e.key === "End" ? last : e.key === "Escape" ? -1 : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
  };

  const rows = active >= 0 ? series.flatMap((s, k) => (visible[k] ? [{ s, k }] : [])).map(({ s, k }) => ({ s, k, v: s.values[active] ?? null, text: cellAt(k, active) })) : [];
  const announcement = active < 0
    ? note
    : `${categories[active]}: ${rows.map((r) => `${r.s.label} ${r.text}`).join(", ")}${showTotal ? `, total ${withUnit(total(active))}` : ""}`;
  const tip = active >= 0 && drawn ? (drawn.tipAt ? drawn.tipAt(active) : { x: drawn.xAt(active), y: 0 }) : { x: 0, y: 0 };
  const tipX = tip.x;
  const arrows = horizontal ? "up and down" : "left and right";

  return (
    <figure ref={ref} className={cx("faun-chart", className)} data-appearance={appearance} data-viz-palette={palette} aria-labelledby={`${id}-title`} {...rest}>
      <figcaption className="faun-chart-head">
        <span id={`${id}-title`} className={hideTitle ? "faun-visually-hidden" : "faun-chart-title"}>{title}</span>
        {description && !hideTitle ? <span className="faun-chart-description">{description}</span> : null}
      </figcaption>
      {showLegend && !empty ? (
        <ul className="faun-chart-legend" aria-label="Legend">
          {series.map((s, k) => {
            const key = <><Swatch color={colors[k]!} kind={kind} shape={shapeOf(k)} /><span>{s.label}</span></>;
            return (
              <li key={s.id} className="faun-chart-legend-item">
                {toggleSeries ? (
                  <button type="button" className="faun-chart-legend-button" aria-pressed={visible[k]} aria-disabled={visible[k] && shownCount === 1 ? true : undefined} onClick={() => toggle(k)}>{key}</button>
                ) : key}
              </li>
            );
          })}
        </ul>
      ) : null}
      {legendExtra && !empty ? legendExtra : null}
      {loading ? (
        <div className="faun-chart-state" role="status" aria-label={`Loading ${title}`} style={{ blockSize: height }}><Skeleton shape="rect" width="100%" height="100%" /></div>
      ) : empty ? (
        <div className="faun-chart-state" style={{ minBlockSize: height }}><EmptyState size="sm" kind="no-results" level={3} title="No data to chart" description="Values appear here once they are reported." /></div>
      ) : (
        <>
          {/* The plot is one tab stop: arrow keys read category by category. The svg is decorative; the table below carries the data. */}
          <div
            ref={plot}
            className="faun-chart-plot"
            style={{ blockSize: height }}
            tabIndex={0}
            role="group"
            aria-roledescription="chart"
            aria-label={`${title}. ${categories.length} categories. Use the ${arrows} arrow keys to read values.`}
            onPointerMove={onPointer}
            onPointerDown={onPointer}
            onPointerLeave={() => { if (document.activeElement !== plot.current) setActive(-1); }}
            onFocus={() => setActive((a) => (a < 0 ? 0 : a))}
            onBlur={() => setActive(-1)}
            onKeyDown={onKeyDown}
          >
            <svg className="faun-chart-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false"><ReliefContext.Provider value={relief}>{drawn?.svg}</ReliefContext.Provider></svg>
            {active >= 0 ? (
              <div className="faun-chart-tooltip" data-side={tipX > width / 2 ? "left" : "right"} data-orient={horizontal ? "horizontal" : undefined} style={{ insetInlineStart: tipX, ...(tip.y ? { insetBlockStart: tip.y } : null) }} aria-hidden="true">
                <p className="faun-chart-tooltip-title">{categories[active]}</p>
                <ul>
                  {rows.map((r) => (
                    <li key={r.s.id}>
                      <Swatch color={colors[r.k]!} kind={kind} shape={shapeOf(r.k)} />
                      <span className="faun-chart-tooltip-name">{r.s.label}</span>
                      <span className="faun-chart-tooltip-value" data-empty={r.v === null || undefined}>{r.text}</span>
                    </li>
                  ))}
                  {showTotal ? <li data-total=""><span className="faun-chart-tooltip-name">Total</span><span className="faun-chart-tooltip-value">{withUnit(total(active))}</span></li> : null}
                </ul>
              </div>
            ) : null}
          </div>
          <VisuallyHidden role="status" aria-live="polite">{announcement}</VisuallyHidden>
          <table className="faun-visually-hidden">
            <caption>{unit ? `${title} (${unit})` : title}</caption>
            <thead>
              <tr>
                <th scope="col">Category</th>
                {shown.map((s) => <th key={s.id} scope="col">{s.label}</th>)}
                {showTotal ? <th scope="col">Total</th> : null}
              </tr>
            </thead>
            <tbody>
              {categories.map((c, i) => (
                <tr key={`${c}-${i}`}>
                  <th scope="row">{c}</th>
                  {series.map((s, k) => (visible[k] ? <td key={s.id}>{cellAt(k, i)}</td> : null))}
                  {showTotal ? <td>{withUnit(total(i))}</td> : null}
                </tr>
              ))}
            </tbody>
            {references.length > 0 ? (
              <tfoot>
                {references.map((r, i) => (
                  <tr key={`${r.label}-${i}`}>
                    <th scope="row">{referenceKindLabel(r)}: {r.label}</th>
                    <td colSpan={shown.length + (showTotal ? 1 : 0)}>{withUnit(r.value)}</td>
                  </tr>
                ))}
              </tfoot>
            ) : null}
          </table>
        </>
      )}
    </figure>
  );
});

export type { ChartColor };
