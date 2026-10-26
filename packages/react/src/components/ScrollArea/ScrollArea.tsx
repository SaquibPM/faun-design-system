import * as RSA from "@radix-ui/react-scroll-area";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cx } from "../../utils/cx.js";

export interface ScrollAreaProps extends ComponentPropsWithoutRef<typeof RSA.Root> {
  /** Which scrollbars to show. Default vertical. */
  orientation?: "vertical" | "horizontal" | "both";
  /** Max height as a CSS length (otherwise size the root yourself). */
  maxHeight?: string;
  /** Accessible name when the region holds meaningful content, e.g. "Run log". Makes the viewport focusable. */
  label?: string;
}

/** A scroll container with slim, themed scrollbars that stays keyboard-scrollable. */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea({ orientation = "vertical", maxHeight, label, className, children, style, type = "hover", ...props }, ref) {
  return (
    <RSA.Root ref={ref} type={type} className={cx("faun-scroll-area", className)} style={maxHeight ? { ...style, maxBlockSize: maxHeight } : style} {...props}>
      <RSA.Viewport className="faun-scroll-viewport" tabIndex={label ? 0 : undefined} role={label ? "region" : undefined} aria-label={label} style={maxHeight ? { maxBlockSize: maxHeight } : undefined}>
        {children}
      </RSA.Viewport>
      {orientation !== "horizontal" ? <RSA.Scrollbar className="faun-scrollbar" orientation="vertical"><RSA.Thumb className="faun-scroll-thumb" /></RSA.Scrollbar> : null}
      {orientation !== "vertical" ? <RSA.Scrollbar className="faun-scrollbar" orientation="horizontal"><RSA.Thumb className="faun-scroll-thumb" /></RSA.Scrollbar> : null}
      <RSA.Corner />
    </RSA.Root>
  );
});
