import { AreaChart } from "./AreaChart";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const solar = [210, 260, 340, 410, 470, 380, 300, 330, 380, 360, 250, 200];
const wind = [320, 300, 280, 240, 200, 180, 190, 210, 260, 300, 330, 350];
const grid = [900, 820, 760, 700, 640, 690, 740, 720, 650, 640, 760, 860];

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <AreaChart variant="stacked" title="Electricity by source" hideTitle legend={false} height={96} categories={months} series={[{ id: "g", label: "Grid", values: grid }, { id: "s", label: "Solar", values: solar }, { id: "w", label: "Wind", values: wind }]} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <AreaChart
        title="Renewable electricity generated, 2026"
        description="Solar peaks in spring and wind in winter, so together they smooth out."
        unit="MWh"
        categories={months}
        series={[{ id: "solar", label: "Solar", values: solar }, { id: "wind", label: "Wind", values: wind }]}
      />
    </div>
  );
}

export function Stacked() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <AreaChart
        variant="stacked"
        title="Electricity supply by source, 2026"
        description="The top edge is total demand; the bands show where it came from."
        unit="MWh"
        categories={months}
        series={[
          { id: "grid", label: "Grid", values: grid },
          { id: "solar", label: "Solar", values: solar },
          { id: "wind", label: "Wind", values: wind },
        ]}
        references={[{ label: "Capacity", value: 2000 }]}
      />
    </div>
  );
}

export function Stepped() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <AreaChart
        step
        title="Approved carbon budget by quarter"
        unit="ktCO₂e"
        categories={["Q1 25", "Q2 25", "Q3 25", "Q4 25", "Q1 26", "Q2 26", "Q3 26", "Q4 26"]}
        series={[{ id: "budget", label: "Budget", values: [42, 42, 40, 40, 38, 38, 35, 35] }]}
        legend
      />
    </div>
  );
}

export function WithGap() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <AreaChart
        title="Metered water use, Austin lab"
        description="The meter failed in June and July; the area breaks rather than dropping to zero."
        unit="kL"
        categories={months.slice(0, 9)}
        series={[{ id: "water", label: "Water", values: [120, 118, 125, 131, 128, null, null, 140, 136] }]}
        legend
      />
    </div>
  );
}

export function Loading() {
  return <div style={{ inlineSize: "100%" }}><AreaChart title="Renewable electricity generated" loading categories={months} series={[]} height={200} /></div>;
}

export function Empty() {
  return <div style={{ inlineSize: "100%" }}><AreaChart title="Renewable electricity generated" categories={[]} series={[]} height={200} /></div>;
}

export function DoStack() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <AreaChart variant="stacked" title="Supply by source" unit="MWh" height={200} categories={months.slice(0, 6)} series={[{ id: "g", label: "Grid", values: grid.slice(0, 6) }, { id: "s", label: "Solar", values: solar.slice(0, 6) }]} />
    </div>
  );
}

export function DontOverlap() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <AreaChart title="Supply by source (overlapping)" unit="MWh" height={200} categories={months.slice(0, 6)} series={[{ id: "g", label: "Grid", values: grid.slice(0, 6) }, { id: "s", label: "Solar", values: solar.slice(0, 6) }, { id: "w", label: "Wind", values: wind.slice(0, 6) }]} />
    </div>
  );
}
