import { IconMoreHorizontal } from "@faun-ds/icons";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../Menu/Menu.js";

/* An item tells the toolbar who it is, so that if it does not fit the toolbar can list it in the overflow menu. */
interface ItemData {
  kind: "action" | "separator";
  label?: string;
  icon?: ReactNode;
  pressed?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}
interface ToolbarContextValue {
  register: (id: string, el: HTMLElement | null, data: ItemData) => void;
  unregister: (id: string) => void;
  size: "sm" | "md";
}
const ToolbarContext = createContext<ToolbarContextValue | null>(null);
/* kept apart from the context above so a change in what is folded does not change the identity of register and unregister */
const HiddenContext = createContext<Set<string>>(new Set());

export interface ToolbarProps extends Omit<HTMLAttributes<HTMLDivElement>, "aria-label"> {
  /** Required accessible name: "Text formatting", "Table actions". */
  label: string;
  orientation?: "horizontal" | "vertical";
  /** Items that do not fit move into a "More" menu, in order. Horizontal only. */
  overflow?: boolean;
  /** Name of the overflow button. Default "More actions". */
  overflowLabel?: string;
  size?: "sm" | "md";
}

const ITEM_SELECTOR = "[data-toolbar-item]:not(:disabled):not([hidden])";

/**
 * A row of related controls that is a single tab stop. Arrow keys move between the controls, Home and End jump to the ends,
 * and with `overflow` the controls that do not fit fold into a menu. Use it for table and text toolbars.
 */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
  { label, orientation = "horizontal", overflow = false, overflowLabel = "More actions", size = "sm", className, children, onKeyDown, onFocus, ...props },
  ref,
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const moreRef = useRef<HTMLButtonElement | null>(null);
  const items = useRef(new Map<string, { el: HTMLElement | null; data: ItemData }>());
  const widths = useRef(new Map<string, number>());
  const active = useRef<HTMLElement | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [version, setVersion] = useState(0);

  const ordered = useCallback(() => {
    return [...items.current.entries()]
      .filter(([, v]) => v.el)
      .sort(([, a], [, b]) => (a.el!.compareDocumentPosition(b.el!) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  }, []);

  const register = useCallback((id: string, el: HTMLElement | null, data: ItemData) => {
    const prev = items.current.get(id);
    // A ref callback that changes identity is called with null and then the element again; ignore the null so that does not look like a change.
    const nextEl = el ?? prev?.el ?? null;
    items.current.set(id, { el: nextEl, data });
    if (!prev || prev.el !== nextEl) setVersion((v) => v + 1);
  }, []);
  const unregister = useCallback((id: string) => {
    items.current.delete(id);
    widths.current.delete(id);
    setVersion((v) => v + 1);
  }, []);

  /* roving tab stop: exactly one enabled, visible control has tabindex 0 */
  const syncTabStops = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const all = [...root.querySelectorAll<HTMLElement>(ITEM_SELECTOR)];
    const stop = active.current && all.includes(active.current) ? active.current : all[0];
    all.forEach((el) => el.setAttribute("tabindex", el === stop ? "0" : "-1"));
  }, []);

  /* overflow: work out which items fit, using widths measured while they were visible */
  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root || !overflow || orientation === "vertical") return;
    const list = ordered();
    for (const [id, v] of list) if (!v.el!.hasAttribute("hidden")) widths.current.set(id, v.el!.offsetWidth);
    const gap = parseFloat(getComputedStyle(root).columnGap) || 0;
    const avail = root.clientWidth;
    const moreW = moreRef.current?.offsetWidth || widths.current.get("__more") || 40;
    if (moreRef.current?.offsetWidth) widths.current.set("__more", moreRef.current.offsetWidth);
    const widthOf = (id: string) => widths.current.get(id) ?? 0;
    const total = list.reduce((n, [id]) => n + widthOf(id), 0) + gap * Math.max(0, list.length - 1);
    const next = new Set<string>();
    if (total > avail) {
      const limit = avail - moreW - gap;
      let used = 0;
      let full = false;
      for (const [id] of list) {
        const w = widthOf(id) + (used ? gap : 0);
        if (full || used + w > limit) { full = true; next.add(id); } else used += w;
      }
    }
    setHidden((prev) => (prev.size === next.size && [...next].every((x) => prev.has(x)) ? prev : next));
  }, [overflow, orientation, ordered]);

  useLayoutEffect(() => { measure(); }, [measure, version, children, hidden]);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !overflow || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(root);
    return () => ro.disconnect();
  }, [overflow, measure]);
  useEffect(() => { syncTabStops(); });

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const horizontal = orientation === "horizontal";
    const next = horizontal ? "ArrowRight" : "ArrowDown";
    const prev = horizontal ? "ArrowLeft" : "ArrowUp";
    if (![next, prev, "Home", "End"].includes(e.key)) return;
    const root = rootRef.current!;
    const all = [...root.querySelectorAll<HTMLElement>(ITEM_SELECTOR)];
    const idx = all.indexOf(document.activeElement as HTMLElement);
    if (idx < 0) return;
    e.preventDefault();
    const target = e.key === "Home" ? all[0] : e.key === "End" ? all.at(-1) : e.key === next ? all[(idx + 1) % all.length] : all[(idx - 1 + all.length) % all.length];
    target?.focus();
  };

  const ctx = useMemo<ToolbarContextValue>(() => ({ register, unregister, size }), [register, unregister, size]);
  const overflowed = ordered().filter(([id]) => hidden.has(id));
  const menu = overflowed.map(([id, v]) => ({ id, ...v.data }));
  while (menu.length && menu[0]!.kind === "separator") menu.shift();
  while (menu.length && menu.at(-1)!.kind === "separator") menu.pop();

  return (
    <ToolbarContext.Provider value={ctx}>
      <HiddenContext.Provider value={hidden}>
      <div
        ref={(el) => { rootRef.current = el; if (typeof ref === "function") ref(el); else if (ref) ref.current = el; }}
        role="toolbar"
        aria-label={label}
        aria-orientation={orientation}
        className={cx("faun-toolbar", className)}
        data-orientation={orientation}
        data-overflow={overflow ? "" : undefined}
        onKeyDown={handleKey}
        onFocus={(e) => {
          onFocus?.(e);
          const t = e.target as HTMLElement;
          if (t.matches?.("[data-toolbar-item]")) { active.current = t; syncTabStops(); }
        }}
        {...props}
      >
        {children}
        {overflow && menu.length ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton ref={moreRef} data-toolbar-item="" className="faun-toolbar-more" size={size} icon={<IconMoreHorizontal />} label={overflowLabel} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {menu.map((m) =>
                m.kind === "separator" ? <DropdownMenuSeparator key={m.id} /> : m.pressed !== undefined ? (
                  <DropdownMenuCheckboxItem key={m.id} checked={m.pressed} disabled={m.disabled} icon={m.icon} onSelect={() => m.onSelect?.()}>{m.label}</DropdownMenuCheckboxItem>
                ) : (
                  <DropdownMenuItem key={m.id} disabled={m.disabled} icon={m.icon} onSelect={() => m.onSelect?.()}>{m.label}</DropdownMenuItem>
                ),
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
      </HiddenContext.Provider>
    </ToolbarContext.Provider>
  );
});

function useItem(data: ItemData) {
  const ctx = useContext(ToolbarContext);
  const hiddenSet = useContext(HiddenContext);
  const id = useId();
  const elRef = useRef<HTMLElement | null>(null);
  const latest = useRef(data);
  latest.current = data;
  const setRef = useCallback((el: HTMLElement | null) => {
    elRef.current = el;
    ctx?.register(id, el, latest.current);
  }, [ctx, id]);
  useEffect(() => {
    // keep the stored data (label, pressed, handler) current without re-measuring
    ctx?.register(id, elRef.current, data);
  });
  useEffect(() => () => ctx?.unregister(id), [ctx, id]);
  return { id, ctx, setRef, hidden: hiddenSet.has(id) };
}

export interface ToolbarButtonProps {
  /** Required accessible name. Shown as the tooltip, or as visible text with `showLabel`. */
  label: string;
  icon?: ReactNode;
  /** Show the label as text beside the icon. */
  showLabel?: boolean;
  /** Makes it a toggle button (bold, italic, a view mode). */
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  onClick?: () => void;
  disabled?: boolean;
  /** Keyboard shortcut shown in the tooltip. */
  shortcut?: string;
  className?: string;
}

/** A control in a Toolbar. With `pressed` it is a toggle. Icon-only by default; the label is its name and tooltip. */
export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(function ToolbarButton(
  { label, icon, showLabel = false, pressed, onPressedChange, onClick, disabled, shortcut, className },
  ref,
) {
  const select = () => { if (pressed !== undefined) onPressedChange?.(!pressed); else onClick?.(); };
  const item = useItem({ kind: "action", label, icon, pressed, disabled, onSelect: select });
  const size = item.ctx?.size ?? "sm";
  const setRefs = (el: HTMLButtonElement | null) => { item.setRef(el); if (typeof ref === "function") ref(el); else if (ref) ref.current = el; };
  const common = {
    ref: setRefs,
    "data-toolbar-item": "",
    "aria-pressed": pressed,
    disabled,
    hidden: item.hidden || undefined,
    className: cx("faun-toolbar-button", className),
    variant: pressed ? ("soft" as const) : ("ghost" as const),
    size,
    onClick: (e: MouseEvent<HTMLButtonElement>) => { onClick?.(); if (pressed !== undefined && !e.defaultPrevented) onPressedChange?.(!pressed); },
  };
  return showLabel
    ? <Button {...common} leadingIcon={icon}>{label}</Button>
    : <IconButton {...common} icon={icon} label={label} shortcut={shortcut} tooltipSide="bottom" />;
});

/** A divider between groups of controls in a Toolbar. */
export const ToolbarSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ToolbarSeparator({ className, ...props }, ref) {
  const item = useItem({ kind: "separator" });
  const setRefs = (el: HTMLDivElement | null) => { item.setRef(el); if (typeof ref === "function") ref(el); else if (ref) ref.current = el; };
  return <div ref={setRefs} role="separator" aria-orientation="vertical" hidden={item.hidden || undefined} className={cx("faun-toolbar-separator", className)} {...props} />;
});
