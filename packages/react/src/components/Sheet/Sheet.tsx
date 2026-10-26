import * as RD from "@radix-ui/react-dialog";
import { IconClose } from "@faun-ds/icons";
import { createContext, forwardRef, useContext, type ComponentPropsWithoutRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { IconButton } from "../IconButton/IconButton.js";

const SheetContext = createContext({ modal: true });

export interface SheetProps extends ComponentPropsWithoutRef<typeof RD.Root> {
  /**
   * `true` (default): blocks the page with a scrim and traps focus.
   * `false`: an inspector panel that sits beside the page; the page stays interactive.
   */
  modal?: boolean;
}

/** A panel that slides in from an edge: details, filters, editors, artifact inspectors. */
export function Sheet({ modal = true, ...props }: SheetProps) {
  return (
    <SheetContext.Provider value={{ modal }}>
      <RD.Root modal={modal} {...props} />
    </SheetContext.Provider>
  );
}
export const SheetTrigger = RD.Trigger;
export const SheetClose = RD.Close;

export interface SheetContentProps extends ComponentPropsWithoutRef<typeof RD.Content> {
  /** Edge to slide from. Default right. Bottom suits mobile actions. */
  side?: "right" | "left" | "bottom";
  /** Width for left/right sheets: sm 400 · md 560 (default) · lg 760. */
  size?: "sm" | "md" | "lg";
  showClose?: boolean;
  /** Prevent closing on scrim click (unsaved input). */
  dismissible?: boolean;
}

export const SheetContent = forwardRef<HTMLDivElement, SheetContentProps>(function SheetContent(
  { side = "right", size = "md", showClose = true, dismissible = true, className, children, onPointerDownOutside, onInteractOutside, ...props },
  ref,
) {
  const { modal } = useContext(SheetContext);
  return (
    <RD.Portal>
      {modal ? <RD.Overlay className="faun-sheet-scrim" /> : null}
      <RD.Content
        ref={ref}
        className={cx("faun-sheet", className)}
        data-side={side}
        data-size={size}
        data-modal={modal ? "" : undefined}
        onPointerDownOutside={(e) => { if (!dismissible || !modal) e.preventDefault(); onPointerDownOutside?.(e); }}
        onInteractOutside={(e) => { if (!dismissible || !modal) e.preventDefault(); onInteractOutside?.(e); }}
        {...props}
      >
        {children}
        {showClose ? (
          <RD.Close asChild>
            <IconButton className="faun-sheet-close" icon={<IconClose />} label="Close" size="sm" tooltip={false} />
          </RD.Close>
        ) : null}
      </RD.Content>
    </RD.Portal>
  );
});

export interface SheetHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  /** Content under the title, e.g. status badges or tabs. */
  meta?: ReactNode;
}

export const SheetHeader = forwardRef<HTMLDivElement, SheetHeaderProps>(function SheetHeader({ title, description, meta, className, ...props }, ref) {
  return (
    <div ref={ref} className={cx("faun-sheet-header", className)} {...props}>
      <RD.Title className="faun-sheet-title">{title}</RD.Title>
      {description ? <RD.Description className="faun-sheet-description">{description}</RD.Description> : <RD.Description className="faun-visually-hidden">{typeof title === "string" ? title : "Panel"}</RD.Description>}
      {meta ? <div className="faun-sheet-meta">{meta}</div> : null}
    </div>
  );
});

export const SheetBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SheetBody({ className, ...props }, ref) {
  return <div ref={ref} className={cx("faun-sheet-body", className)} {...props} />;
});

export interface SheetFooterProps extends HTMLAttributes<HTMLDivElement> {
  start?: ReactNode;
}

export const SheetFooter = forwardRef<HTMLDivElement, SheetFooterProps>(function SheetFooter({ start, className, children, ...props }, ref) {
  return (
    <div ref={ref} className={cx("faun-sheet-footer", className)} {...props}>
      {start ? <div className="faun-sheet-footer-start">{start}</div> : null}
      <div className="faun-sheet-footer-actions">{children}</div>
    </div>
  );
});
