import { StackedBarChart } from "./StackedBarChart";

const years = ["2022", "2023", "2024", "2025", "2026"];
const scopes = [
  { id: "scope-1", label: "Scope 1", values: [21400, 20300, 19600, 18900, 18240] },
  { id: "scope-2", label: "Scope 2", values: [11200, 10400, 9900, 9540, 9310] },
  { id: "scope-3", label: "Scope 3", values: [152300, 148100, 145900, 143800, 142880] },
];

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <StackedBarChart title="Emissions by scope" hideTitle legend={false} height={96} categories={years} series={scopes} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <StackedBarChart
        title="Gross emissions by scope, 2022 to 2026"
        description="Scope 3 is about 83% of the inventory in every year."
        unit="tCO₂e"
        categories={years}
        series={scopes}
        showTotals
      />
    </div>
  );
}

export function Categorical() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <StackedBarChart
        title="Scope 3 by category"
        unit="tCO₂e"
        categories={["2024", "2025", "2026"]}
        series={[
          { id: "c1", label: "Purchased goods and services", values: [88200, 85100, 84300] },
          { id: "c4", label: "Upstream transport", values: [21400, 20900, 20100] },
          { id: "c6", label: "Business travel", values: [6200, 7100, 7300] },
          { id: "c7", label: "Employee commuting", values: [4600, 4300, 4200] },
        ]}
      />
    </div>
  );
}

export function Partial() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <StackedBarChart
        title="Emissions by scope, FY2026 in progress"
        description="Scope 3 for 2026 is not reported yet; the bar shows Scope 1 and 2 only."
        unit="tCO₂e"
        categories={["2024", "2025", "2026"]}
        series={[
          { id: "scope-1", label: "Scope 1", values: [19600, 18900, 18240] },
          { id: "scope-2", label: "Scope 2", values: [9900, 9540, 9310] },
          { id: "scope-3", label: "Scope 3", values: [145900, 143800, null] },
        ]}
      />
    </div>
  );
}

export function DoScopeColours() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <StackedBarChart title="Emissions by scope" unit="tCO₂e" height={200} categories={years.slice(3)} series={scopes.map((s) => ({ ...s, values: s.values.slice(3) }))} />
    </div>
  );
}

export function DontRecolourScopes() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <StackedBarChart title="Emissions by scope, scopes recoloured" unit="tCO₂e" height={200} categories={years.slice(3)}
        series={scopes.map((s, i) => ({ ...s, id: `s${i}`, color: (["cat-3", "cat-1", "cat-2"] as const)[i], values: s.values.slice(3) }))} />
    </div>
  );
}

export function WithTarget() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <StackedBarChart
        title="Gross emissions by scope against the 2026 budget"
        description="Total emissions have been under budget since 2025."
        unit="tCO₂e"
        categories={years}
        series={scopes}
        references={[{ label: "2026 budget", value: 175000, kind: "target" }]}
      />
    </div>
  );
}

export function SeriesToggle() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <StackedBarChart
        title="Operational emissions by scope"
        description="Scope 3 is hidden so Scopes 1 and 2 can be compared; totals follow what is shown."
        unit="tCO₂e"
        toggleSeries
        defaultHiddenSeries={["scope-3"]}
        categories={years}
        series={scopes}
        showTotals
      />
    </div>
  );
}
