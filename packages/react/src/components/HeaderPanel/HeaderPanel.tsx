import * as RD from "@radix-ui/react-dialog";
import { IconClose } from "@faun-ds/icons";
import { createContext, forwardRef, useCallback, useContext, useMemo, useRef, useState, type HTMLAttributes, type MutableRefObject, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { VisuallyHidden } from "../../utils/visually-hidden.js";
import { IconButton } from "../IconButton/IconButton.js";

/* ------------------------------------------------------------ group: one panel open at a time */

interface GroupValue {
  openId: string | null;
  open: (id: string) => void;
  /** Closes `id` only if it is still the open one, so a late "outside press" from a panel that was already replaced cannot close its successor. */
  close: (id: string) => void;
}
const GroupContext = createContext<GroupValue | null>(null);

export interface HeaderActionsProps extends HTMLAttributes<HTMLDivElement> {
  /** Id of the panel that is open, when controlled. */
  openId?: string | null;
  onOpenIdChange?: (id: string | null) => void;
}

/**
 * The global actions at the far end of the header: notifications, help, product switcher, account. It makes sure that only
 * one header panel is open at a time, and gives the actions a toolbar-like row. Place it in `TopBar actions`.
 */
export const HeaderActions = forwardRef<HTMLDivElement, HeaderActionsProps>(function HeaderActions({ openId, onOpenIdChange, className, children, ...props }, ref) {
  const [inner, setInner] = useState<string | null>(null);
  const current = openId === undefined ? inner : openId;
  const latest = useRef<string | null>(current);
  latest.current = current;
  const value = useMemo<GroupValue>(() => {
    const set = (id: string | null) => { latest.current = id; if (openId === undefined) setInner(id); onOpenIdChange?.(id); };
    return { openId: current, open: (id) => set(id), close: (id) => { if (latest.current === id) set(null); } };
  }, [current, openId, onOpenIdChange]);
  return (
    <GroupContext.Provider value={value}>
      <div ref={ref} role="group" aria-label="Global actions" className={cx("faun-header-actions", className)} {...props}>{children}</div>
    </GroupContext.Provider>
  );
});

/* ----------------------------------------------------------------------------- panel context */

const PanelContext = createContext<{ close: () => void } | null>(null);
/** Close the header panel it is used in, e.g. from a custom item. */
export function useHeaderPanel() {
  return useContext(PanelContext);
}

/* ----------------------------------------------------------------------------- action */

export interface HeaderActionProps {
  /** Unique within the HeaderActions group. */
  id: string;
  /** Required accessible name, also the tooltip: "Notifications", "Switch product". */
  label: string;
  icon: ReactNode;
  /** An unread or pending count shown as a badge on the icon; `true` shows a dot. The button name includes it. */
  badge?: number | boolean;
  /** Called when there is no panel. */
  onClick?: () => void;
  /** A `<HeaderPanel>`. Without it the action is a plain icon button. */
  children?: ReactNode;
}

/**
 * An icon in the header. With a `HeaderPanel` as its child it toggles that panel: the trigger is outlined while the panel is open,
 * pressing it again closes the panel, and opening another action's panel closes this one.
 */
export const HeaderAction = forwardRef<HTMLButtonElement, HeaderActionProps>(function HeaderAction({ id, label, icon, badge, onClick, children }, ref) {
  const group = useContext(GroupContext);
  const [localOpen, setLocalOpen] = useState(false);
  const open = group ? group.openId === id : localOpen;
  const setOpen = useCallback((v: boolean) => {
    if (group) { if (v) group.open(id); else group.close(id); } else setLocalOpen(v);
  }, [group, id]);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const count = typeof badge === "number" && badge > 0 ? badge : undefined;
  const dot = badge === true;
  const name = count !== undefined ? `${label}, ${count} new` : dot ? `${label}, new` : label;
  const iconButton = (
    <IconButton
      ref={(el) => { triggerRef.current = el; if (typeof ref === "function") ref(el); else if (ref) ref.current = el; }}
      icon={icon}
      label={name}
      tooltipSide="bottom"
      data-open={open ? "" : undefined}
      onClick={children ? undefined : onClick}
    />
  );
  const face = (
    <span className="faun-header-action-face">
      {children ? <RD.Trigger asChild>{iconButton}</RD.Trigger> : iconButton}
      {count !== undefined || dot ? <span className="faun-header-action-badge" data-dot={dot ? "" : undefined} aria-hidden="true">{count !== undefined ? (count > 9 ? "9+" : count) : null}</span> : null}
    </span>
  );
  if (!children) return <span className="faun-header-action">{face}</span>;
  return (
    <RD.Root modal={false} open={open} onOpenChange={setOpen}>
      <span className="faun-header-action">
        {face}
        <PanelContext.Provider value={{ close: () => setOpen(false) }}>
          <TriggerRefContext.Provider value={triggerRef}>{children}</TriggerRefContext.Provider>
        </PanelContext.Provider>
      </span>
    </RD.Root>
  );
});

const TriggerRefContext = createContext<MutableRefObject<HTMLButtonElement | null> | null>(null);

/* ----------------------------------------------------------------------------- panel */

export interface HeaderPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  onCloseAutoFocus?: (event: Event) => void;
  /** Required: the panel's heading and accessible name. */
  title: ReactNode;
  /** `sm` 320 · `md` 400 (default). Panels are full width below 768px. */
  size?: "sm" | "md";
  /** Hide the visible heading but keep it for assistive technology. */
  hideTitle?: boolean;
  /** Content for the foot of the panel, such as a link to settings. */
  footer?: ReactNode;
  /** Close when an element with a link (`a[href]`) inside the panel is chosen. Default true. */
  closeOnSelect?: boolean;
}

