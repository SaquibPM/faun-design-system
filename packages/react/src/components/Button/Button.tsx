import { Slot, Slottable } from "@radix-ui/react-slot";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { IconCheck, IconStatusDanger } from "@faun-ds/icons";
import type { Intent, Variant } from "../../utils/types.js";
import { Spinner } from "../Spinner/Spinner.js";

/** Button sizes: xs 24, sm 28, md follows density, lg 40, xl 48 (at the default density). */
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual emphasis. `solid` for the one primary action in a view; `outline` (default) for secondary actions. */
  variant?: Variant | "link";
  /** `accent` for brand-primary, `neutral` (default) for everyday actions, `danger` for destructive ones. */
  intent?: Intent;
  /** `md` follows the density mode. */
  size?: ButtonSize;
  /** Icon before the label. Pass an icon component element, e.g. `<IconAdd />`. */
  leadingIcon?: ReactNode;
  /** Icon after the label, e.g. a chevron for menus. */
  trailingIcon?: ReactNode;
  /** Shows a spinner, keeps the width, sets `aria-busy` and blocks activation. */
  loading?: boolean;
  /**
   * Outcome of the action just taken. `success` and `error` swap the leading icon for a check or an alert and announce
   * `statusLabel` after the label for screen readers. Clear it (set to undefined) after about 1.5 seconds. For text that updates beside the button, use InlineLoading.
   */
  status?: "success" | "error";
  /** Read after the label when `status` is set, e.g. "Saved" or "Save failed". For a live announcement beside the button, use InlineLoading. */
  statusLabel?: string;
  /** Let a long label wrap onto several lines instead of truncating. The button grows taller and keeps its minimum height. */
  wrap?: boolean;
  /** Stretches to the container width. */
  fullWidth?: boolean;
  /** Renders the child element (e.g. a router link) with button styling. */
  asChild?: boolean;
}

/**
 * Triggers an action. Pair one `solid accent` button with `outline` or `ghost` buttons; never show two primaries.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "outline", intent = "neutral", size = "md", leadingIcon, trailingIcon, loading = false, status, statusLabel, wrap, fullWidth, asChild, className, children, disabled, type, onClick, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cx("faun-button", className)}
      data-variant={variant}
      data-intent={intent}
      data-size={size}
      data-loading={loading || undefined}
      data-full-width={fullWidth || undefined}
      data-wrap={wrap || undefined}
      data-status={status}
      type={asChild ? undefined : (type ?? "button")}
      disabled={asChild ? undefined : disabled}
      aria-disabled={asChild && disabled ? true : undefined}
      aria-busy={loading || undefined}
      onClick={loading ? (e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault() : onClick}
      {...props}
    >
      {status ? <span className="faun-button-icon" data-status={status} aria-hidden="true">{status === "success" ? <IconCheck /> : <IconStatusDanger />}</span> : leadingIcon ? <span className="faun-button-icon" aria-hidden="true">{leadingIcon}</span> : null}
      <Slottable>{asChild ? children : <span className="faun-button-label">{children}</span>}</Slottable>
      {trailingIcon ? <span className="faun-button-icon" aria-hidden="true">{trailingIcon}</span> : null}
      {loading ? <span className="faun-button-spinner"><Spinner size="md" label={null} /></span> : null}
      {!asChild && status && statusLabel ? <span className="faun-visually-hidden">{statusLabel}</span> : null}
    </Comp>
  );
});
