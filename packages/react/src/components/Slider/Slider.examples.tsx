import { useState } from "react";
import { Field } from "../Field/Field";
import { Slider } from "./Slider";
import { Stack } from "../Layout/Layout";

const col = { display: "grid", gap: "var(--faun-space-5)", width: "min(100%, 400px)" } as const;

export function Thumbnail() {
  return <div style={col}><Slider aria-label="Threshold" defaultValue={[40]} formatValue={(v) => `${v}%`} /></div>;
}

export function Overview() {
  return (
    <div style={col}>
      <Field label="Materiality threshold" description="Topics scoring above this are material.">
        <Slider defaultValue={[60]} formatValue={(v) => `${v}%`} />
      </Field>
    </div>
  );
}

export function Range() {
  return (
    <div style={col}>
      <Field label="Reporting years">
        <Slider min={2019} max={2026} defaultValue={[2021, 2025]} thumbLabels={["Base year", "Target year"]} marks={[{ value: 2019, label: "2019" }, { value: 2022, label: "2022" }, { value: 2026, label: "2026" }]} />
      </Field>
    </div>
  );
}

export function Marks() {
  return (
    <div style={col}>
      <Field label="Confidence level">
        <Slider defaultValue={[75]} step={25} marks={[{ value: 0, label: "Low" }, { value: 50, label: "Medium" }, { value: 100, label: "High" }]} showValue="none" />
      </Field>
    </div>
  );
}

export function ValueBubble() {
  return (
    <div style={col}>
      <Slider aria-label="Reduction target" defaultValue={[42]} showValue="always" formatValue={(v) => `${v}%`} />
    </div>
  );
}

export function Controlled() {
  const [v, setV] = useState([30]);
  return (
    <div style={col}>
      <Field label="Allocation to Scope 3">
        <Slider value={v} onValueChange={setV} step={5} formatValue={(n) => `${n}%`} />
      </Field>
      <p style={{ margin: 0, fontSize: "var(--faun-type-body-sm-font-size)" }}>{100 - v[0]!}% remains for Scope 1 and 2.</p>
    </div>
  );
}

export function Disabled() {
  return <div style={col}><Field label="Locked threshold" disabled><Slider defaultValue={[50]} /></Field></div>;
}

export function DoBounded() {
  return <div style={col}><Field label="Confidence cut-off"><Slider defaultValue={[80]} formatValue={(v) => `${v}%`} /></Field></div>;
}

export function DontPrecise() {
  return <div style={col}><Field label="Exact emissions (tCO₂e)"><Slider min={0} max={100000} step={1} defaultValue={[12480]} /></Field></div>;
}

export function StateContract() {
  return (
    <Stack gap="4" style={{ inlineSize: "min(100%, 400px)" }}>
      <Field label="Scope 2 method" warn="Differs from last year's method. Restate the base year if this is intended."><Slider defaultValue={[60]} /></Field>
      <Field label="Scope 2 method" readOnly description="Set by the approved methodology."><Slider defaultValue={[60]} /></Field>
      <Field label="Scope 2 method" skeleton><Slider defaultValue={[60]} /></Field>
    </Stack>
  );
}
