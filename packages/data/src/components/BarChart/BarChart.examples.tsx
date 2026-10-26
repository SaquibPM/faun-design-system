import { useState } from "react";
import { BarChart } from "./BarChart";

const facilities = ["Pune plant", "Chennai plant", "Rotterdam DC", "Leeds office", "Austin lab"];

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <BarChart title="Scope 1 by site" hideTitle legend={false} height={96} categories={["A", "B", "C", "D", "E"]} series={[{ id: "s1", label: "Scope 1", values: [8200, 5400, 2100, 900, 1640] }]} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <BarChart
        title="Scope 1 emissions by site, FY2026"
        description="Pune and Chennai account for three quarters of direct emissions."
        unit="tCO₂e"
        categories={facilities}
        series={[{ id: "emissions", label: "Scope 1", values: [8200, 5400, 2100, 900, 1640] }]}
        showValues
      />
    </div>
  );
}

export function Clustered() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <BarChart
        title="Scope 2 by site: location-based and market-based"
        unit="tCO₂e"
        categories={facilities}
        series={[
          { id: "loc", label: "Location-based", values: [3900, 2800, 1100, 640, 870] },
          { id: "mkt", label: "Market-based", values: [3100, 2300, 0, 410, 520] },
        ]}
      />
    </div>
  );
}

export function WithGap() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <BarChart
        title="Renewable electricity share by site"
        description="Austin has not reported yet and is shown as a gap, not as zero."
        unit="%"
        categories={facilities}
        series={[{ id: "ren", label: "Renewable share", values: [62, 48, 100, 35, null] }]}
        legend
      />
    </div>
  );
}

export function Loading() {
  return <div style={{ inlineSize: "100%" }}><BarChart title="Scope 1 emissions by site" loading categories={facilities} series={[]} height={200} /></div>;
}

export function Empty() {
  return <div style={{ inlineSize: "100%" }}><BarChart title="Scope 1 emissions by site" categories={[]} series={[]} height={200} /></div>;
}

export function DoZeroBaseline() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <BarChart title="Scope 1 by site" unit="tCO₂e" height={200} categories={facilities.slice(0, 3)} series={[{ id: "s", label: "Scope 1", values: [8200, 5400, 2100] }]} />
    </div>
  );
}

export function DontTooManyCategories() {
  const sites = Array.from({ length: 30 }, (_, i) => `Site ${i + 1}`);
  return (
    <div style={{ inlineSize: "100%" }}>
      <BarChart title="Scope 1 by site, all 30 sites" unit="tCO₂e" height={200} categories={sites} series={[{ id: "s", label: "Scope 1", values: sites.map((_, i) => 400 + ((i * 937) % 7000)) }]} />
    </div>
  );
}

export function Horizontal() {
  const suppliers = ["Northern Steel Works", "Bharat Packaging", "Kestrel Logistics", "Meridian Plastics", "Alder Chemicals", "Tessera Textiles"];
  return (
    <div style={{ inlineSize: "100%" }}>
      <BarChart
        title="Purchased goods emissions by supplier, FY2026"
        description="Horizontal bars keep long supplier names readable."
        unit="tCO₂e"
        orientation="horizontal"
        categories={suppliers}
        series={[{ id: "s3", label: "Scope 3 category 1", values: [31200, 22800, 14600, 9800, 7300, 4100] }]}
        showValues
      />
    </div>
  );
}

export function WithTarget() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <BarChart
        title="Scope 1 by site against the site budget"
        description="Pune is above its 2026 budget."
        unit="tCO₂e"
        categories={facilities}
        series={[{ id: "emissions", label: "Scope 1", values: [8200, 5400, 2100, 900, 1640] }]}
        references={[{ label: "Site budget", value: 6000, kind: "target" }, { label: "Peer median", value: 3200 }]}
      />
    </div>
  );
}

export function SeriesToggle() {
  const [hidden, setHidden] = useState<string[]>([]);
  return (
    <div style={{ inlineSize: "100%" }}>
      <BarChart
        title="Scope 2 by site: location-based and market-based"
        description={hidden.length ? `Hidden: ${hidden.join(", ")}` : "Select a legend entry to hide or show a series."}
        unit="tCO₂e"
        toggleSeries
        hiddenSeries={hidden}
        onHiddenSeriesChange={setHidden}
        categories={facilities}
        series={[
          { id: "location-based", label: "Location-based", values: [3900, 2800, 1100, 640, 870] },
          { id: "market-based", label: "Market-based", values: [3100, 2300, 0, 410, 520] },
          { id: "offsets", label: "Certificates", values: [800, 500, 1100, 230, 350] },
        ]}
      />
    </div>
  );
}

const quarters = ["Q1", "Q2", "Q3", "Q4"];

