import { IconAdd, IconFilter } from "@faun-ds/icons";
import {
  Button, cx, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
  Tag, useControllableState, VisuallyHidden,
} from "@faun-ds/react";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  /** Stable id, for example `"scope"`. */
  id: string;
  /** Name shown in the menu and on the chip, for example "Scope". */
  label: string;
  /** Values people can pick. Several values of one field match as "any of". */
  options: FilterOption[];
  icon?: ReactNode;
}

/** One applied filter: a value of a field. */
export interface FilterValue {
  field: string;
  value: string;
}

export interface FilterBarProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  fields: FilterField[];
  /** Applied filters (controlled). */
  value?: FilterValue[];
  defaultValue?: FilterValue[];
  onValueChange?: (value: FilterValue[]) => void;
  /** Accessible name of the group. Default "Filters". */
  label?: string;
  /** Label of the add button. Default "Add filter". */
  addLabel?: string;
  /** Extra controls placed after the chips, for example a SearchField or sort. */
  children?: ReactNode;
}

const same = (a: FilterValue, b: FilterValue) => a.field === b.field && a.value === b.value;

/** The applied filters as removable chips, an Add filter menu and Clear all. Sits above a table or list. */
export const FilterBar = forwardRef<HTMLDivElement, FilterBarProps>(function FilterBar(
  { fields, value, defaultValue = [], onValueChange, label = "Filters", addLabel = "Add filter", className, children, ...props },
  ref,
) {
  const [applied, setApplied] = useControllableState<FilterValue[]>({ value, defaultValue, onChange: onValueChange });
  const toggle = (f: FilterValue, on: boolean) => setApplied(on ? [...applied, f] : applied.filter((x) => !same(x, f)));
  const chips = applied
    .map((a) => {
      const field = fields.find((f) => f.id === a.field);
      const option = field?.options.find((o) => o.value === a.value);
      return field && option ? { applied: a, field, option } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <div ref={ref} role="group" aria-label={label} className={cx("faun-filter-bar", className)} {...props}>
      {chips.length > 0 ? (
      <ul className="faun-filter-bar-chips">
        {chips.map(({ applied: a, field, option }) => (
          <li key={`${a.field}:${a.value}`}>
            <Tag icon={field.icon} onRemove={() => toggle(a, false)} removeLabel={`Remove filter ${field.label}: ${option.label}`}>
              <span className="faun-filter-bar-field">{field.label}:</span> {option.label}
            </Tag>
          </li>
        ))}
      </ul>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" leadingIcon={chips.length ? <IconAdd /> : <IconFilter />}>{addLabel}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent aria-label={addLabel}>
          {fields.map((f) => (
            <DropdownMenuSub key={f.id}>
              <DropdownMenuSubTrigger icon={f.icon}>{f.label}</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {f.options.map((o) => {
                  const item = { field: f.id, value: o.value };
                  return (
                    <DropdownMenuCheckboxItem key={o.value} checked={applied.some((a) => same(a, item))} onCheckedChange={(on) => toggle(item, on === true)}>
                      {o.label}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {chips.length > 0 ? <Button size="sm" variant="ghost" onClick={() => setApplied([])}>Clear all</Button> : null}
      {children ? <div className="faun-filter-bar-extra">{children}</div> : null}
      <VisuallyHidden role="status">{chips.length === 0 ? "No filters applied" : `${chips.length} ${chips.length === 1 ? "filter" : "filters"} applied`}</VisuallyHidden>
    </div>
  );
});
