import { Slot } from "@radix-ui/react-slot";
import { IconChevronDown, IconChevronsUpDown, IconMenu, IconPanelLeft } from "@faun-ds/icons";
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx.js";
import { useControllableState } from "../../utils/use-controllable-state.js";
import { VisuallyHidden } from "../../utils/visually-hidden.js";
import { Avatar } from "../Avatar/Avatar.js";
import { IconButton } from "../IconButton/IconButton.js";
import { SkipLink } from "../SkipLink/SkipLink.js";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover/Popover.js";
import { Tooltip } from "../Tooltip/Tooltip.js";

/* ------------------------------------------------------------------ context */

const MOBILE_QUERY = "(max-width: 767.98px)";

interface ShellContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  navId: string;
  mainId: string;
  toggleRef: React.MutableRefObject<HTMLButtonElement | null>;
}

const ShellContext = createContext<ShellContextValue | null>(null);

/** Shell state for custom controls: collapsed rail, mobile drawer, ids. Null outside an AppShell. */
export function useAppShell() {
  return useContext(ShellContext);
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, [query]);
  return matches;
}

/* ----------------------------------------------------------------- AppShell */

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  /** The side navigation, usually a `<SideNav>`. */
  nav: ReactNode;
  /** The bar above the page, usually a `<TopBar>`. */
  topBar?: ReactNode;
  /** Collapse the side navigation to an icon rail (desktop). Controlled. */
  navCollapsed?: boolean;
  /** Initial collapsed state when uncontrolled. */
  defaultNavCollapsed?: boolean;
  onNavCollapsedChange?: (collapsed: boolean) => void;
  /** Open state of the off-canvas navigation on small screens. Controlled. */
  mobileNavOpen?: boolean;
  onMobileNavOpenChange?: (open: boolean) => void;
  /** `viewport` fills the window (the app root); `container` fills its parent, for embedding. */
  fill?: "viewport" | "container";
  /** Text of the skip link that jumps past the navigation. */
  skipLinkLabel?: string;
}

/** The application frame: side navigation, top bar and a scrolling page area. */
export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(function AppShell(
  {
    nav,
    topBar,
    navCollapsed,
    defaultNavCollapsed = false,
    onNavCollapsedChange,
    mobileNavOpen,
    onMobileNavOpenChange,
    fill = "viewport",
    skipLinkLabel = "Skip to main content",
    className,
    children,
    ...props
  },
  ref,
) {
  const [collapsed, setCollapsed] = useControllableState({ value: navCollapsed, defaultValue: defaultNavCollapsed, onChange: onNavCollapsedChange });
  const [mobileOpen, setMobileOpen] = useControllableState({ value: mobileNavOpen, defaultValue: false, onChange: onMobileNavOpenChange });
  const mobile = useMediaQuery(MOBILE_QUERY);
  const id = useId();
  const navId = `${id}-nav`;
  const mainId = `${id}-main`;
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const navWrapRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const drawerOpen = mobile && mobileOpen;

  // Close the drawer when the viewport grows past the breakpoint.
  useEffect(() => {
    if (!mobile && mobileOpen) setMobileOpen(false);
  }, [mobile, mobileOpen, setMobileOpen]);

  // Drawer focus management: move focus in, make the page inert, restore focus on close.
  useEffect(() => {
    const body = bodyRef.current;
    if (!drawerOpen) {
      body?.removeAttribute("inert");
      return;
    }
    body?.setAttribute("inert", "");
    const first = navWrapRef.current?.querySelector<HTMLElement>("a[href], button:not([disabled]), [tabindex='0']");
    first?.focus();
    const toggle = toggleRef.current;
    return () => {
      body?.removeAttribute("inert");
      toggle?.focus();
    };
  }, [drawerOpen]);

  const ctx = useMemo<ShellContextValue>(
    () => ({ collapsed: mobile ? false : collapsed, setCollapsed, mobile, mobileOpen: drawerOpen, setMobileOpen, navId, mainId, toggleRef }),
    [collapsed, setCollapsed, mobile, drawerOpen, setMobileOpen, navId, mainId],
  );

  return (
    <ShellContext.Provider value={ctx}>
      <div
        ref={ref}
        className={cx("faun-app-shell", className)}
        data-fill={fill}
        data-collapsed={ctx.collapsed ? "" : undefined}
        data-mobile={mobile ? "" : undefined}
        data-drawer-open={drawerOpen ? "" : undefined}
        {...props}
      >
        <SkipLink href={`#${mainId}`}>{skipLinkLabel}</SkipLink>
        <div
          ref={navWrapRef}
          id={navId}
          className="faun-app-shell-nav"
          onKeyDown={(e) => {
            if (drawerOpen && e.key === "Escape") {
              e.stopPropagation();
              setMobileOpen(false);
            }
          }}
          onClick={(e) => {
            // Following a link in the drawer closes it.
            if (drawerOpen && (e.target as HTMLElement).closest("a[href]")) setMobileOpen(false);
          }}
        >
          {nav}
        </div>
        {drawerOpen ? <div className="faun-app-shell-scrim" aria-hidden="true" onClick={() => setMobileOpen(false)} /> : null}
        <div ref={bodyRef} className="faun-app-shell-body">
          {topBar}
          <main id={mainId} tabIndex={-1} className="faun-app-shell-main">
            {children}
          </main>
        </div>
      </div>
    </ShellContext.Provider>
  );
});

