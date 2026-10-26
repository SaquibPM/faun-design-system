import * as RR from "@radix-ui/react-radio-group";
import { forwardRef, useId, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { FieldMessage, resolveControlState } from "../Field/Field.js";

export interface RadioOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  /** Leading icon or illustration (shown in the card variant). */
  icon?: ReactNode;
  /** Extra content aligned to the end of a card, e.g. a badge. */
  meta?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Group label. Required for accessibility; use `hideLabel` to hide it visually. */
  label: ReactNode;
  hideLabel?: boolean;
  description?: ReactNode;
  error?: ReactNode;
  /** Warning message: allowed, but worth a second look. Shown with an icon; an `error` replaces it. */
  warn?: ReactNode;
  /** Show the selection but do not let it change. */
  readOnly?: boolean;
  /** Show a loading placeholder instead of the options. */
  skeleton?: boolean;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** `default` is a compact list; `card` gives each option a bordered tile for rich choices. */
  variant?: "default" | "card";
  orientation?: "vertical" | "horizontal";
  /** Card variant: number of columns at wide widths. */
  columns?: 1 | 2 | 3;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  className?: string;
}

/** One choice from a short list (2–6 options) where every option should stay visible. */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { label, hideLabel, description, error, warn, readOnly, skeleton, options, value, defaultValue, onValueChange, variant = "default", orientation = "vertical", columns = 1, disabled, required, name, className },
  ref,
) {
  const id = useId();
  const labelId = `${id}-label`;
  const showWarn = !!warn && !error && !skeleton;
  const showError = !!error && !skeleton;
  const state = resolveControlState({ invalid: !!error, warn: !!warn, readOnly, skeleton });
  const describedBy = [description && !skeleton ? `${id}-d` : null, showError ? `${id}-e` : null, showWarn ? `${id}-w` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cx("faun-choice-group", className)} {...state.attrs}>
      <span id={labelId} className={cx("faun-choice-group-legend", hideLabel && "faun-visually-hidden")}>
        {label}{required ? <span className="faun-field-required" aria-hidden="true">*</span> : null}
      </span>
      {description && !skeleton ? <p id={`${id}-d`} className="faun-field-description">{description}</p> : null}
      <RR.Root
        ref={ref}
        className="faun-radio-group"
        data-variant={variant}
        data-columns={columns}
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-readonly={readOnly || undefined}
        aria-busy={skeleton || undefined}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        orientation={orientation}
        disabled={disabled || skeleton}
        required={required}
        name={name}
      >
        {options.map((o) => {
          const itemId = `${id}-${o.value}`;
          const descId = o.description ? `${itemId}-d` : undefined;
          return (
            <label key={o.value} className="faun-radio-option" htmlFor={itemId} data-disabled={o.disabled || disabled ? "" : undefined} data-skeleton={skeleton ? "" : undefined}>
              <RR.Item id={itemId} value={o.value} disabled={o.disabled} className="faun-radio" aria-labelledby={`${itemId}-l`} aria-describedby={descId} data-invalid={error ? "" : undefined} data-warn={state.warn ? "" : undefined} onClick={(e) => { if (readOnly) e.preventDefault(); }}>
                <RR.Indicator className="faun-radio-indicator" />
              </RR.Item>
              {variant === "card" && o.icon ? <span className="faun-radio-icon" aria-hidden="true">{o.icon}</span> : null}
              <span className="faun-radio-text">
                <span id={`${itemId}-l`} className="faun-radio-label">{o.label}</span>
                {o.description ? <span id={descId} className="faun-radio-description">{o.description}</span> : null}
              </span>
              {o.meta ? <span className="faun-radio-meta">{o.meta}</span> : null}
            </label>
          );
        })}
      </RR.Root>
      {showError ? <FieldMessage tone="danger" id={`${id}-e`}>{error}</FieldMessage> : null}
      {showWarn ? <FieldMessage tone="warning" id={`${id}-w`}>{warn}</FieldMessage> : null}
    </div>
  );
});
