import { IconBell, IconClose, IconStatusAttention, IconStatusDanger, IconStatusInfo, IconStatusSuccess, IconStatusWarning } from "@faun-ds/icons";
import { forwardRef, useId, useMemo, type ComponentProps, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { VisuallyHidden } from "../../utils/visually-hidden.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover/Popover.js";

export type NotificationTone = "info" | "success" | "warning" | "danger" | "attention";

const ICONS = { info: IconStatusInfo, success: IconStatusSuccess, warning: IconStatusWarning, danger: IconStatusDanger, attention: IconStatusAttention };
const TONE_LABEL: Record<NotificationTone, string> = { info: "Information", success: "Success", warning: "Warning", danger: "Error", attention: "Needs your attention" };

export interface NotificationData {
  id: string;
  tone?: NotificationTone;
  title: ReactNode;
  description?: ReactNode;
  /** When it happened, in words: "2 min ago", "Yesterday, 16:20". */
  time?: ReactNode;
  /** Where it came from: an agent, a filing, a system. Shown before the time. */
  source?: ReactNode;
  /** Unread notifications get a dot and a bold title. */
  unread?: boolean;
  /** Group heading the item belongs to, such as "Today" or "Earlier". Items with the same group are listed together in the order given. */
  group?: string;
  /** Destination when the notification itself is a link. */
  href?: string;
  /** Text of the single action, such as "Review approval". */
  actionLabel?: string;
}

export interface NotificationItemProps extends Omit<HTMLAttributes<HTMLLIElement>, "title" | "onSelect"> {
  notification: NotificationData;
  onAction?: (n: NotificationData) => void;
  /** Called when the person marks the notification read or unread. */
  onToggleRead?: (n: NotificationData) => void;
  onDismiss?: (n: NotificationData) => void;
}

/** One notification: tone icon, title, text, source and time, an unread marker and up to one action. */
export const NotificationItem = forwardRef<HTMLLIElement, NotificationItemProps>(function NotificationItem({ notification: n, onAction, onToggleRead, onDismiss, className, ...props }, ref) {
  const tone = n.tone ?? "info";
  const Icon = ICONS[tone];
  const titleId = useId();
  return (
    <li ref={ref} className={cx("faun-notification", className)} data-tone={tone} data-unread={n.unread ? "" : undefined} aria-labelledby={titleId} {...props}>
      <span className="faun-notification-icon" aria-hidden="true"><Icon size="md" /></span>
      <div className="faun-notification-body">
        <p className="faun-notification-title" id={titleId}>
          <VisuallyHidden>{TONE_LABEL[tone]}{n.unread ? ", unread" : ""}: </VisuallyHidden>
          {n.href ? <a href={n.href} className="faun-notification-link">{n.title}</a> : n.title}
        </p>
        {n.description ? <p className="faun-notification-text">{n.description}</p> : null}
        {n.source || n.time ? (
          <p className="faun-notification-meta">
            {n.source ? <span>{n.source}</span> : null}
            {n.source && n.time ? <span aria-hidden="true">·</span> : null}
            {n.time ? <span>{n.time}</span> : null}
          </p>
        ) : null}
        {n.actionLabel || onToggleRead ? (
          <div className="faun-notification-actions">
            {n.actionLabel ? <Button size="xs" variant="outline" onClick={() => onAction?.(n)}>{n.actionLabel}</Button> : null}
            {onToggleRead ? <Button size="xs" variant="ghost" onClick={() => onToggleRead(n)}>{n.unread ? "Mark as read" : "Mark as unread"}</Button> : null}
          </div>
        ) : null}
      </div>
      {n.unread ? <span className="faun-notification-dot" aria-hidden="true" /> : null}
      {onDismiss ? <IconButton className="faun-notification-dismiss" size="xs" icon={<IconClose />} label={`Dismiss`} tooltip={false} onClick={() => onDismiss(n)} /> : null}
    </li>
  );
});

export interface NotificationListProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  items: NotificationData[];
  onAction?: (n: NotificationData) => void;
  onToggleRead?: (n: NotificationData) => void;
  onDismiss?: (n: NotificationData) => void;
  /** Shown when there is nothing. Default "You are all caught up." */
  empty?: ReactNode;
  /** Heading level of the group headings. Default 3. */
  headingLevel?: 2 | 3 | 4;
}

