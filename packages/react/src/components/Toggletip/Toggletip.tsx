import { IconHelp, IconStatusInfo } from "@faun-ds/icons";
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Popover, PopoverBody, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger } from "../Popover/Popover.js";

export interface ToggletipProps {
  /** Accessible name of the trigger button, e.g. "About the confidence score". Default "More information". */
  label?: string;
  /** Optional heading inside the panel. */
  title?: ReactNode;
  /** The explanation. Short text, a link or a small list. */
  children: ReactNode;
  /** Actions or links shown at the foot of the panel, e.g. a "Read the method" link. */
  actions?: ReactNode;
  /** Trigger icon. Default is the information icon; use `help` for a question mark. */
  icon?: "info" | "help" | ReactNode;
  side?: ComponentPropsWithoutRef<typeof PopoverContent>["side"];
  align?: ComponentPropsWithoutRef<typeof PopoverContent>["align"];
  /** Panel width. Default `sm` (240). */
  size?: "sm" | "md" | "lg" | "auto";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/**
 * A small information button that opens a panel on press (Enter, Space or click). Unlike a Tooltip the panel stays open
 * until it is dismissed, so it can hold a link or an action and is reachable on touch. Escape closes it and returns focus.
 */
export const Toggletip = forwardRef<HTMLButtonElement, ToggletipProps>(function Toggletip(
  { label = "More information", title, children, actions, icon = "info", side = "top", align = "center", size = "sm", open, defaultOpen, onOpenChange, className },
  ref,
) {
  const glyph = icon === "info" ? <IconStatusInfo /> : icon === "help" ? <IconHelp /> : icon;
  return (
    <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <IconButton ref={ref} className={cx("faun-toggletip-trigger", className)} size="xs" icon={glyph} label={label} tooltip={false} />
      </PopoverTrigger>
      <PopoverContent className="faun-toggletip" side={side} align={align} size={size} arrow aria-label={label}>
        {title ? <PopoverHeader title={title} /> : null}
        <PopoverBody>{children}</PopoverBody>
        {actions ? <PopoverFooter className="faun-toggletip-actions">{actions}</PopoverFooter> : null}
      </PopoverContent>
    </Popover>
  );
});
