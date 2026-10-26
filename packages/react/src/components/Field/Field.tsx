import * as RL from "@radix-ui/react-label";
import { IconStatusDanger, IconStatusWarning } from "@faun-ds/icons";
import { createContext, forwardRef, useContext, useId, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";

type FieldContextValue = {
  id: string;
  labelId: string;
  descriptionId?: string;
  errorId?: string;
  warnId?: string;
  invalid: boolean;
  warn: boolean;
  readOnly: boolean;
  skeleton: boolean;
  required: boolean;
  disabled: boolean;
};
const FieldContext = createContext<FieldContextValue | null>(null);

/** State flags every form control understands. Inside a Field they come from the Field; a control can also set them itself. */
export interface ControlStateProps {
  /** Marks the value as risky but acceptable. Distinct from `invalid`: it never blocks submission. Pair with a Field `warn` message so the state is not colour alone. */
  warn?: boolean;
  /** The value is visible, focusable and copyable, but cannot be changed. */
  readOnly?: boolean;
  /** Replaces the control with a loading placeholder while its data loads. */
  skeleton?: boolean;
}

/** Resolved control state: one object, one set of `data-*` attributes, the same styling hooks on every control. */
export interface ControlState {
  invalid: boolean;
  /** True only when `warn` is set and the control is not invalid (an error always wins over a warning). */
  warn: boolean;
  readOnly: boolean;
  skeleton: boolean;
  /** Spread onto the element that draws the control box. */
  attrs: { "data-invalid"?: ""; "data-warn"?: ""; "data-readonly"?: ""; "data-skeleton"?: "" };
}

/** Builds a ControlState from resolved booleans. Used by controls that do not call `useFieldControl` (groups). */
export function resolveControlState(s: { invalid?: boolean; warn?: boolean; readOnly?: boolean; skeleton?: boolean }): ControlState {
  const invalid = !!s.invalid;
  const warn = !!s.warn && !invalid;
  const readOnly = !!s.readOnly;
  const skeleton = !!s.skeleton;
  return {
    invalid, warn, readOnly, skeleton,
    attrs: { "data-invalid": invalid ? "" : undefined, "data-warn": warn ? "" : undefined, "data-readonly": readOnly ? "" : undefined, "data-skeleton": skeleton ? "" : undefined },
  };
}

/**
 * Props a form control spreads to wire itself to the surrounding Field: id, aria-describedby,
 * aria-invalid, aria-required, disabled. Also returns `state` (invalid, warn, read-only, skeleton) merged from the
 * Field and the control's own flags. Safe to call outside a Field (returns the overrides unchanged).
 * Destructure `invalid` and `state` before spreading the rest onto a DOM element.
 */
export function useFieldControl<T extends { id?: string; "aria-describedby"?: string; disabled?: boolean; required?: boolean; "aria-invalid"?: boolean | "true" | "false" }>(own: T, flags: ControlStateProps = {}) {
  const f = useContext(FieldContext);
  if (!f) {
    const state = resolveControlState({ invalid: own["aria-invalid"] === true || own["aria-invalid"] === "true", ...flags });
    return { ...own, disabled: own.disabled || state.skeleton || undefined, "aria-busy": state.skeleton || undefined, invalid: state.invalid, state };
  }
  const describedBy = [own["aria-describedby"], f.descriptionId, f.errorId, f.warnId].filter(Boolean).join(" ") || undefined;
  const state = resolveControlState({ invalid: f.invalid || own["aria-invalid"] === true || own["aria-invalid"] === "true", warn: f.warn || flags.warn, readOnly: flags.readOnly ?? f.readOnly, skeleton: flags.skeleton ?? f.skeleton });
  return {
    ...own,
    id: own.id ?? f.id,
    "aria-describedby": describedBy,
    "aria-invalid": state.invalid ? (true as const) : undefined,
    "aria-required": f.required || own.required ? (true as const) : undefined,
    "aria-busy": state.skeleton || undefined,
    disabled: (own.disabled ?? f.disabled) || state.skeleton || undefined,
    invalid: state.invalid,
    state,
  };
}
export const useField = () => useContext(FieldContext);

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Visible label. Always provide one; use `hideLabel` only when the purpose is obvious from context. */
  label: ReactNode;
  /** Help text under the control. */
  description?: ReactNode;
  /** Error message. Presence marks the control invalid. Say what is wrong and how to fix it. */
  error?: ReactNode;
  /** Warning message: the value is allowed but worth a second look ("Outside the usual range for this site"). Shown with an icon. An `error` replaces it. */
  warn?: ReactNode;
  /**
   * `default` stacks the label above the control. `inline` puts the label to the left (stacks below 640px).
   * `fluid` moves the label inside a taller box, for dense forms; works with Input, Textarea and the select family.
   */
  variant?: "default" | "inline" | "fluid";
  /** Every control inside shows its value but cannot change it. */
  readOnly?: boolean;
  /** Every control inside shows a loading placeholder. The label stays for screen readers; messages are hidden. */
  skeleton?: boolean;
  required?: boolean;
  /** Marks the field "Optional" when most fields in a form are required. */
  optional?: boolean;
  disabled?: boolean;
  /** Visually hide the label (it stays available to screen readers). */
  hideLabel?: boolean;
  /** Content aligned to the end of the label row, e.g. a "Learn more" link or a character count. */
  labelAction?: ReactNode;
  /** Explicit id for the control. Generated if omitted. */
  controlId?: string;
  children: ReactNode;
}