/** The notification centre list: notifications grouped by time or source, newest first, with read state. Works on a page or inside the panel. */
export const NotificationList = forwardRef<HTMLDivElement, NotificationListProps>(function NotificationList({ items, onAction, onToggleRead, onDismiss, empty = "You are all caught up.", headingLevel = 3, className, ...props }, ref) {
  const groups = useMemo(() => {
    const out: { name: string; items: NotificationData[] }[] = [];
    for (const n of items) {
      const name = n.group ?? "";
      const g = out.find((x) => x.name === name);
      if (g) g.items.push(n); else out.push({ name, items: [n] });
    }
    return out;
  }, [items]);
  const H = `h${headingLevel}` as "h3";
  if (items.length === 0) return <div ref={ref} className={cx("faun-notification-list", className)} {...props}><p className="faun-notification-empty">{empty}</p></div>;
  return (
    <div ref={ref} className={cx("faun-notification-list", className)} {...props}>
      {groups.map((g) => (
        <section key={g.name || "all"} className="faun-notification-group" aria-label={g.name || "Notifications"}>
          {g.name ? <H className="faun-notification-group-title">{g.name}</H> : null}
          <ul className="faun-notification-items">
            {g.items.map((n) => <NotificationItem key={n.id} notification={n} onAction={onAction} onToggleRead={onToggleRead} onDismiss={onDismiss} />)}
          </ul>
        </section>
      ))}
    </div>
  );
});

export type NotificationBellProps = {
  /** Number of unread notifications. Zero hides the badge. */
  unread?: number;
  /** Button label before the count. Default "Notifications". */
  label?: string;
} & Omit<ComponentProps<typeof IconButton>, "icon" | "label">;

/** The bell button with an unread badge. The badge is a count, and the button's name includes it ("Notifications, 3 unread"). */
export const NotificationBell = forwardRef<HTMLButtonElement, NotificationBellProps>(function NotificationBell({ unread = 0, label = "Notifications", className, ...props }, ref) {
  return (
    <span className={cx("faun-notification-bell", className)}>
      <IconButton ref={ref} icon={<IconBell />} label={unread > 0 ? `${label}, ${unread} unread` : label} tooltipSide="bottom" {...props} />
      {unread > 0 ? <span className="faun-notification-bell-badge" aria-hidden="true">{unread > 9 ? "9+" : unread}</span> : null}
    </span>
  );
});

export interface NotificationPanelProps {
  items: NotificationData[];
  onAction?: (n: NotificationData) => void;
  onToggleRead?: (n: NotificationData) => void;
  onDismiss?: (n: NotificationData) => void;
  onMarkAllRead?: () => void;
  /** Link to notification settings, shown in the footer. */
  preferencesHref?: string;
  /** Link to the full notification centre page, shown in the footer. */
  centreHref?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Where the panel opens from the bell. Default end-aligned below. */
  align?: "start" | "center" | "end";
  /** Replace the default bell trigger. Must be a single focusable element. */
  trigger?: ReactNode;
}

/**
 * The notification centre in a popover: a bell with an unread badge, a list grouped by time with read state,
 * "Mark all as read" and a link to preferences. Toasts announce events as they happen; this is where they are kept.
 */
export function NotificationPanel({ items, onAction, onToggleRead, onDismiss, onMarkAllRead, preferencesHref, centreHref, open, defaultOpen, onOpenChange, align = "end", trigger }: NotificationPanelProps) {
  const unread = items.filter((n) => n.unread).length;
  return (
    <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger ?? <NotificationBell unread={unread} />}</PopoverTrigger>
      <PopoverContent className="faun-notification-panel" align={align} size="lg" flush aria-label="Notifications">
        <header className="faun-notification-panel-head">
          <h2 className="faun-notification-panel-title">Notifications{unread > 0 ? <span className="faun-notification-panel-count">{unread} unread</span> : null}</h2>
          {onMarkAllRead ? <Button size="xs" variant="ghost" disabled={unread === 0} onClick={onMarkAllRead}>Mark all as read</Button> : null}
        </header>
        <div className="faun-notification-panel-scroll">
          <NotificationList items={items} onAction={onAction} onToggleRead={onToggleRead} onDismiss={onDismiss} />
        </div>
        {preferencesHref || centreHref ? (
          <footer className="faun-notification-panel-foot">
            {centreHref ? <a href={centreHref} className="faun-notification-foot-link">View all notifications</a> : <span />}
            {preferencesHref ? <a href={preferencesHref} className="faun-notification-foot-link">Notification preferences</a> : null}
          </footer>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
