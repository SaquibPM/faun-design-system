import { TreemapChart } from "./TreemapChart";
import type { HierarchyNode } from "../ChartKit/hierarchy";

const scope3: HierarchyNode = {
  label: "Scope 3",
  children: [
    { label: "Purchased goods", children: [{ label: "Steel", value: 31200, change: 4 }, { label: "Packaging", value: 22800, change: -6 }, { label: "Chemicals", value: 14600, change: 9 }, { label: "Plastics", value: 9800, change: -2 }] },
    { label: "Transport", children: [{ label: "Road freight", value: 17400, change: 3 }, { label: "Sea freight", value: 9600, change: -11 }, { label: "Air freight", value: 4200, change: 14 }] },
    { label: "Business travel", children: [{ label: "Flights", value: 8800, change: -18 }, { label: "Hotels", value: 2100, change: -4 }] },
    { label: "Waste", children: [{ label: "Landfill", value: 3600, change: -22 }, { label: "Incineration", value: 1900, change: 1 }] },
  ],
};

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <TreemapChart title="Scope 3 by category" hideTitle legend={false} height={110} data={scope3} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <TreemapChart title="Scope 3 emissions by category, FY2026" description="Steel and packaging are the two largest single sources." unit="tCO₂e" data={scope3} />
    </div>
  );
}

export function ByValue() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <TreemapChart colorBy="value" title="Scope 3 emissions, shaded by size" description="Darker means larger. Use this when groups matter less than the biggest items." unit="tCO₂e" data={scope3} />
    </div>
  );
}

export function ByChange() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <TreemapChart
        colorBy="change"
        title="Scope 3 emissions and change since FY2025"
        description="Area is this year's emissions. Moss fell, oxblood grew, grey is flat."
        unit="tCO₂e"
        data={scope3}
      />
    </div>
  );
}

export function GroupToggle() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <TreemapChart toggleSeries title="Scope 3 emissions, hide a category" unit="tCO₂e" data={scope3} />
    </div>
  );
}

export function Loading() {
  return <div style={{ inlineSize: "100%" }}><TreemapChart title="Scope 3 by category" loading data={{ label: "Empty" }} height={200} /></div>;
}

export function Empty() {
  return <div style={{ inlineSize: "100%" }}><TreemapChart title="Scope 3 by category" data={{ label: "Empty" }} height={200} /></div>;
}

export function DoPartToWhole() {
  return <div style={{ inlineSize: "100%" }}><TreemapChart title="Scope 3 by category" height={220} unit="tCO₂e" data={scope3} /></div>;
}

export function DontNegativeOrTiny() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <TreemapChart
        title="Tiny items beside a giant (labels vanish)"
        height={220}
        data={{ label: "Mix", children: [{ label: "Giant", value: 100000 }, ...Array.from({ length: 10 }, (_, i) => ({ label: `Tiny ${i + 1}`, value: 20 }))] }}
      />
    </div>
  );
}
