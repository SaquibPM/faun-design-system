import { HeatmapChart } from "./HeatmapChart";

const sites = ["Pune plant", "Chennai plant", "Rotterdam DC", "Leeds office", "Austin lab"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const usage = [
  [820, 790, 770, 730, 700, 760, 790, 780], [540, 520, 500, 480, 470, 500, 520, 510], [210, 205, 200, 190, 185, 195, 205, 200],
  [90, 88, 85, 80, 78, 82, 86, 84], [160, 150, null, 140, 138, 145, 150, 148],
];
const variance = [
  [12, 8, 4, -2, -6, 5, 9, 7], [3, 1, -2, -4, -5, -1, 2, 1], [-3, -4, -6, -8, -9, -7, -5, -6], [0, 1, -1, -2, -3, -1, 0, 1], [6, 4, null, -3, -4, 2, 5, 3],
];

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <HeatmapChart title="Emissions by site and month" hideTitle legend={false} height={110} rows={sites} columns={months} values={usage} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <HeatmapChart
        title="Scope 1 emissions by site and month, 2026"
        description="Pune dominates every month; Austin has a missing reading in March."
        rowTitle="Site"
        columnTitle="Month"
        measure="Scope 1"
        unit="tCO₂e"
        rows={sites}
        columns={months}
        values={usage}
        showValues
      />
    </div>
  );
}

export function Diverging() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <HeatmapChart
        scale="diverging"
        positiveIs="worse"
        title="Variance against monthly budget, 2026"
        description="Oxblood cells are over budget and moss cells are under. Grey is on budget."
        rowTitle="Site"
        columnTitle="Month"
        measure="Variance"
        unit="%"
        rows={sites}
        columns={months}
        values={variance}
        showValues
      />
    </div>
  );
}

export function Loading() {
  return <div style={{ inlineSize: "100%" }}><HeatmapChart title="Emissions by site and month" loading rows={[]} columns={[]} values={[]} height={200} /></div>;
}

export function Empty() {
  return <div style={{ inlineSize: "100%" }}><HeatmapChart title="Emissions by site and month" rows={[]} columns={[]} values={[]} height={200} /></div>;
}

export function DoSequentialForMagnitude() {
  return <div style={{ inlineSize: "100%" }}><HeatmapChart title="Emissions, one hue low to high" height={170} rows={sites.slice(0, 3)} columns={months.slice(0, 5)} values={usage.slice(0, 3).map((r) => r.slice(0, 5))} measure="Scope 1" unit="tCO₂e" /></div>;
}

export function DontDivergingForMagnitude() {
  return <div style={{ inlineSize: "100%" }}><HeatmapChart scale="diverging" title="Emissions on a diverging scale" height={170} rows={sites.slice(0, 3)} columns={months.slice(0, 5)} values={usage.slice(0, 3).map((r) => r.slice(0, 5))} measure="Scope 1" unit="tCO₂e" midpoint={400} /></div>;
}
