import * as RP from "@radix-ui/react-popover";
import { IconClose } from "@faun-ds/icons";
import { forwardRef, type ComponentPropsWithoutRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { IconButton } from "../IconButton/IconButton.js";

export const Popover = RP.Root;
export const PopoverTrigger = RP.Trigger;
export const PopoverAnchor = RP.Anchor;
export const PopoverClose = RP.Close;

export interface PopoverContentProps extends ComponentPropsWithoutRef<typeof RP.Content> {
  /** Width: sm 240 · md 320 (default) · lg 420, or `auto` to fit content. */
  size?: "sm" | "md" | "lg" | "auto";
  /** Show a caret pointing at the trigger. It has its own border so it reads as part of the panel, and follows `align`: with `start` or `end` it sits near that edge. */
  arrow?: boolean;
  /** `default` is a raised surface. `inverse` is a high-contrast dark panel for short hints and onboarding callouts. */
  tone?: "default" | "inverse";
  /** Show a close button in the corner. Use for popovers that hold a form. */
  showClose?: boolean;
  /** Remove the default padding (for menus, lists or custom layouts that manage their own). */
  flush?: boolean;
}

/** Floating panel anchored to a trigger. Closes on Escape and outside click, returns focus to the trigger. */
export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent(
  { size = "md", arrow = false, tone = "default", showClose = false, flush = false, sideOffset = arrow ? 10 : 6, collisionPadding = 8, align = "start", arrowPadding = 16, className, children, ...props },
  ref,
) {
  return (
    <RP.Portal>
      <RP.Content
        ref={ref}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        arrowPadding={arrowPadding}
        align={align}
        className={cx("faun-popover", className)}
        data-size={size}
        data-flush={flush || undefined}
        data-tone={tone}
        data-arrow={arrow || undefined}
        {...props}
      >
        {children}
        {showClose ? (
          <RP.Close asChild>
            <IconButton className="faun-popover-close" icon={<IconClose />} label="Close" size="sm" tooltip={false} />
          </RP.Close>
        ) : null}
        {arrow ? (
          <RP.Arrow asChild>
            <svg className="faun-popover-arrow" width="16" height="8" viewBox="0 0 16 8" aria-hidden="true">
              <path className="faun-popover-arrow-fill" d="M0 0 L8 8 L16 0 Z" />
              <path className="faun-popover-arrow-line" d="M0 0 L8 8 L16 0" fill="none" />
            </svg>
          </RP.Arrow>
        ) : null}
      </RP.Content>
    </RP.Portal>
  );
});

export interface PopoverHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
}

/** Title and optional description at the top of a popover. */
export const PopoverHeader = forwardRef<HTMLDivElement, PopoverHeaderProps>(function PopoverHeader({ title, description, className, ...props }, ref) {
  return (
    <div ref={ref} className={cx("faun-popover-header", className)} {...props}>
      <p className="faun-popover-title">{title}</p>
      {description ? <p className="faun-popover-description">{description}</p> : null}
    </div>
  );
});

/** Main content area. */
export const PopoverBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function PopoverBody({ className, ...props }, ref) {
  return <div ref={ref} className={cx("faun-popover-body", className)} {...props} />;
});

/** Actions row, end-aligned. */
export const PopoverFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function PopoverFooter({ className, ...props }, ref) {
  return <div ref={ref} className={cx("faun-popover-footer", className)} {...props} />;
});
