import { ComboChart } from "./ComboChart";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <ComboChart title="Emissions and intensity" hideTitle legend={false} height={110} categories={months} series={[{ id: "e", label: "Emissions", values: [820, 790, 770, 730, 700, 760, 790, 780] }, { id: "i", label: "Intensity", type: "line", axis: "secondary", values: [12, 11.6, 11.4, 10.9, 10.4, 10.9, 11.2, 11] }]} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <ComboChart
        title="Emissions and intensity, 2026"
        description="Emissions fell until May, then rose with production; intensity tells the same story per unit of revenue."
        unit="tCO₂e"
        secondaryUnit="tCO₂e per £m"
        categories={months}
        series={[
          { id: "emissions", label: "Emissions", values: [820, 790, 770, 730, 700, 760, 790, 780] },
          { id: "intensity", label: "Intensity", type: "line", axis: "secondary", values: [12, 11.6, 11.4, 10.9, 10.4, 10.9, 11.2, 11] },
        ]}
      />
    </div>
  );
}

export function SharedAxis() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <ComboChart
        title="Scope 2 emissions against the glide path"
        unit="tCO₂e"
        categories={months}
        series={[
          { id: "actual", label: "Actual", values: [980, 940, 910, 870, 860, 905, 940, 930] },
          { id: "path", label: "Glide path", type: "line", values: [980, 950, 920, 890, 860, 830, 800, 770] },
        ]}
        references={[{ label: "FY2026 cap", value: 1000, kind: "target" }]}
      />
    </div>
  );
}

export function Loading() {
  return <div style={{ inlineSize: "100%" }}><ComboChart title="Emissions and intensity" loading categories={months} series={[]} height={200} /></div>;
}

export function Empty() {
  return <div style={{ inlineSize: "100%" }}><ComboChart title="Emissions and intensity" categories={[]} series={[]} height={200} /></div>;
}

export function DoDifferentUnits() {
  return <div style={{ inlineSize: "100%" }}><ComboChart title="Volume and rate on two axes" height={220} unit="tCO₂e" secondaryUnit="%" categories={months.slice(0, 5)} series={[{ id: "v", label: "Emissions", values: [820, 790, 770, 730, 700] }, { id: "r", label: "Renewable share", type: "line", axis: "secondary", values: [41, 43, 46, 50, 54] }]} /></div>;
}

export function DontSameUnitTwoAxes() {
  return <div style={{ inlineSize: "100%" }}><ComboChart title="Same unit on two different axes" height={220} unit="tCO₂e" secondaryUnit="tCO₂e" categories={months.slice(0, 5)} series={[{ id: "a", label: "Scope 1", values: [820, 790, 770, 730, 700] }, { id: "b", label: "Scope 2", type: "line", axis: "secondary", values: [98, 94, 91, 87, 86] }]} /></div>;
}
