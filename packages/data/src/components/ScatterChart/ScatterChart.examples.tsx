import { ScatterChart } from "./ScatterChart";

const plants = [
  { x: 120, y: 8.2, size: 900, label: "Pune plant" }, { x: 80, y: 5.4, size: 620, label: "Chennai plant" }, { x: 46, y: 3.6, size: 410, label: "Leeds plant" },
  { x: 150, y: 9.9, size: 1100, label: "Monterrey plant" }, { x: 30, y: 2.1, size: 200, label: "Rotterdam plant" },
];
const hubs = [
  { x: 60, y: 3.9, size: 400, label: "Leeds hub" }, { x: 20, y: 1.2, size: 90, label: "Austin hub" }, { x: 95, y: 4.4, size: 520, label: "Rotterdam hub" }, { x: 40, y: 2.6, size: 250, label: "Pune hub" },
];

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <ScatterChart title="Energy against emissions" hideTitle legend={false} height={110} series={[{ id: "a", label: "Plants", points: plants }, { id: "b", label: "Hubs", points: hubs }]} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <ScatterChart
        title="Energy use against emissions by site, FY2026"
        description="Sites above the trend burn a dirtier mix of energy."
        xTitle="Energy use"
        xUnit="GWh"
        yTitle="Emissions"
        unit="ktCO₂e"
        series={[{ id: "plants", label: "Plants", points: plants }, { id: "hubs", label: "Distribution hubs", points: hubs }]}
      />
    </div>
  );
}

export function Bubble() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <ScatterChart
        variant="bubble"
        title="Energy, emissions and output by site"
        description="Bubble area is annual output, so a large bubble high on the chart is a big producer that is also carbon heavy."
        xTitle="Energy use"
        xUnit="GWh"
        yTitle="Emissions"
        unit="ktCO₂e"
        sizeTitle="Output"
        sizeUnit="kt"
        series={[{ id: "plants", label: "Plants", points: plants }, { id: "hubs", label: "Distribution hubs", points: hubs }]}
      />
    </div>
  );
}

export function WithLimit() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <ScatterChart
        title="Supplier spend against emissions intensity"
        xTitle="Annual spend"
        xUnit="£m"
        yTitle="Intensity"
        unit="tCO₂e/£m"
        series={[{ id: "s", label: "Suppliers", points: [{ x: 4, y: 9.1, label: "Alder Chemicals" }, { x: 12, y: 6.2, label: "Northern Steel Works" }, { x: 7, y: 3.1, label: "Kestrel Logistics" }, { x: 18, y: 2.2, label: "Bharat Packaging" }, { x: 2, y: 4.8, label: "Meridian Plastics" }] }]}
        references={[{ label: "Policy limit", value: 6, kind: "target" }]}
        legend
      />
    </div>
  );
}

export function SeriesToggle() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <ScatterChart
        toggleSeries
        title="Energy use against emissions by site type"
        xTitle="Energy use"
        xUnit="GWh"
        yTitle="Emissions"
        unit="ktCO₂e"
        series={[{ id: "plants", label: "Plants", points: plants }, { id: "hubs", label: "Distribution hubs", points: hubs }]}
      />
    </div>
  );
}

export function Loading() {
  return <div style={{ inlineSize: "100%" }}><ScatterChart title="Energy against emissions" loading series={[]} height={200} /></div>;
}

export function Empty() {
  return <div style={{ inlineSize: "100%" }}><ScatterChart title="Energy against emissions" series={[]} height={200} /></div>;
}

export function DoLabelPoints() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <ScatterChart title="Energy against emissions" height={200} xTitle="Energy" xUnit="GWh" yTitle="Emissions" unit="ktCO₂e" series={[{ id: "p", label: "Plants", points: plants.slice(0, 4) }]} legend />
    </div>
  );
}

export function DontTooManySeries() {
  const many = Array.from({ length: 6 }, (_, k) => ({ id: `s${k}`, label: `Region ${k + 1}`, points: plants.map((p, i) => ({ x: p.x + k * 7 + i, y: p.y + ((k * 3 + i) % 4) * 0.4 })) }));
  return (
    <div style={{ inlineSize: "100%" }}>
      <ScatterChart title="Energy against emissions, six regions" height={200} xTitle="Energy" xUnit="GWh" yTitle="Emissions" unit="ktCO₂e" series={many} />
    </div>
  );
}
