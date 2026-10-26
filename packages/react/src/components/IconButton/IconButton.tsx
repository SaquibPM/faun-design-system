import { forwardRef, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import type { Intent } from "../../utils/types.js";
import { Button, type ButtonProps } from "../Button/Button.js";
import { Tooltip } from "../Tooltip/Tooltip.js";

export interface IconButtonProps extends Omit<ButtonProps, "leadingIcon" | "trailingIcon" | "children" | "fullWidth" | "asChild" | "wrap" | "status" | "statusLabel" | "intent"> {
  /** Icon-only buttons are never `danger`: the icon alone cannot carry the consequence. Put the destructive action in a menu or a labelled Button inside a confirmation. */
  intent?: Exclude<Intent, "danger">;
  /** The icon, e.g. `<IconClose />`. */
  icon: ReactNode;
  /** Required accessible name. Also shown as a tooltip unless `tooltip={false}`. */
  label: string;
  /** Show the label as a tooltip on hover and focus. Default true. */
  tooltip?: boolean;
  /** Keyboard shortcut shown in the tooltip. */
  shortcut?: string;
  tooltipSide?: "top" | "right" | "bottom" | "left";
}

/** A square button with only an icon. Always labelled; the label doubles as its tooltip. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, tooltip = true, shortcut, tooltipSide, variant = "ghost", className, ...props },
  ref,
) {
  const button = (
    <Button ref={ref} variant={variant} aria-label={label} className={cx("faun-icon-button", className)} {...props}>
      <span className="faun-icon-button-icon" aria-hidden="true">{icon}</span>
    </Button>
  );
  return tooltip ? <Tooltip content={label} shortcut={shortcut} side={tooltipSide}>{button}</Tooltip> : button;
});
