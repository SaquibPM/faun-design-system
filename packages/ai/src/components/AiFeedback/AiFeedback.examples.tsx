import { useState } from "react";
import { AIFeedback } from "./AiFeedback";

export function Thumbnail() {
  return <AIFeedback text="x" onRegenerate={() => {}} />;
}

export function Overview() {
  return <AIFeedback text="Scope 3 category 1 is 41,820 tCO₂e for FY2025, covering 148 of 163 suppliers." onRegenerate={() => {}} />;
}

export function WithReasons() {
  const [last, setLast] = useState("");
  return (
    <div style={{ display: "grid", gap: "var(--faun-space-2)" }}>
      <AIFeedback defaultValue="not-helpful" reasons={["Inaccurate", "Missing sources", "Too long", "Not what I asked"]} onReason={setLast} onRegenerate={() => {}} text="Draft" />
      <span style={{ color: "var(--faun-fg-muted)" }}>{last ? `Sent: ${last}` : "No reason sent yet"}</span>
    </div>
  );
}

export function Regenerating() {
  const [busy, setBusy] = useState(false);
  return <AIFeedback text="Draft" regenerating={busy} onRegenerate={() => { setBusy(true); setTimeout(() => setBusy(false), 1600); }} />;
}

export function DoOnlyWhatWorks() {
  return <AIFeedback hide={{ regenerate: true }} text="Copy me" />;
}

export function DontDeadButtons() {
  return <AIFeedback onRegenerate={() => {}} />;
}
