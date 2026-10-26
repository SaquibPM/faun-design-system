import { useState } from "react";
import { Tile, ClickableTile, ExpandableTile, SelectableTile, TileGroup } from "./Tile";

const wrap = { inlineSize: "min(100%, 560px)" } as const;
const muted = { color: "var(--faun-fg-muted)", fontWeight: "var(--faun-font-weight-regular)" } as const;

export function Thumbnail() {
  return (
    <div style={{ inlineSize: 220 }}>
      <TileGroup legend="Framework" hideLegend type="radio" defaultValue="csrd" minTileWidth="6rem">
        <SelectableTile value="csrd"><span>CSRD</span></SelectableTile>
      </TileGroup>
    </div>
  );
}

export function Overview() {
  const [v, setV] = useState<string | null>("csrd");
  return (
    <div style={wrap}>
      <TileGroup legend="Reporting framework" description="Choose the framework this filing follows." type="radio" value={v} onValueChange={setV}>
        <SelectableTile value="csrd"><span>CSRD</span><span style={muted}>ESRS set 1, double materiality</span></SelectableTile>
        <SelectableTile value="issb"><span>ISSB</span><span style={muted}>IFRS S1 and S2</span></SelectableTile>
        <SelectableTile value="gri"><span>GRI</span><span style={muted}>Universal standards 2021</span></SelectableTile>
      </TileGroup>
    </div>
  );
}

export function Base() {
  return (
    <div style={wrap}>
      <Tile>
        <span className="faun-tile-body">
          <span>Scope 1</span>
          <span style={muted}>3,212.6 tCO₂e from fuel and fleet</span>
        </span>
      </Tile>
    </div>
  );
}

export function Clickable() {
  return (
    <div style={{ ...wrap, display: "grid", gap: "var(--faun-space-3)" }}>
      <ClickableTile href="#scope-3"><span>Open the Scope 3 inventory</span><span style={muted}>14 categories, 3 with gaps</span></ClickableTile>
      <ClickableTile onClick={() => {}}><span>Start a new calculation run</span><span style={muted}>Uses the approved factor set</span></ClickableTile>
      <ClickableTile href="#locked" disabled><span>Restate the base year</span><span style={muted}>Needs an approver role</span></ClickableTile>
    </div>
  );
}

export function SelectableCheckbox() {
  const [vals, setVals] = useState<string[]>(["s1", "s2"]);
  return (
    <div style={wrap}>
      <TileGroup legend="Scopes in this report" description="Choose every scope to include." type="checkbox" values={vals} onValuesChange={setVals}>
        <SelectableTile value="s1"><span>Scope 1</span><span style={muted}>Direct emissions</span></SelectableTile>
        <SelectableTile value="s2"><span>Scope 2</span><span style={muted}>Purchased energy</span></SelectableTile>
        <SelectableTile value="s3"><span>Scope 3</span><span style={muted}>Value chain</span></SelectableTile>
        <SelectableTile value="bio" disabled><span>Biogenic</span><span style={muted}>Not enabled for this entity</span></SelectableTile>
      </TileGroup>
    </div>
  );
}

export function SelectableAlone() {
  return (
    <div style={wrap}>
      <SelectableTile defaultSelected><span>Notify me when a run needs approval</span><span style={muted}>Email and in-app</span></SelectableTile>
    </div>
  );
}

export function Expandable() {
  return (
    <div style={{ ...wrap, display: "grid", gap: "var(--faun-space-3)" }}>
      <ExpandableTile summary={<><span>Scope 2 methods</span><span style={muted}>Location and market based</span></>} defaultOpen>
        <p style={{ margin: 0 }}>Report both. Market-based uses supplier-specific factors where you hold contracts; location-based uses grid averages.</p>
      </ExpandableTile>
      <ExpandableTile summary={<><span>Base year policy</span><span style={muted}>Restated when change exceeds 5%</span></>}>
        <p style={{ margin: 0 }}>Structural changes and methodology corrections that move the base year total by more than 5% trigger a restatement.</p>
      </ExpandableTile>
    </div>
  );
}

export function ReadOnlyGroup() {
  return (
    <div style={wrap}>
      <TileGroup legend="Reporting framework" type="radio" defaultValue="csrd" readOnly description="Set by the approved filing plan.">
        <SelectableTile value="csrd"><span>CSRD</span></SelectableTile>
        <SelectableTile value="issb"><span>ISSB</span></SelectableTile>
      </TileGroup>
    </div>
  );
}

export function DoLabelled() {
  return <div style={wrap}><ClickableTile href="#scope-3"><span>Open the Scope 3 inventory</span><span style={muted}>14 categories</span></ClickableTile></div>;
}

export function DontVague() {
  return <div style={wrap}><ClickableTile href="#scope-3"><span>Click here</span></ClickableTile></div>;
}
