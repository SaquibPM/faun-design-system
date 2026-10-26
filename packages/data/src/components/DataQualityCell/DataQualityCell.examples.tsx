import { DataQualityCell } from "./DataQualityCell";

export function Thumbnail() {
  return <DataQualityCell state="estimated" value="9,310" unit="tCO₂e" />;
}

export function Overview() {
  return <DataQualityCell state="evidenced" value="18,240" unit="tCO₂e" source="Utility invoices, Jan to Dec 2025" />;
}

export function AllStates() {
  return (
    <div style={{ display: "grid", gap: "var(--faun-space-3)", gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))", inlineSize: "100%" }}>
      <DataQualityCell state="actual" value="18,240" unit="tCO₂e" />
      <DataQualityCell state="evidenced" value="9,310" unit="tCO₂e" />
      <DataQualityCell state="estimated" value="8,120" unit="tCO₂e" />
      <DataQualityCell state="partial" value="96,400" unit="tCO₂e" />
      <DataQualityCell state="missing" />
      <DataQualityCell state="gap" />
    </div>
  );
}

export function Numeric() {
  return (
    <div style={{ inlineSize: "min(100%, 320px)", display: "grid", gap: "var(--faun-space-3)" }}>
      <DataQualityCell numeric state="actual" value="18,240" unit="tCO₂e" />
      <DataQualityCell numeric state="estimated" value="142,880" unit="tCO₂e" source="Spend-based, EEIO factors" />
      <DataQualityCell numeric state="missing" />
    </div>
  );
}

export function DoStateWithFigure() {
  return <DataQualityCell state="estimated" value="8,120" unit="tCO₂e" source="Residual mix factor 2024" />;
}

export function DontHideMissing() {
  return <DataQualityCell state="actual" value="0" unit="tCO₂e" />;
}
