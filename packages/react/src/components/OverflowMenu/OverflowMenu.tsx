import { IconMoreHorizontal, IconMoreVertical } from "@faun-ds/icons";
import { forwardRef, type ReactNode } from "react";
import { IconButton, type IconButtonProps } from "../IconButton/IconButton.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, type DropdownMenuContentProps } from "../Menu/Menu.js";

export interface OverflowMenuProps extends Omit<IconButtonProps, "icon" | "label" | "children"> {
  /** Required accessible name, naming the object the actions belong to: "Actions for Scope 2 import". Also the tooltip. */
  label: string;
  /** DropdownMenuItem, DropdownMenuSeparator and friends. Keep to about seven items; put the most common first and destructive ones last. */
  children: ReactNode;
  /** Three dots across (default) or stacked. Use vertical in narrow rows and cards. */
  orientation?: "horizontal" | "vertical";
  /** Where the menu aligns to the trigger. Default `end`, so it opens inward from the edge of a row. */
  align?: DropdownMenuContentProps["align"];
  side?: DropdownMenuContentProps["side"];
  /** Class for the menu panel. */
  contentClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** The "more actions" button: an icon button that opens a menu. For row, card and toolbar actions that do not earn a button each. */
export const OverflowMenu = forwardRef<HTMLButtonElement, OverflowMenuProps>(function OverflowMenu(
  { label, children, orientation = "horizontal", align = "end", side, contentClassName, open, onOpenChange, size = "md", variant = "ghost", ...props },
  ref,
) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <IconButton ref={ref} icon={orientation === "vertical" ? <IconMoreVertical /> : <IconMoreHorizontal />} label={label} size={size} variant={variant} aria-haspopup="menu" {...props} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} size={size === "xs" ? "sm" : size === "xl" ? "lg" : size} className={contentClassName}>{children}</DropdownMenuContent>
    </DropdownMenu>
  );
});
