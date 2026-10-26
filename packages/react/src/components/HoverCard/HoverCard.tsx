import * as RH from "@radix-ui/react-hover-card";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cx } from "../../utils/cx.js";

export const HoverCard = RH.Root;
export const HoverCardTrigger = RH.Trigger;

export interface HoverCardContentProps extends ComponentPropsWithoutRef<typeof RH.Content> {
  /** Width: sm 240 · md 320 (default). */
  size?: "sm" | "md";
}

/**
 * A preview of the thing a link points to, shown on hover and keyboard focus of the trigger.
 * Previews are a convenience only: never put the sole route to information or any action in one.
 */
export const HoverCardContent = forwardRef<HTMLDivElement, HoverCardContentProps>(function HoverCardContent(
  { size = "md", sideOffset = 6, collisionPadding = 8, align = "start", className, children, ...props },
  ref,
) {
  return (
    <RH.Portal>
      <RH.Content ref={ref} sideOffset={sideOffset} collisionPadding={collisionPadding} align={align} className={cx("faun-hover-card", className)} data-size={size} {...props}>
        {children}
      </RH.Content>
    </RH.Portal>
  );
});
