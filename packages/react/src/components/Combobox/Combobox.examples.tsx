import { useState } from "react";
import { Field } from "../Field/Field";
import { Combobox } from "./Combobox";
import { Stack } from "../Layout/Layout";

const col = { display: "grid", gap: "var(--faun-space-4)", width: "min(100%, 380px)" } as const;
const factors = [
  { value: "defra-gas", label: "Natural gas (DEFRA 2025)", description: "0.18 kgCO₂e/kWh", group: "Fuels", keywords: ["methane"] },
  { value: "defra-diesel", label: "Diesel (DEFRA 2025)", description: "2.51 kgCO₂e/litre", group: "Fuels" },
  { value: "iea-uk", label: "UK grid electricity (IEA 2025)", description: "0.21 kgCO₂e/kWh", group: "Electricity" },
  { value: "iea-nl", label: "NL grid electricity (IEA 2025)", description: "0.27 kgCO₂e/kWh", group: "Electricity" },
];

export function Thumbnail() {
  return <div style={col}><Combobox aria-label="Factor" options={factors} defaultValue="defra-gas" /></div>;
}

export function Overview() {
  return (
    <div style={col}>
      <Field label="Emission factor" description="Search by fuel, region or source.">
        <Combobox options={factors} placeholder="Search factors" />
      </Field>
    </div>
  );
}

export function Clearable() {
  return <div style={col}><Combobox aria-label="Factor" options={factors} defaultValue="iea-uk" clearable /></div>;
}

export function Loading() {
  return <div style={col}><Combobox aria-label="Factor" options={[]} loading placeholder="Loading factors" /></div>;
}

export function AsyncSearch() {
  const [q, setQ] = useState("");
  const results = factors.filter((f) => f.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={col}>
      <Combobox aria-label="Factor" options={results} filter={false} onSearchChange={setQ} placeholder="Search a factor library" emptyMessage={`No factors match “${q}”. Try a fuel name.`} />
    </div>
  );
}

export function WithError() {
  return <div style={col}><Field label="Emission factor" error="Choose a factor before running the calculation."><Combobox options={factors} placeholder="Choose a factor" /></Field></div>;
}

export function Sizes() {
  return (
    <div style={col}>
      <Combobox aria-label="Small" size="sm" options={factors} placeholder="Small" />
      <Combobox aria-label="Large" size="lg" options={factors} placeholder="Large" />
    </div>
  );
}

export function DoLongList() {
  return <div style={col}><Combobox aria-label="Factor" options={factors} placeholder="Search 4,000 factors" /></div>;
}

export function DontFewOptions() {
  return <div style={col}><Combobox aria-label="Period" options={[{ value: "q", label: "Quarter" }, { value: "y", label: "Year" }]} placeholder="Period" /></div>;
}

export function StateContract() {
  return (
    <Stack gap="4" style={{ inlineSize: "min(100%, 400px)" }}>
      <Field label="Scope 2 method" warn="Differs from last year's method. Restate the base year if this is intended."><Combobox defaultValue="control" options={[{ value: "control", label: "Operational control" }, { value: "financial", label: "Financial control" }, { value: "equity", label: "Equity share" }]} /></Field>
      <Field label="Scope 2 method" readOnly description="Set by the approved methodology."><Combobox defaultValue="control" options={[{ value: "control", label: "Operational control" }, { value: "financial", label: "Financial control" }, { value: "equity", label: "Equity share" }]} /></Field>
      <Field label="Scope 2 method" skeleton><Combobox defaultValue="control" options={[{ value: "control", label: "Operational control" }, { value: "financial", label: "Financial control" }, { value: "equity", label: "Equity share" }]} /></Field>
    </Stack>
  );
}

export function CustomValue() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div style={col}>
      <Field label="Emission factor source" description="Pick a library factor or type your own reference.">
        <Combobox options={factors} allowCustomValue clearable value={value} onValueChange={setValue} placeholder="Search or type a source" customValueLabel={(t) => `Use “${t}” as a custom source`} />
      </Field>
      <p style={{ margin: 0, color: "var(--faun-fg-muted)", fontSize: "var(--faun-type-body-sm-font-size)" }}>{value ? `Value: ${value}` : "No value"}</p>
    </div>
  );
}
