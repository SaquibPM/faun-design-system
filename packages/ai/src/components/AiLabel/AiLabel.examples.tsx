import { useState } from "react";
import { Link } from "@faun-ds/react";
import { actors, citations } from "../../utils/fixtures";
import { AILabel } from "./AiLabel";

const explain = {
  agent: actors.narrative,
  model: "narrative-drafter 2026-09",
  summary: "Drafted from 148 supplier records and the DEFRA 2025 factors. 15 suppliers are estimated from spend.",
  confidence: { level: "medium" as const, score: 0.78, reason: "15 of 163 suppliers have no measured data." },
  sources: citations.map((c) => c.source),
};

export function Thumbnail() {
  return <AILabel agent={actors.narrative} />;
}

export function Overview() {
  return <div style={{ minBlockSize: 120 }}><AILabel {...explain} /></div>;
}

export function Explained() {
  return (
    <div style={{ minBlockSize: 520, inlineSize: "100%" }}>
      <AILabel defaultOpen {...explain} actions={<Link href="#method">How drafting works</Link>} />
    </div>
  );
}

export function Kinds() {
  return (
    <div style={{ display: "flex", gap: "var(--faun-space-3)", alignItems: "center", flexWrap: "wrap" }}>
      <AILabel agent={actors.narrative} />
      <AILabel agent={actors.narrative} text="AI suggested" />
      <AILabel agent={actors.narrative} size="sm" />
      <AILabel agent={actors.narrative} kind="icon" />
      <AILabel agent={actors.narrative} kind="icon" size="sm" />
    </div>
  );
}

export function WithRevert() {
  const [value, setValue] = useState("43,100");
  const original = "41,820";
  return (
    <div style={{ display: "grid", gap: "var(--faun-space-3)", justifyItems: "start", minBlockSize: 340 }}>
      <p style={{ margin: 0 }}>Scope 3 category 1: <strong>{value}</strong> tCO₂e</p>
      <AILabel {...explain} modified={value !== original} onRevert={() => setValue(original)} />
      <button type="button" onClick={() => setValue("43,100")} style={{ font: "inherit" }}>Edit the figure</button>
    </div>
  );
}

export function DoNameTheAgent() {
  return <AILabel agent={actors.narrative} text="AI generated" />;
}

export function DontDecoration() {
  return <span style={{ color: "var(--faun-ai-fg)" }}>✦ (a sparkle with no words or explanation)</span>;
}