/* ---------------------------------------------------------------- NavToggle */

export interface AppShellNavToggleProps {
  className?: string;
}

/** Collapses the rail on desktop and opens the drawer on small screens. TopBar renders one for you. */
export const AppShellNavToggle = forwardRef<HTMLButtonElement, AppShellNavToggleProps>(function AppShellNavToggle({ className }, ref) {
  const ctx = useAppShell();
  const setRefs = useCallback(
    (el: HTMLButtonElement | null) => {
      if (ctx) ctx.toggleRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    },
    [ctx, ref],
  );
  if (!ctx) return null;
  const label = ctx.mobile ? "Open navigation" : ctx.collapsed ? "Expand navigation" : "Collapse navigation";
  return (
    <IconButton
      ref={setRefs}
      className={cx("faun-app-shell-toggle", className)}
      icon={ctx.mobile ? <IconMenu /> : <IconPanelLeft />}
      label={label}
      tooltip={!ctx.mobile}
      tooltipSide="bottom"
      aria-controls={ctx.navId}
      aria-expanded={ctx.mobile ? ctx.mobileOpen : !ctx.collapsed}
      onClick={() => (ctx.mobile ? ctx.setMobileOpen(!ctx.mobileOpen) : ctx.setCollapsed(!ctx.collapsed))}
    />
  );
});

/* ------------------------------------------------------------------ SideNav */

const NavContext = createContext<{ collapsed: boolean }>({ collapsed: false });
const TierContext = createContext<{ tier: 1 | 2 }>({ tier: 1 });

export interface SideNavProps extends HTMLAttributes<HTMLElement> {
  /** Accessible name of the navigation landmark. Default "Main". */
  label?: string;
  /** Workspace or product identity at the top, usually `<SideNavWorkspace>`. */
  workspace?: ReactNode;
  /** Pinned to the bottom, usually `<SideNavUser>`. */
  footer?: ReactNode;
  /** Force the icon rail when used outside an AppShell. */
  collapsed?: boolean;
}

/** The primary navigation rail: workspace, sections of destinations, and the signed-in user. */
export const SideNav = forwardRef<HTMLElement, SideNavProps>(function SideNav({ label = "Main", workspace, footer, collapsed: collapsedProp, className, children, ...props }, ref) {
  const shell = useAppShell();
  const collapsed = collapsedProp ?? shell?.collapsed ?? false;
  return (
    <NavContext.Provider value={{ collapsed }}>
      <nav ref={ref} aria-label={label} className={cx("faun-side-nav", className)} data-collapsed={collapsed ? "" : undefined} {...props}>
        {workspace ? <div className="faun-side-nav-head">{workspace}</div> : null}
        <div className="faun-side-nav-body">{children}</div>
        {footer ? <div className="faun-side-nav-foot">{footer}</div> : null}
      </nav>
    </NavContext.Provider>
  );
});

