import { GaugeChart } from "./GaugeChart";

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <GaugeChart title="Data completeness" value={91} unit="%" height={110} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "100%", maxInlineSize: "30rem" }}>
      <GaugeChart title="Data completeness" label="Required datapoints reported" value={91} unit="%" target={95} delta={3.2} deltaLabel="vs last quarter" />
    </div>
  );
}

export function WithStatus() {
  return (
    <div style={{ inlineSize: "100%", maxInlineSize: "30rem" }}>
      <GaugeChart title="Assurance coverage" label="Datapoints assured" value={42} unit="%" tone="danger" target={80} />
    </div>
  );
}

export function Loading() {
  return <div style={{ inlineSize: "100%", maxInlineSize: "30rem" }}><GaugeChart title="Data completeness" value={0} loading height={160} /></div>;
}

export function DoOneHeadline() {
  return <div style={{ inlineSize: "100%", maxInlineSize: "30rem" }}><GaugeChart title="Renewable share" value={62} unit="%" height={170} target={70} /></div>;
}

export function DontStatusAsDecoration() {
  return <div style={{ inlineSize: "100%", maxInlineSize: "30rem" }}><GaugeChart title="Headcount" value={1240} min={0} max={2000} tone="danger" height={170} /></div>;
}
