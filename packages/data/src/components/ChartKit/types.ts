import type { HTMLAttributes } from "react";

/**
 * Colour slot for a series. `cat-1` to `cat-8` are the categorical slots (assigned in order, never cycled).
 * `scope-1`, `scope-2`, `scope-3` and `scope-outside` are reserved for GHG scopes.
 */
export type ChartColor = "cat-1" | "cat-2" | "cat-3" | "cat-4" | "cat-5" | "cat-6" | "cat-7" | "cat-8" | "scope-1" | "scope-2" | "scope-3" | "scope-outside";

export interface ChartSeries {
  /** Stable id. A series with id `scope-1`, `scope-2` or `scope-3` takes the GHG scope colour automatically. */
  id: string;
  /** Name shown in the legend, tooltip and data table. */
  label: string;
  /** One value per category, in category order. `null` means no data (drawn as a gap, never as zero). */
  values: (number | null)[];
  /** Floating bars only: the lower end of each bar, one per category. The bar spans from `base` to `values`. */
  base?: (number | null)[];
  /** Overrides the colour slot. By default series take `cat-1`, `cat-2`, and so on in order. */
  color?: ChartColor;
}

/** A horizontal (or, in a horizontal bar chart, vertical) line that marks a value on the measure axis: a target, a limit or a baseline. */
export interface ChartReference {
  /** Name shown beside the line and in the data table, for example "2030 target". */
  label: string;
  /** Value on the measure axis, in the chart's unit. */
  value: number;
  /** `target` is a heavier dash for a goal you are working towards; `reference` is a quiet dotted line for a baseline or limit. Default `reference`. */
  kind?: "target" | "reference";
}

/**
 * How marks are drawn. `relief` (default) draws shallow blocks: a tinted face with a fine wave texture, a thin outline and a darker side face,
 * and gives every series its own wave so series differ without colour. `flat` draws the classic solid fills.
 * High-contrast themes, print and forced colours always draw solid fills with a distinct hatch per series instead of depth.
 */
export type ChartAppearance = "relief" | "flat";

/**
 * Data-viz colour option. `default` is Faun's saturated categorical palette. `meadow`, `dawn` and `harbour` are pastel options (ADR 0007): moss is still series 1,
 * the pastel is the face of a relief mark, and the outline, side and wave (derived from a deeper colour of the same hue) carry the 3:1 contrast. Lines, points and flat
 * marks use the deep colour. High-contrast themes and print always use the default palette.
 */
export type ChartPalette = "default" | "meadow" | "dawn" | "harbour";

/** Props every Faun chart shares. */
export interface ChartCommonProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Names the chart for everyone, including the data table fallback. Required. */
  title: string;
  /** One sentence on what the chart shows. Shown under the title. */
  description?: string;
  /** Hides the visible title (it stays available to assistive technology). Use when a surrounding card already has the heading. */
  hideTitle?: boolean;
  /** Plot height in px. The width follows the container. */
  height?: number;
  /** `relief` (default) or `flat`. See {@link ChartAppearance}. */
  appearance?: ChartAppearance;
  /** Colour option: `default`, or a pastel option `meadow`, `dawn` or `harbour` (sets `data-viz-palette` on the chart). Moss stays series 1. See {@link ChartPalette}. */
  palette?: ChartPalette;
  /** Shows the legend. By default only when there is more than one entry. */
  legend?: boolean;
  /** Shows a loading placeholder in place of the plot. */
  loading?: boolean;
  /** Turns the legend entries into toggle buttons (`aria-pressed`) that show or hide a series. At least one series always stays visible. */
  toggleSeries?: boolean;
  /** Ids of the hidden series (controlled). Pair with `onHiddenSeriesChange`. */
  hiddenSeries?: string[];
  /** Ids of the series hidden at first (uncontrolled). */
  defaultHiddenSeries?: string[];
  /** Called with the new list of hidden series ids when someone toggles a legend entry. */
  onHiddenSeriesChange?: (hidden: string[]) => void;
}

export interface ChartBaseProps extends ChartCommonProps {
  /** X-axis categories, for example years or facility names. */
  categories: string[];
  series: ChartSeries[];
  /** Unit of the values, for example "tCO₂e". Shown on the axis, in tooltips and in the data table. */
  unit?: string;
  /** Formats a value for ticks, tooltips and the data table. Default: thousands separators, up to one decimal. */
  format?: (value: number) => string;
  /** Target and reference lines on the measure axis. They extend the axis if needed and are listed, with their values, in the data table. */
  references?: ChartReference[];
}

export const MAX_SERIES = 8;
