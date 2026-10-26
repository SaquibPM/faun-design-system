import { DefinitionTooltip } from "./DefinitionTooltip";

export function Thumbnail() {
  return <span>Report <DefinitionTooltip definition="Value-chain emissions.">Scope 3</DefinitionTooltip></span>;
}

export function Overview() {
  return (
    <p style={{ margin: 0, maxInlineSize: "var(--faun-layout-reading-max)" }}>
      Disclose gross <DefinitionTooltip definition="Greenhouse gases other than CO2, weighted by warming potential and expressed as tonnes of CO2 equivalent.">tCO₂e</DefinitionTooltip> for each scope, then the <DefinitionTooltip definition="The year against which targets and restatements are measured.">base year</DefinitionTooltip> comparison.
    </p>
  );
}

export function InTable() {
  return (
    <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", gap: "var(--faun-space-2) var(--faun-space-6)" }}>
      <dt><DefinitionTooltip definition="Emissions from electricity bought on the market, using supplier-specific factors.">Market-based</DefinitionTooltip></dt><dd style={{ margin: 0 }}>4,120 tCO₂e</dd>
      <dt><DefinitionTooltip definition="Emissions from electricity using the average grid factor for the location.">Location-based</DefinitionTooltip></dt><dd style={{ margin: 0 }}>5,380 tCO₂e</dd>
    </dl>
  );
}

export function DoOneTerm() {
  return <span>Reported in <DefinitionTooltip definition="Tonnes of carbon dioxide equivalent.">tCO₂e</DefinitionTooltip></span>;
}

export function DontLinks() {
  return <span>Reported in tCO₂e (hover for a link)</span>;
}
