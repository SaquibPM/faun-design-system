import { useState } from "react";
import { Field } from "../Field/Field";
import { NumberField } from "./NumberField";
import { Stack } from "../Layout/Layout";

const col = { display: "grid", gap: "var(--faun-space-4)", width: "min(100%, 320px)" } as const;

export function Thumbnail() {
  return <div style={col}><NumberField aria-label="Emissions" defaultValue={12480} unit="tCO₂e" locale="en-US" /></div>;
}

export function Overview() {
  return (
    <div style={col}>
      <Field label="Scope 1 emissions" description="Total for the reporting period.">
        <NumberField defaultValue={12480.5} unit="tCO₂e" locale="en-US" min={0} />
      </Field>
    </div>
  );
}

export function Stepper() {
  return (
    <div style={col}>
      <Field label="Reporting sites">
        <NumberField defaultValue={14} stepper min={1} max={200} />
      </Field>
    </div>
  );
}

export function UnitsAndPrefix() {
  return (
    <div style={col}>
      <Field label="Carbon price"><NumberField defaultValue={85} prefix="€" unit="per tCO₂e" locale="en-US" step={5} /></Field>
      <Field label="Reduction target"><NumberField defaultValue={42} unit="%" min={0} max={100} stepper /></Field>
    </div>
  );
}

export function Controlled() {
  const [v, setV] = useState<number | null>(1250);
  return (
    <div style={col}>
      <Field label="Electricity use" description="Type a value, or use the arrow keys. Shift moves by 10 steps.">
        <NumberField value={v} onValueChange={setV} unit="MWh" step={10} min={0} locale="en-US" />
      </Field>
      <p style={{ margin: 0, fontSize: "var(--faun-type-body-sm-font-size)" }}>Stored value: {v === null ? "empty" : v}</p>
    </div>
  );
}

export function Invalid() {
  return (
    <div style={col}>
      <Field label="Allocation" error="Allocations must be between 0 and 100%.">
        <NumberField defaultValue={120} unit="%" min={0} max={100} />
      </Field>
    </div>
  );
}

export function DoUnit() {
  return <div style={col}><Field label="Water withdrawal"><NumberField defaultValue={3200} unit="m³" locale="en-US" /></Field></div>;
}

export function DontUnitInLabel() {
  return <div style={col}><Field label="Water withdrawal (m³)"><NumberField defaultValue={3200} locale="en-US" /></Field></div>;
}

export function StateContract() {
  return (
    <Stack gap="4" style={{ inlineSize: "min(100%, 400px)" }}>
      <Field label="Scope 2 method" warn="Differs from last year's method. Restate the base year if this is intended."><NumberField defaultValue={3212.6} unit="tCO₂e" /></Field>
      <Field label="Scope 2 method" readOnly description="Set by the approved methodology."><NumberField defaultValue={3212.6} unit="tCO₂e" /></Field>
      <Field label="Scope 2 method" skeleton><NumberField defaultValue={3212.6} unit="tCO₂e" /></Field>
    </Stack>
  );
}
