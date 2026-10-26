import { IconChevronDown, IconChevronUp } from "@faun-ds/icons";
import { forwardRef, useEffect, useMemo, useRef, useState, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { useComposedRefs } from "../../utils/compose-refs.js";
import type { Size } from "../../utils/types.js";
import { useControllableState } from "../../utils/use-controllable-state.js";
import { useFieldControl, type ControlStateProps } from "../Field/Field.js";

export interface NumberFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size" | "prefix" | "min" | "max" | "step" | "type">, ControlStateProps {
  /** The number, or null when empty. */
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Arrow keys and steppers move by this. Shift multiplies by 10. Default 1. */
  step?: number;
  /** Unit after the value, e.g. "tCO₂e", "kWh", "%". */
  unit?: ReactNode;
  /** Content before the value, e.g. "€". */
  prefix?: ReactNode;
  /** Show increment and decrement buttons. */
  stepper?: boolean;
  /** Locale for display formatting on blur. Defaults to the browser locale. */
  locale?: string;
  /** Intl.NumberFormat options for display, e.g. { maximumFractionDigits: 2 }. */
  formatOptions?: Intl.NumberFormatOptions;
  size?: Size;
  invalid?: boolean;
  wrapperClassName?: string;
}

const clamp = (n: number, min?: number, max?: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
const decimals = (n: number) => (String(n).split(".")[1] ?? "").length;

/** Numbers with units: quantities, factors, percentages. Formats on blur, steps with arrow keys, clamps to min and max. */
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(function NumberField(
  { value, defaultValue = null, onValueChange, min, max, step = 1, unit, prefix, stepper, locale, formatOptions, size = "md", invalid, warn, skeleton, className, wrapperClassName, onBlur, onFocus, onKeyDown, disabled, readOnly, ...rest },
  forwarded,
) {
  const inner = useRef<HTMLInputElement>(null);
  const ref = useComposedRefs(forwarded, inner);
  const { invalid: _invalid, state, ...props } = useFieldControl({ ...rest, disabled, "aria-invalid": invalid || undefined }, { warn, readOnly, skeleton });
  const ro = state.readOnly;
  const [num, setNum] = useControllableState<number | null>({ value, defaultValue, onChange: onValueChange });
  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 6, ...formatOptions }), [locale, formatOptions]);
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(num == null ? "" : fmt.format(num));
  useEffect(() => { if (!focused) setText(num == null ? "" : fmt.format(num)); }, [num, focused, fmt]);

  // Parse using the locale's decimal and group separators.
  const parts = useMemo(() => fmt.formatToParts(12345.6), [fmt]);
  const group = parts.find((p) => p.type === "group")?.value ?? ",";
  const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";
  const parse = (s: string): number | null => {
    const t = s.trim().split(group).join("").replace(decimal, ".").replace(/[^\d.\-eE]/g, "");
    if (t === "" || t === "-" || t === ".") return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  };
  const commit = (n: number | null) => setNum(n == null ? null : clamp(n, min, max));
  const bump = (dir: 1 | -1, mult = 1) => {
    if (props.disabled || ro) return;
    const base = parse(text) ?? num ?? (dir > 0 ? (min ?? 0) - step : (max ?? 0) + step);
    const next = clamp(Number((base + dir * step * mult).toFixed(Math.max(decimals(step), decimals(base)))), min, max);
    setNum(next);
    setText(focused ? String(next).replace(".", decimal) : fmt.format(next));
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === "ArrowUp") { e.preventDefault(); bump(1, e.shiftKey ? 10 : 1); }
    else if (e.key === "ArrowDown") { e.preventDefault(); bump(-1, e.shiftKey ? 10 : 1); }
    else if (e.key === "PageUp") { e.preventDefault(); bump(1, 10); }
    else if (e.key === "PageDown") { e.preventDefault(); bump(-1, 10); }
    else if (e.key === "Home" && min != null) { e.preventDefault(); commit(min); setText(String(min)); }
    else if (e.key === "End" && max != null) { e.preventDefault(); commit(max); setText(String(max)); }
    else if (e.key === "Enter") commit(parse(text));
  };
  return (
    <div className={cx("faun-input", "faun-number-field", wrapperClassName)} data-size={size} {...state.attrs} data-disabled={props.disabled && !state.skeleton ? "" : undefined} data-numeric="" data-stepper={stepper ? "" : undefined}>
      {prefix ? <span className="faun-input-affix" data-side="prefix">{prefix}</span> : null}
      <input
        {...props}
        ref={ref}
        type="text"
        inputMode="decimal"
        role="spinbutton"
        autoComplete="off"
        aria-valuenow={num ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={num == null ? undefined : `${fmt.format(num)}${typeof unit === "string" ? ` ${unit}` : ""}`}
        className={cx("faun-input-control", className)}
        readOnly={ro}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={(e) => { setFocused(true); setText(num == null ? "" : String(num).replace(".", decimal)); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); const n = parse(text); commit(n); setText(n == null ? "" : fmt.format(clamp(n, min, max))); onBlur?.(e); }}
        onKeyDown={onKey}
      />
      {unit ? <span className="faun-input-affix" data-side="suffix">{unit}</span> : null}
      {stepper ? (
        <span className="faun-number-field-steppers">
          <button type="button" tabIndex={-1} aria-label="Increase" disabled={props.disabled || ro || (max != null && num != null && num >= max)} onClick={() => bump(1)} onMouseDown={(e) => e.preventDefault()}><IconChevronUp /></button>
          <button type="button" tabIndex={-1} aria-label="Decrease" disabled={props.disabled || ro || (min != null && num != null && num <= min)} onClick={() => bump(-1)} onMouseDown={(e) => e.preventDefault()}><IconChevronDown /></button>
        </span>
      ) : null}
    </div>
  );
});
