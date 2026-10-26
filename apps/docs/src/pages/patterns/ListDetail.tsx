import { IconDownload, IconFileText } from "@faun-ds/icons";
import { Badge, Banner, Button, DescriptionList, PageHeader, SearchField, Sheet, SheetBody, SheetClose, SheetContent, SheetFooter, SheetHeader, Stat, StatGroup, StatusBadge, Tabs, TabsContent, TabsList, TabsTrigger } from "@faun-ds/react";
import { DataTable, FilterBar, type DataTableColumn, type FilterValue } from "@faun-ds/data";
import { useMemo, useState } from "react";
import { H2 } from "../foundations/shared";
import { AppScreen } from "./app-screen";
import { FILTER_FIELDS, datapoints, fmt, type Datapoint } from "./sample";

const columns: DataTableColumn<Datapoint>[] = [
  { id: "name", header: "Datapoint", accessor: "name", rowHeader: true, sortable: true },
  { id: "value", header: "Value", numeric: true, sortable: true, sortValue: (r) => r.value, cell: (r) => (r.value === null ? "None" : `${fmt(r.value)} ${r.unit}`) },
  { id: "state", header: "Data quality", cell: (r) => <StatusBadge domain="data-quality" state={r.state} />, accessor: "state" },
];

function Table({ rows, onOpen }: { rows: Datapoint[]; onOpen: (d: Datapoint) => void }) {
  return <DataTable label="Datapoints" columns={columns} data={rows} getRowId={(r) => r.id} getRowLabel={(r) => r.name} onRowActivate={onOpen} />;
}

export function ListDetailScreen() {
  const [filters, setFilters] = useState<FilterValue[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Datapoint | null>(null);
  const [tab, setTab] = useState("all");

  const rows = useMemo(() => {
    const byField = (f: string) => filters.filter((x) => x.field === f).map((x) => x.value);
    return datapoints.filter((d) => {
      if (tab === "attention" && !["missing", "gap", "estimated", "partial"].includes(d.state)) return false;
      if (tab === "mine" && d.owner !== "Priya Raman") return false;
      if (byField("topic").length && !byField("topic").includes(d.topic)) return false;
      if (byField("state").length && !byField("state").includes(d.state)) return false;
      return !query || `${d.name} ${d.code}`.toLowerCase().includes(query.toLowerCase());
    });
  }, [filters, query, tab]);

  const attention = datapoints.filter((d) => ["missing", "gap"].includes(d.state)).length;
  return (
    <>
      <AppScreen current="datapoints" crumbs={[{ label: "Reporting", href: "#reporting" }, { label: "Datapoints" }]}>
        <PageHeader
          title="Datapoints"
          description="CSRD ESRS Set 1, FY2026. Select a row to see its value, source and owner."
          actions={<><Button variant="outline" leadingIcon={<IconDownload />}>Export</Button><Button variant="solid" intent="accent">Assign owners</Button></>}
        />
        <StatGroup aria-label="Datapoint summary" minItemWidth="11rem">
          <Stat size="sm" label="Datapoints" value="1,034" footnote="9 disclosure requirements" />
          <Stat size="sm" label="Evidenced" value="86" unit="%" delta={{ value: "6 pts", direction: "up", sentiment: "good", label: "vs last month" }} />
          <Stat size="sm" label="Missing or gap" value={String(attention)} footnote="E2-4 and E5-5" />
        </StatGroup>
        {attention > 0 ? (
          <div className="pt-gap">
            <Banner tone="warning" variant="inline" title={`${attention} datapoints have no source`} actions={<Button size="sm" variant="outline" onClick={() => setTab("attention")}>Show them</Button>}>
              E2-4 and E5-5 cannot be filed until a source is connected or an owner is assigned.
            </Banner>
          </div>
        ) : null}
        <Tabs value={tab} onValueChange={setTab} className="pt-tabs">
          <TabsList aria-label="Datapoint views">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="attention">Needs attention</TabsTrigger>
            <TabsTrigger value="mine">Assigned to me</TabsTrigger>
          </TabsList>
          <div className="pt-toolbar">
            <FilterBar fields={FILTER_FIELDS} value={filters} onValueChange={setFilters}>
              <SearchField aria-label="Search datapoints" placeholder="Search datapoints" size="sm" value={query} onValueChange={setQuery} />
            </FilterBar>
          </div>
          {["all", "attention", "mine"].map((v) => (
            <TabsContent key={v} value={v}><Table rows={rows} onOpen={setOpen} /></TabsContent>
          ))}
        </Tabs>
      </AppScreen>

      <Sheet open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent>
          {open ? (
            <>
              <SheetHeader title={open.name} description={`FY2026 · ${open.topic}`} meta={<><StatusBadge domain="data-quality" state={open.state} /><Badge variant="outline">{open.code}</Badge></>} />
              <SheetBody>
                {open.state === "missing" || open.state === "gap" ? (
                  <Banner tone="warning" variant="inline" title="No value yet">No source is connected. Assign an owner or connect a source to collect it.</Banner>
                ) : null}
                <DescriptionList items={[
                  { term: "Value", value: open.value === null ? "None" : `${fmt(open.value)} ${open.unit}` },
                  { term: "Source", value: open.source },
                  { term: "Owner", value: open.owner },
                  { term: "Updated", value: open.updated },
                  { term: "Reference", value: open.code, mono: true },
                ]} />
              </SheetBody>
              <SheetFooter>
                <SheetClose asChild><Button variant="ghost">Close</Button></SheetClose>
                <Button variant="solid" intent="accent" leadingIcon={<IconFileText />}>Open evidence</Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}

export function ListDetailPattern() {
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="example" lede="The default shape for any collection: a filterable table with a few totals above it, and a side panel that opens on the row so the list stays in view. Filter, sort, or select a row.">Example</H2>
        <ListDetailScreen />
      </section>
      <section className="fd-section">
        <H2 id="rules">Rules</H2>
        <ul className="fd-rules">
          <li>One page title and one primary action. Export and bulk actions are outlined.</li>
          <li>At most three stats above the list; each says what to do next or how it changed.</li>
          <li>Tabs switch saved views of the same list. Filters narrow within a view and appear as removable chips.</li>
          <li>Rows are keyboard operable and open a Sheet, not a new page, so the person keeps their place and filters.</li>
          <li>Every value shows its data-quality state with an icon and a word. A missing value reads "None", never a blank or zero.</li>
          <li>Numeric columns are right-aligned with the unit in the cell; the owner and reference columns are plain text.</li>
          <li>Use a full page instead of a Sheet when the detail has its own tabs, a long form or more than a screen of content.</li>
        </ul>
      </section>
    </div>
  );
}