export interface SideNavWorkspaceProps extends HTMLAttributes<HTMLElement> {
  /** Square mark (logo or icon) shown in both expanded and collapsed states. */
  mark: ReactNode;
  /** Product or workspace name, e.g. "Faun". */
  name: ReactNode;
  /** Secondary line: tenant and period, e.g. "Acme Industrial · FY2026". */
  context?: ReactNode;
  /** Makes the block a workspace switcher button. */
  onSwitch?: () => void;
}

/** Workspace identity at the top of the SideNav; optionally a switcher. */
export const SideNavWorkspace = forwardRef<HTMLElement, SideNavWorkspaceProps>(function SideNavWorkspace({ mark, name, context, onSwitch, className, ...props }, ref) {
  const { collapsed } = useContext(NavContext);
  const inner = (
    <>
      <span className="faun-side-nav-mark" aria-hidden="true">{mark}</span>
      <span className="faun-side-nav-ws-text">
        <span className="faun-side-nav-ws-name">{name}</span>
        {context ? <span className="faun-side-nav-ws-context">{context}</span> : null}
      </span>
      {onSwitch ? <IconChevronsUpDown size="sm" className="faun-side-nav-ws-chevron" aria-hidden="true" /> : null}
    </>
  );
  const tip = typeof name === "string" ? name : undefined;
  if (onSwitch) {
    return (
      <Tooltip content={tip} side="right" disabled={!collapsed}>
        <button ref={ref as React.Ref<HTMLButtonElement>} type="button" className={cx("faun-side-nav-ws", className)} data-interactive="" onClick={onSwitch} aria-label={collapsed && tip ? `Switch workspace, current ${tip}` : undefined} {...(props as HTMLAttributes<HTMLButtonElement>)}>
          {inner}
        </button>
      </Tooltip>
    );
  }
  return <div ref={ref as React.Ref<HTMLDivElement>} className={cx("faun-side-nav-ws", className)} {...(props as HTMLAttributes<HTMLDivElement>)}>{inner}</div>;
});

export interface SideNavSectionProps extends HTMLAttributes<HTMLDivElement> {
  /** Section heading, e.g. "Reporting". Omit for the top group. */
  title?: string;
}

/** A labelled group of SideNav items. */
export const SideNavSection = forwardRef<HTMLDivElement, SideNavSectionProps>(function SideNavSection({ title, className, children, ...props }, ref) {
  const id = useId();
  return (
    <div ref={ref} className={cx("faun-side-nav-section", className)} {...props}>
      {title ? <p id={id} className="faun-side-nav-section-title">{title}</p> : null}
      <ul className="faun-side-nav-list" aria-labelledby={title ? id : undefined}>{children}</ul>
    </div>
  );
});

export interface SideNavItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Icon at 16px. Required for top-level items so the collapsed rail stays usable; second-tier items inside a `SideNavGroup` have none. */
  icon?: ReactNode;
  /** Destination name, or your router link element when `asChild` is set. */
  children: ReactNode;
  /** Marks the current page (`aria-current="page"`). */
  current?: boolean;
  /** Neutral count, e.g. number of filings. */
  count?: number;
  /** Items awaiting the user, e.g. approvals. Shown as an attention badge; `true` shows a dot. */
  attention?: number | boolean;
  /** Render your router's link instead of `<a>`: `<SideNavItem asChild icon={…} label="Filings"><Link to="/filings" /></SideNavItem>`. */
  asChild?: boolean;
  /** Destination name when `asChild` is used (children is then the link element). */
  label?: string;
}

