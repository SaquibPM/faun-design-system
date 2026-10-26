import { Stack } from "../Layout/Layout";
import { ScrollArea } from "./ScrollArea";

const log = [
  "09:12 CSRD Narrative Agent started run 418",
  "09:12 Read 312 ledger rows for Scope 1",
  "09:13 Matched 298 rows to DEFRA 2025 factors",
  "09:13 Flagged 14 rows with missing units",
  "09:14 Drafted ESRS E1-6 paragraph 1 of 4",
  "09:15 Drafted ESRS E1-6 paragraph 2 of 4",
  "09:16 Drafted ESRS E1-6 paragraph 3 of 4",
  "09:17 Drafted ESRS E1-6 paragraph 4 of 4",
  "09:18 Cited 41 evidence items",
  "09:18 Waiting for approval from Priya Nair",
];

export function Thumbnail() {
  return (
    <ScrollArea maxHeight="5rem" style={{ inlineSize: "11rem" }}>
      <Stack gap="1">{log.slice(0, 5).map((l) => <span key={l}>{l.slice(6)}</span>)}</Stack>
    </ScrollArea>
  );
}

export function Overview() {
  return (
    <ScrollArea label="Run log" maxHeight="10rem" style={{ inlineSize: "min(100%, 420px)", border: "var(--faun-border-width-hairline) solid var(--faun-border-subtle)", borderRadius: "var(--faun-radius-md)" }}>
      <Stack gap="2" style={{ padding: "var(--faun-space-3)" }}>
        {log.map((l) => <span key={l} style={{ fontFamily: "var(--faun-font-family-mono)", fontSize: "var(--faun-type-caption-font-size)" }}>{l}</span>)}
      </Stack>
    </ScrollArea>
  );
}

export function Horizontal() {
  return (
    <ScrollArea orientation="horizontal" label="Quarterly emissions" style={{ inlineSize: "min(100%, 420px)" }}>
      <div style={{ display: "flex", gap: "var(--faun-space-6)", padding: "var(--faun-space-3)", inlineSize: "max-content" }}>
        {["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "Q1 2026", "Q2 2026", "Q3 2026"].map((q) => <span key={q}>{q}</span>)}
      </div>
    </ScrollArea>
  );
}

export function DoLabelRegion() {
  return (
    <ScrollArea label="Evidence list" maxHeight="4rem" style={{ inlineSize: "min(100%, 320px)" }}>
      <Stack gap="1">{["Invoice 4412", "Meter reading Oct", "Supplier survey", "Grid certificate", "Audit memo"].map((x) => <span key={x}>{x}</span>)}</Stack>
    </ScrollArea>
  );
}

export function DontNested() {
  return (
    <ScrollArea maxHeight="4rem" style={{ inlineSize: "min(100%, 320px)" }}>
      <ScrollArea maxHeight="2rem"><Stack gap="1">{["One", "Two", "Three", "Four"].map((x) => <span key={x}>{x}</span>)}</Stack></ScrollArea>
      <Stack gap="1">{["Five", "Six", "Seven"].map((x) => <span key={x}>{x}</span>)}</Stack>
    </ScrollArea>
  );
}
