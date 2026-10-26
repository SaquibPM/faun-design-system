import { IconArrowRight, IconCheck, IconChevronDown } from "@faun-ds/icons";
import { Slot } from "@radix-ui/react-slot";
import { createContext, forwardRef, useContext, useId, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { useControllableState } from "../../utils/use-controllable-state.js";

export interface TileProps extends HTMLAttributes<HTMLDivElement> {
  /** Greys the tile and removes it from interaction. */
  disabled?: boolean;
  /** Render the child as the tile. */
  asChild?: boolean;
}

/** A flat block of related content that sits in a grid of peers. Quieter than a Card: no header anatomy, no shadow. */
export const Tile = forwardRef<HTMLDivElement, TileProps>(function Tile({ disabled, asChild, className, ...props }, ref) {
  const Comp = asChild ? Slot : "div";
  return <Comp ref={ref} className={cx("faun-tile", className)} data-kind="base" data-disabled={disabled ? "" : undefined} {...props} />;
});

type ClickableBase = { disabled?: boolean; children: ReactNode; className?: string; /** Hide the trailing arrow. */ hideArrow?: boolean };
export type ClickableTileProps = ClickableBase & (
  | ({ href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children" | "className">)
  | ({ href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className" | "disabled">)
);

/**
 * A tile that is one link or one button. With `href` it renders a link; without, a button. The text inside names it, so write
 * what happens ("Open the Scope 3 inventory"), not "Click here". Do not put other links or buttons inside.
 */
export const ClickableTile = forwardRef<HTMLAnchorElement | HTMLButtonElement, ClickableTileProps>(function ClickableTile({ disabled, children, className, hideArrow, ...props }, ref) {
  const inner = (
    <>
      <span className="faun-tile-body">{children}</span>
      {hideArrow ? null : <span className="faun-tile-arrow" aria-hidden="true"><IconArrowRight /></span>}
    </>
  );
  const cls = cx("faun-tile", className);
  if ("href" in props && props.href !== undefined) {
    const { href, ...rest } = props as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} className={cls} data-kind="clickable" data-disabled={disabled ? "" : undefined} href={disabled ? undefined : href} aria-disabled={disabled || undefined} role={disabled ? "link" : undefined} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} type="button" className={cls} data-kind="clickable" data-disabled={disabled ? "" : undefined} disabled={disabled} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {inner}
    </button>
  );
});

// ---- selectable ----

type GroupContext = {
  type: "radio" | "checkbox";
  name: string;
  isSelected: (value: string) => boolean;
  toggle: (value: string, on: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
};
const Group = createContext<GroupContext | null>(null);

export interface TileGroupProps extends Omit<HTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue"> {
  /** Names the group for assistive technology and is shown above the tiles. Required. */
  legend: ReactNode;
  /** Help text under the legend. */
  description?: ReactNode;
  /** `radio`: one tile at a time, chosen with the arrow keys. `checkbox`: any number, each with its own tab stop. */
  type?: "radio" | "checkbox";
  /** Chosen value (radio). */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Chosen values (checkbox). */
  values?: string[];
  defaultValues?: string[];
  onValuesChange?: (values: string[]) => void;
  disabled?: boolean;
  /** Tiles show the choice but it cannot change. */
  readOnly?: boolean;
  /** Minimum tile width in the grid. Default 12rem. */
  minTileWidth?: string;
  /** Visually hide the legend (it stays for screen readers). */
  hideLegend?: boolean;
}

/** A set of selectable tiles that behave as radios (choose one) or checkboxes (choose several). */
export const TileGroup = forwardRef<HTMLFieldSetElement, TileGroupProps>(function TileGroup(
  { legend, description, type = "radio", value, defaultValue = null, onValueChange, values, defaultValues = [], onValuesChange, disabled, readOnly, minTileWidth, hideLegend, className, style, children, ...props },
  ref,
) {
  const name = useId();
  const descId = useId();
  const [one, setOne] = useControllableState<string | null>({ value, defaultValue, onChange: onValueChange });
  const [many, setMany] = useControllableState<string[]>({ value: values, defaultValue: defaultValues, onChange: onValuesChange });
  const ctx: GroupContext = {
    type, name, disabled, readOnly,
    isSelected: (v) => (type === "radio" ? one === v : many.includes(v)),
    toggle: (v, on) => {
      if (readOnly) return;
      if (type === "radio") setOne(on ? v : null);
      else setMany(on ? [...many.filter((x) => x !== v), v] : many.filter((x) => x !== v));
    },
  };
  return (
    <fieldset
      ref={ref}
      className={cx("faun-tile-group", className)}
      disabled={disabled}
      aria-describedby={description ? descId : undefined}
      style={{ ...(minTileWidth ? { "--_tile-min": minTileWidth } : null), ...style } as React.CSSProperties}
      {...props}
    >
      <legend className={cx("faun-tile-group-legend", hideLegend && "faun-visually-hidden")}>{legend}</legend>
      {description ? <p id={descId} className="faun-tile-group-description">{description}</p> : null}
      <Group.Provider value={ctx}><div className="faun-tile-grid">{children}</div></Group.Provider>
    </fieldset>
  );
});

export interface SelectableTileProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange" | "children" | "checked" | "defaultChecked" | "size"> {
  /** The tile's value inside a TileGroup. Required there. */
  value?: string;
  /** Standalone (checkbox) selected state. In a TileGroup the group holds it. */
  selected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  /** Tile content: a title and a line or two. Keep to text and inline elements. */
  children: ReactNode;
  readOnly?: boolean;
  wrapperClassName?: string;
}

/**
 * A tile that is chosen rather than opened. Inside a `TileGroup type="radio"` it is a radio; inside `type="checkbox"`, or on its own, a checkbox.
 * The indicator is a filled check or dot, so the choice never rests on colour alone.
 */
export const SelectableTile = forwardRef<HTMLInputElement, SelectableTileProps>(function SelectableTile(
  { value, selected, defaultSelected = false, onSelectedChange, children, disabled, readOnly, className, wrapperClassName, ...props },
  ref,
) {
  const group = useContext(Group);
  const [own, setOwn] = useControllableState<boolean>({ value: selected, defaultValue: defaultSelected, onChange: onSelectedChange });
  const type = group?.type ?? "checkbox";
  const checked = group ? group.isSelected(value ?? "") : own;
  const off = disabled || group?.disabled;
  const ro = readOnly || group?.readOnly;
  return (
    <label className={cx("faun-tile", wrapperClassName)} data-kind="selectable" data-type={type} data-selected={checked ? "" : undefined} data-disabled={off ? "" : undefined} data-readonly={ro ? "" : undefined}>
      <input
        ref={ref}
        type={type}
        name={group?.name}
        value={value}
        className={cx("faun-tile-input", className)}
        checked={checked}
        disabled={off}
        aria-readonly={ro || undefined}
        onChange={(e) => { if (ro) return; if (group) group.toggle(value ?? "", e.target.checked); else setOwn(e.target.checked); }}
        // a read-only radio or checkbox must not flip: React controls `checked`, so ignoring onChange is enough
        {...props}
      />
      <span className="faun-tile-indicator" aria-hidden="true">{type === "checkbox" ? <IconCheck /> : <span className="faun-tile-dot" />}</span>
      <span className="faun-tile-body">{children}</span>
    </label>
  );
});

// ---- expandable ----

export interface ExpandableTileProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "onChange"> {
  /** Always visible. Names the toggle, so make it a short title with an optional line. Keep to text and inline elements: it sits inside a button. */
  summary: ReactNode;
  /** Revealed when open. */
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

/** A tile with an always-visible summary and detail that opens in place. The whole summary is the toggle. */
export const ExpandableTile = forwardRef<HTMLDivElement, ExpandableTileProps>(function ExpandableTile(
  { summary, children, open, defaultOpen = false, onOpenChange, disabled, className, ...props },
  ref,
) {
  const [isOpen, setOpen] = useControllableState<boolean>({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const uid = useId();
  const contentId = `${uid}-content`;
  return (
    <div ref={ref} className={cx("faun-tile", className)} data-kind="expandable" data-state={isOpen ? "open" : "closed"} data-disabled={disabled ? "" : undefined} {...props}>
      <button id={`${uid}-trigger`} type="button" className="faun-tile-trigger" aria-expanded={isOpen} aria-controls={contentId} disabled={disabled} onClick={() => setOpen(!isOpen)}>
        <span className="faun-tile-body">{summary}</span>
        <span className="faun-tile-chevron" aria-hidden="true"><IconChevronDown /></span>
      </button>
      <div id={contentId} role="region" aria-labelledby={`${uid}-trigger`} className="faun-tile-content" data-state={isOpen ? "open" : "closed"}>
        <div className="faun-tile-content-inner">{children}</div>
      </div>
    </div>
  );
});
