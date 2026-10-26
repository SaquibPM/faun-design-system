import { JsonViewer } from "./JsonViewer";

const run = {
  runId: "run_01HX9Q4T",
  agent: "CSRD narrative agent",
  status: "awaiting_approval",
  confidence: 0.91,
  inputs: { framework: "ESRS E1", period: { from: "2025-01-01", to: "2025-12-31" }, scopes: [1, 2, 3] },
  output: {
    datapoint: "E1-6.44",
    value: 18240,
    unit: "tCO₂e",
    evidence: [
      { id: "ev_204", kind: "invoice", source: "Utility invoices, Jan to Dec 2025" },
      { id: "ev_211", kind: "meter", source: "Pune plant meter export" },
    ],
    estimated: false,
  },
  approvedBy: null,
};

export function Thumbnail() {
  return <JsonViewer label="Run payload" toolbar={false} defaultExpandedDepth={1} data={{ datapoint: "E1-6.44", value: 18240, unit: "tCO₂e", estimated: false }} />;
}

export function Overview() {
  return <div style={{ inlineSize: "100%" }}><JsonViewer label="Agent run payload" data={run} /></div>;
}

export function Expanded() {
  return <div style={{ inlineSize: "100%" }}><JsonViewer label="Agent run payload, expanded" data={run} defaultExpandedDepth={Infinity} maxHeight="20rem" /></div>;
}

export function Collapsed() {
  return <div style={{ inlineSize: "100%" }}><JsonViewer label="Agent run payload, collapsed" data={run} defaultExpandedDepth={0} /></div>;
}

export function DoLabel() {
  return <div style={{ inlineSize: "100%" }}><JsonViewer label="Emission factor record" toolbar={false} data={{ id: "ef_defra_2025_elec", factor: 0.207, unit: "kgCO₂e/kWh" }} /></div>;
}

export function DontRawText() {
  return <pre style={{ margin: 0, padding: "var(--faun-space-3)", background: "var(--faun-bg-surface-nested)", border: "1px solid var(--faun-border-subtle)", borderRadius: "var(--faun-radius-lg)", overflow: "auto", font: "var(--faun-type-code-sm-font-size) var(--faun-font-family-mono)" }}>{`{"id":"ef_defra_2025_elec","factor":0.207,"unit":"kgCO₂e/kWh"}`}</pre>;
}
