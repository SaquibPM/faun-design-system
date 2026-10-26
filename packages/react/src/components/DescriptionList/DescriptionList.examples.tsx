import { StatusBadge } from "../Badge/Badge";
import { DescriptionList } from "./DescriptionList";

export function Thumbnail() {
  return <DescriptionList style={{ inlineSize: 220 }} termWidth="70px" items={[{ term: "Standard", value: "ESRS E1" }, { term: "Period", value: "FY2026" }]} />;
}

export function Overview() {
  return (
    <DescriptionList
      style={{ inlineSize: "min(100%, 460px)" }}
      items={[
        { term: "Datapoint", value: "Gross Scope 1 GHG emissions" },
        { term: "Disclosure", value: "ESRS E1-6 §44(a)", mono: true },
        { term: "Value", value: "3,212.6 tCO₂e" },
        { term: "Source", value: "Ledger · 418 rows" },
        { term: "Quality", value: <StatusBadge domain="data-quality" state="evidenced" /> },
        { term: "Run ID", value: "run_482_9f3a1c", mono: true, copyValue: "run_482_9f3a1c" },
      ]}
    />
  );
}

const items = [
  { term: "Orchestrator", value: "CSRD Filing Orchestrator" },
  { term: "Entity", value: "Acme Industrial GmbH" },
  { term: "Boundary", value: "Operational control" },
  { term: "Run ID", value: "run_482_9f3a1c", mono: true, copyValue: "run_482_9f3a1c" },
];

export function Stacked() {
  return <DescriptionList layout="stacked" items={items} style={{ inlineSize: "min(100%, 300px)" }} />;
}

export function Plain() {
  return <DescriptionList divided={false} items={items} style={{ inlineSize: "min(100%, 420px)" }} />;
}

export function CopyValues() {
  return (
    <DescriptionList
      style={{ inlineSize: "min(100%, 460px)" }}
      items={[
        { term: "Factor ID", value: "defra-2026-diesel-l", mono: true, copyValue: "defra-2026-diesel-l" },
        { term: "Hash", value: "sha256:9f3a1c…e41b", mono: true, copyValue: "sha256:9f3a1c0b72d84e3f95a1c6b0d7e2a8f4c3b19d5e0a7f6c2b8d4e1a3f5c7b9e41b" },
      ]}
    />
  );
}

export function DoLabelsShort() {
  return <DescriptionList style={{ inlineSize: 300 }} termWidth="90px" items={[{ term: "Boundary", value: "Operational control" }, { term: "Period", value: "FY2026" }]} />;
}

export function DontSentenceLabels() {
  return <DescriptionList style={{ inlineSize: 300 }} termWidth="90px" items={[{ term: "The consolidation boundary that applies", value: "Operational control" }, { term: "Which reporting period", value: "FY2026" }]} />;
}
