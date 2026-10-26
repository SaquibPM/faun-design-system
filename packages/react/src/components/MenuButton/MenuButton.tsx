import { IconChevronDown } from "@faun-ds/icons";
import { forwardRef, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { Button, type ButtonProps } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, type DropdownMenuContentProps } from "../Menu/Menu.js";

type MenuSize = "sm" | "md" | "lg";
const menuSize = (s: ButtonProps["size"]): MenuSize => (s === "xs" ? "sm" : s === "xl" ? "lg" : s ?? "md");

export interface MenuButtonProps extends Omit<ButtonProps, "trailingIcon" | "asChild" | "onClick"> {
  /** DropdownMenuItem, DropdownMenuSeparator and friends. */
  menu: ReactNode;
  /** Align the menu to the start or end of the button. Default `start`. */
  align?: DropdownMenuContentProps["align"];
  /** Make the menu at least as wide as the button. */
  matchTriggerWidth?: boolean;
  contentClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** A button that opens a menu: the label says what the menu is for ("Export", "Add filter"), the chevron says it opens. Menu items match the button size. */
export const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>(function MenuButton(
  { menu, align = "start", matchTriggerWidth, contentClassName, open, onOpenChange, size = "md", children, ...props },
  ref,
) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button ref={ref} size={size} trailingIcon={<IconChevronDown />} {...props}>{children}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} size={menuSize(size)} matchTriggerWidth={matchTriggerWidth} className={contentClassName}>{menu}</DropdownMenuContent>
    </DropdownMenu>
  );
});

export interface ComboButtonProps extends Omit<ButtonProps, "trailingIcon" | "asChild"> {
  /** DropdownMenuItem and friends: the alternatives to the primary action. */
  menu: ReactNode;
  /** Required accessible name of the chevron button. Default "More actions". */
  menuLabel?: string;
  align?: DropdownMenuContentProps["align"];
  contentClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** A primary action with a menu of related alternatives: "Run now" with "Run with sample data". The label button acts; the chevron opens the menu. */
export const ComboButton = forwardRef<HTMLDivElement, ComboButtonProps>(function ComboButton(
  { menu, menuLabel = "More actions", align = "end", contentClassName, open, onOpenChange, size = "md", variant = "solid", intent = "accent", className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} role="group" aria-label={typeof children === "string" ? children : undefined} className={cx("faun-combo-button", className)} data-variant={variant} data-intent={intent} data-size={size}>
      <Button size={size} variant={variant} intent={intent} {...props}>{children}</Button>
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <IconButton icon={<IconChevronDown />} label={menuLabel} size={size} variant={variant} intent={intent === "danger" ? undefined : intent} disabled={props.disabled} aria-haspopup="menu" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} size={menuSize(size)} className={contentClassName}>{menu}</DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});
