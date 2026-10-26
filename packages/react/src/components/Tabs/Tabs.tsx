import * as RT from "@radix-ui/react-tabs";
import { forwardRef, useCallback, useEffect, useRef, useState, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";

export type TabsVariant = "line" | "contained" | "segmented";

export interface TabsProps extends ComponentPropsWithoutRef<typeof RT.Root> {
  /**
   * line (default): an underline under the active tab, for page and section navigation.
   * contained: tabs joined to a bordered panel. segmented: a compact pill group for switching views of the same data.
   */
  variant?: TabsVariant;
  /** md (default) or sm for dense toolbars and side panels. */
  size?: "sm" | "md";
}

/** Switches between related panels of content in the same context. */
export const Tabs = forwardRef<ElementRef<typeof RT.Root>, TabsProps>(function Tabs({ variant = "line", size = "md", className, ...props }, ref) {
  return <RT.Root ref={ref} className={cx("faun-tabs", className)} data-variant={variant} data-size={size} {...props} />;
});

export interface TabsListProps extends ComponentPropsWithoutRef<typeof RT.List> {
  /** Accessible name for the tab list, when there's no visible heading naming it. */
  "aria-label"?: string;
  /** Content shown at the end of the list, outside the scroll area, e.g. a “New view” button. */
  end?: ReactNode;
}

/** The row of tabs. Scrolls horizontally with edge fades when the tabs don't fit. */
export const TabsList = forwardRef<ElementRef<typeof RT.List>, TabsListProps>(function TabsList({ className, children, end, ...props }, ref) {
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const x = Math.abs(el.scrollLeft);
    setEdges((prev) => {
      const next = { start: x > 1, end: max - x > 1 };
      return prev.start === next.start && prev.end === next.end ? prev : next;
    });
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    if (el.firstElementChild) ro?.observe(el.firstElementChild);
    // Keep the active tab in view as selection changes.
    const mo = typeof MutationObserver !== "undefined"
      ? new MutationObserver(() => {
          const active = el.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
          if (active && typeof active.scrollIntoView === "function" && el.scrollWidth > el.clientWidth) active.scrollIntoView({ block: "nearest", inline: "nearest" });
        })
      : null;
    mo?.observe(el, { subtree: true, attributes: true, attributeFilter: ["data-state"] });
    return () => { el.removeEventListener("scroll", measure); ro?.disconnect(); mo?.disconnect(); };
  }, [measure]);

  return (
    <div className="faun-tabs-bar" data-fade-start={edges.start || undefined} data-fade-end={edges.end || undefined}>
      <div ref={scroller} className="faun-tabs-scroller">
        <RT.List ref={ref} className={cx("faun-tabs-list", className)} {...props}>
          {children}
        </RT.List>
      </div>
      {end ? <div className="faun-tabs-end">{end}</div> : null}
    </div>
  );
});

export interface TabsTriggerProps extends ComponentPropsWithoutRef<typeof RT.Trigger> {
  /** Leading icon, 16px. */
  icon?: ReactNode;
  /** A count shown after the label, e.g. open issues. Numbers are formatted with thousands separators. */
  count?: number | string;
}

export const TabsTrigger = forwardRef<ElementRef<typeof RT.Trigger>, TabsTriggerProps>(function TabsTrigger({ className, icon, count, children, ...props }, ref) {
  const shown = typeof count === "number" ? count.toLocaleString("en-US") : count;
  return (
    <RT.Trigger ref={ref} className={cx("faun-tabs-trigger", className)} {...props}>
      {icon ? <span className="faun-tabs-icon" aria-hidden="true">{icon}</span> : null}
      <span className="faun-tabs-label" data-text={typeof children === "string" ? children : undefined}>{children}</span>
      {shown !== undefined && shown !== null && shown !== "" ? <span className="faun-tabs-count">{shown}</span> : null}
    </RT.Trigger>
  );
});

export const TabsContent = forwardRef<ElementRef<typeof RT.Content>, ComponentPropsWithoutRef<typeof RT.Content>>(function TabsContent({ className, ...props }, ref) {
  return <RT.Content ref={ref} className={cx("faun-tabs-content", className)} {...props} />;
});
