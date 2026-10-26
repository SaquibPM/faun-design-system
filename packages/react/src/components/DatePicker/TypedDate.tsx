import * as RP from "@radix-ui/react-popover";
import { IconCalendar, IconClose, IconStatusDanger } from "@faun-ds/icons";
import { isAfter, isSameDay, startOfDay } from "date-fns";
import { forwardRef, useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type Ref } from "react";
import { cx } from "../../utils/cx.js";
import { VisuallyHidden } from "../../utils/visually-hidden.js";
import { useControllableState } from "../../utils/use-controllable-state.js";
import { useField, useFieldControl } from "../Field/Field.js";
import { Calendar } from "./Calendar.js";
import type { DatePickerProps, DateRange, DateRangePickerProps } from "./DatePicker.js";
import { formatDateText, hintOf, maskDateText, parseDateFormat, parseDateText, validateDateText, type DateValidation } from "./dateText.js";
import { defaultRangePresets } from "./presets.js";

const same = (a?: Date | null, b?: Date | null) => (!a && !b) || (!!a && !!b && isSameDay(a, b));

function useJoinedRef<T>(forwarded: Ref<T>, local: { current: T | null }) {
  return (el: T | null) => {
    local.current = el;
    if (typeof forwarded === "function") forwarded(el);
    else if (forwarded) (forwarded as { current: T | null }).current = el;
  };
}

/** One typed date: masks while typing, validates against the limits, and reports the problem in words. */
function useDateText(opts: { date: Date | null; fmt: ReturnType<typeof parseDateFormat>; min?: Date; max?: Date; disabled?: DatePickerProps["disabledDates"]; label: string; onDate: (d: Date | null) => void }) {
  const { date, fmt, min, max, disabled, label, onDate } = opts;
  const [text, setText] = useState(() => (date ? formatDateText(date, fmt) : ""));
  const [touched, setTouched] = useState(false);
  const check = (t: string) => validateDateText(t, fmt, { min, max, disabled, label });
  const result = check(text);
  // An outside change to the value (reset, clear, calendar) replaces the text; the text we typed ourselves does not.
  useEffect(() => {
    const typed = parseDateText(text, fmt).date ?? null;
    if (date && !same(date, typed)) setText(formatDateText(date, fmt));
    else if (!date && typed && check(text).status === "valid") setText("");
  }, [date]);
  const change = (raw: string) => {
    const masked = maskDateText(raw, fmt);
    setText(masked);
    const r = check(masked);
    if (r.status === "valid" && r.date) { if (!same(r.date, date)) onDate(r.date); }
    else if (date) onDate(null);
  };
  const set = (d: Date | null) => { setText(d ? formatDateText(d, fmt) : ""); setTouched(false); onDate(d); };
  const problem = result.status === "incomplete" ? (touched ? `Enter the full ${label} as ${hintOf(fmt)}.` : undefined) : result.message;
  return { text, change, set, blur: () => setTouched(true), result: result as DateValidation & { date?: Date }, problem };
}

function Message({ id, text }: { id: string; text?: string }) {
  if (!text) return <span id={id} />;
  return <p id={id} className="faun-date-message" role="status"><IconStatusDanger aria-hidden="true" /><span>{text}</span></p>;
}

const CalendarButton = forwardRef<HTMLButtonElement, { label: string; open: boolean; disabled?: boolean; hidden?: boolean }>(function CalendarButton({ label, open, disabled, hidden }, ref) {
  return (
    <RP.Trigger asChild>
      <button ref={ref} type="button" className="faun-date-input-button" aria-label={label} aria-haspopup="dialog" aria-expanded={open} disabled={disabled} data-hide={hidden ? "" : undefined}>
        <IconCalendar />
      </button>
    </RP.Trigger>
  );
});

