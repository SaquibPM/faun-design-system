import { IconLock, IconSearch, IconStatusDanger } from "@faun-ds/icons";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * `first-use` invites the first action; `no-results` follows a search or filter; `error` explains a failure;
   * `no-permission` says who can grant access. Sets a default illustration.
   */
  kind?: "first-use" | "no-results" | "error" | "no-permission";
  title: ReactNode;
  description?: ReactNode;
  /** Icon or illustration. Defaults by `kind`. */
  icon?: ReactNode;
  /** Primary action (usually one Button). */
  action?: ReactNode;
  /** Secondary action, e.g. a link to docs. */
  secondaryAction?: ReactNode;
  /** `md` for whole pages and panels, `sm` inside cards and tables. */
  size?: "sm" | "md";
  /** Heading level for the title. Default 2. */
  level?: 2 | 3 | 4;
}

function Seeds() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="faun-empty-art">
      <rect x="6" y="14" width="52" height="40" rx="9" className="faun-empty-art-card" />
      <rect x="14" y="24" width="22" height="4" rx="2" className="faun-empty-art-line" />
      <rect x="14" y="33" width="34" height="4" rx="2" className="faun-empty-art-line" opacity="0.6" />
      <rect x="14" y="42" width="16" height="4" rx="2" className="faun-empty-art-line" opacity="0.4" />
      <g className="faun-empty-art-faun" transform="translate(40 4)">
        <path d="M10 9.4C10 5.5 7.6 2.5 3.8 2.5 3.8 6.4 6.3 9.4 10 9.4Z" />
        <path d="M10.6 10C14.5 10 17.5 7.6 17.5 3.8 13.6 3.8 10.6 6.3 10.6 10Z" opacity="0.7" />
        <path d="M10 10.6C10 14.5 12.4 17.5 16.2 17.5 16.2 13.6 13.7 10.6 10 10.6Z" />
        <path d="M9.4 10C5.5 10 2.5 12.4 2.5 16.2 6.4 16.2 9.4 13.7 9.4 10Z" opacity="0.7" />
      </g>
    </svg>
  );
}

/** What to show when there is nothing to show: explain why and offer the next step. */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState({ kind = "first-use", title, description, icon, action, secondaryAction, size = "md", level = 2, className, ...props }, ref) {
  const H = `h${level}` as "h2";
  const fallback = kind === "no-results" ? <IconSearch size="xl" /> : kind === "error" ? <IconStatusDanger size="xl" /> : kind === "no-permission" ? <IconLock size="xl" /> : <Seeds />;
  return (
    <div ref={ref} className={cx("faun-empty", className)} data-kind={kind} data-size={size} {...props}>
      <div className="faun-empty-visual" aria-hidden="true">{icon ?? fallback}</div>
      <H className="faun-empty-title">{title}</H>
      {description ? <p className="faun-empty-description">{description}</p> : null}
      {action || secondaryAction ? <div className="faun-empty-actions">{action}{secondaryAction}</div> : null}
    </div>
  );
});
