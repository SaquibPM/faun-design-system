import { useState } from "react";
import { Field } from "../Field/Field";
import { Stack } from "../Layout/Layout";
import { TimePicker } from "./TimePicker";

const col = { display: "grid", gap: "var(--faun-space-4)", width: "min(100%, 320px)" } as const;

export function Thumbnail() {
  return <div style={col}><TimePicker aria-label="Start time" defaultValue="09:30" /></div>;
}

export function Overview() {
  return (
    <div style={col}>
      <Field label="Agent run starts" description="Local time, 24 hour.">
        <TimePicker defaultValue="06:30" />
      </Field>
    </div>
  );
}

export function TwelveHour() {
  const [v, setV] = useState<string | null>("15:45");
  return (
    <div style={col}>
      <Field label="Review closes" description="Press A or P to switch AM and PM.">
        <TimePicker hourCycle={12} value={v} onValueChange={setV} />
      </Field>
      <p style={{ margin: 0, color: "var(--faun-fg-muted)", fontSize: "var(--faun-type-body-sm-font-size)" }}>Stored as {v ?? "nothing"}</p>
    </div>
  );
}

export function Steps() {
  return (
    <div style={col}>
      <Field label="Approval slot" description="15 minute slots between 09:00 and 17:00. Arrow keys move one slot.">
        <TimePicker step={15} min="09:00" max="17:00" defaultValue="10:15" />
      </Field>
    </div>
  );
}

export function Validation() {
  const [msg, setMsg] = useState<string | undefined>();
  return (
    <div style={col}>
      <Field label="Cut-off" description="Try 09:10 or 08:00." error={msg}>
        <TimePicker step={15} min="09:00" max="17:00" onValidate={(r) => setMsg(r.message)} />
      </Field>
    </div>
  );
}

export function StateContract() {
  return (
    <Stack gap="4" style={{ inlineSize: "min(100%, 320px)" }}>
      <Field label="Cut-off" warn="Outside office hours."><TimePicker defaultValue="21:00" /></Field>
      <Field label="Cut-off" readOnly description="Set by the filing calendar."><TimePicker defaultValue="17:00" /></Field>
      <Field label="Cut-off" skeleton><TimePicker defaultValue="17:00" /></Field>
    </Stack>
  );
}

export function DoDateAndTime() {
  return (
    <div style={col}>
      <Field label="Run time (local)" description="Paired with its own date field."><TimePicker defaultValue="06:30" /></Field>
    </div>
  );
}

export function DontSecondsPrecision() {
  return <div style={col}><Field label="Start (hour, minute, second)"><TimePicker aria-label="Start" placeholder="hh:mm:ss" /></Field></div>;
}
