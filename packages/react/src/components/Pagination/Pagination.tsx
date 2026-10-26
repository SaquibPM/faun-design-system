import { IconChevronDown, IconChevronLeft, IconChevronRight } from "@faun-ds/icons";
import { forwardRef, useId, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx.js";

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  /** Current page, 1-based. */
  page: number;
  onPageChange: (page: number) => void;
  /** Total number of items. */
  total: number;
  /** Items per page. Default 25. */
  pageSize?: number;
  /** Offer a page size picker with these options, e.g. [25, 50, 100]. Requires onPageSizeChange. */
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  /** Plural noun for the summary and page size label: “rows”, “suppliers”. Default “items”. */
  itemLabel?: string;
  /** Pages shown either side of the current page. Default 1. */
  siblingCount?: number;
  /** Pages always shown at the start and end. Default 1. */
  boundaryCount?: number;
  /** Hide the “Showing 1–25 of 1,034” summary. */
  hideSummary?: boolean;
  /** compact shows “Page 3 of 42” with arrows only. Default full; compact is used automatically on narrow screens. */
  variant?: "full" | "compact";
  /** Name of the navigation landmark. Default “Pagination”. */
  "aria-label"?: string;
}

const fmt = (n: number) => n.toLocaleString("en-US");

/** Builds a list of page numbers with "gap" markers, e.g. [1, "gap", 4, 5, 6, "gap", 42]. */
export function paginationRange(page: number, pageCount: number, siblingCount = 1, boundaryCount = 1): (number | "gap")[] {
  const range = (a: number, b: number) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);
  const start = range(1, Math.min(boundaryCount, pageCount));
  const end = range(Math.max(pageCount - boundaryCount + 1, boundaryCount + 1), pageCount);
  const siblingsStart = Math.max(Math.min(page - siblingCount, pageCount - boundaryCount - siblingCount * 2 - 1), boundaryCount + 2);
  const siblingsEnd = Math.min(Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2), end.length > 0 ? (end[0] ?? pageCount) - 2 : pageCount - 1);
  return [
    ...start,
    ...(siblingsStart > boundaryCount + 2 ? (["gap"] as const) : boundaryCount + 1 < pageCount - boundaryCount ? [boundaryCount + 1] : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < pageCount - boundaryCount - 1 ? (["gap"] as const) : pageCount - boundaryCount > boundaryCount ? [pageCount - boundaryCount] : []),
    ...end,
  ];
}

/** Moves through a long list one page at a time, with an optional page size picker. */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    page,
    onPageChange,
    total,
    pageSize = 25,
    pageSizeOptions,
    onPageSizeChange,
    itemLabel = "items",
    siblingCount = 1,
    boundaryCount = 1,
    hideSummary,
    variant = "full",
    className,
    "aria-label": ariaLabel = "Pagination",
    ...props
  },
  ref,
) {
  const sizeId = useId();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(total, current * pageSize);
  const items = paginationRange(current, pageCount, siblingCount, boundaryCount);
  const go = (p: number) => { if (p >= 1 && p <= pageCount && p !== current) onPageChange(p); };

  return (
    <nav ref={ref} aria-label={ariaLabel} className={cx("faun-pagination", className)} data-variant={variant} {...props}>
      {pageSizeOptions && onPageSizeChange ? (
        <div className="faun-pagination-size">
          <label htmlFor={sizeId} className="faun-pagination-size-label">{`${itemLabel.charAt(0).toUpperCase()}${itemLabel.slice(1)} per page`}</label>
          <span className="faun-pagination-select">
            <select id={sizeId} value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
              {pageSizeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <IconChevronDown size="sm" aria-hidden="true" />
          </span>
        </div>
      ) : null}
      {hideSummary ? null : (
        <p className="faun-pagination-summary" aria-live="polite">
          {total === 0 ? `No ${itemLabel}` : <>Showing <strong>{fmt(from)}–{fmt(to)}</strong> of <strong>{fmt(total)}</strong> {itemLabel}</>}
        </p>
      )}
      <div className="faun-pagination-controls">
        <button type="button" className="faun-pagination-button" aria-label="Previous page" disabled={current <= 1} onClick={() => go(current - 1)}>
          <IconChevronLeft size="md" />
        </button>
        <ul className="faun-pagination-pages">
          {items.map((it, i) =>
            it === "gap" ? (
              <li key={`gap-${i}`} className="faun-pagination-gap" aria-hidden="true">…</li>
            ) : (
              <li key={it}>
                <button
                  type="button"
                  className="faun-pagination-button faun-pagination-page"
                  aria-label={`Page ${it}`}
                  aria-current={it === current ? "page" : undefined}
                  onClick={() => go(it)}
                >
                  {fmt(it)}
                </button>
              </li>
            ),
          )}
        </ul>
        <span className="faun-pagination-compact">Page {fmt(current)} of {fmt(pageCount)}</span>
        <button type="button" className="faun-pagination-button" aria-label="Next page" disabled={current >= pageCount} onClick={() => go(current + 1)}>
          <IconChevronRight size="md" />
        </button>
      </div>
    </nav>
  );
});
