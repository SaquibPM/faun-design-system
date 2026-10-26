import { clsx } from "clsx";
import { forwardRef, type ElementType, type HTMLAttributes } from "react";

export type GridMode = "wide" | "narrow" | "condensed";
export type GridElement = "div" | "section" | "main" | "article" | "aside" | "header" | "footer" | "nav" | "ul" | "ol";

export interface GridProps extends HTMLAttributes<HTMLElement> {
  /**
   * Gutter mode. `wide` (default) uses the full gutter (16px, 24px from lg), `narrow` halves it for
   * dense pages, `condensed` uses a 1px hairline gutter so tiles read as one surface.
   */
  mode?: GridMode;
  /** Remove the page margin and maximum width. Use for a grid nested in a card, panel or Column. */
  flush?: boolean;
  /** Element to render. Use `ul` or `ol` with `Column as="li"`. Defaults to `div`. */
  as?: GridElement;
}

/**
 * Responsive page grid: 4 columns below 768px, 8 from md, 12 from lg. Place `Column`s inside.
 * Gutters, margins and the content maximum come from the `grid.*` tokens.
 */
export const Grid = forwardRef<HTMLElement, GridProps>(function Grid({ mode = "wide", flush, as = "div", className, ...rest }, ref) {
  const Tag = as as ElementType;
  return <Tag ref={ref} className={clsx("faun-grid", className)} data-mode={mode} data-flush={flush ? "" : undefined} {...rest} />;
});
