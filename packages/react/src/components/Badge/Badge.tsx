import {
  IconStatusApproved, IconStatusArchived, IconStatusAttention, IconStatusBlocked, IconStatusDanger, IconStatusDraft, IconStatusFailed,
  IconStatusInactive, IconStatusInfo, IconStatusNeutral, IconStatusPartial, IconStatusPaused, IconStatusQueued, IconStatusReview,
  IconStatusRunning, IconStatusSkipped, IconStatusSuccess, IconStatusUnknown, IconStatusVerified, IconStatusWarning, type FaunIcon,
} from "@faun-ds/icons";
import { statusOf, statusMap } from "@faun-ds/tokens";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import type { Tone } from "../../utils/types.js";

const STATUS_ICONS: Record<string, FaunIcon> = {
  "status-approved": IconStatusApproved, "status-archived": IconStatusArchived, "status-attention": IconStatusAttention,
  "status-blocked": IconStatusBlocked, "status-danger": IconStatusDanger, "status-draft": IconStatusDraft, "status-failed": IconStatusFailed,
  "status-inactive": IconStatusInactive, "status-info": IconStatusInfo, "status-neutral": IconStatusNeutral, "status-partial": IconStatusPartial,
  "status-paused": IconStatusPaused, "status-queued": IconStatusQueued, "status-review": IconStatusReview, "status-running": IconStatusRunning,
  "status-skipped": IconStatusSkipped, "status-success": IconStatusSuccess, "status-unknown": IconStatusUnknown, "status-verified": IconStatusVerified,
  "status-warning": IconStatusWarning,
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Status tone, or `accent` for brand labels. */
  tone?: Tone | "accent";
  /** `soft` (default) for most uses, `solid` for counts and high emphasis, `outline` for quiet metadata. */
  variant?: "soft" | "solid" | "outline";
  size?: "sm" | "md";
  /** Leading icon element. For status, prefer StatusBadge, which picks the icon for you. */
  icon?: ReactNode;
  /** Show a small dot instead of an icon (live indicators, legend keys). Pulses when tone is `running`. */
  dot?: boolean;
}

/** A compact label for status, categories or counts. Status must always carry a word, not just a colour. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({ tone = "neutral", variant = "soft", size = "md", icon, dot, className, children, ...props }, ref) {
  return (
    <span ref={ref} className={cx("faun-badge", className)} data-tone={tone} data-variant={variant} data-size={size} {...props}>
      {dot ? <span className="faun-badge-dot" aria-hidden="true" /> : icon ? <span className="faun-badge-icon" aria-hidden="true">{icon}</span> : null}
      {children != null ? <span className="faun-badge-label">{children}</span> : null}
    </span>
  );
});

export interface StatusBadgeProps extends Omit<BadgeProps, "tone" | "icon" | "children"> {
  /** Domain from the Faun status map: lifecycle, task, run, progress, approval, data-quality — or your own. */
  domain?: string;
  /** The state within the domain, e.g. "awaiting_approval". */
  state?: string;
  /** Override the tone (when not using domain/state). */
  tone?: Tone;
  /** Override the label. */
  label?: ReactNode;
  /** Override the icon name (any `status-*` icon). */
  icon?: string;
}

/** Status from a domain state, rendered with the right tone, icon and label from the Faun status map. */
export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(function StatusBadge({ domain, state, tone, label, icon, ...props }, ref) {
  const entry = domain && state ? statusOf(domain, state) : null;
  const t = (tone ?? entry?.tone ?? "neutral") as Tone;
  const iconName = icon ?? entry?.icon ?? (statusMap.tones as Record<string, { icon: string }>)[t]?.icon ?? "status-neutral";
  const Icon = STATUS_ICONS[iconName] ?? IconStatusUnknown;
  return (
    <Badge ref={ref} tone={t} icon={<Icon size="sm" className={t === "running" ? "faun-spin" : undefined} />} data-state={state} {...props}>
      {label ?? entry?.label ?? state}
    </Badge>
  );
});
