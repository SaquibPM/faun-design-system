import { IconEdit, IconUsers } from "@faun-ds/icons";
import { Button, SearchField, Tag } from "@faun-ds/react";
import { useMemo, useState } from "react";
import { DataQualityCell, type DataQualityState } from "../DataQualityCell/DataQualityCell";
import { DataTable, type DataTableColumn, type DataTableSort } from "./DataTable";
import { DataTableRowActions, DataTableToolbar, type DataTableRowSize } from "./DataTableParts";

type Datapoint = { id: string; code: string; metric: string; value: number | null; unit: string; quality: DataQualityState; owner: string; updated: string };

const datapoints: Datapoint[] = [
  { id: "dp-1", code: "E1-6.44", metric: "Gross Scope 1 GHG emissions", value: 18240, unit: "tCO₂e", quality: "actual", owner: "Priya Nair", updated: "14 Mar 2026" },
  { id: "dp-2", code: "E1-6.49", metric: "Gross Scope 2, location-based", value: 9310, unit: "tCO₂e", quality: "evidenced", owner: "Marcus Webb", updated: "12 Mar 2026" },
  { id: "dp-3", code: "E1-6.51", metric: "Gross Scope 2, market-based", value: 8120, unit: "tCO₂e", quality: "estimated", owner: "Marcus Webb", updated: "12 Mar 2026" },
  { id: "dp-4", code: "E1-6.52", metric: "Scope 3, purchased goods and services", value: 96400, unit: "tCO₂e", quality: "partial", owner: "Aiko Tanaka", updated: "09 Mar 2026" },
  { id: "dp-5", code: "E1-5.37", metric: "Energy from fossil sources", value: 41250, unit: "MWh", quality: "actual", owner: "Priya Nair", updated: "02 Mar 2026" },
  { id: "dp-6", code: "E1-5.38", metric: "Share of renewable energy", value: null, unit: "%", quality: "missing", owner: "Unassigned", updated: "None" },
  { id: "dp-7", code: "E1-6.53", metric: "Biogenic emissions", value: null, unit: "tCO₂e", quality: "gap", owner: "Aiko Tanaka", updated: "None" },
];

const nf = new Intl.NumberFormat("en-US");

const columns: DataTableColumn<Datapoint>[] = [
  { id: "code", header: "Datapoint", accessor: "code", sortable: true, width: 120, rowHeader: true },
  { id: "metric", header: "Metric", accessor: "metric", sortable: true, width: 280 },
  {
    id: "value", header: "Reported value", label: "Reported value", numeric: true, sortable: true, width: 220,
    sortValue: (r) => r.value,
    cell: (r) => <DataQualityCell numeric state={r.quality} value={r.value === null ? undefined : nf.format(r.value)} unit={r.value === null ? undefined : r.unit} />,
  },
  { id: "owner", header: "Owner", accessor: "owner", sortable: true, width: 160 },
  { id: "updated", header: "Updated", accessor: "updated", width: 140 },
];

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <DataTable label="Datapoints" columns={columns.slice(0, 3)} data={datapoints.slice(0, 3)} getRowId={(r) => r.id} />
    </div>
  );
}

export function Overview() {
  const [sort, setSort] = useState<DataTableSort | null>({ columnId: "code", direction: "ascending" });
  return (
    <div style={{ inlineSize: "100%" }}>
      <DataTable label="CSRD datapoints" columns={columns} data={datapoints} getRowId={(r) => r.id} getRowLabel={(r) => `${r.code} ${r.metric}`} sort={sort} onSortChange={setSort} />
    </div>
  );
}

export function Selectable() {
  const [ids, setIds] = useState<string[]>(["dp-3", "dp-4"]);
  return (
    <div style={{ inlineSize: "100%" }}>
      <DataTable
        label="Datapoints to review"
        selectable
        columns={columns}
        data={datapoints}
        getRowId={(r) => r.id}
        getRowLabel={(r) => `${r.code} ${r.metric}`}
        selectedIds={ids}
        onSelectedIdsChange={setIds}
        selectionActions={<Button size="sm" variant="outline">Request evidence</Button>}
      />
    </div>
  );
}

