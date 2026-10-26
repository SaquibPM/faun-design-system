import { Timeline, type TimelineItem } from "./Timeline";

const items: TimelineItem[] = [
  { id: "1", actor: { name: "CSRD Narrative Agent", kind: "agent" }, action: "drafted ESRS E1-6 and cited 41 evidence items", time: "2026-10-20T09:18:00Z", timeLabel: "20 Oct, 09:18", status: { domain: "run", state: "awaiting_approval" }, details: <p style={{ margin: 0 }}>Read 312 ledger rows, matched 298 to DEFRA 2025 factors and flagged 14 rows with missing units.</p> },
  { id: "2", actor: { name: "Priya Nair" }, action: "approved the materiality matrix", time: "2026-10-19T16:40:00Z", timeLabel: "19 Oct, 16:40", status: { domain: "approval", state: "approved" } },
  { id: "3", actor: { name: "Supplier engagement agent", kind: "agent" }, action: "collected Scope 3 Cat. 1 data from 148 suppliers", time: "2026-10-18T11:05:00Z", timeLabel: "18 Oct, 11:05" },
];

export function Thumbnail() {
  return <div style={{ inlineSize: "min(100%, 260px)" }}><Timeline density="dense" items={items.slice(1)} aria-label="Audit trail" /></div>;
}

export function Overview() {
  return (
    <div style={{ inlineSize: "min(100%, 520px)" }}>
      <Timeline items={items} aria-label="Audit trail for the CSRD statement" />
    </div>
  );
}

export function Dense() {
  return (
    <div style={{ inlineSize: "min(100%, 360px)" }}>
      <Timeline density="dense" items={items.map((i) => ({ ...i, details: undefined }))} aria-label="Audit trail" />
    </div>
  );
}

export function OpenDetails() {
  return (
    <div style={{ inlineSize: "min(100%, 520px)" }}>
      <Timeline items={[{ ...items[0]!, defaultOpen: true }]} aria-label="Latest change" />
    </div>
  );
}

export function DoSentenceFragment() {
  return <div style={{ inlineSize: "min(100%, 420px)" }}><Timeline items={[items[1]!]} aria-label="Approval" /></div>;
}

export function DontFullSentence() {
  return <div style={{ inlineSize: "min(100%, 420px)" }}><Timeline items={[{ ...items[1]!, action: "Priya Nair has approved the materiality matrix." }]} aria-label="Approval" /></div>;
}
