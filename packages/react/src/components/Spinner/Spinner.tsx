import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx.js";

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Diameter: xs 12 · sm 14 · md 16 · lg 20 · xl 24. */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Accessible label. Defaults to "Loading". Pass `label={null}` when a parent already announces
   * the busy state (for example a Button with `loading`).
   */
  label?: string | null;
}

/** An indeterminate activity indicator. Inherits colour from its parent. */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner({ size = "md", label = "Loading", className, ...props }, ref) {
  return (
    <span
      ref={ref}
      className={cx("faun-spinner", className)}
      data-size={size}
      role={label ? "status" : undefined}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.22" strokeWidth="3" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  );
});
