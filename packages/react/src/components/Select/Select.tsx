import * as RS from "@radix-ui/react-select";
import { IconCheck, IconChevronDown, IconChevronUp } from "@faun-ds/icons";
import { forwardRef, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import type { Size } from "../../utils/types.js";
import { useFieldControl, type ControlStateProps } from "../Field/Field.js";
import { groupOptions, type ListOption } from "../Listbox/listbox.js";

export type SelectOption = ListOption;

export interface SelectProps extends ControlStateProps {
  /** Options. Use `group` on options to render headed groups. For custom content, pass `children` with SelectItem instead. */
  options?: SelectOption[];
  children?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  size?: Size;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  /** Leading icon in the trigger. */
  icon?: ReactNode;
  /** Accessible name when not inside a Field. */
  "aria-label"?: string;
  "aria-describedby"?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Width of the trigger. Default fills the container. */
  className?: string;
  /** Class for the dropdown panel. */
  contentClassName?: string;
}

/** Picks one value from a list of up to ~15 known options. For longer or searchable lists, use Combobox. */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  { options, children, value, defaultValue, onValueChange, placeholder = "Select", size = "md", invalid, warn, skeleton, readOnly, disabled, required, name, id, icon, open, onOpenChange, className, contentClassName, ...aria },
  ref,
) {
  const { invalid: isInvalid, state, ...control } = useFieldControl({ id, disabled, required, "aria-invalid": invalid || undefined, ...aria }, { warn, readOnly, skeleton });
  return (
    <RS.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={control.disabled} required={required} name={name} open={state.readOnly ? false : open} onOpenChange={state.readOnly ? undefined : onOpenChange}>
      <RS.Trigger
        ref={ref}
        id={control.id}
        aria-label={aria["aria-label"]}
        aria-describedby={control["aria-describedby"]}
        aria-invalid={isInvalid || undefined}
        aria-readonly={state.readOnly || undefined}
        aria-busy={state.skeleton || undefined}
        aria-required={("aria-required" in control ? control["aria-required"] : required || undefined)}
        className={cx("faun-field-trigger", "faun-select-trigger", className)}
        data-size={size}
        {...state.attrs}
      >
        {icon ? <span className="faun-field-trigger-icon" aria-hidden="true">{icon}</span> : null}
        <span className="faun-field-trigger-value"><RS.Value placeholder={<span data-placeholder="">{placeholder}</span>} /></span>
        <RS.Icon className="faun-field-trigger-icon"><IconChevronDown /></RS.Icon>
      </RS.Trigger>
      <RS.Portal>
        <RS.Content className={cx("faun-listbox-panel", "faun-select-content", contentClassName)} position="popper" sideOffset={6} collisionPadding={8}>
          <RS.ScrollUpButton className="faun-select-scroll"><IconChevronUp /></RS.ScrollUpButton>
          <RS.Viewport className="faun-listbox-list">
            {children ?? groupOptions(options ?? []).map(([group, list], gi) => (
              group ? (
                <RS.Group key={group}>
                  {gi > 0 ? <RS.Separator className="faun-listbox-separator" /> : null}
                  <RS.Label className="faun-listbox-group-label">{group}</RS.Label>
                  {list.map((o) => <SelectItem key={o.value} {...o} />)}
                </RS.Group>
              ) : list.map((o) => <SelectItem key={o.value} {...o} />)
            ))}
          </RS.Viewport>
          <RS.ScrollDownButton className="faun-select-scroll"><IconChevronDown /></RS.ScrollDownButton>
        </RS.Content>
      </RS.Portal>
    </RS.Root>
  );
});

export interface SelectItemProps extends Omit<SelectOption, "group" | "keywords"> {
  className?: string;
}

/** One option. Use inside Select when composing children by hand. */
export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(function SelectItem({ value, label, description, icon, disabled, className }, ref) {
  return (
    <RS.Item ref={ref} value={value} disabled={disabled} className={cx("faun-listbox-option", className)} textValue={label}>
      {icon ? <span className="faun-listbox-option-icon" aria-hidden="true">{icon}</span> : null}
      <span className="faun-listbox-option-text">
        <RS.ItemText><span className="faun-listbox-option-label">{label}</span></RS.ItemText>
        {description ? <span className="faun-listbox-option-desc">{description}</span> : null}
      </span>
      <RS.ItemIndicator className="faun-listbox-option-check"><IconCheck /></RS.ItemIndicator>
    </RS.Item>
  );
});

export const SelectGroup = RS.Group;
export function SelectLabel({ children }: { children: ReactNode }) { return <RS.Label className="faun-listbox-group-label">{children}</RS.Label>; }
export function SelectSeparator() { return <RS.Separator className="faun-listbox-separator" />; }
