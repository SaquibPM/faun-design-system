import { useState } from "react";
import { Field } from "../Field/Field";
import { Input } from "../Input/Input";
import { Calendar } from "./Calendar";
import { DatePicker, DateRangePicker, type DateRange } from "./DatePicker";
import { Stack } from "../Layout/Layout";

const col = { display: "grid", gap: "var(--faun-space-4)", width: "min(100%, 360px)" } as const;

export function Thumbnail() {
  return <div style={col}><DatePicker aria-label="Reporting date" defaultValue={new Date(2026, 2, 31)} /></div>;
}

export function Overview() {
  return (
    <div style={col}>
      <Field label="Reporting date" description="Last day of the reporting period.">
        <DatePicker defaultValue={new Date(2026, 11, 31)} />
      </Field>
    </div>
  );
}

export function Range() {
  return (
    <div style={{ ...col, width: "min(100%, 420px)" }}>
      <Field label="Reporting period">
        <DateRangePicker defaultValue={{ from: new Date(2026, 0, 1), to: new Date(2026, 2, 31) }} />
      </Field>
    </div>
  );
}

export function FiscalPresets() {
  const [r, setR] = useState<DateRange | null>(null);
  return (
    <div style={{ ...col, width: "min(100%, 420px)" }}>
      <Field label="Fiscal period" description="Presets follow an April fiscal year start.">
        <DateRangePicker value={r} onValueChange={setR} fiscalYearStartMonth={3} placeholder="Choose a period" clearable />
      </Field>
    </div>
  );
}

export function Limits() {
  return (
    <div style={col}>
      <Field label="Effective from" description="Must fall inside the current filing year.">
        <DatePicker min={new Date(2026, 0, 1)} max={new Date(2026, 11, 31)} defaultValue={new Date(2026, 5, 30)} clearable />
      </Field>
    </div>
  );
}

export function WithError() {
  return <div style={col}><Field label="Reporting date" error="Choose the last day of the period."><DatePicker /></Field></div>;
}

export function Inline() {
  const [d, setD] = useState<Date | undefined>(new Date(2026, 9, 18));
  return <Calendar mode="single" selected={d} onSelect={setD} weekStartsOn={1} />;
}

export function Disabled() {
  return <div style={col}><Field label="Reporting date" disabled><DatePicker defaultValue={new Date(2026, 2, 31)} /></Field></div>;
}

export function DoPresets() {
  return <div style={{ ...col, width: "min(100%, 420px)" }}><Field label="Period"><DateRangePicker /></Field></div>;
}

export function DoTypedWithFormat() {
  return <div style={col}><Field label="Reporting date" description="Type it or open the calendar."><DatePicker defaultValue={new Date(2026, 2, 31)} /></Field></div>;
}

export function DontPlainInput() {
  return <div style={col}><Field label="Reporting date (any format)"><Input placeholder="Type a date" defaultValue="31st March" /></Field></div>;
}

export function Validation() {
  const [msg, setMsg] = useState<string | undefined>();
  return (
    <div style={col}>
      <Field label="Effective from" description="Weekdays in 2026 only. Try 31/02/2026 or a Sunday." error={msg}>
        <DatePicker min={new Date(2026, 0, 1)} max={new Date(2026, 11, 31)} disabledDates={{ dayOfWeek: [0, 6] }} defaultValue={new Date(2026, 5, 30)} onValidate={(r) => setMsg(r.message)} />
      </Field>
    </div>
  );
}

export function Formats() {
  return (
    <Stack gap="4" style={col}>
      <Field label="Day first (default)"><DatePicker defaultValue={new Date(2026, 2, 31)} /></Field>
      <Field label="Month first"><DatePicker inputFormat="MM/dd/yyyy" defaultValue={new Date(2026, 2, 31)} /></Field>
      <Field label="Year first"><DatePicker inputFormat="yyyy-MM-dd" defaultValue={new Date(2026, 2, 31)} /></Field>
    </Stack>
  );
}

export function ButtonEntry() {
  return <div style={col}><Field label="Reporting date" description="A trigger only, for places where typing is not wanted."><DatePicker entry="button" defaultValue={new Date(2026, 2, 31)} /></Field></div>;
}

export function StateContract() {
  return (
    <Stack gap="4" style={{ inlineSize: "min(100%, 400px)" }}>
      <Field label="Scope 2 method" warn="Differs from last year's method. Restate the base year if this is intended."><DatePicker defaultValue={new Date(2026, 11, 31)} /></Field>
      <Field label="Scope 2 method" readOnly description="Set by the approved methodology."><DatePicker defaultValue={new Date(2026, 11, 31)} /></Field>
      <Field label="Scope 2 method" skeleton><DatePicker defaultValue={new Date(2026, 11, 31)} /></Field>
    </Stack>
  );
}
