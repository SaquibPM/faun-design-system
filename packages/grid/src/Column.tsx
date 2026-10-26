import { clsx } from "clsx";
import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import { BREAKPOINTS, MAX_COLUMNS, type BreakpointKey } from "./breakpoints.js";

/** A number of columns (1 to 12) or `"full"` for the whole row. A span larger than the columns available at a breakpoint fills the row. */
export type Span = number | "full";
/** A span, or a span with an offset. */
export type ColumnSpec = Span | { span?: Span; offset?: number };
export type ColumnElement = "div" | "section" | "article" | "aside" | "li" | "header" | "footer" | "nav" | "main";

export interface ColumnProps extends HTMLAttributes<HTMLElement> {
  /** Span below `sm` (640px). Without any span a column fills the row. */
  span?: Span;
  /** Offset in columns below `sm`. Pair it with a span, or the column fills the rest of the row. */
  offset?: number;
  /** From 640px. A span, or `{ span, offset }`. Applies upward until a larger breakpoint sets its own. */
  sm?: ColumnSpec;
  /** From 768px (8 columns). */
  md?: ColumnSpec;
  /** From 1024px (12 columns). */
  lg?: ColumnSpec;
  /** From 1280px. */
  xl?: ColumnSpec;
  /** From 1536px (the 2xl breakpoint). */
  xxl?: ColumnSpec;
  /** Element to render. Use `li` inside a `Grid as="ul"`. Defaults to `div`. */
  as?: ColumnElement;
}

const COLUMN_COUNT: Record<BreakpointKey, number> = { base: 4, sm: 4, md: 8, lg: 12, xl: 12, "2xl": 12 };
const warn = (msg: string) => { if (typeof process === "undefined" || process.env?.NODE_ENV !== "production") console.warn(`@faun-ds/grid: ${msg}`); };

function validSpan(s: unknown, where: string): Span | undefined {
  if (s === undefined) return undefined;
  if (s === "full") return s;
  if (typeof s === "number" && Number.isInteger(s) && s >= 1 && s <= MAX_COLUMNS) return s;
  warn(`ignored span ${JSON.stringify(s)} at ${where}; use an integer from 1 to ${MAX_COLUMNS} or "full".`);
  return undefined;
}
function validOffset(o: unknown, where: string): number | undefined {
  if (o === undefined) return undefined;
  if (typeof o === "number" && Number.isInteger(o) && o >= 0 && o < MAX_COLUMNS) return o;
  warn(`ignored offset ${JSON.stringify(o)} at ${where}; use an integer from 0 to ${MAX_COLUMNS - 1}.`);
  return undefined;
}

/**
 * Turns Column props into `data-span-*` and `data-offset-*` attributes, one pair per breakpoint.
 * An offset with no span at or below its breakpoint also gets a span of the remaining columns, so it cannot overflow the row.
 */
export function resolveColumn(props: Partial<Pick<ColumnProps, "span" | "offset" | "sm" | "md" | "lg" | "xl" | "xxl">>): Record<string, string> {
  const spec = (b: BreakpointKey): { span?: Span; offset?: number } => {
    const raw = b === "base" ? { span: props.span, offset: props.offset } : ((props as any)[b === "2xl" ? "xxl" : b] as ColumnSpec | undefined);
    if (raw === undefined) return {};
    const o = typeof raw === "object" ? raw : { span: raw };
    return { span: validSpan(o.span, b), offset: validOffset(o.offset, b) };
  };
  const out: Record<string, string> = {};
  let spanSeen = false;
  for (const b of BREAKPOINTS) {
    const { span, offset } = spec(b);
    if (span !== undefined) { spanSeen = true; out[`data-span-${b}`] = String(span); }
    if (offset !== undefined) {
      out[`data-offset-${b}`] = String(offset);
      if (span === undefined && !spanSeen && offset > 0) out[`data-span-${b}`] = String(Math.max(1, COLUMN_COUNT[b] - offset));
    }
  }
  return out;
}

/** A column inside a `Grid`. Spans and offsets are set per breakpoint, mobile first. */
export const Column = forwardRef<HTMLElement, ColumnProps>(function Column({ span, offset, sm, md, lg, xl, xxl, as = "div", className, ...rest }, ref) {
  const Tag = as as ElementType;
  return <Tag ref={ref} className={clsx("faun-column", className)} {...resolveColumn({ span, offset, sm, md, lg, xl, xxl })} {...rest} />;
});
