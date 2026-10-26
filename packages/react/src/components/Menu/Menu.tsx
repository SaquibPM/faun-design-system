import * as RC from "@radix-ui/react-context-menu";
import * as RM from "@radix-ui/react-dropdown-menu";
import { IconCheck, IconChevronRight } from "@faun-ds/icons";
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";

/* ------------------------------------------------------------------ shared item content */

type ItemExtras = {
  /** Leading icon, e.g. `<IconEdit />`. */
  icon?: ReactNode;
  /** Keyboard shortcut hint shown at the end, e.g. "⌘E". Display only: wire the shortcut yourself. */
  shortcut?: string;
  /** Secondary line under the label. */
  description?: ReactNode;
  /** `danger` for destructive items such as Delete or Archive. */
  intent?: "neutral" | "danger";
};

function ItemInner({ icon, shortcut, description, children, indicator }: ItemExtras & { children?: ReactNode; indicator?: ReactNode }) {
  return (
    <>
      {indicator !== undefined ? <span className="faun-menu-indicator" aria-hidden="true">{indicator}</span> : null}
      {icon ? <span className="faun-menu-icon" aria-hidden="true">{icon}</span> : null}
      <span className="faun-menu-text">
        <span className="faun-menu-label">{children}</span>
        {description ? <span className="faun-menu-description">{description}</span> : null}
      </span>
      {shortcut ? <kbd className="faun-menu-shortcut">{shortcut}</kbd> : null}
    </>
  );
}

const contentProps = (className?: string) => ({ className: cx("faun-menu", className) });

/* ------------------------------------------------------------------ dropdown menu */

export const DropdownMenu = RM.Root;
export const DropdownMenuTrigger = RM.Trigger;
export const DropdownMenuGroup = RM.Group;
export const DropdownMenuRadioGroup = RM.RadioGroup;
export const DropdownMenuSub = RM.Sub;

export interface DropdownMenuContentProps extends ComponentPropsWithoutRef<typeof RM.Content> {
  /** Minimum width matches the trigger when true. */
  matchTriggerWidth?: boolean;
  /** Item height follows a control size, so a menu opened from a small button has small rows. Default: the density mode. */
  size?: "sm" | "md" | "lg";
}

/** The menu panel. Arrow keys move between items, typing jumps to a matching item, Escape closes. */
export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(function DropdownMenuContent(
  { className, sideOffset = 6, collisionPadding = 8, align = "start", matchTriggerWidth, size, style, ...props },
  ref,
) {
  return (
    <RM.Portal>
      <RM.Content
        ref={ref}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        align={align}
        {...contentProps(className)}
        data-size={size}
        style={matchTriggerWidth ? { minWidth: "var(--radix-dropdown-menu-trigger-width)", ...style } : style}
        {...props}
      />
    </RM.Portal>
  );
});

export interface DropdownMenuItemProps extends ComponentPropsWithoutRef<typeof RM.Item>, ItemExtras {}

/** An action. Selecting it closes the menu. */
export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(function DropdownMenuItem(
  { icon, shortcut, description, intent = "neutral", className, children, asChild, ...props },
  ref,
) {
  return (
    <RM.Item ref={ref} className={cx("faun-menu-item", className)} data-intent={intent} asChild={asChild} {...props}>
      {asChild ? children : <ItemInner icon={icon} shortcut={shortcut} description={description}>{children}</ItemInner>}
    </RM.Item>
  );
});

export interface DropdownMenuCheckboxItemProps extends ComponentPropsWithoutRef<typeof RM.CheckboxItem>, Omit<ItemExtras, "intent"> {}

/** A toggle, e.g. a visible column. Keeps the menu open by default so several can be changed. */
export const DropdownMenuCheckboxItem = forwardRef<HTMLDivElement, DropdownMenuCheckboxItemProps>(function DropdownMenuCheckboxItem(
  { icon, shortcut, description, className, children, onSelect, ...props },
  ref,
) {
  return (
    <RM.CheckboxItem ref={ref} className={cx("faun-menu-item", className)} data-indicator="check" onSelect={(e) => { e.preventDefault(); onSelect?.(e); }} {...props}>
      <ItemInner icon={icon} shortcut={shortcut} description={description} indicator={<RM.ItemIndicator><IconCheck size="md" /></RM.ItemIndicator>}>{children}</ItemInner>
    </RM.CheckboxItem>
  );
});

export interface DropdownMenuRadioItemProps extends ComponentPropsWithoutRef<typeof RM.RadioItem>, Omit<ItemExtras, "intent"> {}

/** One choice in a DropdownMenuRadioGroup, e.g. sort order. */
export const DropdownMenuRadioItem = forwardRef<HTMLDivElement, DropdownMenuRadioItemProps>(function DropdownMenuRadioItem(
  { icon, shortcut, description, className, children, ...props },
  ref,
) {
  return (
    <RM.RadioItem ref={ref} className={cx("faun-menu-item", className)} data-indicator="radio" {...props}>
      <ItemInner icon={icon} shortcut={shortcut} description={description} indicator={<RM.ItemIndicator><span className="faun-menu-radio-dot" /></RM.ItemIndicator>}>{children}</ItemInner>
    </RM.RadioItem>
  );
});

/** Non-interactive heading for a group of items. */
export const DropdownMenuLabel = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RM.Label>>(function DropdownMenuLabel({ className, ...props }, ref) {
  return <RM.Label ref={ref} className={cx("faun-menu-group-label", className)} {...props} />;
});

export const DropdownMenuSeparator = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RM.Separator>>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return <RM.Separator ref={ref} className={cx("faun-menu-separator", className)} {...props} />;
});

