import { Card, Field, Input, Textarea } from "@faun-ds/react";
import { useState } from "react";
import { actors, citations } from "../../utils/fixtures";
import { AISlot, type AISlotState } from "./AiSlot";

const explain = {
  agent: actors.scope3,
  model: "scope3-estimator 2026-09",
  summary: "Spend-based estimate from 148 supplier records.",
  confidence: { level: "medium" as const, score: 0.78 },
  sources: citations.slice(0, 2).map((c) => c.source),
};

function useSlot(original: string, initial: AISlotState = "suggested") {
  const [state, setState] = useState<AISlotState>(initial);
  const [value, setValue] = useState(original);
  return {
    state,
    value,
    onAccept: () => setState("accepted"),
    onRevert: () => { setValue(original); setState("accepted"); },
    onChange: (v: string) => { setValue(v); setState(v === original ? "accepted" : "edited"); },
    reset: () => { setValue(original); setState("suggested"); },
  };
}

export function Thumbnail() {
  return (
    <div style={{ inlineSize: 240 }}>
      <AISlot state="suggested"><Field label="Scope 3 cat. 1"><Input readOnly value="41,820 tCO₂e" /></Field></AISlot>
    </div>
  );
}

export function Overview() {
  const s = useSlot("41,820");
  return (
    <div style={{ inlineSize: "min(100%, 420px)" }}>
      <AISlot state={s.state} explain={explain} onAccept={s.onAccept} onRevert={s.onRevert}>
        <Field label="Scope 3 category 1 (tCO₂e)" description="Estimated from supplier spend.">
          <Input value={s.value} onChange={(e) => s.onChange(e.target.value)} inputMode="numeric" />
        </Field>
      </AISlot>
    </div>
  );
}

export function States() {
  return (
    <div style={{ display: "grid", gap: "var(--faun-space-4)", inlineSize: "min(100%, 420px)" }}>
      {(["suggested", "accepted", "edited"] as const).map((state) => (
        <AISlot key={state} state={state} explain={explain}>
          <Field label={`State: ${state}`}><Input readOnly value="41,820" /></Field>
        </AISlot>
      ))}
    </div>
  );
}

export function TextArea() {
  const original = "Scope 3 category 1 emissions were 41,820 tCO₂e in FY2025. The figure covers 148 of 163 suppliers by spend; the remainder is estimated.";
  const s = useSlot(original);
  return (
    <div style={{ inlineSize: "min(100%, 560px)" }}>
      <AISlot state={s.state} explain={{ ...explain, agent: actors.narrative }} onAccept={s.onAccept} onRevert={s.onRevert}>
        <Field label="ESRS E1-6 narrative"><Textarea value={s.value} onChange={(e) => s.onChange(e.target.value)} minRows={4} /></Field>
      </AISlot>
    </div>
  );
}

export function Block() {
  const s = useSlot("x");
  return (
    <div style={{ inlineSize: "min(100%, 460px)" }}>
      <AISlot kind="block" state={s.state} explain={explain} onAccept={s.onAccept} onRevert={s.onRevert} labels={{ suggested: "AI suggested summary" }}>
        <Card style={{ padding: "var(--faun-space-4)" }}>
          <strong>Supplier engagement summary</strong>
          <p style={{ margin: "var(--faun-space-2) 0 0" }}>15 suppliers account for 9% of spend and have no measured data. Request primary data from the five largest first.</p>
        </Card>
      </AISlot>
    </div>
  );
}

export function DoAccept() {
  return <div style={{ inlineSize: 320 }}><AISlot state="suggested"><Field label="Reporting boundary"><Input readOnly value="Operational control" /></Field></AISlot></div>;
}

export function DontSilentFill() {
  return <div style={{ inlineSize: 320 }}><Field label="Reporting boundary"><Input readOnly value="Operational control" /></Field></div>;
}
