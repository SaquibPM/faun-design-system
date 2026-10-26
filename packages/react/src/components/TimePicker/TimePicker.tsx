import { IconClock, IconStatusDanger } from "@faun-ds/icons";
import { forwardRef, useEffect, useId, useMemo, useState, type KeyboardEvent } from "react";
import { cx } from "../../utils/cx.js";
import type { Size } from "../../utils/types.js";
import { useControllableState } from "../../utils/use-controllable-state.js";
import { VisuallyHidden } from "../../utils/visually-hidden.js";
import { useField, useFieldControl, type ControlStateProps } from "../Field/Field.js";
import { checkTime, from24, maskTime, to24, toText, type TimePeriod, type TimeStatus } from "./timeText.js";

export interface TimeValidation { status: TimeStatus; message?: string }

export interface TimePickerProps extends ControlStateProps {
  /** Time as 24 hour "HH:mm", whatever the field shows, or `null`. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** `24` (default) shows hh:mm. `12` shows hh:mm with an AM/PM choice. */
  hourCycle?: 12 | 24;
  /** Minutes between allowed times (default 1). Arrow Up and Down move by this much, and a time off the grid is flagged. Use 5, 15 or 30 for slots. */
  step?: number;
  /** Earliest time, "HH:mm". Steps count from here. */
  min?: string;
  /** Latest time, "HH:mm". */
  max?: string;
  placeholder?: string;
  size?: Size;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  /** Called when the status of what is typed changes, with a message in words for problems. The picker also shows that message under the field. */
  onValidate?: (result: TimeValidation) => void;
  className?: string;
}

/**
 * Types a time of day: a masked hh:mm field with optional AM/PM, steps and limits. Arrow Up and Down change the time by one step.
 * The value is always 24 hour "HH:mm", so the display setting never changes what you store.
 */
export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(
  { value, defaultValue = null, onValueChange, hourCycle = 24, step = 1, min, max, placeholder, size = "md", invalid, warn, skeleton, readOnly, disabled, required, id, className, onValidate, ...aria },
  ref,
) {
  const h12 = hourCycle === 12;
  const stepN = Math.max(1, Math.round(step));
  const [val, setVal] = useControllableState<string | null>({ value, defaultValue, onChange: onValueChange });
  const initial = from24(val);
  const [text, setText] = useState(() => (initial != null ? toText(initial, h12).text : ""));
  const [period, setPeriod] = useState<TimePeriod>(() => (initial != null ? toText(initial, h12).period : "AM"));
  const [touched, setTouched] = useState(false);
  const msgId = useId();
  const hintId = useId();
  const field = useField();
  const { invalid: fieldInvalid, state, ...control } = useFieldControl({ id, disabled, required, "aria-invalid": invalid || undefined, "aria-describedby": aria["aria-describedby"] }, { warn, readOnly, skeleton });
  const inert = !!control.disabled || state.readOnly;
  const lim = useMemo(() => ({ h12, step: stepN, min: from24(min), max: from24(max) }), [h12, stepN, min, max]);
  const result = checkTime(text, period, lim);
  const problem = result.status === "incomplete" ? (touched ? `Enter the full time as hh:mm${h12 ? " and choose AM or PM" : ""}.` : undefined) : result.message;
  const isInvalid = fieldInvalid || !!problem;

  // An outside change to the value replaces the text; the text we typed ourselves does not.
  useEffect(() => {
    const own = result.status === "valid" ? to24(result.minutes!) : null;
    if (val === own) return;
    const m = from24(val);
    if (m != null) { const t = toText(m, h12); setText(t.text); setPeriod(t.period); }
    else if (own) setText("");
  }, [val, h12]);
  useEffect(() => { onValidate?.({ status: result.status, message: problem }); }, [result.status, problem]);

  const commit = (t: string, p: TimePeriod) => {
    const r = checkTime(t, p, lim);
    if (r.status === "valid") { const next = to24(r.minutes!); if (next !== val) setVal(next); }
    else if (val !== null) setVal(null);
  };
  const type = (raw: string) => { const t = maskTime(raw, h12); setText(t); commit(t, period); };
  const choosePeriod = (p: TimePeriod) => { setPeriod(p); commit(text, p); };
  const setMinutes = (mins: number) => { const t = toText(mins, h12); setText(t.text); setPeriod(t.period); setVal(to24(mins)); };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (inert) return;
    if (h12 && /^[ap]$/i.test(e.key) && !e.ctrlKey && !e.metaKey) { e.preventDefault(); choosePeriod(e.key.toLowerCase() === "a" ? "AM" : "PM"); return; }
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const dir = e.key === "ArrowUp" ? 1 : -1;
    const lo = lim.min ?? 0;
    const hi = lim.max ?? 24 * 60 - 1;
    const cur = result.minutes ?? null;
    let next: number;
    if (cur == null) next = dir === 1 ? lo : Math.floor((hi - lo) / stepN) * stepN + lo;
    else {
      const onGrid = (cur - lo) % stepN === 0;
      next = dir === 1 ? (onGrid ? cur + stepN : lo + Math.ceil((cur - lo) / stepN) * stepN) : (onGrid ? cur - stepN : lo + Math.floor((cur - lo) / stepN) * stepN);
      if (next > hi) next = lo; // wrap, so the keys never dead-end
      if (next < lo) next = lo + Math.floor((hi - lo) / stepN) * stepN;
    }
    setMinutes(next);
  };
  const label = aria["aria-label"] ?? "Time";
  return (
    <div className={cx("faun-time-wrap", className)}>
      <div className="faun-input faun-time-input" data-size={size} data-disabled={control.disabled && !state.skeleton ? "" : undefined} {...state.attrs} data-invalid={isInvalid ? "" : undefined}>
        <span className="faun-input-affix" aria-hidden="true"><IconClock /></span>
        <input
          ref={ref}
          id={control.id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className="faun-input-control"
          placeholder={placeholder ?? "hh:mm"}
          maxLength={5}
          value={text}
          onChange={(e) => type(e.target.value)}
          onBlur={() => setTouched(true)}
          onKeyDown={onKeyDown}
          disabled={control.disabled}
          readOnly={state.readOnly}
          aria-readonly={state.readOnly || undefined}
          aria-label={field ? undefined : label}
          aria-invalid={isInvalid || undefined}
          aria-required={"aria-required" in control ? control["aria-required"] : required || undefined}
          aria-busy={state.skeleton || undefined}
          aria-describedby={[control["aria-describedby"], hintId, problem ? msgId : undefined].filter(Boolean).join(" ")}
        />
        <VisuallyHidden id={hintId}>
          Format hh:mm{h12 ? ", then AM or PM. Press A or P to switch" : ""}. Arrow up and down change the time{stepN > 1 ? ` by ${stepN} minutes` : ""}.
        </VisuallyHidden>
        {h12 ? (
          <select className="faun-time-period" aria-label="AM or PM" value={period} disabled={control.disabled} onChange={(e) => choosePeriod(e.target.value as TimePeriod)} data-readonly={state.readOnly ? "" : undefined} aria-readonly={state.readOnly || undefined} tabIndex={state.readOnly ? -1 : undefined}>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        ) : null}
      </div>
      {problem ? <p id={msgId} className="faun-date-message" role="status"><IconStatusDanger aria-hidden="true" /><span>{problem}</span></p> : null}
    </div>
  );
});
