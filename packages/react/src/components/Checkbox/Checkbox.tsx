import * as RC from "@radix-ui/react-checkbox";
import { IconCheck, IconMinus } from "@faun-ds/icons";
import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { useControllableState } from "../../utils/use-controllable-state.js";
import { FieldMessage, resolveControlState, useFieldControl, type ControlStateProps } from "../Field/Field.js";

export type CheckedState = boolean | "indeterminate";

export interface CheckboxProps extends Omit<ComponentPropsWithoutRef<typeof RC.Root>, "children">, ControlStateProps {
  /** Visible label next to the box. Omit only when the box sits inside a labelled Field or table row with an aria-label. */
  label?: ReactNode;
  /** Help text under the label. */
  description?: ReactNode;
  /** Marks the box invalid. */
  invalid?: boolean;
  size?: "sm" | "md";
}

/** A box for one yes/no choice, or for selecting items in a list. Supports an indeterminate state for "some selected". */
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { label, description, invalid, warn, readOnly, skeleton, size = "md", className, id, onClick, ...rest },
  ref,
) {
  const auto = useId();
  const { invalid: _invalid, state, ...props } = useFieldControl({ ...rest, id, "aria-invalid": invalid || undefined }, { warn, readOnly, skeleton });
  const controlId = props.id ?? `faun-checkbox-${auto}`;
  const descId = description ? `${controlId}-desc` : undefined;
  const describedBy = [props["aria-describedby"], descId].filter(Boolean).join(" ") || undefined;
  const box = (
    <RC.Root
      ref={ref}
      {...props}
      id={controlId}
      aria-describedby={describedBy}
      aria-readonly={state.readOnly || undefined}
      className={cx("faun-checkbox", !label && className)}
      data-size={size}
      {...state.attrs}
      onClick={(e) => { if (state.readOnly) e.preventDefault(); onClick?.(e); }}
    >
      <RC.Indicator className="faun-checkbox-indicator" forceMount>
        <IconCheck className="faun-checkbox-check" />
        <IconMinus className="faun-checkbox-dash" />
      </RC.Indicator>
    </RC.Root>
  );
  if (!label) return box;
  return (
    <div className={cx("faun-checkbox-row", className)} data-disabled={props.disabled && !state.skeleton ? "" : undefined} data-skeleton={state.skeleton ? "" : undefined} data-readonly={state.readOnly ? "" : undefined} data-size={size}>
      {box}
      <div className="faun-checkbox-text">
        <label htmlFor={controlId} className="faun-checkbox-label">{label}</label>
        {description ? <p id={descId} className="faun-checkbox-description">{description}</p> : null}
      </div>
    </div>
  );
});

export interface CheckboxOption { value: string; label: ReactNode; description?: ReactNode; disabled?: boolean }

export interface CheckboxGroupProps {
  /** Group label, rendered as the fieldset legend. */
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  /** Warning message: allowed, but worth a second look. Shown with an icon; an `error` replaces it. */
  warn?: ReactNode;
  /** Show the selection but do not let it change. */
  readOnly?: boolean;
  /** Show a loading placeholder instead of the options. */
  skeleton?: boolean;
  options: CheckboxOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  orientation?: "vertical" | "horizontal";
  disabled?: boolean;
  required?: boolean;
  /** Adds a "Select all" checkbox with an indeterminate state. */
  selectAll?: boolean | string;
  className?: string;
}

/** Several related checkboxes under one label, e.g. the frameworks an agent supports. */
export const CheckboxGroup = forwardRef<HTMLFieldSetElement, CheckboxGroupProps>(function CheckboxGroup(
  { label, description, error, warn, readOnly, skeleton, options, value, defaultValue = [], onValueChange, orientation = "vertical", disabled, required, selectAll, className },
  ref,
) {
  const id = useId();
  const [selected, setSelected] = useControllableState<string[]>({ value, defaultValue, onChange: onValueChange });
  const enabled = options.filter((o) => !o.disabled).map((o) => o.value);
  const allOn = enabled.length > 0 && enabled.every((v) => selected.includes(v));
  const someOn = enabled.some((v) => selected.includes(v));
  const toggle = (v: string, on: boolean) => setSelected(on ? [...selected, v] : selected.filter((x) => x !== v));
  const showWarn = !!warn && !error && !skeleton;
  const showError = !!error && !skeleton;
  const state = resolveControlState({ invalid: !!error, warn: !!warn, readOnly, skeleton });
  const descIds = [description && !skeleton ? `${id}-d` : null, showError ? `${id}-e` : null, showWarn ? `${id}-w` : null].filter(Boolean).join(" ") || undefined;
  return (
    <fieldset ref={ref} className={cx("faun-choice-group", className)} disabled={disabled || skeleton} aria-describedby={descIds} aria-invalid={error ? true : undefined} aria-required={required || undefined} aria-busy={skeleton || undefined} {...state.attrs}>
      <legend className="faun-choice-group-legend">{label}{required ? <span className="faun-field-required" aria-hidden="true">*</span> : null}</legend>
      {description && !skeleton ? <p id={`${id}-d`} className="faun-field-description">{description}</p> : null}
      <div className="faun-choice-group-items" data-orientation={orientation}>
        {selectAll ? (
          <Checkbox
            label={typeof selectAll === "string" ? selectAll : "Select all"}
            checked={allOn ? true : someOn ? "indeterminate" : false}
            onCheckedChange={(c) => setSelected(c === true ? Array.from(new Set([...selected, ...enabled])) : selected.filter((v) => !enabled.includes(v)))}
            className="faun-choice-group-all"
            readOnly={readOnly}
            skeleton={skeleton}
          />
        ) : null}
        {options.map((o) => (
          <Checkbox key={o.value} label={o.label} description={o.description} disabled={o.disabled} value={o.value} invalid={!!error} warn={!!warn} readOnly={readOnly} skeleton={skeleton} checked={selected.includes(o.value)} onCheckedChange={(c) => toggle(o.value, c === true)} />
        ))}
      </div>
      {showError ? <FieldMessage tone="danger" id={`${id}-e`}>{error}</FieldMessage> : null}
      {showWarn ? <FieldMessage tone="warning" id={`${id}-w`}>{warn}</FieldMessage> : null}
    </fieldset>
  );
});
