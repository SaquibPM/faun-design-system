import { HistogramChart } from "./HistogramChart";

// Emissions intensity of 60 suppliers, in kgCO₂e per unit.
const intensity = [
  1.2, 1.4, 1.5, 1.6, 1.7, 1.8, 1.8, 1.9, 2.0, 2.0, 2.1, 2.2, 2.2, 2.3, 2.4, 2.4, 2.5, 2.5, 2.6, 2.7,
  2.7, 2.8, 2.9, 2.9, 3.0, 3.0, 3.1, 3.2, 3.3, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.1, 4.3, 4.4,
  4.6, 4.8, 5.0, 5.2, 5.5, 5.9, 6.3, 6.8, 7.4, 8.1, 2.3, 2.6, 2.8, 3.1, 3.4, 3.2, 2.1, 1.9, 2.4, 3.0,
];

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <HistogramChart title="Supplier intensity" hideTitle height={110} values={intensity} bins={10} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <HistogramChart
        title="Supplier emissions intensity distribution"
        description="Most suppliers sit between 2 and 4; a long tail runs past 6."
        xTitle="Intensity"
        unit="kgCO₂e per unit"
        countLabel="Suppliers"
        values={intensity}
        binWidth={1}
      />
    </div>
  );
}

export function WithThreshold() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <HistogramChart
        title="Supplier intensity against the policy limit"
        description="Seven suppliers are above the limit and need a reduction plan."
        xTitle="Intensity"
        unit="kgCO₂e per unit"
        countLabel="Suppliers"
        values={intensity}
        binWidth={0.5}
        references={[{ label: "Policy limit", value: 5, kind: "target" }, { label: "Median", value: 2.9 }]}
      />
    </div>
  );
}

export function Loading() {
  return <div style={{ inlineSize: "100%" }}><HistogramChart title="Supplier intensity" loading values={[]} height={200} /></div>;
}

export function Empty() {
  return <div style={{ inlineSize: "100%" }}><HistogramChart title="Supplier intensity" values={[]} height={200} /></div>;
}

export function DoSensibleBins() {
  return <div style={{ inlineSize: "100%" }}><HistogramChart title="Intensity, 1-unit bins" height={200} values={intensity} binWidth={1} countLabel="Suppliers" unit="kgCO₂e per unit" /></div>;
}

export function DontTooManyBins() {
  return <div style={{ inlineSize: "100%" }}><HistogramChart title="Intensity, 20 bins for 60 values" height={200} values={intensity} bins={20} countLabel="Suppliers" unit="kgCO₂e per unit" /></div>;
}
