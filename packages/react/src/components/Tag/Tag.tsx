import { IconCheck, IconClose } from "@faun-ds/icons";
import { Children, forwardRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactElement, type ReactNode, type Ref } from "react";
import { cx } from "../../utils/cx.js";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover/Popover.js";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Leading icon. */
  icon?: ReactNode;
  /**
   * `framework` renders a regulatory or standard code (CSRD, ESRS E1, GRI 305) in the mono face, always neutral.
   * `operational` is a tag you can press: it does something, such as opening the rest of a list; give it `onClick` or use it as a trigger.
   * `filter` is an applied filter, tinted with the accent; give it `onRemove`.
   */
  variant?: "default" | "framework" | "brand" | "operational" | "filter";
  size?: "sm" | "md" | "lg";
  /** Shows a remove button; called when pressed. */
  onRemove?: () => void;
  /** Accessible label for the remove button. Defaults to "Remove <text>". */
  removeLabel?: string;
  /** Makes the tag a toggle button. Pair with `selected` and `onSelectedChange`. A selected tag shows a check. */
  selectable?: boolean;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  /** Not available: greyed out and skipped by the keyboard. */
  disabled?: boolean;
}

/**
 * A label for categorising: frameworks, topics, entities, filters already applied. It can also be pressed (operational), toggled (selectable)
 * or dismissed. When the tag is interactive, the ref and props such as `onClick` and `aria-expanded` go to its button, so it works as a popover trigger.
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { icon, variant = "default", size = "md", onRemove, removeLabel, selectable, selected = false, onSelectedChange, disabled, className, children, onClick, ...props },
  ref,
) {
  const text = typeof children === "string" ? children : "tag";
  const interactive = !!selectable || variant === "operational";
  const body = (
    <>
      {selectable && selected ? <span className="faun-tag-icon" aria-hidden="true"><IconCheck /></span> : icon ? <span className="faun-tag-icon" aria-hidden="true">{icon}</span> : null}
      <span className="faun-tag-label">{children}</span>
    </>
  );
  const rootProps = interactive ? {} : props;
  return (
    <span
      ref={interactive ? undefined : ref}
      className={cx("faun-tag", className)}
      data-variant={variant}
      data-size={size}
      data-removable={onRemove ? "" : undefined}
      data-interactive={interactive ? "" : undefined}
      data-selected={selectable && selected ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      {...rootProps}
      onClick={interactive ? undefined : onClick}
    >
      {interactive ? (
        <button
          ref={ref as unknown as Ref<HTMLButtonElement>}
          type="button"
          className="faun-tag-action"
          disabled={disabled}
          aria-pressed={selectable ? selected : undefined}
          {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
          onClick={(e) => {
            onClick?.(e as never);
            if (selectable && !e.defaultPrevented) onSelectedChange?.(!selected);
          }}
        >
          {body}
        </button>
      ) : body}
      {onRemove ? (
        <button type="button" className="faun-tag-remove" disabled={disabled} aria-label={removeLabel ?? `Remove ${text}`} onClick={onRemove}>
          <IconClose size="xs" />
        </button>
      ) : null}
    </span>
  );
});

export interface TagGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The tags. */
  children: ReactNode;
  /** How many tags to show before the rest move into a "+N" popover. Default: show all. */
  max?: number;
  /** Accessible name of the group, e.g. "Frameworks". */
  label?: string;
  /** Name of the "+N" button. Gets the hidden count. Keep the visible "+N" in it. Default "+N more". */
  moreLabel?: (hidden: number) => string;
  size?: "sm" | "md" | "lg";
}

/** A row of tags that wraps. With `max`, the tags past it are kept in a "+N" tag that opens a popover listing them. */
export const TagGroup = forwardRef<HTMLDivElement, TagGroupProps>(function TagGroup(
  { children, max, label, moreLabel = (n) => `+${n} more`, size = "md", className, ...props },
  ref,
) {
  const tags = Children.toArray(children) as ReactElement[];
  const limited = max !== undefined && tags.length > max;
  const shown = limited ? tags.slice(0, max) : tags;
  const hidden = limited ? tags.slice(max) : [];
  const [open, setOpen] = useState(false);
  return (
    <div ref={ref} role="group" aria-label={label} className={cx("faun-tag-group", className)} data-size={size} {...props}>
      {shown}
      {hidden.length ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Tag variant="operational" size={size} aria-label={moreLabel(hidden.length)}>{`+${hidden.length}`}</Tag>
          </PopoverTrigger>
          <PopoverContent size="auto" align="start" aria-label={label ? `More ${label.toLowerCase()}` : "More tags"} className="faun-tag-group-overflow">
            <div className="faun-tag-group" data-size={size}>{hidden}</div>
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  );
});

export interface FilterChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Whether the filter is applied. */
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  icon?: ReactNode;
  /** Count of matching items, shown after the label. */
  count?: number;
  size?: "sm" | "md";
}

/** A toggleable chip for quick filters ("Awaiting you", "Estimated", "Scope 3"). Announced as a pressed toggle. */
export const FilterChip = forwardRef<HTMLButtonElement, FilterChipProps>(function FilterChip({ selected = false, onSelectedChange, icon, count, size = "md", className, children, onClick, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      className={cx("faun-filter-chip", className)}
      data-size={size}
      onClick={(e) => { onClick?.(e); if (!e.defaultPrevented) onSelectedChange?.(!selected); }}
      {...props}
    >
      {selected ? <IconCheck size="sm" aria-hidden="true" /> : icon ? <span className="faun-tag-icon" aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
      {count !== undefined ? <span className="faun-filter-chip-count">{count}</span> : null}
    </button>
  );
});