export function StickyHeader() {
  const many = Array.from({ length: 4 }, (_, k) => datapoints.map((d) => ({ ...d, id: `${d.id}-${k}` }))).flat();
  return (
    <div style={{ inlineSize: "100%" }}>
      <DataTable label="All datapoints" stickyHeader maxHeight="18rem" columns={columns} data={many} getRowId={(r) => r.id} />
    </div>
  );
}

export function Density() {
  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "var(--faun-space-4)" }}>
      {(["compact", "comfortable", "spacious"] as const).map((d) => (
        <DataTable key={d} label={`Datapoints, ${d}`} density={d} columns={columns.slice(0, 3)} data={datapoints.slice(0, 2)} getRowId={(r) => r.id} />
      ))}
    </div>
  );
}

export function Resizable() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <DataTable label="Resizable datapoints" resizableColumns columns={columns} data={datapoints.slice(0, 4)} getRowId={(r) => r.id} />
    </div>
  );
}

// Larger sample for paging and virtualisation: 240 datapoints across the ESRS E1 range.
const owners = ["Priya Nair", "Marcus Webb", "Aiko Tanaka", "Unassigned"];
const states: DataQualityState[] = ["actual", "evidenced", "estimated", "partial"];
const bulk: Datapoint[] = Array.from({ length: 240 }, (_, i) => ({
  id: `bulk-${i + 1}`,
  code: `E1-6.${String(i + 1).padStart(3, "0")}`,
  metric: ["Gross Scope 1 emissions", "Scope 2, location-based", "Purchased goods and services", "Business travel", "Waste generated in operations"][i % 5]! + ` (site ${(i % 12) + 1})`,
  value: 400 + ((i * 7919) % 90000),
  unit: "tCO₂e",
  quality: states[i % states.length]!,
  owner: owners[i % owners.length]!,
  updated: `${String((i % 27) + 1).padStart(2, "0")} Mar 2026`,
}));

export function Paginated() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <DataTable
        label="All CSRD datapoints"
        paginated
        pageSizeOptions={[10, 25, 50]}
        itemLabel="datapoints"
        columns={columns}
        data={bulk}
        getRowId={(r) => r.id}
        defaultSort={{ columnId: "value", direction: "descending" }}
      />
    </div>
  );
}

export function ServerPaginated() {
  const [page, setPage] = useState(3);
  const [size, setSize] = useState(10);
  // Stands in for a request: the server returns only the rows of the requested page.
  const rows = bulk.slice((page - 1) * size, page * size);
  return (
    <div style={{ inlineSize: "100%" }}>
      <DataTable
        label="Datapoints from the server"
        columns={columns}
        data={rows}
        getRowId={(r) => r.id}
        totalRows={1034}
        page={page}
        onPageChange={setPage}
        pageSize={size}
        onPageSizeChange={(n) => { setSize(n); setPage(1); }}
        pageSizeOptions={[10, 25]}
        itemLabel="datapoints"
      />
    </div>
  );
}

export function ExpandableRows() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <DataTable
        label="Datapoints with evidence"
        columns={columns.slice(0, 4)}
        data={datapoints}
        getRowId={(r) => r.id}
        getRowLabel={(r) => r.code}
        defaultExpandedIds={["dp-4"]}
        isRowExpandable={(r) => r.quality !== "missing" && r.quality !== "gap"}
        renderExpanded={(r) => (
          <div style={{ display: "grid", gap: "var(--faun-space-2)" }}>
            <strong>{r.metric}</strong>
            <span>Last updated {r.updated} by {r.owner}. Source: utility invoices, FY2026 Q1.</span>
            <span style={{ display: "inline-flex", gap: "var(--faun-space-2)" }}><Tag>ESRS E1-6</Tag><Tag>{r.unit}</Tag></span>
          </div>
        )}
      />
    </div>
  );
}