export function Stacked() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <BarChart
        variant="stacked"
        title="Emissions by scope and site, FY2026"
        description="Each bar is a site's total; segments are its three scopes."
        unit="tCO₂e"
        showTotals
        categories={facilities}
        series={[
          { id: "scope-1", label: "Scope 1", values: [8200, 5400, 2100, 900, 1640] },
          { id: "scope-2", label: "Scope 2", values: [3900, 2800, 1100, 640, 870] },
          { id: "scope-3", label: "Scope 3", values: [12400, 9100, 6300, 2200, 3100] },
        ]}
      />
    </div>
  );
}

export function StackedHorizontal() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <BarChart
        variant="stacked"
        orientation="horizontal"
        title="Energy use by source and site, FY2026"
        unit="MWh"
        showTotals
        categories={facilities}
        series={[
          { id: "grid", label: "Grid electricity", values: [9200, 6100, 2400, 1300, 1900] },
          { id: "solar", label: "On-site solar", values: [1200, 800, 0, 150, 420] },
          { id: "gas", label: "Natural gas", values: [4100, 2600, 900, 300, 540] },
        ]}
      />
    </div>
  );
}

export function Floating() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <BarChart
        variant="floating"
        title="Scope 1 forecast range by site, FY2027"
        description="Each bar spans the low and high forecast. The wider the bar, the less certain the estimate."
        unit="tCO₂e"
        categories={facilities}
        series={[{ id: "range", label: "Forecast range", base: [7400, 4800, 1700, 700, 1500], values: [8900, 6200, 2600, 1150, 2100] }]}
        references={[{ label: "Site budget", value: 6000, kind: "target" }]}
      />
    </div>
  );
}

export function Diverging() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <BarChart
        variant="diverging"
        orientation="horizontal"
        positiveIs="worse"
        divergingLabels={{ negative: "Under budget", positive: "Over budget" }}
        title="Scope 1 variance against budget, FY2026"
        description="Moss bars are under budget; oxblood bars are over. Length and shade both grow with the gap."
        unit="tCO₂e"
        categories={facilities}
        series={[{ id: "variance", label: "Variance", values: [2200, -600, -900, 150, -1100] }]}
        showValues
      />
    </div>
  );
}

export function Lollipop() {
  const suppliers = ["Northern Steel Works", "Bharat Packaging", "Kestrel Logistics", "Meridian Plastics", "Alder Chemicals", "Tessera Textiles"];
  return (
    <div style={{ inlineSize: "100%" }}>
      <BarChart
        variant="lollipop"
        orientation="horizontal"
        title="Emissions intensity by supplier"
        description="A stem and a dot say the same as a bar with less ink, which helps when many values are close."
        unit="kgCO₂e per unit"
        categories={suppliers}
        series={[{ id: "intensity", label: "Intensity", values: [4.8, 3.9, 3.1, 2.7, 2.2, 1.4] }]}
        showValues
      />
    </div>
  );
}

export function GroupedQuarters() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <BarChart
        variant="grouped"
        title="Waste diverted from landfill by quarter"
        unit="t"
        categories={quarters}
        series={[
          { id: "fy25", label: "FY2025", values: [310, 340, 365, 390] },
          { id: "fy26", label: "FY2026", values: [420, 455, 470, 520] },
        ]}
      />
    </div>
  );
}

export function DontDivergingForAll() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <BarChart variant="diverging" title="Scope 1 by site (all positive)" unit="tCO₂e" height={200} categories={facilities.slice(0, 3)} series={[{ id: "s", label: "Scope 1", values: [8200, 5400, 2100] }]} />
    </div>
  );
}

export function Appearance() {
  const props = { hideTitle: true as const, legend: false, height: 180, unit: "tCO₂e", categories: facilities, series: [{ id: "emissions", label: "Scope 1", values: [8200, 5400, 2100, 900, 1640] }], showValues: true };
  return (
    <div style={{ display: "grid", gap: "var(--faun-space-6)", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", inlineSize: "100%" }}>
      <BarChart title="Relief (default)" {...props} appearance="relief" />
      <BarChart title="Flat" {...props} appearance="flat" />
    </div>
  );
}

export function Palettes() {
  const props = { hideTitle: true as const, variant: "stacked" as const, height: 220, unit: "tCO₂e", categories: ["Q1", "Q2", "Q3"], series: [
    { id: "a", label: "Electricity", values: [8200, 5400, 2100] }, { id: "b", label: "Gas", values: [3900, 2800, 1100] }, { id: "c", label: "Fuel", values: [2400, 3100, 1500] },
    { id: "d", label: "Travel", values: [900, 1400, 1700] }, { id: "e", label: "Waste", values: [600, 500, 800] },
  ] };
  return (
    <div style={{ display: "grid", gap: "var(--faun-space-6)", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", inlineSize: "100%" }}>
      <BarChart title="Default" {...props} palette="default" />
      <BarChart title="Meadow" {...props} palette="meadow" />
      <BarChart title="Dawn" {...props} palette="dawn" />
      <BarChart title="Harbour" {...props} palette="harbour" />
    </div>
  );
}
