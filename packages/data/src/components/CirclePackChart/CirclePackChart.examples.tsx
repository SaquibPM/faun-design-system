import { CirclePackChart } from "./CirclePackChart";

const suppliers = {
  label: "Suppliers",
  children: [
    { label: "Materials", children: [{ label: "Northern Steel Works", value: 31200 }, { label: "Alder Chemicals", value: 14600 }, { label: "Meridian Plastics", value: 9800 }] },
    { label: "Logistics", children: [{ label: "Kestrel Logistics", value: 17400 }, { label: "Harbour Freight", value: 9600 }, { label: "SkyBridge Cargo", value: 4200 }] },
    { label: "Packaging", children: [{ label: "Bharat Packaging", value: 22800 }, { label: "Pennine Board", value: 6100 }] },
    { label: "Services", children: [{ label: "Tessera Textiles", value: 3600 }, { label: "Orchard Facilities", value: 2100 }, { label: "Lumen IT", value: 1500 }] },
  ],
};

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <CirclePackChart title="Suppliers by emissions" hideTitle legend={false} height={120} data={suppliers} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <CirclePackChart title="Supplier emissions by category, FY2026" description="Each circle is a supplier, sized by emissions and grouped by spend category." unit="tCO₂e" data={suppliers} />
    </div>
  );
}

export function ByValue() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <CirclePackChart colorBy="value" title="Supplier emissions, shaded by size" unit="tCO₂e" data={suppliers} />
    </div>
  );
}

export function Loading() {
  return <div style={{ inlineSize: "100%" }}><CirclePackChart title="Suppliers by emissions" loading data={{ label: "Empty" }} height={200} /></div>;
}

export function Empty() {
  return <div style={{ inlineSize: "100%" }}><CirclePackChart title="Suppliers by emissions" data={{ label: "Empty" }} height={200} /></div>;
}

export function DoFewGroups() {
  return <div style={{ inlineSize: "100%" }}><CirclePackChart title="Four groups, a dozen members" height={240} unit="tCO₂e" data={suppliers} /></div>;
}

export function DontCompareExactValues() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <CirclePackChart title="Near-identical values (hard to rank)" height={240} data={{ label: "Mix", children: [{ label: "Group", children: Array.from({ length: 12 }, (_, i) => ({ label: `Supplier ${i + 1}`, value: 1000 + i * 15 })) }] }} />
    </div>
  );
}