export interface DropdownMenuSubTriggerProps extends ComponentPropsWithoutRef<typeof RM.SubTrigger>, Omit<ItemExtras, "intent" | "shortcut"> {}

/** Opens a submenu. Right arrow opens it; left arrow closes it. */
export const DropdownMenuSubTrigger = forwardRef<HTMLDivElement, DropdownMenuSubTriggerProps>(function DropdownMenuSubTrigger({ icon, description, className, children, ...props }, ref) {
  return (
    <RM.SubTrigger ref={ref} className={cx("faun-menu-item", className)} {...props}>
      <ItemInner icon={icon} description={description}>{children}</ItemInner>
      <span className="faun-menu-sub-chevron" aria-hidden="true"><IconChevronRight size="md" /></span>
    </RM.SubTrigger>
  );
});

export const DropdownMenuSubContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RM.SubContent>>(function DropdownMenuSubContent({ className, sideOffset = 4, collisionPadding = 8, ...props }, ref) {
  return (
    <RM.Portal>
      <RM.SubContent ref={ref} sideOffset={sideOffset} collisionPadding={collisionPadding} {...contentProps(className)} {...props} />
    </RM.Portal>
  );
});

/* ------------------------------------------------------------------ context menu */

export const ContextMenu = RC.Root;
export const ContextMenuTrigger = RC.Trigger;
export const ContextMenuGroup = RC.Group;
export const ContextMenuRadioGroup = RC.RadioGroup;
export const ContextMenuSub = RC.Sub;

/** Menu opened by right-click or the context-menu key. Always offer the same actions somewhere visible too. */
export const ContextMenuContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RC.Content>>(function ContextMenuContent({ className, collisionPadding = 8, ...props }, ref) {
  return (
    <RC.Portal>
      <RC.Content ref={ref} collisionPadding={collisionPadding} {...contentProps(className)} {...props} />
    </RC.Portal>
  );
});

export interface ContextMenuItemProps extends ComponentPropsWithoutRef<typeof RC.Item>, ItemExtras {}

export const ContextMenuItem = forwardRef<HTMLDivElement, ContextMenuItemProps>(function ContextMenuItem(
  { icon, shortcut, description, intent = "neutral", className, children, ...props },
  ref,
) {
  return (
    <RC.Item ref={ref} className={cx("faun-menu-item", className)} data-intent={intent} {...props}>
      <ItemInner icon={icon} shortcut={shortcut} description={description}>{children}</ItemInner>
    </RC.Item>
  );
});

export interface ContextMenuCheckboxItemProps extends ComponentPropsWithoutRef<typeof RC.CheckboxItem>, Omit<ItemExtras, "intent"> {}

export const ContextMenuCheckboxItem = forwardRef<HTMLDivElement, ContextMenuCheckboxItemProps>(function ContextMenuCheckboxItem({ icon, shortcut, description, className, children, ...props }, ref) {
  return (
    <RC.CheckboxItem ref={ref} className={cx("faun-menu-item", className)} data-indicator="check" {...props}>
      <ItemInner icon={icon} shortcut={shortcut} description={description} indicator={<RC.ItemIndicator><IconCheck size="md" /></RC.ItemIndicator>}>{children}</ItemInner>
    </RC.CheckboxItem>
  );
});

export interface ContextMenuRadioItemProps extends ComponentPropsWithoutRef<typeof RC.RadioItem>, Omit<ItemExtras, "intent"> {}

export const ContextMenuRadioItem = forwardRef<HTMLDivElement, ContextMenuRadioItemProps>(function ContextMenuRadioItem({ icon, shortcut, description, className, children, ...props }, ref) {
  return (
    <RC.RadioItem ref={ref} className={cx("faun-menu-item", className)} data-indicator="radio" {...props}>
      <ItemInner icon={icon} shortcut={shortcut} description={description} indicator={<RC.ItemIndicator><span className="faun-menu-radio-dot" /></RC.ItemIndicator>}>{children}</ItemInner>
    </RC.RadioItem>
  );
});

export const ContextMenuLabel = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RC.Label>>(function ContextMenuLabel({ className, ...props }, ref) {
  return <RC.Label ref={ref} className={cx("faun-menu-group-label", className)} {...props} />;
});

export const ContextMenuSeparator = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RC.Separator>>(function ContextMenuSeparator({ className, ...props }, ref) {
  return <RC.Separator ref={ref} className={cx("faun-menu-separator", className)} {...props} />;
});

export interface ContextMenuSubTriggerProps extends ComponentPropsWithoutRef<typeof RC.SubTrigger>, Omit<ItemExtras, "intent" | "shortcut"> {}

export const ContextMenuSubTrigger = forwardRef<HTMLDivElement, ContextMenuSubTriggerProps>(function ContextMenuSubTrigger({ icon, description, className, children, ...props }, ref) {
  return (
    <RC.SubTrigger ref={ref} className={cx("faun-menu-item", className)} {...props}>
      <ItemInner icon={icon} description={description}>{children}</ItemInner>
      <span className="faun-menu-sub-chevron" aria-hidden="true"><IconChevronRight size="md" /></span>
    </RC.SubTrigger>
  );
});

export const ContextMenuSubContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RC.SubContent>>(function ContextMenuSubContent({ className, collisionPadding = 8, ...props }, ref) {
  return (
    <RC.Portal>
      <RC.SubContent ref={ref} collisionPadding={collisionPadding} {...contentProps(className)} {...props} />
    </RC.Portal>
  );
});
