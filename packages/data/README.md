# @faun-ds/data

> **Status: pre-1.0 (0.1.0).** APIs can change in minor releases. Verified in Chromium only (Firefox and Safari untested). Forced colours are covered by CSS tests, not a real session. No manual screen-reader pass. Many component states have not been reviewed by eye. ESM only. [What is tested and what is not](https://github.com/SaquibPM/faun-design-system/blob/main/docs/STATUS.md)

Data components for dense enterprise screens: `DataTable` (sorting, selection, resizing, pagination, expandable rows), `FilterBar`, `JsonViewer`, `DataQualityCell` and 20+ accessible charts (bar, stacked bar, line, area, scatter, pie and donut, radar, histogram, box plot, bullet, gauge, heatmap, treemap, circle pack, Sankey, word cloud, sparkline and more). Every chart has a hidden data table, keyboard navigation and tooltips on focus, and a colour-vision-safe palette.

Part of [Faun](https://github.com/SaquibPM/faun-design-system), an open design system for agentic enterprise software.

## Install

```bash
npm install @faun-ds/data @faun-ds/react @faun-ds/tokens react react-dom
```

`@faun-ds/react`, `@faun-ds/icons` and `@faun-ds/tokens` are installed with it as dependencies; list them yourself if you import from them directly. React 18.2 or 19 is a peer dependency.

## Load the styles

After the tokens and the React styles:

```tsx
import "@faun-ds/tokens/css";
import "@faun-ds/tokens/css/base";
import "@faun-ds/react/styles.css";
import "@faun-ds/data/styles.css";
```

See [`@faun-ds/react`](https://github.com/SaquibPM/faun-design-system/tree/main/packages/react) for fonts, theme and density.

## Use

```tsx
import { BarChart, DataTable, type DataTableColumn } from "@faun-ds/data";

type Row = { id: string; site: string; scope1: number };
const rows: Row[] = [
  { id: "1", site: "Pune plant", scope1: 8200 },
  { id: "2", site: "Chennai plant", scope1: 5400 },
];
const columns: DataTableColumn<Row>[] = [
  { id: "site", header: "Site", accessor: "site", sortable: true, rowHeader: true },
  { id: "scope1", header: "Scope 1 (tCO₂e)", accessor: "scope1", numeric: true, sortable: true },
];

export const Sites = () => (
  <>
    <DataTable label="Sites" columns={columns} data={rows} getRowId={(r) => r.id} />
    <BarChart
      title="Scope 1 by site"
      unit="tCO₂e"
      categories={rows.map((r) => r.site)}
      series={[{ id: "s1", label: "Scope 1", values: rows.map((r) => r.scope1) }]}
    />
  </>
);
```

Components carry a `"use client"` directive and work in the Next.js App Router. Documentation and live examples: <https://saquibpm.github.io/faun-design-system>.

## License

Apache-2.0
