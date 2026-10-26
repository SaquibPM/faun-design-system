import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx.js";

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  /** `text` lines, a `circle` (avatar), a `rect` (image, chart, card). */
  shape?: "text" | "circle" | "rect";
  /** Width as any CSS length; text defaults to 100%, the last of several lines to 60%. */
  width?: string;
  /** Height for rect/circle as any CSS length. */
  height?: string;
  /** Number of text lines. */
  lines?: number;
}

/** A placeholder shaped like the content that is loading. Prefer skeletons over spinners for page and section loads. */
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton({ shape = "text", width, height, lines = 1, className, style, ...props }, ref) {
  if (shape === "text" && lines > 1) {
    return (
      <span ref={ref} className={cx("faun-skeleton-lines", className)} aria-hidden="true" style={style} {...props}>
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className="faun-skeleton" data-shape="text" style={{ inlineSize: i === lines - 1 ? "60%" : width ?? "100%" }} />
        ))}
      </span>
    );
  }
  const s: CSSProperties = { inlineSize: width, blockSize: height, ...style };
  if (shape === "circle" && width && !height) s.blockSize = width;
  return <span ref={ref} className={cx("faun-skeleton", className)} data-shape={shape} aria-hidden="true" style={s} {...props} />;
});

export interface SkeletonRowsProps extends HTMLAttributes<HTMLDivElement> {
  /** Rows to draw. */
  rows?: number;
  /** Columns per row; the first is wider. */
  columns?: number;
  /** Accessible loading message. */
  label?: string;
}

/** Table-shaped placeholder: header plus rows, matching the density row height. */
export const SkeletonRows = forwardRef<HTMLDivElement, SkeletonRowsProps>(function SkeletonRows({ rows = 5, columns = 4, label = "Loading", className, ...props }, ref) {
  return (
    <div ref={ref} role="status" aria-label={label} className={cx("faun-skeleton-rows", className)} {...props}>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="faun-skeleton-row" style={{ gridTemplateColumns: `2fr repeat(${columns - 1}, 1fr)` }}>
          {Array.from({ length: columns }, (_, c) => <Skeleton key={c} width={c === 0 ? "70%" : `${45 + ((r * 7 + c * 13) % 40)}%`} />)}
        </div>
      ))}
    </div>
  );
});
