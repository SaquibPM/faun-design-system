import { useState } from "react";
import { Switch } from "./Switch";
import { Stack } from "../Layout/Layout";

const col = { display: "grid", gap: "var(--faun-space-4)", width: "min(100%, 400px)" } as const;

export function Thumbnail() {
  return <Switch label="Email me when a run fails" defaultChecked labelPosition="end" />;
}

export function Overview() {
  return (
    <div style={col}>
      <Switch label="Email me when a run fails" description="Sent to the run owner within a minute." defaultChecked />
    </div>
  );
}

export function Sizes() {
  return (
    <div style={col}>
      <Switch size="sm" label="Compact" defaultChecked />
      <Switch size="md" label="Default" defaultChecked />
    </div>
  );
}

export function LabelPosition() {
  return (
    <div style={{ ...col, width: "min(100%, 360px)" }}>
      <Switch label="Require approval" labelPosition="end" description="Runs pause until a reviewer approves." defaultChecked />
      <Switch label="Auto-archive" labelPosition="start" description="After 90 days without activity." />
    </div>
  );
}

export function Controlled() {
  const [on, setOn] = useState(false);
  return (
    <div style={col}>
      <Switch label="Include Scope 3" checked={on} onCheckedChange={setOn} />
      <p style={{ margin: 0, fontSize: "var(--faun-type-body-sm-font-size)" }}>Scope 3 is {on ? "included" : "excluded"} in the total.</p>
    </div>
  );
}

export function Disabled() {
  return (
    <div style={col}>
      <Switch label="Locked by admin" checked disabled />
      <Switch label="Unavailable" disabled />
    </div>
  );
}

export function DoImmediate() {
  return <div style={col}><Switch label="Notify reviewers" description="Takes effect immediately." defaultChecked /></div>;
}

export function DontNeedsSave() {
  return <div style={col}><Switch label="Submit CSRD filing" description="Needs a Save button." /></div>;
}

export function StateContract() {
  return (
    <Stack gap="4">
      <Switch label="Email me when a run fails" readOnly defaultChecked description="Managed by your administrator." />
      <Switch label="Email me when a run fails" skeleton />
    </Stack>
  );
}
