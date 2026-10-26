import { NOW, actors, provenance } from "../../utils/fixtures";
import type { ProvenanceNode } from "../../utils/types";
import { ProvenanceTrail } from "./ProvenanceTrail";

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "min(100%, 300px)" }}>
      <ProvenanceTrail now={NOW} nodes={[provenance[1]!, provenance[4]!, provenance[5]!].map((n) => ({ ...n, actor: undefined, at: undefined, detail: undefined }))} aria-label="Lineage" />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "min(100%, 640px)" }}>
      <ProvenanceTrail now={NOW} nodes={provenance} aria-label="Lineage of ESRS E1-6 Scope 2, Pune plant" />
    </div>
  );
}

export function WithEstimate() {
  const nodes: ProvenanceNode[] = [
    { id: "e1", kind: "source", title: "Electricity invoices, Pune plant, FY2025", detail: "11 of 12 monthly bills received." },
    { id: "e2", kind: "extraction", title: "Consumption read from 11 bills", value: "1,177 MWh", actor: actors.collector, at: "2026-10-18T10:20:00Z" },
    { id: "e3", kind: "estimate", title: "March bill missing: 11-month average used", detail: "Replace with the invoice when it arrives.", value: "107 MWh", actor: actors.collector, at: "2026-10-18T10:21:00Z" },
    { id: "e4", kind: "calculation", title: "1,284 MWh × 0.716 tCO₂e/MWh", value: "919.3 tCO₂e", actor: actors.calc, at: "2026-10-21T09:06:00Z" },
    { id: "e5", kind: "datapoint", title: "ESRS E1-6: Scope 2, location-based, Pune plant", value: "919 tCO₂e" },
  ];
  return (
    <div style={{ inlineSize: "min(100%, 640px)" }}>
      <ProvenanceTrail now={NOW} nodes={nodes} aria-label="Lineage with an estimate" />
    </div>
  );
}

export function Short() {
  return (
    <div style={{ inlineSize: "min(100%, 520px)" }}>
      <ProvenanceTrail now={NOW} nodes={[provenance[3]!, provenance[4]!, provenance[5]!]} aria-label="Lineage from factor" />
    </div>
  );
}

export function DoShowTheValueAtEachStep() {
  return <div style={{ inlineSize: "min(100%, 420px)" }}><ProvenanceTrail now={NOW} nodes={[provenance[1]!, provenance[5]!].map((n) => ({ ...n, actor: undefined, at: undefined }))} aria-label="Lineage" /></div>;
}

export function DontStepsWithoutValues() {
  return <div style={{ inlineSize: "min(100%, 420px)" }}><ProvenanceTrail now={NOW} nodes={[{ id: "a", kind: "extraction", title: "Data processed" }, { id: "b", kind: "datapoint", title: "Value stored" }]} aria-label="Lineage" /></div>;
}
