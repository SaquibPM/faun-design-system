import { LineChart } from "./LineChart";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <LineChart title="Monthly Scope 2" hideTitle legend={false} height={96} categories={months} series={[{ id: "a", label: "Scope 2", values: [980, 940, 910, 870, 860, 905, 940, 930, 880, 850, 820, 810] }]} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <LineChart
        title="Scope 2 emissions by month, 2025"
        description="Market-based figures lag by two months while supplier certificates are confirmed."
        unit="tCO₂e"
        categories={months}
        series={[
          { id: "loc", label: "Location-based", values: [980, 940, 910, 870, 860, 905, 940, 930, 880, 850, 820, 810] },
          { id: "mkt", label: "Market-based", values: [820, 790, 770, 730, 700, 760, 790, 780, 740, null, null, null] },
        ]}
      />
    </div>
  );
}

export function Scopes() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <LineChart
        title="Scope 1 and 2 intensity, 2022 to 2026"
        unit="tCO₂e per £m revenue"
        categories={["2022", "2023", "2024", "2025", "2026"]}
        series={[
          { id: "scope-1", label: "Scope 1", values: [14.2, 13.4, 12.6, 11.9, 11.2] },
          { id: "scope-2", label: "Scope 2", values: [7.4, 6.9, 6.4, 6.0, 5.7] },
        ]}
      />
    </div>
  );
}

export function FittedAxis() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <LineChart
        title="Grid emission factor, kgCO₂e per kWh"
        description="The axis is fitted to the data, not started at zero."
        zeroBaseline={false}
        categories={["2020", "2021", "2022", "2023", "2024", "2025"]}
        series={[{ id: "f", label: "UK grid factor", values: [0.233, 0.212, 0.193, 0.207, 0.185, 0.177] }]}
        format={(v) => v.toFixed(3)}
        legend
      />
    </div>
  );
}

export function Loading() {
  return <div style={{ inlineSize: "100%" }}><LineChart title="Scope 2 by month" loading categories={months} series={[]} height={200} /></div>;
}

export function DoMarkers() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <LineChart title="Two series, told apart by shape and colour" height={200} categories={["Q1", "Q2", "Q3", "Q4"]}
        series={[{ id: "a", label: "Location-based", values: [2800, 2700, 2650, 2500] }, { id: "b", label: "Market-based", values: [2300, 2250, 2100, 2050] }]} />
    </div>
  );
}

export function DontZeroForGaps() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <LineChart title="Missing quarters entered as zero" height={200} categories={["Q1", "Q2", "Q3", "Q4"]}
        series={[{ id: "a", label: "Scope 2", values: [2800, 0, 2650, 0] }]} legend />
    </div>
  );
}

export function WithReference() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <LineChart
        title="Scope 2 location-based against the reduction pathway"
        description="Emissions fell below the pathway in September and have stayed under it since."
        unit="tCO₂e"
        categories={months}
        series={[{ id: "loc", label: "Location-based", values: [980, 940, 910, 870, 860, 905, 940, 930, 880, 850, 820, 810] }]}
        references={[{ label: "2025 pathway", value: 900, kind: "target" }, { label: "FY2024 monthly average", value: 1010 }]}
        legend
      />
    </div>
  );
}

export function SeriesToggle() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <LineChart
        title="Grid emission factor by market"
        unit="gCO₂e/kWh"
        toggleSeries
        defaultHiddenSeries={["uk"]}
        categories={["2022", "2023", "2024", "2025", "2026"]}
        series={[
          { id: "in", label: "India", values: [713, 708, 702, 694, 687] },
          { id: "uk", label: "United Kingdom", values: [193, 162, 124, 98, 81] },
          { id: "nl", label: "Netherlands", values: [328, 306, 284, 262, 247] },
        ]}
      />
    </div>
  );
}

export function Step() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <LineChart
        variant="step"
        title="Grid emission factor by year"
        description="A step holds each factor until the next one is published, which is how the factor is applied."
        unit="kgCO₂e/kWh"
        zeroBaseline={false}
        categories={["2019", "2020", "2021", "2022", "2023", "2024", "2025"]}
        series={[
          { id: "india", label: "India grid", values: [0.82, 0.82, 0.79, 0.79, 0.76, 0.74, 0.74] },
          { id: "uk", label: "UK grid", values: [0.26, 0.23, 0.21, 0.19, 0.18, 0.16, 0.15] },
        ]}
        format={(v) => v.toFixed(2)}
      />
    </div>
  );
}
