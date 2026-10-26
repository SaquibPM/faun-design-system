import { SearchField } from "@faun-ds/react";
import { useState } from "react";
import { DataTable } from "../DataTable/DataTable";
import { FilterBar, type FilterField, type FilterValue } from "./FilterBar";

const fields: FilterField[] = [
  { id: "scope", label: "Scope", options: [{ value: "1", label: "Scope 1" }, { value: "2", label: "Scope 2" }, { value: "3", label: "Scope 3" }] },
  { id: "framework", label: "Framework", options: [{ value: "csrd", label: "CSRD ESRS E1" }, { value: "gri", label: "GRI 305" }, { value: "cdp", label: "CDP Climate" }] },
  { id: "quality", label: "Data quality", options: [{ value: "actual", label: "Actual" }, { value: "estimated", label: "Estimated" }, { value: "missing", label: "Missing" }] },
];

export function Thumbnail() {
  return <FilterBar fields={fields} defaultValue={[{ field: "scope", value: "3" }]} />;
}

export function Overview() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <FilterBar fields={fields} defaultValue={[{ field: "scope", value: "1" }, { field: "quality", value: "estimated" }]} />
    </div>
  );
}

export function Empty() {
  return <FilterBar fields={fields} />;
}

export function WithSearch() {
  const [query, setQuery] = useState("");
  return (
    <div style={{ inlineSize: "100%" }}>
      <FilterBar fields={fields} defaultValue={[{ field: "framework", value: "csrd" }]}>
        <SearchField size="sm" aria-label="Search datapoints" value={query} onValueChange={setQuery} placeholder="Search datapoints" />
      </FilterBar>
    </div>
  );
}

const rows = [
  { id: "1", metric: "Gross Scope 1 emissions", scope: "1", quality: "actual", t: "18,240" },
  { id: "2", metric: "Gross Scope 2, location-based", scope: "2", quality: "estimated", t: "9,310" },
  { id: "3", metric: "Purchased goods and services", scope: "3", quality: "estimated", t: "96,400" },
  { id: "4", metric: "Business travel", scope: "3", quality: "missing", t: "" },
];

export function WithTable() {
  const [value, setValue] = useState<FilterValue[]>([{ field: "scope", value: "3" }]);
  const shown = rows.filter((r) => ["scope", "quality"].every((f) => {
    const picked = value.filter((v) => v.field === f).map((v) => v.value);
    return picked.length === 0 || picked.includes(r[f as "scope" | "quality"]);
  }));
  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "var(--faun-space-3)" }}>
      <FilterBar fields={fields} value={value} onValueChange={setValue} />
      <DataTable
        label="Filtered datapoints"
        data={shown}
        getRowId={(r) => r.id}
        columns={[
          { id: "metric", header: "Metric", accessor: "metric", rowHeader: true },
          { id: "quality", header: "Quality", accessor: "quality" },
          { id: "t", header: "tCO₂e", accessor: "t", numeric: true },
        ]}
      />
    </div>
  );
}

export function DoShowResultCount() {
  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "var(--faun-space-2)" }}>
      <FilterBar fields={fields} defaultValue={[{ field: "quality", value: "missing" }]} />
      <p style={{ margin: 0, color: "var(--faun-fg-muted)", fontSize: "var(--faun-type-body-sm-font-size)" }}>2 of 1,034 datapoints</p>
    </div>
  );
}

export function DontHiddenFilters() {
  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "var(--faun-space-2)" }}>
      <FilterBar fields={fields} />
      <p style={{ margin: 0, color: "var(--faun-fg-muted)", fontSize: "var(--faun-type-body-sm-font-size)" }}>2 of 1,034 datapoints (filters applied elsewhere, not shown)</p>
    </div>
  );
}
