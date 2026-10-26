import { IconDownload } from "@faun-ds/icons";
import { Banner, Button, StatusBadge } from "@faun-ds/react";
import { DataTable, type DataTableColumn } from "@faun-ds/data";
import { useState } from "react";
import { H2 } from "../foundations/shared";
import { datapoints, fmt, type Datapoint } from "./sample";

const columns: DataTableColumn<Datapoint>[] = [
  { id: "name", header: "Datapoint", accessor: "name", rowHeader: true, sortable: true },
  { id: "value", header: "Value", numeric: true, cell: (r) => (r.value === null ? "None" : `${fmt(r.value)} ${r.unit}`) },
  { id: "state", header: "Data quality", cell: (r) => <StatusBadge domain="data-quality" state={r.state} />, accessor: "state" },
  { id: "owner", header: "Owner", accessor: "owner" },
];

export function BulkActionsPattern() {
  const [rows, setRows] = useState(datapoints.slice(0, 8));
  const [selected, setSelected] = useState<string[]>(["dp7"]);
  const [done, setDone] = useState<string | null>(null);
  const assign = () => {
    const n = selected.length;
    setRows((rs) => rs.map((r) => (selected.includes(r.id) ? { ...r, owner: "Arjun Mehta" } : r)));
    setDone(`Assigned ${n} ${n === 1 ? "datapoint" : "datapoints"} to Arjun Mehta.`);
    setSelected([]);
  };
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="example" lede="Selecting rows reveals a bar with the count and the actions that apply to every selected row. One row is already selected: change the selection, then act.">Example</H2>
        {done ? <Banner tone="success" variant="inline" title={done} onDismiss={() => setDone(null)}>The owners were notified. Reassign from this table at any time.</Banner> : null}
        <DataTable
          label="Datapoints"
          columns={columns}
          data={rows}
          getRowId={(r) => r.id}
          getRowLabel={(r) => r.name}
          selectable
          selectedIds={selected}
          onSelectedIdsChange={(ids) => setSelected([...ids])}
          selectionActions={<><Button size="sm" variant="outline" leadingIcon={<IconDownload />}>Export</Button><Button size="sm" variant="solid" intent="accent" onClick={assign}>Assign owner</Button></>}
        />
      </section>
      <section className="fd-section">
        <H2 id="rules">Rules</H2>
        <ul className="fd-rules">
          <li>Selecting a row shows the selection bar; clearing the last row hides it. The count is announced to screen readers.</li>
          <li>The header checkbox selects the rows on the current page and shows a mixed state when only some are selected. Say so before selecting more than one page.</li>
          <li>Offer only actions that make sense for every selected row. If one row cannot take the action, say which and why before applying it.</li>
          <li>One solid action in the bar at most. Destructive bulk actions are outlined and open a confirmation that states the count.</li>
          <li>After the action, clear the selection and confirm the result with the count and the outcome. Offer undo for anything reversible.</li>
          <li>Keep selection when sorting. Clear it when filters change the rows underneath.</li>
        </ul>
      </section>
    </div>
  );
}
