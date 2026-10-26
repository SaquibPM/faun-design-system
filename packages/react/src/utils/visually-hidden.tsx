import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "./cx.js";

/** Hides content visually while keeping it available to assistive technology. */
export const VisuallyHidden = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function VisuallyHidden({ className, ...props }, ref) {
  return <span ref={ref} className={cx("faun-visually-hidden", className)} {...props} />;
});
