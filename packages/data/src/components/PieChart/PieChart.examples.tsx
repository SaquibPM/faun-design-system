import { PieChart } from "./PieChart";

const scopes = [
  { id: "scope-1", label: "Scope 1", value: 18240 },
  { id: "scope-2", label: "Scope 2", value: 9310 },
  { id: "scope-3", label: "Scope 3", value: 142880 },
];
const sources = [
  { id: "grid", label: "Grid", value: 5200 }, { id: "solar", label: "Solar", value: 2100 }, { id: "wind", label: "Wind", value: 1400 }, { id: "ppa", label: "Power purchase agreements", value: 900 },
];

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <PieChart variant="donut" title="Emissions by scope" hideTitle legend={false} height={110} slices={scopes} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <PieChart
        title="Electricity by source, FY2026"
        description="Grid supply is still more than half of consumption."
        unit="MWh"
        showShares
        slices={sources}
      />
    </div>
  );
}

export function Donut() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <PieChart
        variant="donut"
        title="Emissions by scope, FY2026"
        description="Scope 3 is 84% of the footprint."
        unit="tCO₂e"
        centerLabel="Total footprint"
        slices={scopes}
      />
    </div>
  );
}

export function DonutCustomCenter() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <PieChart
        variant="donut"
        title="Assurance status of reported datapoints"
        description="The centre shows the headline share, not the total."
        centerValue="72%"
        centerLabel="assured"
        showShares
        slices={[{ id: "assured", label: "Assured", value: 288 }, { id: "review", label: "In review", value: 76 }, { id: "unassured", label: "Not assured", value: 36 }]}
      />
    </div>
  );
}

export function SliceToggle() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <PieChart toggleSeries variant="donut" title="Electricity by source" unit="MWh" slices={sources} />
    </div>
  );
}

export function Loading() {
  return <div style={{ inlineSize: "100%" }}><PieChart title="Emissions by scope" loading slices={[]} height={200} /></div>;
}

export function Empty() {
  return <div style={{ inlineSize: "100%" }}><PieChart title="Emissions by scope" slices={[]} height={200} /></div>;
}

export function DoFewSlices() {
  return <div style={{ inlineSize: "100%" }}><PieChart variant="donut" title="Emissions by scope" unit="tCO₂e" height={200} slices={scopes} /></div>;
}

export function DontManySlices() {
  const many = Array.from({ length: 8 }, (_, i) => ({ id: `c${i}`, label: `Category ${i + 1}`, value: 100 + ((i * 37) % 60) }));
  return <div style={{ inlineSize: "100%" }}><PieChart title="Scope 3 by category (all eight)" height={200} slices={many} /></div>;
}
