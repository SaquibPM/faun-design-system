import { SankeyChart } from "./SankeyChart";

const nodes = [
  { id: "electricity", label: "Electricity" }, { id: "gas", label: "Natural gas" }, { id: "diesel", label: "Diesel" },
  { id: "scope-1", label: "Scope 1" }, { id: "scope-2", label: "Scope 2" },
  { id: "pune", label: "Pune plant" }, { id: "chennai", label: "Chennai plant" }, { id: "dc", label: "Distribution" },
];
const links = [
  { source: "electricity", target: "scope-2", value: 9300 }, { source: "gas", target: "scope-1", value: 11200 }, { source: "diesel", target: "scope-1", value: 7000 },
  { source: "scope-2", target: "pune", value: 4800 }, { source: "scope-2", target: "chennai", value: 3100 }, { source: "scope-2", target: "dc", value: 1400 },
  { source: "scope-1", target: "pune", value: 9200 }, { source: "scope-1", target: "chennai", value: 5400 }, { source: "scope-1", target: "dc", value: 3600 },
];

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <SankeyChart title="Energy to scope to site" hideTitle height={120} nodes={nodes} links={links} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <SankeyChart
        title="From energy source to scope to site, FY2026"
        description="Gas and diesel make up Scope 1; electricity makes up Scope 2. Pune takes the largest share."
        unit="tCO₂e"
        nodes={nodes}
        links={links}
      />
    </div>
  );
}

export function TwoStage() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <SankeyChart
        title="Supplier spend by category and region"
        unit="£m"
        nodes={[{ id: "mat", label: "Materials" }, { id: "log", label: "Logistics" }, { id: "svc", label: "Services" }, { id: "apac", label: "Asia Pacific" }, { id: "eu", label: "Europe" }, { id: "na", label: "North America" }]}
        links={[
          { source: "mat", target: "apac", value: 42 }, { source: "mat", target: "eu", value: 18 }, { source: "mat", target: "na", value: 9 },
          { source: "log", target: "apac", value: 11 }, { source: "log", target: "eu", value: 14 }, { source: "log", target: "na", value: 7 },
          { source: "svc", target: "eu", value: 8 }, { source: "svc", target: "na", value: 12 },
        ]}
      />
    </div>
  );
}

export function Loading() {
  return <div style={{ inlineSize: "100%" }}><SankeyChart title="Energy to scope to site" loading nodes={[]} links={[]} height={200} /></div>;
}

export function Empty() {
  return <div style={{ inlineSize: "100%" }}><SankeyChart title="Energy to scope to site" nodes={[]} links={[]} height={200} /></div>;
}

export function DoSmallNumberOfNodes() {
  return <div style={{ inlineSize: "100%" }}><SankeyChart title="Three sources, two scopes" height={220} unit="tCO₂e" nodes={nodes.slice(0, 5)} links={links.slice(0, 3)} /></div>;
}

export function DontTooManyFlows() {
  const many = Array.from({ length: 10 }, (_, i) => ({ id: `s${i}`, label: `Source ${i + 1}` }));
  const to = Array.from({ length: 10 }, (_, i) => ({ id: `t${i}`, label: `Target ${i + 1}` }));
  const l = many.flatMap((s, i) => to.map((t, j) => ({ source: s.id, target: t.id, value: 10 + ((i * 7 + j * 3) % 9) })));
  return <div style={{ inlineSize: "100%" }}><SankeyChart title="Ten sources to ten targets" height={260} nodes={[...many, ...to]} links={l} /></div>;
}
