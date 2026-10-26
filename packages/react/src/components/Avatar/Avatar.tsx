import * as RA from "@radix-ui/react-avatar";
import { Children, forwardRef, isValidElement, type HTMLAttributes, type ReactElement, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Person or agent name. Used for the initials fallback and the accessible name. */
  name: string;
  /** Image URL. Falls back to initials (or the agent mark) if it fails to load. */
  src?: string;
  /** xs 20 · sm 24 · md 32 (default) · lg 40 · xl 56. */
  size?: AvatarSize;
  /** `person` (circle, initials) or `agent` (rounded square with the agent mark): agents should never look like people. */
  kind?: "person" | "agent";
  /** Activity ring: `running` for an agent at work, `attention` when waiting on this person. */
  status?: "running" | "attention";
  /** Custom fallback content (e.g. an icon) instead of initials. */
  fallback?: ReactNode;
  /** Hide from assistive tech when the name is already shown next to the avatar. */
  decorative?: boolean;
}

const PALETTE = ["blue", "lagoon", "plum", "amber", "grass", "moss"] as const;
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return ((parts[0]![0] ?? "") + (parts.length > 1 ? parts[parts.length - 1]![0] ?? "" : "")).toUpperCase();
}
function hue(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length]!;
}

function AgentMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="faun-avatar-mark">
      <g fill="currentColor">
        <path d="M12 11.2C12 6.6 9.1 3 4.6 3 4.6 7.6 7.5 11.2 12 11.2Z" />
        <path d="M12.8 12C17.4 12 21 9.1 21 4.6 16.4 4.6 12.8 7.5 12.8 12Z" opacity="0.7" />
        <path d="M12 12.8C12 17.4 14.9 21 19.4 21 19.4 16.4 16.5 12.8 12 12.8Z" />
        <path d="M11.2 12C6.6 12 3 14.9 3 19.4 7.6 19.4 11.2 16.5 11.2 12Z" opacity="0.7" />
      </g>
    </svg>
  );
}

/** A person or agent, as a photo, initials or the agent mark. */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar({ name, src, size = "md", kind = "person", status, fallback, decorative, className, ...props }, ref) {
  const label = status ? `${name}, ${status === "running" ? "working" : "waiting on you"}` : name;
  return (
    <RA.Root
      ref={ref}
      className={cx("faun-avatar", className)}
      data-size={size}
      data-kind={kind}
      data-status={status}
      data-hue={kind === "agent" ? "accent" : hue(name)}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      {...props}
    >
      {src ? <RA.Image className="faun-avatar-image" src={src} alt="" /> : null}
      <RA.Fallback className="faun-avatar-fallback" delayMs={src ? 300 : 0}>
        {fallback ?? (kind === "agent" ? <AgentMark /> : <span aria-hidden="true">{initials(name)}</span>)}
      </RA.Fallback>
    </RA.Root>
  );
});

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Show at most this many avatars, then a "+N" counter. Default 4. */
  max?: number;
  size?: AvatarSize;
  /** Accessible label for the group, e.g. "Reviewers". */
  label?: string;
  children: ReactNode;
}

/** Overlapping avatars for owners, reviewers or participants. */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup({ max = 4, size = "md", label, className, children, ...props }, ref) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<AvatarProps>[];
  const shown = items.slice(0, max);
  const rest = items.length - shown.length;
  const names = items.map((i) => i.props.name).join(", ");
  return (
    <div ref={ref} role="group" aria-label={label ? `${label}: ${names}` : names} className={cx("faun-avatar-group", className)} data-size={size} {...props}>
      {shown.map((el, i) => <Avatar key={el.key ?? i} {...el.props} size={size} decorative />)}
      {rest > 0 ? <span className="faun-avatar faun-avatar-more" data-size={size} aria-hidden="true">+{rest}</span> : null}
    </div>
  );
});
