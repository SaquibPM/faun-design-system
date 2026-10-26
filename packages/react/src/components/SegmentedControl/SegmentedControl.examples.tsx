import { IconCalendar, IconFileText } from "@faun-ds/icons";
import { useState } from "react";
import { SegmentedControl } from "./SegmentedControl";

export function Thumbnail() {
  return <SegmentedControl aria-label="Period" defaultValue="quarter" options={[{ value: "month", label: "Month" }, { value: "quarter", label: "Quarter" }, { value: "year", label: "Year" }]} />;
}

export function Overview() {
  const [v, setV] = useState("quarter");
  return (
    <SegmentedControl
      aria-label="Reporting period"
      value={v}
      onValueChange={setV}
      options={[{ value: "month", label: "Month" }, { value: "quarter", label: "Quarter" }, { value: "year", label: "Year" }]}
    />
  );
}

export function Sizes() {
  const options = [{ value: "s1", label: "Scope 1" }, { value: "s2", label: "Scope 2" }, { value: "s3", label: "Scope 3" }];
  return (
    <>
      <SegmentedControl aria-label="Small" size="sm" defaultValue="s1" options={options} />
      <SegmentedControl aria-label="Medium" size="md" defaultValue="s2" options={options} />
      <SegmentedControl aria-label="Large" size="lg" defaultValue="s3" options={options} />
    </>
  );
}

export function WithIcons() {
  return (
    <SegmentedControl
      aria-label="View"
      defaultValue="calendar"
      options={[{ value: "calendar", label: "Calendar", icon: <IconCalendar /> }, { value: "list", label: "List", icon: <IconFileText /> }]}
    />
  );
}

export function FullWidth() {
  return (
    <div style={{ width: "min(100%, 420px)" }}>
      <SegmentedControl aria-label="Basis" fullWidth defaultValue="market" options={[{ value: "location", label: "Location-based" }, { value: "market", label: "Market-based" }]} />
    </div>
  );
}

export function DisabledOption() {
  return (
    <SegmentedControl aria-label="Framework" defaultValue="csrd" options={[{ value: "csrd", label: "CSRD" }, { value: "issb", label: "ISSB" }, { value: "sec", label: "SEC", disabled: true }]} />
  );
}

export function DoFewShortOptions() {
  return <SegmentedControl aria-label="Basis" defaultValue="gross" options={[{ value: "gross", label: "Gross" }, { value: "net", label: "Net" }]} />;
}

export function DontManyOptions() {
  return <SegmentedControl aria-label="Frameworks" defaultValue="a" options={["CSRD", "ISSB", "CDP", "GRI", "TCFD", "SFDR"].map((l, i) => ({ value: String.fromCharCode(97 + i), label: l }))} />;
}
