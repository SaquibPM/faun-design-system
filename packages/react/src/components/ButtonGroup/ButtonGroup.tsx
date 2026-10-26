import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx.js";

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Accessible name for the group when its buttons need shared context, e.g. "Review actions". */
  "aria-label"?: string;
  /** `set` keeps buttons apart (default). `joined` fuses them into one control with hairline separators, for closely related choices. */
  layout?: "set" | "joined";
  /** Give every button the same width. Good for a Cancel and Save pair in a dialog footer. */
  equal?: boolean;
  /** Stack buttons vertically. Stacks automatically below 480px when `stack="narrow"`. */
  stack?: "never" | "narrow" | "always";
  /** Align the set inside its container. Default `end`, where dialog footers put it. */
  align?: "start" | "end" | "stretch";
}

/**
 * Two or three related buttons with one clear primary. Order from quiet to loud: tertiary, secondary, primary last.
 * More than three actions belong in a MenuButton or OverflowMenu.
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { layout = "set", equal, stack = "never", align = "end", className, ...props },
  ref,
) {
  return <div ref={ref} role="group" className={cx("faun-button-group", className)} data-layout={layout} data-equal={equal || undefined} data-stack={stack} data-align={align} {...props} />;
});
