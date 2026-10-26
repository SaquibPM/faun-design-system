import * as RT from "@radix-ui/react-tooltip";
import { forwardRef, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";

export interface TooltipProviderProps {
  children: ReactNode;
  /** Delay before the first tooltip opens, in ms. Default 400. */
  delayDuration?: number;
  /** After a tooltip closes, others open instantly for this long. Default 300. */
  skipDelayDuration?: number;
}

/** Wrap the app once. Tooltip also works without it, using the same defaults. */
export function TooltipProvider({ children, delayDuration = 400, skipDelayDuration = 300 }: TooltipProviderProps) {
  return <RT.Provider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration}>{children}</RT.Provider>;
}

export interface TooltipProps {
  /** Short supplementary text. Never put essential information or interactive content in a tooltip. */
  content: ReactNode;
  /** The element that triggers the tooltip. Must be focusable. */
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  /** Keyboard shortcut shown after the content, e.g. "⌘K". */
  shortcut?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  /** Skip the tooltip entirely (for example when the label is already visible). */
  disabled?: boolean;
}

/** Brief, non-essential hint on hover and focus. */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  { content, children, side = "top", align = "center", shortcut, open, defaultOpen, onOpenChange, delayDuration, disabled },
  ref,
) {
  if (disabled || content == null || content === "") return <>{children}</>;
  return (
    <RT.Provider delayDuration={delayDuration ?? 400}>
      <RT.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} delayDuration={delayDuration}>
        <RT.Trigger asChild>{children}</RT.Trigger>
        <RT.Portal>
          <RT.Content ref={ref} side={side} align={align} sideOffset={6} collisionPadding={8} className={cx("faun-tooltip")}>
            <span>{content}</span>
            {shortcut ? <kbd className="faun-tooltip-shortcut">{shortcut}</kbd> : null}
          </RT.Content>
        </RT.Portal>
      </RT.Root>
    </RT.Provider>
  );
});