/** A destination in the SideNav. Shows a tooltip with its name when the rail is collapsed. */
export const SideNavItem = forwardRef<HTMLAnchorElement, SideNavItemProps>(function SideNavItem(
  { icon, children, current, count, attention, asChild, label, className, ...props },
  ref,
) {
  const { collapsed } = useContext(NavContext);
  const { tier } = useContext(TierContext);
  const text = label ?? (typeof children === "string" ? children : "");
  const attentionCount = typeof attention === "number" ? attention : undefined;
  const hasAttention = attention === true || (attentionCount !== undefined && attentionCount > 0);
  const content = (
    <>
      {icon ? <span className="faun-side-nav-icon" aria-hidden="true">{icon}</span> : null}
      <span className="faun-side-nav-label">{text}</span>
      {hasAttention ? (
        <span className="faun-side-nav-attention" data-dot={attentionCount === undefined ? "" : undefined}>
          {attentionCount !== undefined ? <span aria-hidden="true">{attentionCount}</span> : null}
          <VisuallyHidden>{attentionCount !== undefined ? `${attentionCount} awaiting you` : "awaiting you"}</VisuallyHidden>
        </span>
      ) : count !== undefined ? (
        <span className="faun-side-nav-count">{count}</span>
      ) : null}
    </>
  );
  const Comp = asChild ? Slot : "a";
  const tip = hasAttention && attentionCount !== undefined ? `${text} · ${attentionCount}` : count !== undefined ? `${text} · ${count}` : text;
  return (
    <li className="faun-side-nav-li">
      <Tooltip content={tip} side="right" disabled={!collapsed}>
        <Comp ref={ref} className={cx("faun-side-nav-item", className)} data-tier={tier === 2 ? "2" : undefined} aria-current={current ? "page" : undefined} data-current={current ? "" : undefined} {...props}>
          {asChild && isValidElement(children) ? cloneElement(children as ReactElement<{ children?: ReactNode }>, undefined, content) : content}
        </Comp>
      </Tooltip>
    </li>
  );
});

export interface SideNavGroupProps extends Omit<HTMLAttributes<HTMLLIElement>, "children"> {
  /** Icon at 16px. Required: it is what the collapsed rail shows. */
  icon: ReactNode;
  /** Group name, e.g. "Reporting". */
  label: string;
  /** Second-tier destinations: `<SideNavItem>` elements without icons. */
  children: ReactNode;
  /** Expanded state, when controlled. */
  open?: boolean;
  /** Initial state when uncontrolled. Defaults to open when one of the items is current, closed otherwise. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Marks the group as holding the current page, when the current item is not a direct child. Detected automatically otherwise. */
  current?: boolean;
}

type ItemElement = ReactElement<SideNavItemProps>;
const itemElements = (children: ReactNode) => Children.toArray(children).filter((c): c is ItemElement => isValidElement(c));

/**
 * A second tier in the SideNav: a group that expands to show its destinations. A group that holds the current page starts open and
 * is marked. In the collapsed rail the group shows its icon, and pressing it opens a small panel beside the rail with the same links.
 */
