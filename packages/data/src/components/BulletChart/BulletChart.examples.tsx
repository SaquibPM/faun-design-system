import { BulletChart } from "./BulletChart";

const kpis = [
  { id: "ren", label: "Renewable electricity", value: 62, target: 70, ranges: [40, 60, 100] },
  { id: "dq", label: "Data completeness", value: 91, target: 95, ranges: [70, 90, 100] },
  { id: "sup", label: "Suppliers with targets", value: 48, target: 60, ranges: [30, 50, 100] },
  { id: "ass", label: "Assured datapoints", value: 72, target: 80, ranges: [50, 75, 100] },
];

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <BulletChart title="Programme KPIs" hideTitle height={120} items={kpis.slice(0, 3)} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <BulletChart
        title="Sustainability programme KPIs, FY2026"
        description="Every measure is below its target; data completeness is closest."
        unit="%"
        rangeLabels={["Behind", "On track", "Ahead"]}
        items={kpis}
      />
    </div>
  );
}

export function WithoutBands() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <BulletChart
        title="Site reductions against 2026 goal"
        unit="tCO₂e"
        items={[
          { id: "pune", label: "Pune plant", value: 7400, target: 6000 },
          { id: "chennai", label: "Chennai plant", value: 4900, target: 5000 },
          { id: "leeds", label: "Leeds office", value: 820, target: 900 },
        ]}
      />
    </div>
  );
}

export function Loading() {
  return <div style={{ inlineSize: "100%" }}><BulletChart title="Programme KPIs" loading items={[]} height={160} /></div>;
}

export function Empty() {
  return <div style={{ inlineSize: "100%" }}><BulletChart title="Programme KPIs" items={[]} height={160} /></div>;
}

export function DoOneScale() {
  return <div style={{ inlineSize: "100%" }}><BulletChart title="KPIs on a shared 0 to 100 scale" unit="%" height={150} rangeLabels={["Behind", "On track", "Ahead"]} items={kpis.slice(0, 2)} /></div>;
}

export function DontMixScales() {
  return <div style={{ inlineSize: "100%" }}><BulletChart title="Percentages and tonnes on one scale" height={150} items={[{ id: "a", label: "Renewable share (%)", value: 62, target: 70 }, { id: "b", label: "Scope 1 (tCO₂e)", value: 7400, target: 6000 }]} /></div>;
}
