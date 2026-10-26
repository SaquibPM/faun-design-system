import { useState } from "react";
import { Field } from "../Field/Field";
import { Textarea } from "./Textarea";
import { Stack } from "../Layout/Layout";

const col = { display: "grid", gap: "var(--faun-space-4)", width: "min(100%, 400px)" } as const;

export function Thumbnail() {
  return <div style={col}><Textarea aria-label="Note" defaultValue="Spend-based method used where supplier data was unavailable." minRows={2} /></div>;
}

export function Overview() {
  return (
    <div style={col}>
      <Field label="Methodology note" description="Shown to auditors alongside the datapoint.">
        <Textarea placeholder="Describe how this figure was calculated" />
      </Field>
    </div>
  );
}

export function AutoGrow() {
  return (
    <div style={col}>
      <Field label="Assumptions">
        <Textarea autoGrow minRows={2} maxRows={6} defaultValue={"Emission factors from DEFRA 2025.\nGrid factor for the UK from IEA.\nExcludes leased vehicles under 12 months."} />
      </Field>
    </div>
  );
}

export function CharacterCount() {
  const [v, setV] = useState("Scope 2 market-based figures reflect 2025 supplier certificates.");
  return (
    <div style={col}>
      <Field label="Disclosure summary" description="Appears in the CSRD statement.">
        <Textarea showCount maxLength={200} value={v} onChange={(e) => setV(e.target.value)} />
      </Field>
    </div>
  );
}

export function Invalid() {
  return (
    <div style={col}>
      <Field label="Justification" error="Add at least one sentence explaining why this topic is not material.">
        <Textarea defaultValue="" />
      </Field>
    </div>
  );
}

export function Resize() {
  return (
    <div style={col}>
      <Textarea aria-label="Resizable" resize="vertical" defaultValue="Drag the corner to resize." minRows={2} />
      <Textarea aria-label="Fixed" resize="none" defaultValue="This one stays the same size." minRows={2} />
    </div>
  );
}

export function Disabled() {
  return <div style={col}><Field label="Reviewer comment" disabled><Textarea defaultValue="Locked after approval." /></Field></div>;
}

export function DoLongForm() {
  return <div style={col}><Field label="Explain the variance"><Textarea placeholder="What changed since last year and why?" /></Field></div>;
}

export function DontShortAnswer() {
  return <div style={col}><Field label="Site name"><Textarea minRows={3} placeholder="Name" /></Field></div>;
}

export function StateContract() {
  return (
    <Stack gap="4" style={{ inlineSize: "min(100%, 400px)" }}>
      <Field label="Scope 2 method" warn="Differs from last year's method. Restate the base year if this is intended."><Textarea defaultValue="Market-based, supplier-specific factors where available." /></Field>
      <Field label="Scope 2 method" readOnly description="Set by the approved methodology."><Textarea defaultValue="Market-based, supplier-specific factors where available." /></Field>
      <Field label="Scope 2 method" skeleton><Textarea defaultValue="Market-based, supplier-specific factors where available." /></Field>
    </Stack>
  );
}