export function ColumnMenu() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <DataTable
        label="Datapoints"
        columnMenu
        defaultHiddenColumns={["updated"]}
        columns={columns.map((c) => (c.id === "code" ? { ...c, hideable: false } : c))}
        data={datapoints}
        getRowId={(r) => r.id}
      />
    </div>
  );
}

export function Virtualized() {
  const many = Array.from({ length: 20000 }, (_, i) => ({ ...bulk[i % bulk.length]!, id: `v-${i}`, code: `E1-6.${String(i + 1).padStart(5, "0")}` }));
  return (
    <div style={{ inlineSize: "100%" }}>
      <DataTable
        label="20,000 datapoints"
        virtualize
        maxHeight="20rem"
        selectable
        columns={columns}
        data={many}
        getRowId={(r) => r.id}
        getRowLabel={(r) => r.code}
      />
    </div>
  );
}

export function Loading() {
  return <div style={{ inlineSize: "100%" }}><DataTable label="Datapoints" loading selectable columns={columns} data={[]} /></div>;
}

export function Empty() {
  return <div style={{ inlineSize: "100%" }}><DataTable label="Datapoints" columns={columns} data={[]} /></div>;
}

export function ErrorState() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <DataTable label="Datapoints" columns={columns} data={[]} error={{ title: "Could not load datapoints", description: "The CSRD workspace did not respond.", onRetry: () => {} }} />
    </div>
  );
}

export function DoNumeric() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <DataTable
        label="Scope totals"
        columns={[
          { id: "scope", header: "Scope", accessor: "scope" },
          { id: "t", header: "tCO₂e", accessor: "t", numeric: true },
        ]}
        data={[{ scope: "Scope 1", t: "18,240" }, { scope: "Scope 2", t: "9,310" }, { scope: "Scope 3", t: "142,880" }]}
      />
    </div>
  );
}

export function DontNumeric() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <DataTable
        label="Scope totals, numbers left-aligned"
        columns={[
          { id: "scope", header: "Scope", accessor: "scope" },
          { id: "t", header: "tCO₂e", accessor: "t" },
        ]}
        data={[{ scope: "Scope 1", t: "18,240" }, { scope: "Scope 2", t: "9,310" }, { scope: "Scope 3", t: "142,880" }]}
      />
    </div>
  );
}

const wrap = { inlineSize: "100%" } as const;

export function SingleSelect() {
  const [ids, setIds] = useState<string[]>(["dp-2"]);
  const picked = datapoints.find((d) => d.id === ids[0]);
  return (
    <div style={{ ...wrap, display: "grid", gap: "var(--faun-space-3)" }}>
      <DataTable
        label="Choose the datapoint to restate"
        selectable
        selectionMode="single"
        columns={columns.slice(0, 4)}
        data={datapoints.slice(0, 5)}
        getRowId={(r) => r.id}
        getRowLabel={(r) => `${r.code} ${r.metric}`}
        selectedIds={ids}
        onSelectedIdsChange={setIds}
      />
      <p style={{ margin: 0, fontSize: "var(--faun-type-body-sm-font-size)", lineHeight: "var(--faun-type-body-sm-line-height)", color: "var(--faun-fg-muted)" }}>{picked ? `Restating ${picked.code}` : "Nothing chosen"}</p>
    </div>
  );
}

export function WithToolbar() {
  const [q, setQ] = useState("");
  const [ids, setIds] = useState<string[]>([]);
  const rows = useMemo(() => datapoints.filter((d) => `${d.code} ${d.metric} ${d.owner}`.toLowerCase().includes(q.toLowerCase())), [q]);
  return (
    <div style={wrap}>
      <DataTable
        label="Datapoints with tools"
        selectable
        columns={columns}
        data={rows}
        getRowId={(r) => r.id}
        getRowLabel={(r) => `${r.code} ${r.metric}`}
        selectedIds={ids}
        onSelectedIdsChange={setIds}
        selectionActions={<Button size="sm" variant="outline">Request evidence</Button>}
        rowSizeMenu
        defaultRowSize="md"
        toolbar={
          <DataTableToolbar
            search={<SearchField size="sm" aria-label="Search datapoints" placeholder="Search datapoints" value={q} onValueChange={setQ} />}
            actions={<Button size="sm" variant="outline">Export CSV</Button>}
          />
        }
        emptyState={<p style={{ margin: 0, padding: "var(--faun-space-6)" }}>No datapoints match “{q}”.</p>}
      />
    </div>
  );
}

