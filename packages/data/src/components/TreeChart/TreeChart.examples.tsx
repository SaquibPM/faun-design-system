import { TreeChart } from "./TreeChart";

const framework = {
  label: "ESRS E1",
  children: [
    { label: "Governance", children: [{ label: "GOV-3 Remuneration" }, { label: "E1-1 Transition plan" }] },
    { label: "Strategy", children: [{ label: "E1-SBM-3 Risks and opportunities" }, { label: "E1-2 Policies" }, { label: "E1-3 Actions" }] },
    { label: "Metrics and targets", children: [{ label: "E1-4 Targets" }, { label: "E1-5 Energy" }, { label: "E1-6 Gross emissions" }, { label: "E1-7 Removals" }, { label: "E1-8 Carbon pricing" }] },
  ],
};

const owners = {
  label: "Group",
  children: [
    { label: "Manufacturing", children: [{ label: "Pune plant", value: 8200 }, { label: "Chennai plant", value: 5400 }] },
    { label: "Distribution", children: [{ label: "Rotterdam DC", value: 2100 }, { label: "Leeds hub", value: 900 }] },
  ],
};

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <TreeChart title="Disclosure structure" hideTitle height={120} data={owners} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <TreeChart title="ESRS E1 disclosure requirements" description="Requirements grouped by the topic they belong to." data={framework} />
    </div>
  );
}

export function Dendrogram() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <TreeChart variant="dendrogram" title="Reporting entities and their Scope 1 emissions" unit="tCO₂e" data={owners} legend />
    </div>
  );
}

export function Loading() {
  return <div style={{ inlineSize: "100%" }}><TreeChart title="Disclosure structure" loading data={{ label: "Empty" }} height={200} /></div>;
}

export function Empty() {
  return <div style={{ inlineSize: "100%" }}><TreeChart title="Disclosure structure" data={{ label: "Empty" }} height={200} /></div>;
}

export function DoShallow() {
  return <div style={{ inlineSize: "100%" }}><TreeChart title="Three levels" data={owners} /></div>;
}

export function DontDeep() {
  const deep = { label: "L0", children: [{ label: "L1", children: [{ label: "L2", children: [{ label: "L3", children: [{ label: "L4", children: [{ label: "L5 leaf name", value: 1 }] }] }] }] }] };
  return <div style={{ inlineSize: "100%" }}><TreeChart title="Six levels deep" data={deep} /></div>;
}
