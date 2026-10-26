import { IconEye, IconEyeOff } from "@faun-ds/icons";
import { forwardRef, useEffect, useId, useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import type { Size } from "../../utils/types.js";
import { Field, useFieldControl, type ControlStateProps, type FieldProps } from "../Field/Field.js";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix">, ControlStateProps {
  size?: Size;
  /** Content before the value: an icon, a currency or a unit. */
  prefix?: ReactNode;
  /** Content after the value: a unit such as "tCO₂e", a status icon, or an action. */
  suffix?: ReactNode;
  /** Marks the value invalid. Inside a Field, the Field's `error` sets this. */
  invalid?: boolean;
  /** Right-align and use tabular figures, for numbers that line up. */
  numeric?: boolean;
  /** Show "12 / 40" inside the box. Needs `maxLength` to show the limit. The browser still enforces the limit. */
  showCount?: boolean;
  /**
   * With `type="password"`, show a button that reveals the value. Default true.
   * Turn off only where revealing is unsafe (a shared screen, a kiosk).
   */
  passwordToggle?: boolean;
  /** Accessible name of the reveal button while the value is hidden. Default "Show password". */
  showPasswordLabel?: string;
  /** Accessible name of the reveal button while the value is visible. Default "Hide password". */
  hidePasswordLabel?: string;
  /** Class for the outer wrapper (the visible box). */
  wrapperClassName?: string;
}

/** A single-line text input with optional prefix and suffix. Wires itself to a surrounding Field. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = "md", prefix, suffix, invalid, warn, skeleton, numeric, showCount, passwordToggle = true, showPasswordLabel = "Show password", hidePasswordLabel = "Hide password",
    className, wrapperClassName, disabled, readOnly, type, maxLength, value, defaultValue, onChange, ...rest
  },
  ref,
) {
  const { invalid: _invalid, state, ...props } = useFieldControl({ ...rest, disabled, "aria-invalid": invalid || undefined }, { warn, readOnly, skeleton });
  const [revealed, setRevealed] = useState(false);
  const [count, setCount] = useState(() => String(value ?? defaultValue ?? "").length);
  const autoId = useId();
  const countId = showCount ? `${props.id ?? autoId}-count` : undefined;
  useEffect(() => { if (value !== undefined) setCount(String(value).length); }, [value]);
  const near = !!maxLength && count >= maxLength * 0.9;
  const isPassword = type === "password";
  const toggle = isPassword && passwordToggle && !state.skeleton;
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => { setCount(e.target.value.length); onChange?.(e); };
  return (
    <div
      className={cx("faun-input", wrapperClassName)}
      data-size={size}
      {...state.attrs}
      data-disabled={props.disabled && !state.skeleton ? "" : undefined}
      data-numeric={numeric ? "" : undefined}
    >
      {prefix ? <span className="faun-input-affix" data-side="prefix">{prefix}</span> : null}
      <input
        ref={ref}
        className={cx("faun-input-control", className)}
        readOnly={state.readOnly}
        type={isPassword && revealed && toggle ? "text" : type}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        {...props}
        aria-describedby={[props["aria-describedby"], countId].filter(Boolean).join(" ") || undefined}
      />
      {suffix ? <span className="faun-input-affix" data-side="suffix">{suffix}</span> : null}
      {showCount ? (
        <span className="faun-input-count" data-over={maxLength && count >= maxLength ? "" : undefined}>
          <span id={countId}>{maxLength ? `${count.toLocaleString()} / ${maxLength.toLocaleString()}` : count.toLocaleString()}<span className="faun-visually-hidden"> characters</span></span>
          <span className="faun-visually-hidden" aria-live="polite">{near && maxLength ? `${Math.max(0, maxLength - count)} characters left` : ""}</span>
        </span>
      ) : null}
      {toggle ? (
        <button
          type="button"
          className="faun-input-action"
          aria-label={revealed ? hidePasswordLabel : showPasswordLabel}
          disabled={props.disabled}
          onClick={() => setRevealed((r) => !r)}
        >
          {revealed ? <IconEyeOff /> : <IconEye />}
        </button>
      ) : null}
    </div>
  );
});

export interface PasswordInputProps extends Omit<InputProps, "type" | "prefix" | "numeric"> {}

/** A password box with a reveal button. Same as `<Input type="password" />`, with autocomplete defaulted for sign-in. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput({ autoComplete = "current-password", ...props }, ref) {
  return <Input ref={ref} type="password" autoComplete={autoComplete} {...props} />;
});

export interface TextFieldProps extends Omit<InputProps, "warn">, Pick<FieldProps, "label" | "description" | "error" | "warn" | "optional" | "hideLabel" | "labelAction" | "variant"> {}

/** Field + Input in one: the everyday labelled text box. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, description, error, warn, readOnly, skeleton, optional, hideLabel, labelAction, variant, required, disabled, id, ...props },
  ref,
) {
  return (
    <Field label={label} description={description} error={error} warn={warn} readOnly={readOnly} skeleton={skeleton} optional={optional} hideLabel={hideLabel} labelAction={labelAction} variant={variant} required={required} disabled={disabled} controlId={id}>
      <Input ref={ref} required={required} {...props} />
    </Field>
  );
});