export function RowSizes() {
  const [size, setSize] = useState<DataTableRowSize>("sm");
  return (
    <div style={{ ...wrap, display: "grid", gap: "var(--faun-space-3)" }}>
      <div style={{ display: "flex", gap: "var(--faun-space-2)", flexWrap: "wrap" }} role="group" aria-label="Row size">
        {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => (
          <Button key={s} size="sm" variant={s === size ? "soft" : "outline"} aria-pressed={s === size} onClick={() => setSize(s)}>{s}</Button>
        ))}
      </div>
      <DataTable label="Datapoints by row size" rowSize={size} columns={columns.slice(0, 3)} data={datapoints.slice(0, 4)} getRowId={(r) => r.id} />
    </div>
  );
}

export function Zebra() {
  return (
    <div style={wrap}>
      <DataTable label="Striped datapoints" zebra columns={columns} data={datapoints} getRowId={(r) => r.id} />
    </div>
  );
}

export function RowActions() {
  const [log, setLog] = useState("No action yet");
  const [ids, setIds] = useState<string[]>([]);
  const cols: DataTableColumn<Datapoint>[] = [
    { id: "code", header: "Datapoint", accessor: "code", width: 120, rowHeader: true },
    { id: "owner", header: "Owner", accessor: "owner", width: 150 },
    {
      id: "actions", header: "Quick actions", label: "Quick actions", width: 130,
      cell: (r) => (
        <DataTableRowActions
          label={r.code}
          reveal="always"
          actions={[
            { id: "edit", label: "Edit", icon: <IconEdit />, onSelect: () => setLog(`Editing ${r.code}`) },
            { id: "assign", label: "Assign owner", icon: <IconUsers />, onSelect: () => setLog(`Assigning ${r.code}`) },
          ]}
        />
      ),
    },
    {
      id: "more", header: "More (on hover)", label: "More", width: 120,
      cell: (r) => (
        <DataTableRowActions
          label={r.code}
          actions={[
            { id: "open", label: "Open evidence", onSelect: () => setLog(`Opening evidence for ${r.code}`) },
            { id: "history", label: "View history", onSelect: () => setLog(`History for ${r.code}`) },
            { id: "remove", label: "Remove from report", danger: true, onSelect: () => setLog(`Removed ${r.code}`) },
          ]}
        />
      ),
    },
  ];
  return (
    <div style={{ ...wrap, display: "grid", gap: "var(--faun-space-3)" }}>
      <DataTable label="Datapoints with row actions" selectable columns={cols} data={datapoints.slice(0, 4)} getRowId={(r) => r.id} getRowLabel={(r) => r.code} selectedIds={ids} onSelectedIdsChange={setIds} />
      <p role="status" style={{ margin: 0, fontSize: "var(--faun-type-body-sm-font-size)", lineHeight: "var(--faun-type-body-sm-line-height)", color: "var(--faun-fg-muted)" }}>{log}</p>
    </div>
  );
}

export function StickyColumn() {
  const wide: DataTableColumn<Datapoint>[] = [
    ...columns,
    { id: "quality", header: "Quality", accessor: "quality", width: 160 },
    { id: "unit", header: "Unit", accessor: "unit", width: 140 },
    { id: "evidence", header: "Evidence files", accessor: (r) => (r.value === null ? 0 : 3), numeric: true, width: 160 },
  ];
  return (
    <div style={wrap}>
      <DataTable label="Wide datapoints" selectable stickyFirstColumn resizableColumns columns={wide} data={datapoints.slice(0, 5)} getRowId={(r) => r.id} getRowLabel={(r) => r.code} />
    </div>
  );
}
