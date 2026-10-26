import { useState } from "react";
import { Checkbox, CheckboxGroup, type CheckedState } from "./Checkbox";
import { Stack } from "../Layout/Layout";

const col = { display: "grid", gap: "var(--faun-space-4)", width: "min(100%, 400px)" } as const;
const frameworks = [
  { value: "csrd", label: "CSRD", description: "EU Corporate Sustainability Reporting Directive" },
  { value: "issb", label: "ISSB", description: "IFRS S1 and S2" },
  { value: "cdp", label: "CDP", description: "Climate change questionnaire" },
];

export function Thumbnail() {
  return <Checkbox label="Include Scope 3" defaultChecked />;
}

export function Overview() {
  return (
    <div style={col}>
      <Checkbox label="Include Scope 3" description="Adds value-chain emissions to the total." defaultChecked />
      <Checkbox label="Include biogenic CO₂" />
    </div>
  );
}

export function Indeterminate() {
  const [sites, setSites] = useState<Record<string, boolean>>({ rotterdam: true, lyon: false, porto: true });
  const values = Object.values(sites);
  const parent: CheckedState = values.every(Boolean) ? true : values.some(Boolean) ? "indeterminate" : false;
  return (
    <div style={col}>
      <Checkbox label="All sites" checked={parent} onCheckedChange={(c) => setSites(Object.fromEntries(Object.keys(sites).map((k) => [k, c === true])))} />
      <div style={{ display: "grid", gap: "var(--faun-space-3)", paddingInlineStart: "var(--faun-space-7)" }}>
        {Object.entries(sites).map(([k, v]) => (
          <Checkbox key={k} label={k[0]!.toUpperCase() + k.slice(1)} checked={v} onCheckedChange={(c) => setSites({ ...sites, [k]: c === true })} />
        ))}
      </div>
    </div>
  );
}

export function Group() {
  return (
    <div style={col}>
      <CheckboxGroup label="Frameworks" description="Choose every framework this filing covers." options={frameworks} defaultValue={["csrd"]} />
    </div>
  );
}

export function GroupSelectAll() {
  return (
    <div style={col}>
      <CheckboxGroup label="Frameworks" options={frameworks} defaultValue={["csrd", "issb"]} selectAll />
    </div>
  );
}

export function Horizontal() {
  return (
    <CheckboxGroup label="Scopes" orientation="horizontal" options={[{ value: "1", label: "Scope 1" }, { value: "2", label: "Scope 2" }, { value: "3", label: "Scope 3" }]} defaultValue={["1", "2"]} />
  );
}

export function WithError() {
  return (
    <div style={col}>
      <CheckboxGroup label="Frameworks" options={frameworks} error="Pick at least one framework to continue." />
    </div>
  );
}

export function Disabled() {
  return (
    <div style={col}>
      <Checkbox label="Locked by admin" checked disabled />
      <Checkbox label="Unavailable" disabled />
    </div>
  );
}

export function DoIndependent() {
  return <div style={col}><CheckboxGroup label="Include in total" options={[{ value: "1", label: "Scope 1" }, { value: "2", label: "Scope 2" }]} defaultValue={["1", "2"]} /></div>;
}

export function DontExclusive() {
  return <div style={col}><CheckboxGroup label="Scope 2 method" options={[{ value: "l", label: "Location-based" }, { value: "m", label: "Market-based" }]} defaultValue={["l"]} /></div>;
}

export function StateContract() {
  return (
    <Stack gap="4">
      <CheckboxGroup label="Disclosures in scope" warn="E1-6 is in scope but has no approved data yet." defaultValue={["e1-5"]} options={[{ value: "e1-5", label: "ESRS E1-5 Energy" }, { value: "e1-6", label: "ESRS E1-6 Emissions" }]} />
      <CheckboxGroup label="Disclosures in scope" readOnly defaultValue={["e1-5"]} options={[{ value: "e1-5", label: "ESRS E1-5 Energy" }, { value: "e1-6", label: "ESRS E1-6 Emissions" }]} />
      <CheckboxGroup label="Disclosures in scope" skeleton options={[{ value: "e1-5", label: "ESRS E1-5 Energy" }, { value: "e1-6", label: "ESRS E1-6 Emissions" }]} />
      <Checkbox label="I confirm the boundary is final" readOnly defaultChecked />
    </Stack>
  );
}
