import { WordCloudChart } from "./WordCloudChart";

const topics = [
  { text: "emissions", value: 94, group: "Climate" }, { text: "renewables", value: 61, group: "Climate" }, { text: "net zero", value: 55, group: "Climate" }, { text: "energy", value: 48, group: "Climate" },
  { text: "supplier audits", value: 52, group: "Supply chain" }, { text: "traceability", value: 37, group: "Supply chain" }, { text: "logistics", value: 24, group: "Supply chain" },
  { text: "water", value: 44, group: "Environment" }, { text: "waste", value: 33, group: "Environment" }, { text: "biodiversity", value: 29, group: "Environment" },
  { text: "safety", value: 41, group: "People" }, { text: "wages", value: 26, group: "People" }, { text: "training", value: 21, group: "People" },
  { text: "assurance", value: 35 }, { text: "data quality", value: 31 }, { text: "targets", value: 28 },
];

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <WordCloudChart title="Stakeholder topics" hideTitle legend={false} height={120} words={topics} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <WordCloudChart
        title="Topics raised in stakeholder feedback, FY2026"
        description="Climate dominates, with supplier audits close behind."
        valueLabel="Mentions"
        words={topics}
      />
    </div>
  );
}

export function Ungrouped() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <WordCloudChart title="Terms in the materiality survey" valueLabel="Mentions" words={topics.map(({ text, value }) => ({ text, value }))} />
    </div>
  );
}

export function Loading() {
  return <div style={{ inlineSize: "100%" }}><WordCloudChart title="Stakeholder topics" loading words={[]} height={200} /></div>;
}

export function Empty() {
  return <div style={{ inlineSize: "100%" }}><WordCloudChart title="Stakeholder topics" words={[]} height={200} /></div>;
}

export function DoShortTerms() {
  return <div style={{ inlineSize: "100%" }}><WordCloudChart title="Short terms" height={220} words={topics.slice(0, 8)} valueLabel="Mentions" /></div>;
}

export function DontExactComparison() {
  return <div style={{ inlineSize: "100%" }}><WordCloudChart title="Near-equal values (size cannot be compared)" height={220} words={topics.slice(0, 8).map((t, i) => ({ ...t, value: 50 + i }))} valueLabel="Mentions" /></div>;
}
