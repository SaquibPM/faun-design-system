import { IconStatusAttention } from "@faun-ds/icons";
import { useState } from "react";
import { Field } from "../Field/Field";
import { Select, SelectGroup, SelectItem, SelectLabel, SelectSeparator } from "./Select";
import { Stack } from "../Layout/Layout";

const col = { display: "grid", gap: "var(--faun-space-4)", width: "min(100%, 360px)" } as const;
const standards = [
  { value: "e1", label: "ESRS E1", description: "Climate change", group: "Environment" },
  { value: "e3", label: "ESRS E3", description: "Water and marine resources", group: "Environment" },
  { value: "s1", label: "ESRS S1", description: "Own workforce", group: "Social" },
  { value: "g1", label: "ESRS G1", description: "Business conduct", group: "Governance" },
];

export function Thumbnail() {
  return <div style={col}><Select aria-label="Standard" options={standards} defaultValue="e1" /></div>;
}

export function Overview() {
  return (
    <div style={col}>
      <Field label="Topical standard" description="Where this datapoint is reported.">
        <Select options={standards} placeholder="Choose a standard" />
      </Field>
    </div>
  );
}

export function Sizes() {
  return (
    <div style={col}>
      <Select aria-label="Small" size="sm" options={standards} placeholder="Small" />
      <Select aria-label="Medium" size="md" options={standards} placeholder="Medium" />
      <Select aria-label="Large" size="lg" options={standards} placeholder="Large" />
    </div>
  );
}

export function Composed() {
  return (
    <div style={col}>
      <Select aria-label="Region" placeholder="Choose a region" defaultValue="eu">
        <SelectGroup>
          <SelectLabel>Regions</SelectLabel>
          <SelectItem value="eu" label="European Union" />
          <SelectItem value="uk" label="United Kingdom" />
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Other</SelectLabel>
          <SelectItem value="us" label="United States" description="State-level rules apply" />
          <SelectItem value="apac" label="Asia-Pacific" disabled />
        </SelectGroup>
      </Select>
    </div>
  );
}

export function Controlled() {
  const [v, setV] = useState("e1");
  return (
    <div style={col}>
      <Select aria-label="Standard" options={standards} value={v} onValueChange={setV} />
      <p style={{ margin: 0, fontSize: "var(--faun-type-body-sm-font-size)" }}>Selected: {v}</p>
    </div>
  );
}

export function WithError() {
  return <div style={col}><Field label="Topical standard" error="Choose a standard to continue."><Select options={standards} placeholder="Choose a standard" /></Field></div>;
}

export function WithIcon() {
  return <div style={col}><Select aria-label="Status" icon={<IconStatusAttention />} placeholder="Filter by status" options={[{ value: "open", label: "Needs review" }, { value: "done", label: "Approved" }]} /></div>;
}

export function Disabled() {
  return <div style={col}><Field label="Standard" disabled><Select options={standards} defaultValue="e1" /></Field></div>;
}

export function DoShortList() {
  return <div style={col}><Select aria-label="Period" defaultValue="q" options={[{ value: "m", label: "Month" }, { value: "q", label: "Quarter" }, { value: "y", label: "Year" }]} /></div>;
}

export function DontLongList() {
  return <div style={col}><Select aria-label="Factor" placeholder="Choose from 4,000 emission factors" options={standards} /></div>;
}

export function StateContract() {
  return (
    <Stack gap="4" style={{ inlineSize: "min(100%, 400px)" }}>
      <Field label="Scope 2 method" warn="Differs from last year's method. Restate the base year if this is intended."><Select defaultValue="control" options={[{ value: "control", label: "Operational control" }, { value: "financial", label: "Financial control" }, { value: "equity", label: "Equity share" }]} /></Field>
      <Field label="Scope 2 method" readOnly description="Set by the approved methodology."><Select defaultValue="control" options={[{ value: "control", label: "Operational control" }, { value: "financial", label: "Financial control" }, { value: "equity", label: "Equity share" }]} /></Field>
      <Field label="Scope 2 method" skeleton><Select defaultValue="control" options={[{ value: "control", label: "Operational control" }, { value: "financial", label: "Financial control" }, { value: "equity", label: "Equity share" }]} /></Field>
    </Stack>
  );
}