/**
 * A panel under the header at the right edge, opened from a HeaderAction. Non-modal: the page stays usable behind it.
 * Closes with Escape, with a press outside, with its close button, with the trigger, or when a link in it is chosen.
 */
export const HeaderPanel = forwardRef<HTMLDivElement, HeaderPanelProps>(function HeaderPanel({ title, size = "md", hideTitle, footer, closeOnSelect = true, className, children, onClick, onCloseAutoFocus, ...props }, ref) {
  const triggerRef = useContext(TriggerRefContext);
  const panel = useContext(PanelContext);
  const group = useContext(GroupContext);
  return (
    <RD.Content
      ref={ref}
      className={cx("faun-header-panel", className)}
      data-size={size}
      aria-describedby={undefined}
      onCloseAutoFocus={(e) => {
        onCloseAutoFocus?.(e);
        // Another header panel took over: do not pull focus back to this trigger, which would dismiss the new panel.
        if (group?.openId) e.preventDefault();
      }}
      onInteractOutside={(e) => {
        // A press on the trigger toggles the panel; do not close it here as well, or it would reopen.
        if (triggerRef?.current && e.target instanceof Node && triggerRef.current.contains(e.target)) e.preventDefault();
      }}
      onClick={(e) => {
        onClick?.(e);
        if (closeOnSelect && !e.defaultPrevented && (e.target as HTMLElement).closest?.("a[href]")) panel?.close();
      }}
      {...props}
    >
      <header className="faun-header-panel-head">
        {hideTitle ? <VisuallyHidden><RD.Title>{title}</RD.Title></VisuallyHidden> : <RD.Title className="faun-header-panel-title">{title}</RD.Title>}
        <RD.Close asChild>
          <IconButton className="faun-header-panel-close" size="sm" icon={<IconClose />} label="Close panel" tooltip={false} />
        </RD.Close>
      </header>
      <div className="faun-header-panel-body">{children}</div>
      {footer ? <footer className="faun-header-panel-foot">{footer}</footer> : null}
    </RD.Content>
  );
});

/* ----------------------------------------------------------------------------- switcher */

export interface SwitcherLink {
  label: string;
  href: string;
  /** Short line under the name, e.g. what the product is for. */
  description?: string;
  /** The product or workspace the person is in now. */
  current?: boolean;
  icon?: ReactNode;
}

export interface SwitcherSection {
  /** Heading: "Recent", "Frequent", "All products". */
  title: string;
  items: SwitcherLink[];
}

export interface SwitcherPanelProps extends HTMLAttributes<HTMLElement> {
  sections: SwitcherSection[];
  /** Accessible name of the navigation. Default "Products". */
  label?: string;
}

/**
 * The content of a product or workspace switcher: sections (recent, frequent, all) of links separated by dividers.
 * The current one is marked. Place it inside a HeaderPanel, opened from the action at the far right of the header.
 */
export const SwitcherPanel = forwardRef<HTMLElement, SwitcherPanelProps>(function SwitcherPanel({ sections, label = "Products", className, ...props }, ref) {
  return (
    <nav ref={ref} aria-label={label} className={cx("faun-switcher", className)} {...props}>
      {sections.map((s) => (
        <section key={s.title} className="faun-switcher-section" aria-label={s.title}>
          <h3 className="faun-switcher-title">{s.title}</h3>
          <ul className="faun-switcher-list">
            {s.items.map((i) => (
              <li key={`${s.title}-${i.href}`}>
                <a href={i.href} className="faun-switcher-link" aria-current={i.current ? "true" : undefined} data-current={i.current ? "" : undefined}>
                  {i.icon ? <span className="faun-switcher-icon" aria-hidden="true">{i.icon}</span> : null}
                  <span className="faun-switcher-text">
                    <span className="faun-switcher-name">{i.label}</span>
                    {i.description ? <span className="faun-switcher-desc">{i.description}</span> : null}
                  </span>
                  {i.current ? <span className="faun-switcher-here">Current</span> : null}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
});