/** Label, help text and validation for one form control. Wires ids and ARIA automatically. */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { label, description, error, warn, variant = "default", readOnly = false, skeleton = false, required = false, optional, disabled = false, hideLabel, labelAction, controlId, className, children, ...props },
  ref,
) {
  const auto = useId();
  const id = controlId ?? `faun-field-${auto}`;
  const showError = !!error && !skeleton;
  const showWarn = !!warn && !error && !skeleton;
  const descriptionId = description && !skeleton ? `${id}-description` : undefined;
  const errorId = showError ? `${id}-error` : undefined;
  const warnId = showWarn ? `${id}-warn` : undefined;
  const ctx: FieldContextValue = { id, labelId: `${id}-label`, descriptionId, errorId, warnId, invalid: !!error, warn: !!warn && !error, readOnly, skeleton, required, disabled };
  return (
    <FieldContext.Provider value={ctx}>
      <div ref={ref} className={cx("faun-field", className)} data-invalid={error ? "" : undefined} data-warn={showWarn ? "" : undefined} data-variant={variant === "default" ? undefined : variant} data-readonly={readOnly ? "" : undefined} data-skeleton={skeleton ? "" : undefined} data-disabled={disabled ? "" : undefined} aria-busy={skeleton || undefined} {...props}>
        <div className={cx("faun-field-label-row", hideLabel && "faun-visually-hidden")}>
          <RL.Root id={ctx.labelId} htmlFor={id} className="faun-field-label">
            {label}
            {required ? <span className="faun-field-required" aria-hidden="true">*</span> : null}
            {optional && !required ? <span className="faun-field-optional">Optional</span> : null}
          </RL.Root>
          {labelAction ? <span className="faun-field-label-action">{labelAction}</span> : null}
        </div>
        {children}
        {description && !skeleton ? <p id={descriptionId} className="faun-field-description">{description}</p> : null}
        {showError ? <FieldMessage tone="danger" id={errorId}>{error}</FieldMessage> : null}
        {showWarn ? <FieldMessage tone="warning" id={warnId}>{warn}</FieldMessage> : null}
      </div>
    </FieldContext.Provider>
  );
});

export interface FieldMessageProps {
  /** `danger` for an error (announced assertively), `warning` for a warning (announced politely). */
  tone: "danger" | "warning";
  id?: string;
  children: ReactNode;
}

/** The icon-plus-text message under a control. Status is never colour alone. Used by Field and by the group controls. */
export function FieldMessage({ tone, id, children }: FieldMessageProps) {
  const Icon = tone === "danger" ? IconStatusDanger : IconStatusWarning;
  return (
    <p id={id} className={tone === "danger" ? "faun-field-error" : "faun-field-warn"} role={tone === "danger" ? "alert" : "status"}>
      <Icon size="sm" />
      <span>{children}</span>
    </p>
  );
}

export interface FieldsetProps extends HTMLAttributes<HTMLFieldSetElement> {
  legend: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

/** Groups related fields (an address, a date range, a set of checkboxes) under one legend. */
export const Fieldset = forwardRef<HTMLFieldSetElement, FieldsetProps>(function Fieldset({ legend, description, className, children, ...props }, ref) {
  const id = useId();
  return (
    <fieldset ref={ref} className={cx("faun-fieldset", className)} aria-describedby={description ? `${id}-d` : undefined} {...props}>
      <legend className="faun-fieldset-legend">{legend}</legend>
      {description ? <p id={`${id}-d`} className="faun-field-description">{description}</p> : null}
      <div className="faun-fieldset-body">{children}</div>
    </fieldset>
  );
});
