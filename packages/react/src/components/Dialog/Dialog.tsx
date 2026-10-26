import * as RD from "@radix-ui/react-dialog";
import { IconClose, IconStatusDanger } from "@faun-ds/icons";
import { createContext, forwardRef, useCallback, useContext, useEffect, useRef, useState, type ComponentPropsWithoutRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { useComposedRefs } from "../../utils/compose-refs.js";
import { IconButton } from "../IconButton/IconButton.js";

export const Dialog = RD.Root;
export const DialogTrigger = RD.Trigger;
export const DialogClose = RD.Close;

export type DialogVariant = "default" | "passive" | "danger";
const VariantContext = createContext<DialogVariant>("default");

export interface DialogContentProps extends ComponentPropsWithoutRef<typeof RD.Content> {
  /** xs 320 · sm 420 · md 560 (default) · lg 760 · xl 1040. On narrow screens every size becomes a bottom sheet. */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * `default`: a transactional dialog with a decision. `passive`: information only, no decision; closed with the close
   * button, Escape or a single Close action. `danger`: a destructive confirmation; the header carries a danger icon and the
   * panel a danger rule. For irreversible actions that need typed or explicit confirmation use AlertDialog.
   */
  variant?: DialogVariant;
  /** Show the close button in the corner. Default true. */
  showClose?: boolean;
  /** Prevent closing on scrim click (use for forms with unsaved input). */
  dismissible?: boolean;
}

/** The dialog panel. Traps focus, closes on Escape, restores focus to the trigger, and locks page scroll. */
export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(
  { size = "md", variant = "default", showClose = true, dismissible = true, className, children, onPointerDownOutside, onInteractOutside, ...props },
  ref,
) {
  return (
    <RD.Portal>
      <RD.Overlay className="faun-dialog-scrim" />
      <RD.Content
        ref={ref}
        className={cx("faun-dialog", className)}
        data-size={size}
        data-variant={variant}
        onPointerDownOutside={(e) => { if (!dismissible) e.preventDefault(); onPointerDownOutside?.(e); }}
        onInteractOutside={(e) => { if (!dismissible) e.preventDefault(); onInteractOutside?.(e); }}
        {...props}
      >
        <VariantContext.Provider value={variant}>{children}</VariantContext.Provider>
        {showClose ? (
          <RD.Close asChild>
            <IconButton className="faun-dialog-close" icon={<IconClose />} label="Close" size="sm" tooltip={false} />
          </RD.Close>
        ) : null}
      </RD.Content>
    </RD.Portal>
  );
});

export interface DialogHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  /** Optional icon or illustration above the title. */
  icon?: ReactNode;
}

/** Title (required for accessibility) and optional description. */
export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(function DialogHeader({ title, description, icon, className, ...props }, ref) {
  const variant = useContext(VariantContext);
  if (icon === undefined && variant === "danger") icon = <IconStatusDanger size="lg" label="Danger" />;
  return (
    <div ref={ref} className={cx("faun-dialog-header", className)} {...props}>
      {icon ? <div className="faun-dialog-icon">{icon}</div> : null}
      <RD.Title className="faun-dialog-title">{title}</RD.Title>
      {description ? <RD.Description className="faun-dialog-description">{description}</RD.Description> : <RD.Description className="faun-visually-hidden">{typeof title === "string" ? title : "Dialog"}</RD.Description>}
    </div>
  );
});

export interface DialogBodyProps extends HTMLAttributes<HTMLDivElement> {
  /** Name of the scrolling region, announced when the body overflows. Default "Dialog content". */
  scrollLabel?: string;
}

/**
 * Scrollable content area. When the content is taller than the dialog the body becomes a focusable, labelled region
 * (so keyboard users can scroll it with the arrow keys) and draws a divider on each side that has more content.
 */
export const DialogBody = forwardRef<HTMLDivElement, DialogBodyProps>(function DialogBody({ className, scrollLabel = "Dialog content", children, ...props }, ref) {
  const own = useRef<HTMLDivElement>(null);
  const refs = useComposedRefs(ref, own);
  const [scroll, setScroll] = useState<"none" | "start" | "middle" | "end">("none");
  const measure = useCallback(() => {
    const el = own.current;
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight + 1) return setScroll("none");
    const atStart = el.scrollTop <= 1;
    const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
    setScroll(atStart ? "start" : atEnd ? "end" : "middle");
  }, []);
  useEffect(() => {
    measure();
    const el = own.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, children]);
  const scrollable = scroll !== "none";
  return (
    <div
      ref={refs}
      className={cx("faun-dialog-body", className)}
      data-scroll={scroll}
      tabIndex={scrollable ? 0 : undefined}
      role={scrollable ? "region" : undefined}
      aria-label={scrollable ? scrollLabel : undefined}
      onScroll={measure}
      {...props}
    >
      {children}
    </div>
  );
});

export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Content on the start side, e.g. a "Don't show again" checkbox or a destructive secondary action. */
  start?: ReactNode;
}

/** Actions, end-aligned. Put the primary action last. */
export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(function DialogFooter({ start, className, children, ...props }, ref) {
  return (
    <div ref={ref} className={cx("faun-dialog-footer", className)} {...props}>
      {start ? <div className="faun-dialog-footer-start">{start}</div> : null}
      <div className="faun-dialog-footer-actions">{children}</div>
    </div>
  );
});