export const SideNavGroup = forwardRef<HTMLLIElement, SideNavGroupProps>(function SideNavGroup({ icon, label, children, open: openProp, defaultOpen, onOpenChange, current, className, ...props }, ref) {
  const { collapsed } = useContext(NavContext);
  const items = itemElements(children);
  const holdsCurrent = current ?? items.some((i) => i.props.current);
  const needsAttention = items.some((i) => i.props.attention === true || (typeof i.props.attention === "number" && i.props.attention > 0));
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen ?? holdsCurrent, onChange: onOpenChange });
  const listId = useId();

  if (collapsed) {
    return (
      <li ref={ref} className={cx("faun-side-nav-li", className)} data-has-current={holdsCurrent ? "" : undefined} {...props}>
        <Popover>
          <Tooltip content={label} side="right">
            <PopoverTrigger asChild>
              <button type="button" className="faun-side-nav-item faun-side-nav-group-trigger" data-has-current={holdsCurrent ? "" : undefined} aria-label={`${label}, ${items.length} pages`}>
                <span className="faun-side-nav-icon" aria-hidden="true">{icon}</span>
                {needsAttention ? <span className="faun-side-nav-attention" data-dot="" aria-hidden="true" /> : null}
              </button>
            </PopoverTrigger>
          </Tooltip>
          <PopoverContent className="faun-side-nav-flyout" side="right" align="start" size="auto" flush sideOffset={8} aria-label={label}>
            <p className="faun-side-nav-flyout-title">{label}</p>
            <ul className="faun-side-nav-flyout-list">
              {items.map((i, idx) => {
                const { children: kids, current: cur, count, attention, asChild, label: lbl, icon: _icon, className: _cn, ...rest } = i.props;
                const text = lbl ?? (typeof kids === "string" ? kids : "");
                const badge = typeof attention === "number" && attention > 0 ? attention : count;
                const inner = (
                  <>
                    <span className="faun-side-nav-flyout-label">{text}</span>
                    {attention === true ? <span className="faun-side-nav-attention" data-dot="" /> : badge !== undefined ? <span className="faun-side-nav-flyout-count">{badge}</span> : null}
                  </>
                );
                const common = { className: "faun-side-nav-flyout-link", "aria-current": cur ? ("page" as const) : undefined, "data-current": cur ? "" : undefined };
                return (
                  <li key={idx}>
                    {asChild && isValidElement(kids)
                      ? cloneElement(kids as ReactElement<Record<string, unknown>>, common, inner)
                      : <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} {...common}>{inner}</a>}
                  </li>
                );
              })}
            </ul>
          </PopoverContent>
        </Popover>
      </li>
    );
  }

  return (
    <li ref={ref} className={cx("faun-side-nav-li faun-side-nav-group", className)} data-has-current={holdsCurrent ? "" : undefined} data-open={open ? "" : undefined} {...props}>
      <button type="button" className="faun-side-nav-item faun-side-nav-group-trigger" data-has-current={holdsCurrent ? "" : undefined} aria-expanded={open} aria-controls={listId} onClick={() => setOpen(!open)}>
        <span className="faun-side-nav-icon" aria-hidden="true">{icon}</span>
        <span className="faun-side-nav-label">{label}</span>
        {!open && needsAttention ? <span className="faun-side-nav-attention" data-dot=""><VisuallyHidden>awaiting you</VisuallyHidden></span> : null}
        <IconChevronDown size="sm" className="faun-side-nav-group-chevron" aria-hidden="true" />
      </button>
      <TierContext.Provider value={{ tier: 2 }}>
        <ul id={listId} className="faun-side-nav-sublist" hidden={!open}>{children}</ul>
      </TierContext.Provider>
    </li>
  );
});

export interface SideNavUserProps extends HTMLAttributes<HTMLElement> {
  name: string;
  /** Role or email under the name. */
  meta?: ReactNode;
  /** Avatar image URL. */
  src?: string;
  /** Opens the account menu. Without it the block is static. */
  onOpenMenu?: () => void;
}

/** The signed-in user at the foot of the SideNav. */
export const SideNavUser = forwardRef<HTMLElement, SideNavUserProps>(function SideNavUser({ name, meta, src, onOpenMenu, className, ...props }, ref) {
  const { collapsed } = useContext(NavContext);
  const inner = (
    <>
      <Avatar name={name} src={src} size="sm" decorative />
      <span className="faun-side-nav-user-text">
        <span className="faun-side-nav-user-name">{name}</span>
        {meta ? <span className="faun-side-nav-user-meta">{meta}</span> : null}
      </span>
    </>
  );
  if (onOpenMenu) {
    return (
      <Tooltip content={name} side="right" disabled={!collapsed}>
        <button ref={ref as React.Ref<HTMLButtonElement>} type="button" className={cx("faun-side-nav-user", className)} data-interactive="" aria-label={`Account: ${name}`} onClick={onOpenMenu} {...(props as HTMLAttributes<HTMLButtonElement>)}>
          {inner}
        </button>
      </Tooltip>
    );
  }
  return (
    <div ref={ref as React.Ref<HTMLDivElement>} className={cx("faun-side-nav-user", className)} {...(props as HTMLAttributes<HTMLDivElement>)}>
      {inner}
    </div>
  );
});

