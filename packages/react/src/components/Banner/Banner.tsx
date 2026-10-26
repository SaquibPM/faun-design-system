import { IconClose, IconStatusAttention, IconStatusDanger, IconStatusInfo, IconStatusSuccess, IconStatusWarning } from "@faun-ds/icons";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { VisuallyHidden } from "../../utils/visually-hidden.js";
import { IconButton } from "../IconButton/IconButton.js";

export type BannerTone = "info" | "success" | "warning" | "danger" | "attention";

const TONE_LABEL: Record<BannerTone, string> = { info: "Information", success: "Success", warning: "Warning", danger: "Error", attention: "Needs your attention" };

const ICONS = { info: IconStatusInfo, success: IconStatusSuccess, warning: IconStatusWarning, danger: IconStatusDanger, attention: IconStatusAttention };

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  tone?: BannerTone;
  /** `inline` sits inside content (a form, a card, a section). `page` spans the top of a page or app. */
  variant?: "inline" | "page";
  /** Short headline. Keep it to one line. */
  title?: ReactNode;
  /** `low` (default) tints the banner and keeps default text. `high` fills it with the tone's solid colour for messages that must not be missed. The icon and the title carry the tone in both, never colour alone. */
  contrast?: "low" | "high";
  /** When it happened, e.g. "2 min ago". Shown under the text. Pass a `<time>` for machine-readable output. */
  timestamp?: ReactNode;
  /** An actionable notification: text of the single action button ("Retry import"). Pair with `onAction`. */
  actionLabel?: string;
  onAction?: () => void;
  /** Actions: links or small buttons such as "Review approvals" or "Retry". */
  actions?: ReactNode;
  /** Shows a close button and calls this when pressed. Omit for messages that must stay. */
  onDismiss?: () => void;
  /** Replace the tone icon. Pass `null` to hide it. */
  icon?: ReactNode | null;
}

/** A message about the state of a page, section or system: errors, warnings, confirmations, things waiting on you. */
export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner({ tone = "info", variant = "inline", contrast = "low", timestamp, actionLabel, onAction, title, actions, onDismiss, icon, className, children, role, ...props }, ref) {
  const Icon = ICONS[tone];
  const urgent = tone === "danger" || tone === "warning";
  return (
    <div ref={ref} role={role ?? (urgent ? "alert" : "status")} className={cx("faun-banner", className)} data-tone={tone} data-variant={variant} data-contrast={contrast} {...props}>
      {icon === null ? null : <span className="faun-banner-icon" aria-hidden="true">{icon ?? <Icon size="md" />}</span>}
      <div className="faun-banner-content">
        <VisuallyHidden>{TONE_LABEL[tone]}: </VisuallyHidden>
        {title ? <p className="faun-banner-title">{title}</p> : null}
        {children ? <div className="faun-banner-text">{children}</div> : null}
        {timestamp ? <div className="faun-banner-time">{timestamp}</div> : null}
      </div>
      {actionLabel ? <button type="button" className="faun-banner-action" onClick={onAction}>{actionLabel}</button> : null}
      {actions ? <div className="faun-banner-actions">{actions}</div> : null}
      {onDismiss ? <IconButton className="faun-banner-dismiss" size="sm" icon={<IconClose />} label="Dismiss" tooltip={false} onClick={onDismiss} /> : null}
    </div>
  );
});
