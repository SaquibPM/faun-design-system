# Carbon chart parity

Source: Carbon Design System, Data visualization, Chart types (carbondesignsystem.com/data-visualization/chart-types/) and the linked chart pages. The Carbon Charts gallery (charts.carbondesignsystem.com) reports 26 charts but did not list them when fetched, so the chart-types page is the reference list.

Every chart below is built on the shared ChartKit: a visually hidden data table, keyboard navigation, a tooltip on hover and focus, a legend, reference lines where they carry meaning, and colour from `--faun-dataviz-*` tokens only.

## Carbon types and Faun mapping

| Carbon type | Faun component | Variant or prop | Status |
| --- | --- | --- | --- |
| Simple bar (vertical and horizontal) | `BarChart` | `variant="simple"`, `orientation` | Built |
| Grouped bar | `BarChart` | `variant="grouped"` | Built |
| Stacked bar | `BarChart`, `StackedBarChart` | `variant="stacked"` | Built (negatives stack below the baseline) |
| Floating bar | `BarChart` | `variant="floating"`, `ChartSeries.base` | Built |
| Diverging bar (not a Carbon type; requested) | `BarChart` | `variant="diverging"`, `positiveIs` | Built |
| Lollipop | `BarChart` | `variant="lollipop"` | Built |
| Line | `LineChart` | `variant="line"` | Existing |
| Step | `LineChart` | `variant="step"` | Built |
| Area | `AreaChart` | `variant="simple"` | Built |
| Stacked area | `AreaChart` | `variant="stacked"` | Built |
| Scatter | `ScatterChart` | `variant="scatter"` | Built |
| Bubble | `ScatterChart` | `variant="bubble"` | Built |
| Radar | `RadarChart` | | Built |
| Histogram | `HistogramChart` | | Built |
| Boxplot | `BoxplotChart` | | Built (raw values or precomputed quartiles) |
| Bullet | `BulletChart` | | Built |
| Gauge | `GaugeChart` | | Built |
| Meter | `MeterChart` | `variant="standard"` | Built |
| Meter, proportional | `MeterChart` | `variant="proportional"` | Built |
| Pie | `PieChart` | `variant="pie"` | Built |
| Donut | `PieChart` | `variant="donut"` | Built |
| Combo (bar and line, dual axis) | `ComboChart` | | Built |
| Sparkline | `Sparkline` | `variant="line" or "area" or "bar"` | Built |
| Word cloud | `WordCloudChart` | | Built |
| Treemap | `TreemapChart` | `colorBy="group"` or `"value"` | Built |
| Treemap, divergent | `TreemapChart` | `colorBy="change"` | Built |
| Circle pack | `CirclePackChart` | | Built |
| Tree | `TreeChart` | `variant="tree"` | Built |
| Dendrogram | `TreeChart` | `variant="dendrogram"` | Built |
| Alluvial | `SankeyChart` | multi-stage nodes | Built |
| Sankey (flow) | `SankeyChart` | | Built |
| Heat map, sequential | `HeatmapChart` | `variant="sequential"` | Built |
| Heat map, divergent | `HeatmapChart` | `variant="diverging"` | Built |
| Network | | | Not built. Needs a force layout and a graph data model. |
| Parallel coordinates | | | Not built. |
| Geospatial (choropleth, proportional symbol, connection, cartogram) | | | Not built. Needs map geometry data, which Faun does not ship. |

Chart types overview page: Data, Chart types (`ChartTypes`), a tile gallery with a live thumbnail per type.

## Palette audit

- Categorical series use `--faun-dataviz-cat-1` to `cat-8` in CVD-safe order.
- Scope charts use `--faun-dataviz-scope-1/2/3/outside`.
- Sequential ramps (`seq-1` to `seq-7`) are used by heatmap, treemap `colorBy="value"` and circle pack value shading.
- Diverging ramps (`div-neg-3` to `div-pos-3`) are used by diverging bars, divergent heatmap and treemap `colorBy="change"`.
- Status tones are read only in `ChartKit/tones.ts`, for Gauge and Meter, where the colour means a status.
- Chrome (grid, axis, surface, text) uses `--faun-dataviz-grid`, `axis`, `surface` and foreground tokens.
- `packages/data/test/palette.test.ts` scans every chart source file and example for hex, `rgb()`, `hsl()`, `oklch()` and named colours, for `var(--faun-*)` references outside the allowed roles, and fails on any match. It also checks that the sequential and diverging ramps are used.