/* ------------------------------------------------------------------- TopBar */

export interface TopBarProps extends HTMLAttributes<HTMLElement> {
  /** Header navigation links, usually `<HeaderNav>`. Sits before `start`, and folds into a Menu button on small screens. */
  nav?: ReactNode;
  /** Left side: usually breadcrumbs for the current page. */
  start?: ReactNode;
  /** Centre-right: usually a search or "ask the assistant" field. Hidden below the small breakpoint unless `keepSearch`. */
  search?: ReactNode;
  /** Right side: notifications, help, account. */
  actions?: ReactNode;
  /** Show the navigation toggle when inside an AppShell. Default true. */
  navToggle?: boolean;
}

/** The bar above every page: navigation toggle, location, search and global actions. */
export const TopBar = forwardRef<HTMLElement, TopBarProps>(function TopBar({ nav, start, search, actions, navToggle = true, className, ...props }, ref) {
  return (
    <header ref={ref} className={cx("faun-top-bar", className)} {...props}>
      {navToggle ? <AppShellNavToggle /> : null}
      {nav ? <div className="faun-top-bar-nav">{nav}</div> : null}
      <div className="faun-top-bar-start">{start}</div>
      {search ? <div className="faun-top-bar-search">{search}</div> : null}
      {actions ? <div className="faun-top-bar-actions">{actions}</div> : null}
    </header>
  );
});

/* --------------------------------------------------------------- PageHeader */

export interface PageHeaderMeta {
  icon?: ReactNode;
  label: ReactNode;
}

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** The page title. One per page. */
  title: ReactNode;
  /** Shown beside the title, usually a `<StatusBadge>`. */
  status?: ReactNode;
  /** Short facts under the title: owner agent, period, started time. */
  meta?: PageHeaderMeta[];
  /** A sentence of context under the title, when meta is not enough. */
  description?: ReactNode;
  /** Page-level actions, primary last (rightmost). */
  actions?: ReactNode;
  /** Content above the title, e.g. a back link. */
  eyebrow?: ReactNode;
  /** Heading level. Default 1. */
  level?: 1 | 2;
  /** Below the header, e.g. Tabs. */
  children?: ReactNode;
}

/** Title, status, facts and actions for a page. */
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader({ title, status, meta, description, actions, eyebrow, level = 1, className, children, ...props }, ref) {
  const H = level === 1 ? "h1" : "h2";
  return (
    <header ref={ref} className={cx("faun-page-header", className)} {...props}>
      <div className="faun-page-header-row">
        <div className="faun-page-header-main">
          {eyebrow ? <div className="faun-page-header-eyebrow">{eyebrow}</div> : null}
          <div className="faun-page-header-title-row">
            <H className="faun-page-header-title">{title}</H>
            {status ? <span className="faun-page-header-status">{status}</span> : null}
          </div>
          {meta?.length ? (
            <ul className="faun-page-header-meta">
              {meta.map((m, i) => (
                <li key={i}>
                  {m.icon ? <span className="faun-page-header-meta-icon" aria-hidden="true">{m.icon}</span> : null}
                  {m.label}
                </li>
              ))}
            </ul>
          ) : null}
          {description ? <p className="faun-page-header-description">{description}</p> : null}
        </div>
        {actions ? <div className="faun-page-header-actions">{actions}</div> : null}
      </div>
      {children ? <div className="faun-page-header-extra">{children}</div> : null}
    </header>
  );
});
