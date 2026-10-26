import { IconFileText, IconCalendar } from "@faun-ds/icons";
import { useState } from "react";
import { RadioGroup } from "./RadioGroup";
import { Stack } from "../Layout/Layout";

const col = { display: "grid", gap: "var(--faun-space-4)", width: "min(100%, 520px)" } as const;
const methods = [
  { value: "location", label: "Location-based", description: "Grid-average emission factors" },
  { value: "market", label: "Market-based", description: "Contractual instruments and residual mix" },
];

export function Thumbnail() {
  return <RadioGroup label="Scope 2 method" options={methods} defaultValue="market" />;
}

export function Overview() {
  return (
    <div style={col}>
      <RadioGroup label="Scope 2 method" description="Applies to every site in this filing." options={methods} defaultValue="market" />
    </div>
  );
}

export function Cards() {
  return (
    <div style={col}>
      <RadioGroup
        label="Filing type"
        variant="card"
        columns={2}
        defaultValue="annual"
        options={[
          { value: "annual", label: "Annual report", description: "Full CSRD statement", icon: <IconFileText /> },
          { value: "interim", label: "Interim update", description: "Quarterly KPIs only", icon: <IconCalendar /> },
        ]}
      />
    </div>
  );
}

export function Horizontal() {
  return <RadioGroup label="Consolidation approach" orientation="horizontal" defaultValue="control" options={[{ value: "control", label: "Operational control" }, { value: "equity", label: "Equity share" }]} />;
}

export function Controlled() {
  const [v, setV] = useState("location");
  return (
    <div style={col}>
      <RadioGroup label="Scope 2 method" options={methods} value={v} onValueChange={setV} />
      <p style={{ margin: 0, fontSize: "var(--faun-type-body-sm-font-size)" }}>Selected: {v}</p>
    </div>
  );
}

export function WithError() {
  return <div style={col}><RadioGroup label="Scope 2 method" options={methods} error="Choose a method before running the filing." required /></div>;
}

export function DisabledOption() {
  return <div style={col}><RadioGroup label="Framework" defaultValue="csrd" options={[{ value: "csrd", label: "CSRD" }, { value: "sec", label: "SEC climate rule", description: "Unavailable for this entity", disabled: true }]} /></div>;
}

export function DoShowAllOptions() {
  return <div style={col}><RadioGroup label="Method" options={methods} defaultValue="location" /></div>;
}

export function DontToggle() {
  return <div style={col}><RadioGroup label="Notifications" options={[{ value: "on", label: "On" }, { value: "off", label: "Off" }]} defaultValue="on" /></div>;
}

const states = [{ value: "control", label: "Operational control" }, { value: "financial", label: "Financial control" }];
export function StateContract() {
  return (
    <Stack gap="4">
      <RadioGroup label="Boundary" warn="Differs from the approach used last year." defaultValue="financial" options={states} />
      <RadioGroup label="Boundary" readOnly defaultValue="financial" options={states} />
      <RadioGroup label="Boundary" skeleton options={states} />
    </Stack>
  );
}
