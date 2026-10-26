import { useState } from "react";
import { Field } from "../Field/Field";
import { MultiSelect } from "./MultiSelect";
import { Stack } from "../Layout/Layout";

const col = { display: "grid", gap: "var(--faun-space-4)", width: "min(100%, 420px)" } as const;
const sites = [
  { value: "rot", label: "Rotterdam", description: "Netherlands", group: "EU" },
  { value: "lyon", label: "Lyon", description: "France", group: "EU" },
  { value: "gdansk", label: "Gdańsk", description: "Poland", group: "EU" },
  { value: "leeds", label: "Leeds", description: "United Kingdom", group: "UK" },
  { value: "porto", label: "Porto", description: "Portugal", group: "EU", disabled: true },
];

export function Thumbnail() {
  return <div style={col}><MultiSelect aria-label="Sites" options={sites} defaultValue={["rot", "lyon"]} /></div>;
}

export function Overview() {
  return (
    <div style={col}>
      <Field label="Sites in scope" description="Emissions roll up across the selected sites.">
        <MultiSelect options={sites} defaultValue={["rot", "lyon"]} placeholder="Select sites" />
      </Field>
    </div>
  );
}

export function Overflow() {
  return (
    <div style={col}>
      <Field label="Sites in scope">
        <MultiSelect options={sites} defaultValue={["rot", "lyon", "gdansk", "leeds"]} maxVisible={2} />
      </Field>
    </div>
  );
}

export function Controlled() {
  const [v, setV] = useState<string[]>(["leeds"]);
  return (
    <div style={col}>
      <MultiSelect aria-label="Sites" options={sites} value={v} onValueChange={setV} />
      <p style={{ margin: 0, fontSize: "var(--faun-type-body-sm-font-size)" }}>{v.length} of {sites.length} sites selected.</p>
    </div>
  );
}

export function WithError() {
  return <div style={col}><Field label="Sites in scope" error="Select at least one site."><MultiSelect options={sites} placeholder="Select sites" /></Field></div>;
}

export function Sizes() {
  return (
    <div style={col}>
      <MultiSelect aria-label="Small" size="sm" options={sites} defaultValue={["rot"]} />
      <MultiSelect aria-label="Large" size="lg" options={sites} defaultValue={["rot"]} />
    </div>
  );
}

export function Disabled() {
  return <div style={col}><Field label="Sites in scope" disabled><MultiSelect options={sites} defaultValue={["rot", "lyon"]} /></Field></div>;
}

export function DoBulkWithManyOptions() {
  return <div style={col}><MultiSelect aria-label="Sites" options={sites} bulkActions placeholder="Select sites" /></div>;
}

export function DontNoVisibleLimit() {
  return <div style={col}><MultiSelect aria-label="Sites" options={sites} defaultValue={["rot", "lyon", "gdansk", "leeds"]} maxVisible={10} /></div>;
}

export function StateContract() {
  return (
    <Stack gap="4" style={{ inlineSize: "min(100%, 400px)" }}>
      <Field label="Scope 2 method" warn="Differs from last year's method. Restate the base year if this is intended."><MultiSelect defaultValue={["control", "equity"]} options={[{ value: "control", label: "Operational control" }, { value: "financial", label: "Financial control" }, { value: "equity", label: "Equity share" }]} /></Field>
      <Field label="Scope 2 method" readOnly description="Set by the approved methodology."><MultiSelect defaultValue={["control", "equity"]} options={[{ value: "control", label: "Operational control" }, { value: "financial", label: "Financial control" }, { value: "equity", label: "Equity share" }]} /></Field>
      <Field label="Scope 2 method" skeleton><MultiSelect defaultValue={["control", "equity"]} options={[{ value: "control", label: "Operational control" }, { value: "financial", label: "Financial control" }, { value: "equity", label: "Equity share" }]} /></Field>
    </Stack>
  );
}
