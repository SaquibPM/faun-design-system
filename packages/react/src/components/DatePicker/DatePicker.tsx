import * as RP from "@radix-ui/react-popover";
import { IconCalendar, IconCalendarRange, IconClose } from "@faun-ds/icons";
import { format as formatFn, isSameDay, isAfter, startOfDay, type Locale } from "date-fns";
import { forwardRef, useId, useMemo, useState, type ReactNode, type Ref } from "react";
import type { DateRange, Matcher } from "react-day-picker";
import { cx } from "../../utils/cx.js";
import type { Size } from "../../utils/types.js";
import { useControllableState } from "../../utils/use-controllable-state.js";
import { useField, useFieldControl, type ControlStateProps } from "../Field/Field.js";
import { Calendar } from "./Calendar.js";
import type { DateValidation } from "./dateText.js";
import { defaultRangePresets, type DateRangePreset } from "./presets.js";
import { TypedDatePicker, TypedDateRangePicker } from "./TypedDate.js";

export type { DateRange };
export type { DateValidation };

interface SharedProps extends ControlStateProps {
  placeholder?: string;
  /**
   * How the value is shown on the button when `entry="button"`, as a date-fns format. Default "d MMM yyyy".
   * Typed entry uses `inputFormat` instead.
   */
  dateFormat?: string;
  /**
   * `typed` (default): a text field with a format mask, validation and a calendar button. `button`: a read-only trigger that opens the calendar,
   * for a place where typing is not wanted.
   */
  entry?: "typed" | "button";
  /** Numeric format of the typed text: `dd/MM/yyyy` (default), `MM/dd/yyyy`, `yyyy-MM-dd`, with `/`, `-` or `.` as the separator. Shown as the placeholder. */
  inputFormat?: string;
  /**
   * Called when what is typed changes status: `empty`, `incomplete`, `valid`, or a problem (`invalid`, `before-min`, `after-max`, `disabled`) with a message in words.
   * The picker also shows that message under the field and sets `aria-invalid`. Typed entry only.
   */
  onValidate?: (result: DateValidation) => void;
  /** Earliest selectable date. */
  min?: Date;
  /** Latest selectable date. */
  max?: Date;
  /** Extra disabled dates (react-day-picker matchers). */
  disabledDates?: Matcher | Matcher[];
  /** Show a clear button once a value is set. */
  clearable?: boolean;
  /** 0 = Sunday, 1 = Monday. Default 1. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  locale?: Locale;
  size?: Size;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  className?: string;
  contentClassName?: string;
}

function useDisabled(min?: Date, max?: Date, extra?: Matcher | Matcher[]) {
  return useMemo(() => {
    const list: Matcher[] = [];
    if (min) list.push({ before: startOfDay(min) });
    if (max) list.push({ after: startOfDay(max) });
    if (extra) list.push(...(Array.isArray(extra) ? extra : [extra]));
    return list.length ? list : undefined;
  }, [min, max, extra]);
}

interface TriggerProps extends SharedProps {
  open: boolean;
  icon: ReactNode;
  text: string | null;
  onClear: () => void;
  label: string;
}

const Trigger = forwardRef<HTMLButtonElement, TriggerProps>(function Trigger({ open, icon, text, onClear, label, placeholder, clearable, size = "md", invalid, warn, skeleton, readOnly, disabled, required, id, className, ...aria }, ref) {
  const valueId = useId();
  const field = useField();
  const { invalid: isInvalid, state, ...control } = useFieldControl({ id, disabled, required, "aria-invalid": invalid || undefined, "aria-describedby": aria["aria-describedby"] }, { warn, readOnly, skeleton });
  const showClear = clearable && text && !control.disabled && !state.readOnly;
  return (
    <div className={cx("faun-field-trigger-wrap", "faun-date-picker", className)}>
      <RP.Trigger asChild disabled={control.disabled}>
        <button
          ref={ref}
          type="button"
          id={control.id}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={field ? undefined : `${aria["aria-label"] ?? label}${text ? `, ${text}` : ""}`}
          aria-labelledby={field ? `${field.labelId} ${valueId}` : undefined}
          aria-describedby={control["aria-describedby"]}
          aria-invalid={isInvalid || undefined}
          aria-readonly={state.readOnly || undefined}
          aria-busy={state.skeleton || undefined}
          aria-required={("aria-required" in control ? control["aria-required"] : required || undefined)}
          disabled={control.disabled}
          onClick={(e) => { if (state.readOnly) e.preventDefault(); }}
          className="faun-field-trigger"
          data-size={size}
          {...state.attrs}
          data-state={open ? "open" : "closed"}
          data-has-clear={showClear ? "" : undefined}
        >
          <span className="faun-field-trigger-icon" aria-hidden="true">{icon}</span>
          <span id={valueId} className="faun-field-trigger-value" data-placeholder={text ? undefined : ""}>{text ?? placeholder}</span>
        </button>
      </RP.Trigger>
      {showClear ? <button type="button" className="faun-field-trigger-clear" aria-label={`Clear ${aria["aria-label"] ?? label.toLowerCase()}`} onClick={onClear}><IconClose /></button> : null}
    </div>
  );
});

export interface DatePickerProps extends SharedProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (date: Date | null) => void;
}

/** Picks one date: a reporting date, a deadline, an effective-from date. Type it with a mask and validation, or open the calendar. */
export const DatePicker = forwardRef<HTMLInputElement | HTMLButtonElement, DatePickerProps>(function DatePicker(props, ref) {
  return props.entry === "button" ? <ButtonDatePicker {...props} ref={ref as Ref<HTMLButtonElement>} /> : <TypedDatePicker {...props} ref={ref as Ref<HTMLInputElement>} />;
});

const ButtonDatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(function ButtonDatePicker(
  { entry: _e, inputFormat: _f, onValidate: _v, value, defaultValue = null, onValueChange, placeholder = "Pick a date", dateFormat = "d MMM yyyy", min, max, disabledDates, weekStartsOn = 1, locale, contentClassName, ...rest },
  ref,
) {
  const [date, setDate] = useControllableState<Date | null>({ value, defaultValue, onChange: onValueChange });
  const [open, setOpen] = useState(false);
  const disabled = useDisabled(min, max, disabledDates);
  const text = date ? formatFn(date, dateFormat, { locale }) : null;
  return (
    <RP.Root open={open} onOpenChange={setOpen}>
      <Trigger ref={ref} {...rest} placeholder={placeholder} open={open} icon={<IconCalendar />} text={text} onClear={() => setDate(null)} label="Date" />
      <RP.Portal>
        <RP.Content className={cx("faun-date-panel", contentClassName)} align="start" sideOffset={6} collisionPadding={8} aria-label="Choose date">
          <Calendar
            mode="single"
            autoFocus
            selected={date ?? undefined}
            defaultMonth={date ?? (max && isAfter(new Date(), max) ? max : min && isAfter(min, new Date()) ? min : undefined)}
            onSelect={(d) => { setDate(d ?? null); if (d) setOpen(false); }}
            disabled={disabled}
            startMonth={min}
            endMonth={max}
            weekStartsOn={weekStartsOn}
            locale={locale}
          />
        </RP.Content>
      </RP.Portal>
    </RP.Root>
  );
});

export interface DateRangePickerProps extends SharedProps {
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onValueChange?: (range: DateRange | null) => void;
  /** Quick ranges shown beside the calendar. Default: months, quarters, year to date, fiscal years, last 12 months. Pass false to hide. */
  presets?: DateRangePreset[] | false;
  /** Month the fiscal year starts (0 = January), for the default presets. */
  fiscalYearStartMonth?: number;
  /** Months shown side by side. Default 2. */
  numberOfMonths?: number;
}

const sameRange = (a?: DateRange | null, b?: DateRange | null) =>
  !!a?.from && !!b?.from && !!a.to && !!b.to && isSameDay(a.from, b.from) && isSameDay(a.to, b.to);

/** Picks a period: a reporting window, a base year, a comparison range. Presets cover the common periods. */
export const DateRangePicker = forwardRef<HTMLInputElement | HTMLButtonElement, DateRangePickerProps>(function DateRangePicker(props, ref) {
  return props.entry === "button" ? <ButtonDateRangePicker {...props} ref={ref as Ref<HTMLButtonElement>} /> : <TypedDateRangePicker {...props} ref={ref as Ref<HTMLInputElement>} />;
});

const ButtonDateRangePicker = forwardRef<HTMLButtonElement, DateRangePickerProps>(function ButtonDateRangePicker(
  { entry: _e, inputFormat: _f, onValidate: _v, value, defaultValue = null, onValueChange, placeholder = "Pick a date range", dateFormat = "d MMM yyyy", min, max, disabledDates, weekStartsOn = 1, locale, presets, fiscalYearStartMonth = 0, numberOfMonths = 2, contentClassName, ...rest },
  ref,
) {
  const [range, setRange] = useControllableState<DateRange | null>({ value, defaultValue, onChange: onValueChange });
  const [draft, setDraft] = useState<DateRange | undefined>();
  const [open, setOpen] = useState(false);
  const disabled = useDisabled(min, max, disabledDates);
  const list = presets === false ? [] : presets ?? defaultRangePresets({ fiscalYearStartMonth });
  const today = new Date();
  const fmt = (d: Date) => formatFn(d, dateFormat, { locale });
  const text = range?.from ? (range.to && !isSameDay(range.from, range.to) ? `${fmt(range.from)} – ${fmt(range.to)}` : fmt(range.from)) : null;
  const shown = draft ?? range ?? undefined;
  const onOpenChange = (o: boolean) => { setOpen(o); setDraft(undefined); };
  const commit = (r: DateRange) => { setRange(r); setDraft(undefined); setOpen(false); };
  const pick = (day: Date) => {
    if (!draft?.from) { setDraft({ from: day, to: undefined }); return; }
    const [from, to] = isAfter(draft.from, day) ? [day, draft.from] : [draft.from, day];
    commit({ from, to });
  };
  return (
    <RP.Root open={open} onOpenChange={onOpenChange}>
      <Trigger ref={ref} {...rest} placeholder={placeholder} open={open} icon={<IconCalendarRange />} text={text} onClear={() => setRange(null)} label="Date range" />
      <RP.Portal>
        <RP.Content className={cx("faun-date-panel", "faun-date-range-panel", contentClassName)} align="start" sideOffset={6} collisionPadding={8} aria-label="Choose date range">
          {list.length ? (
            <div className="faun-date-presets" role="group" aria-label="Presets">
              {list.map((p) => {
                const r = p.range(today);
                const active = sameRange(r, range);
                return <button key={p.label} type="button" className="faun-date-preset" aria-pressed={active} onClick={() => commit(r)}>{p.label}</button>;
              })}
            </div>
          ) : null}
          <div className="faun-date-range-main">
            <Calendar
              mode="range"
              autoFocus
              numberOfMonths={numberOfMonths}
              selected={shown}
              defaultMonth={shown?.from ?? (numberOfMonths > 1 ? new Date(today.getFullYear(), today.getMonth() - 1, 1) : undefined)}
              onSelect={(_r, day) => pick(day)}
              disabled={disabled}
              startMonth={min}
              endMonth={max}
              weekStartsOn={weekStartsOn}
              locale={locale}
            />
            <p className="faun-date-range-hint" aria-live="polite">
              {draft?.from ? `Starts ${fmt(draft.from)}. Pick an end date.` : text ? text : "Pick a start date."}
            </p>
          </div>
        </RP.Content>
      </RP.Portal>
    </RP.Root>
  );
});
