import { RadarChart } from "./RadarChart";

const criteria = ["Emissions", "Water", "Labour practices", "Governance", "Data quality", "Circularity"];

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <RadarChart title="Supplier scores" hideTitle legend={false} height={130} max={100} categories={["A", "B", "C", "D", "E", "F"]} series={[{ id: "a", label: "Supplier", values: [82, 64, 71, 90, 55, 60] }]} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <RadarChart
        title="Supplier ESG scores, FY2026"
        description="Northern Steel is strong on governance but trails on circularity."
        max={100}
        categories={criteria}
        series={[
          { id: "steel", label: "Northern Steel Works", values: [58, 62, 74, 92, 70, 41] },
          { id: "packaging", label: "Bharat Packaging", values: [76, 55, 68, 71, 82, 78] },
        ]}
      />
    </div>
  );
}

export function WithTarget() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <RadarChart
        title="Maturity against target, by disclosure area"
        description="The dashed ring is the minimum maturity the programme expects."
        max={5}
        categories={["Governance", "Strategy", "Risk management", "Metrics", "Targets", "Assurance"]}
        series={[{ id: "now", label: "Current maturity", values: [4, 3, 3, 4.5, 2, 2.5] }]}
        references={[{ label: "Expected: 3", value: 3, kind: "target" }]}
        legend
      />
    </div>
  );
}

export function Loading() {
  return <div style={{ inlineSize: "100%" }}><RadarChart title="Supplier ESG scores" loading categories={criteria} series={[]} height={220} /></div>;
}

export function Empty() {
  return <div style={{ inlineSize: "100%" }}><RadarChart title="Supplier ESG scores" categories={[]} series={[]} height={220} /></div>;
}

export function DoSharedScale() {
  return <div style={{ inlineSize: "100%" }}><RadarChart title="Scores on one 0 to 100 scale" height={240} max={100} categories={criteria} series={[{ id: "a", label: "Supplier", values: [58, 62, 74, 92, 70, 41] }]} legend /></div>;
}

export function DontMixUnits() {
  return <div style={{ inlineSize: "100%" }}><RadarChart title="Mixed units on one radar" height={240} categories={["Emissions (t)", "Water (kL)", "Score (0 to 100)", "Spend (£m)"]} series={[{ id: "a", label: "Site", values: [8200, 54000, 72, 12] }]} legend /></div>;
}
