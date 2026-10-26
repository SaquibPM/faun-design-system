import { MeterChart } from "./MeterChart";

const zones = [{ from: 0, tone: "success" as const, label: "Within budget" }, { from: 70, tone: "warning" as const, label: "Approaching limit" }, { from: 90, tone: "danger" as const, label: "Over limit" }];

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <MeterChart title="Carbon budget used" value={64} max={100} unit="%" height={70} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <MeterChart title="Annual carbon budget used" value={78} max={100} unit="%" zones={zones} />
    </div>
  );
}

export function Proportional() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <MeterChart
        variant="proportional"
        title="Scope 3 emissions by category, FY2026"
        description="Parts of one whole, so the order and size of segments carry the story."
        unit="tCO₂e"
        max={142880}
        segments={[
          { id: "goods", label: "Purchased goods", value: 78400 },
          { id: "transport", label: "Transport", value: 31200 },
          { id: "travel", label: "Business travel", value: 14600 },
          { id: "waste", label: "Waste", value: 9100 },
        ]}
      />
    </div>
  );
}

export function Loading() {
  return <div style={{ inlineSize: "100%" }}><MeterChart title="Carbon budget used" loading height={80} /></div>;
}

export function Empty() {
  return <div style={{ inlineSize: "100%" }}><MeterChart variant="proportional" title="Scope 3 by category" segments={[]} height={80} /></div>;
}

export function DoNameTheStatus() {
  return <div style={{ inlineSize: "100%" }}><MeterChart title="Storage used" value={91} unit="%" zones={zones} height={90} /></div>;
}

export function DontColourAlone() {
  return <div style={{ inlineSize: "100%" }}><MeterChart title="Storage used (no zone names)" value={91} unit="%" zones={[{ from: 0, tone: "success" }, { from: 90, tone: "danger" }]} height={90} /></div>;
}
