import { BoxplotChart } from "./BoxplotChart";

const groups = [
  { label: "Asia Pacific", values: [2.1, 2.4, 2.6, 2.9, 3.1, 3.3, 3.6, 3.9, 4.2, 4.8, 9.4] },
  { label: "Europe", values: [1.4, 1.6, 1.8, 2.0, 2.1, 2.3, 2.4, 2.6, 2.8, 3.1] },
  { label: "North America", values: [2.0, 2.3, 2.7, 3.0, 3.2, 3.6, 4.1, 4.6, 5.2, 5.8, 6.1] },
  { label: "Latin America", values: [2.8, 3.1, 3.5, 3.8, 4.4, 4.9, 5.3, 5.9, 6.4] },
];

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <BoxplotChart title="Intensity by region" hideTitle height={110} groups={groups} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <BoxplotChart
        title="Supplier emissions intensity by region"
        description="Europe is tight and low; Asia Pacific has one clear outlier above 9."
        unit="kgCO₂e per unit"
        groups={groups}
        references={[{ label: "Policy limit", value: 6, kind: "target" }]}
      />
    </div>
  );
}

export function Horizontal() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <BoxplotChart
        orientation="horizontal"
        title="Supplier emissions intensity by region"
        unit="kgCO₂e per unit"
        groups={groups}
      />
    </div>
  );
}

export function PrecomputedSummary() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <BoxplotChart
        title="Invoice-to-disclosure lead time by business unit"
        description="Summaries come from the data warehouse, so the chart gets quartiles instead of raw values."
        unit="days"
        groups={[
          { label: "Manufacturing", min: 4, q1: 7, median: 10, q3: 15, max: 24, outliers: [31, 36] },
          { label: "Logistics", min: 2, q1: 5, median: 6, q3: 9, max: 14 },
          { label: "Retail", min: 6, q1: 11, median: 16, q3: 22, max: 33, outliers: [41] },
        ]}
      />
    </div>
  );
}

export function Loading() {
  return <div style={{ inlineSize: "100%" }}><BoxplotChart title="Intensity by region" loading groups={[]} height={200} /></div>;
}

export function Empty() {
  return <div style={{ inlineSize: "100%" }}><BoxplotChart title="Intensity by region" groups={[]} height={200} /></div>;
}

export function DoEnoughValues() {
  return <div style={{ inlineSize: "100%" }}><BoxplotChart title="Intensity by region (10 or more values each)" height={220} groups={groups.slice(0, 3)} unit="kgCO₂e per unit" /></div>;
}

export function DontFewValues() {
  return <div style={{ inlineSize: "100%" }}><BoxplotChart title="Intensity by region (three values each)" height={220} groups={[{ label: "Asia Pacific", values: [2.1, 3.3, 4.8] }, { label: "Europe", values: [1.6, 2.3, 3.1] }]} unit="kgCO₂e per unit" /></div>;
}