export const TypedDatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function TypedDatePicker(
  { value, defaultValue = null, onValueChange, placeholder, inputFormat, min, max, disabledDates, clearable, weekStartsOn = 1, locale, size = "md", invalid, warn, skeleton, readOnly, disabled, required, id, className, contentClassName, onValidate, ...aria },
  ref,
) {
  const fmt = useMemo(() => parseDateFormat(inputFormat), [inputFormat]);
  const [date, setDate] = useControllableState<Date | null>({ value, defaultValue, onChange: onValueChange });
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement | null>(null);
  const setRefs = useJoinedRef(ref, input);
  const msgId = useId();
  const hintId = useId();
  const field = useField();
  const { invalid: fieldInvalid, state, ...control } = useFieldControl({ id, disabled, required, "aria-invalid": invalid || undefined, "aria-describedby": aria["aria-describedby"] }, { warn, readOnly, skeleton });
  const inert = !!control.disabled || state.readOnly;
  const t = useDateText({ date, fmt, min, max, disabled: disabledDates, label: "date", onDate: setDate });
  const problem = t.problem;
  const isInvalid = fieldInvalid || !!problem;
  useEffect(() => { onValidate?.((problem ? { status: t.result.status, message: problem } : { status: t.result.status }) as DateValidation); }, [t.result.status, problem]);
  const disabledList = useMemo(() => {
    const l: unknown[] = [];
    if (min) l.push({ before: startOfDay(min) });
    if (max) l.push({ after: startOfDay(max) });
    if (disabledDates) l.push(...(Array.isArray(disabledDates) ? disabledDates : [disabledDates]));
    return l.length ? (l as never) : undefined;
  }, [min, max, disabledDates]);
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (inert) return;
    if (e.key === "ArrowDown" && e.altKey) { e.preventDefault(); setOpen(true); }
  };
  const showClear = !!clearable && (!!t.text || !!date) && !inert;
  const label = aria["aria-label"] ?? "Date";
  return (
    <div className={cx("faun-date-wrap", className)}>
      <RP.Root open={open && !inert} onOpenChange={setOpen}>
        <RP.Anchor asChild>
          <div className="faun-input faun-date-input" data-size={size} data-disabled={control.disabled && !state.skeleton ? "" : undefined} {...state.attrs} data-invalid={isInvalid ? "" : undefined}>
            <input
              ref={setRefs}
              id={control.id}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className="faun-input-control"
              placeholder={placeholder ?? hintOf(fmt)}
              maxLength={fmt.length}
              value={t.text}
              onChange={(e: ChangeEvent<HTMLInputElement>) => t.change(e.target.value)}
              onBlur={t.blur}
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
            <VisuallyHidden id={hintId}>Format {hintOf(fmt)}. Alt and arrow down opens the calendar.</VisuallyHidden>
            {showClear ? (
              <button type="button" className="faun-date-input-button" aria-label={`Clear ${label.toLowerCase()}`} onClick={() => { t.set(null); input.current?.focus(); }}><IconClose /></button>
            ) : null}
            <CalendarButton label="Choose date" open={open} disabled={control.disabled} hidden={state.readOnly} />
          </div>
        </RP.Anchor>
        <Message id={msgId} text={problem} />
        <RP.Portal>
          <RP.Content
            className={cx("faun-date-panel", contentClassName)}
            align="start"
            sideOffset={6}
            collisionPadding={8}
            aria-label="Choose date"
            onCloseAutoFocus={(e) => { e.preventDefault(); input.current?.focus(); }}
          >
            <Calendar
              mode="single"
              autoFocus
              selected={date ?? undefined}
              defaultMonth={date ?? (max && isAfter(new Date(), max) ? max : min && isAfter(min, new Date()) ? min : undefined)}
              onSelect={(d) => { if (d) { t.set(d); setOpen(false); } }}
              disabled={disabledList}
              startMonth={min}
              endMonth={max}
              weekStartsOn={weekStartsOn}
              locale={locale}
            />
          </RP.Content>
        </RP.Portal>
      </RP.Root>
    </div>
  );
});

