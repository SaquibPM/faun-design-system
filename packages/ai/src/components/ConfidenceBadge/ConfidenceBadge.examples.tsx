import { ConfidenceBadge } from "./ConfidenceBadge";

export function Thumbnail() {
  return (
    <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
      <ConfidenceBadge confidence={{ level: "high", score: 0.94 }} showScore />
      <ConfidenceBadge confidence={{ level: "low", score: 0.41 }} showScore />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <ConfidenceBadge confidence={{ level: "high", score: 0.94 }} />
      <ConfidenceBadge confidence={{ level: "medium", score: 0.72 }} />
      <ConfidenceBadge confidence={{ level: "low", score: 0.41 }} />
    </div>
  );
}

export function WithScore() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <ConfidenceBadge showScore confidence={{ level: "high", score: 0.94 }} />
      <ConfidenceBadge showScore confidence={{ level: "medium", score: 0.72 }} />
      <ConfidenceBadge showScore confidence={{ level: "low", score: 0.41 }} />
    </div>
  );
}

export function WithReason() {
  return (
    <ConfidenceBadge
      confidence={{ level: "low", score: 0.41, reason: "Matched on supplier name only. No invoice or unit of measure was found for this row." }}
      showScore
    />
  );
}

export function Small() {
  return <ConfidenceBadge size="sm" confidence={{ level: "medium", score: 0.72 }} />;
}

export function DoShowReason() {
  return <ConfidenceBadge showScore confidence={{ level: "low", score: 0.41, reason: "Supplier matched on name only." }} />;
}

export function DontScoreAlone() {
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>0.41</span>;
}