export const TypedDateRangePicker = forwardRef<HTMLInputElement, DateRangePickerProps>(function TypedDateRangePicker(
  { value, defaultValue = null, onValueChange, placeholder, inputFormat, min, max, disabledDates, clearable, weekStartsOn = 1, locale, presets, fiscalYearStartMonth = 0, numberOfMonths = 2, size = "md", invalid, warn, skeleton, readOnly, disabled, required, id, className, contentClassName, onValidate, ...aria },
  ref,
) {
  const fmt = useMemo(() => parseDateFormat(inputFormat), [inputFormat]);
  const [range, setRange] = useControllableState<DateRange | null>({ value, defaultValue, onChange: onValueChange });
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>();
  const first = useRef<HTMLInputElement | null>(null);
  const setRefs = useJoinedRef(ref, first);
  const msgId = useId();
  const hintId = useId();
  const startId = useId();
  const endId = useId();
  const field = useField();
  const { invalid: fieldInvalid, state, ...control } = useFieldControl({ id, disabled, required, "aria-invalid": invalid || undefined, "aria-describedby": aria["aria-describedby"] }, { warn, readOnly, skeleton });
  const inert = !!control.disabled || state.readOnly;
  const [from, setFrom] = useState<Date | null>(range?.from ?? null);
  const [to, setTo] = useState<Date | null>(range?.to ?? null);
  const lim = { min, max, disabled: disabledDates };
  const own = useRef(false);
  const emit = (f: Date | null, t: Date | null) => {
    if (f && t && !isAfter(f, t)) { own.current = true; setRange({ from: f, to: t }); }
    else if (range) { own.current = true; setRange(null); }
  };
  // Each end is its own typed date. The range is only reported when both are valid and in order.
  const a = useDateText({ date: from, fmt, ...lim, label: "start date", onDate: (d) => { setFrom(d); emit(d, to); } });
  const b = useDateText({ date: to, fmt, ...lim, label: "end date", onDate: (d) => { setTo(d); emit(from, d); } });
  // Outside value changes (a reset, a controlled update) flow into both ends; changes we made ourselves do not.
  useEffect(() => {
    if (own.current) { own.current = false; return; }
    if (range?.from || range?.to) {
      if (!same(range.from ?? null, from)) setFrom(range.from ?? null);
      if (!same(range.to ?? null, to)) setTo(range.to ?? null);
    } else if (from && to) { setFrom(null); setTo(null); }
  }, [range]);
  const order = from && to && isAfter(from, to) ? "The end date is before the start date." : undefined;
  const problem = a.problem ?? b.problem ?? order;
  const isInvalid = fieldInvalid || !!problem;
  const status = problem ? "invalid" : from && to ? "valid" : !a.text && !b.text ? "empty" : "incomplete";
  useEffect(() => { onValidate?.({ status, message: problem } as DateValidation); }, [status, problem]);
  const disabledList = useMemo(() => {
    const l: unknown[] = [];
    if (min) l.push({ before: startOfDay(min) });
    if (max) l.push({ after: startOfDay(max) });
    if (disabledDates) l.push(...(Array.isArray(disabledDates) ? disabledDates : [disabledDates]));
    return l.length ? (l as never) : undefined;
  }, [min, max, disabledDates]);
  const list = presets === false ? [] : presets ?? defaultRangePresets({ fiscalYearStartMonth });
  const today = new Date();
  const label = aria["aria-label"] ?? "Date range";
  const apply = (r: DateRange) => { setFrom(r.from ?? null); setTo(r.to ?? null); a.set(r.from ?? null); b.set(r.to ?? null); own.current = true; setRange(r.from && r.to ? { from: r.from, to: r.to } : null); setDraft(undefined); setOpen(false); };
  const pick = (day: Date) => {
    if (!draft?.from) { setDraft({ from: day, to: undefined }); a.set(day); b.set(null); setTo(null); return; }
    const [f, t] = isAfter(draft.from, day) ? [day, draft.from] : [draft.from, day];
    apply({ from: f, to: t });
  };
  const shown: DateRange | undefined = draft ?? (from ? { from, to: to ?? undefined } : undefined);
  const showClear = !!clearable && (!!a.text || !!b.text) && !inert;
  const labelledBy = (own: string) => (field ? `${field.labelId} ${own}` : undefined);
  const common = { type: "text" as const, inputMode: "numeric" as const, autoComplete: "off", className: "faun-input-control", maxLength: fmt.length, disabled: control.disabled, readOnly: state.readOnly, "aria-readonly": state.readOnly || undefined, "aria-invalid": isInvalid || undefined, "aria-busy": state.skeleton || undefined };
  const describedBy = [control["aria-describedby"], hintId, problem ? msgId : undefined].filter(Boolean).join(" ");
  return (
    <div className={cx("faun-date-wrap", className)}>
      <RP.Root open={open && !inert} onOpenChange={(o) => { setOpen(o); setDraft(undefined); }}>
        <RP.Anchor asChild>
          <div className="faun-input faun-date-input faun-date-range-input" role="group" aria-label={field ? undefined : label} aria-labelledby={field ? field.labelId : undefined} data-size={size} data-disabled={control.disabled && !state.skeleton ? "" : undefined} {...state.attrs} data-invalid={isInvalid ? "" : undefined}>
            <VisuallyHidden id={startId}>start date</VisuallyHidden>
            <VisuallyHidden id={endId}>end date</VisuallyHidden>
            <input {...common} ref={setRefs} id={control.id} placeholder={placeholder ?? hintOf(fmt)} value={a.text} onChange={(e) => a.change(e.target.value)} onBlur={a.blur}
              aria-label={field ? undefined : `${label}, start date`} aria-labelledby={labelledBy(startId)} aria-describedby={describedBy}
              aria-required={"aria-required" in control ? control["aria-required"] : required || undefined}
              onKeyDown={(e) => { if (!inert && e.key === "ArrowDown" && e.altKey) { e.preventDefault(); setOpen(true); } }} />
            <span className="faun-date-range-sep" aria-hidden="true">–</span>
            <input {...common} placeholder={hintOf(fmt)} value={b.text} onChange={(e) => b.change(e.target.value)} onBlur={b.blur}
              aria-label={field ? undefined : `${label}, end date`} aria-labelledby={labelledBy(endId)} aria-describedby={describedBy}
              onKeyDown={(e) => { if (!inert && e.key === "ArrowDown" && e.altKey) { e.preventDefault(); setOpen(true); } }} />
            <VisuallyHidden id={hintId}>Format {hintOf(fmt)}. Alt and arrow down opens the calendar.</VisuallyHidden>
            {showClear ? (
              <button type="button" className="faun-date-input-button" aria-label={`Clear ${label.toLowerCase()}`} onClick={() => { a.set(null); b.set(null); setFrom(null); setTo(null); own.current = true; setRange(null); first.current?.focus(); }}><IconClose /></button>
            ) : null}
            <CalendarButton label="Choose date range" open={open} disabled={control.disabled} hidden={state.readOnly} />
          </div>
        </RP.Anchor>
        <Message id={msgId} text={problem} />
        <RP.Portal>
          <RP.Content
            className={cx("faun-date-panel", "faun-date-range-panel", contentClassName)}
            align="start"
            sideOffset={6}
            collisionPadding={8}
            aria-label="Choose date range"
            onCloseAutoFocus={(e) => { e.preventDefault(); first.current?.focus(); }}
          >
            {list.length ? (
              <div className="faun-date-presets" role="group" aria-label="Presets">
                {list.map((p) => {
                  const r = p.range(today);
                  const active = !!r.from && !!r.to && same(r.from, from) && same(r.to, to);
                  return <button key={p.label} type="button" className="faun-date-preset" aria-pressed={active} onClick={() => apply(r)}>{p.label}</button>;
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
                disabled={disabledList}
                startMonth={min}
                endMonth={max}
                weekStartsOn={weekStartsOn}
                locale={locale}
              />
              <p className="faun-date-range-hint" aria-live="polite">
                {draft?.from ? `Starts ${formatDateText(draft.from, fmt)}. Pick an end date.` : from && to ? `${formatDateText(from, fmt)} – ${formatDateText(to, fmt)}` : "Pick a start date."}
              </p>
            </div>
          </RP.Content>
        </RP.Portal>
      </RP.Root>
    </div>
  );
});
