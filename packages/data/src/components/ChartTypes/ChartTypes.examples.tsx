import type { ReactNode } from "react";
import { AreaChart } from "../AreaChart/AreaChart";
import { BarChart } from "../BarChart/BarChart";
import { BoxplotChart } from "../BoxplotChart/BoxplotChart";
import { BulletChart } from "../BulletChart/BulletChart";
import { CirclePackChart } from "../CirclePackChart/CirclePackChart";
import { ComboChart } from "../ComboChart/ComboChart";
import { GaugeChart } from "../GaugeChart/GaugeChart";
import { HeatmapChart } from "../HeatmapChart/HeatmapChart";
import { HistogramChart } from "../HistogramChart/HistogramChart";
import { LineChart } from "../LineChart/LineChart";
import { MeterChart } from "../MeterChart/MeterChart";
import { PieChart } from "../PieChart/PieChart";
import { RadarChart } from "../RadarChart/RadarChart";
import { SankeyChart } from "../SankeyChart/SankeyChart";
import { ScatterChart } from "../ScatterChart/ScatterChart";
import { Sparkline } from "../Sparkline/Sparkline";
import { TreeChart } from "../TreeChart/TreeChart";
import { TreemapChart } from "../TreemapChart/TreemapChart";
import { WordCloudChart } from "../WordCloudChart/WordCloudChart";

const cats = ["A", "B", "C", "D", "E"];
const one = [{ id: "a", label: "A", values: [8, 5, 3, 6, 4] }];
const two = [{ id: "a", label: "A", values: [8, 5, 3, 6, 4] }, { id: "b", label: "B", values: [5, 7, 2, 4, 6] }];
const three = [{ id: "a", label: "A", values: [8, 5, 3, 6, 4] }, { id: "b", label: "B", values: [5, 7, 2, 4, 6] }, { id: "c", label: "C", values: [3, 2, 4, 3, 5] }];
const months = ["J", "F", "M", "A", "M", "J", "J", "A"];
const trend = [{ id: "a", label: "A", values: [4, 6, 5, 8, 7, 9, 8, 11] }, { id: "b", label: "B", values: [3, 4, 6, 5, 7, 6, 9, 8] }];
const tree = { label: "Root", children: [{ label: "A", children: [{ label: "A1", value: 5 }, { label: "A2", value: 3 }, { label: "A3", value: 2 }] }, { label: "B", children: [{ label: "B1", value: 4 }, { label: "B2", value: 3 }] }, { label: "C", children: [{ label: "C1", value: 3 }] }] };
const pts = (k: number) => [0, 1, 2, 3, 4, 5].map((i) => ({ x: i * 10 + k * 4, y: 10 + ((i * 7 + k * 5) % 9) * 4 + i * 3, size: 20 + ((i * 13) % 7) * 12 }));
const sample = [3, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 8, 9, 10, 12, 4, 5, 6, 7];
const sankeyNodes = [{ id: "a", label: "A" }, { id: "b", label: "B" }, { id: "c", label: "C" }, { id: "d", label: "D" }, { id: "e", label: "E" }];
const sankeyLinks = [{ source: "a", target: "c", value: 6 }, { source: "b", target: "c", value: 3 }, { source: "c", target: "d", value: 5 }, { source: "c", target: "e", value: 4 }];
const grid = [[1, 3, 5, 7, 6, 4], [2, 4, 6, 8, 7, 5], [1, 2, 3, 5, 4, 3], [3, 5, 7, 9, 8, 6]];
const common = { hideTitle: true, legend: false, height: 90 } as const;

interface TileSpec { slug: string; name: string; variant: string; thumb: () => ReactNode }
interface Group { heading: string; note: string; tiles: TileSpec[] }

const groups: Group[] = [
  {
    heading: "Compare values",
    note: "One measure across categories.",
    tiles: [
      { slug: "bar-chart", name: "Bar", variant: "Simple", thumb: () => <BarChart {...common} title="Simple bar" categories={cats} series={one} /> },
      { slug: "bar-chart", name: "Bar", variant: "Grouped", thumb: () => <BarChart {...common} variant="grouped" title="Grouped bar" categories={cats} series={two} /> },
      { slug: "bar-chart", name: "Bar", variant: "Stacked", thumb: () => <BarChart {...common} variant="stacked" title="Stacked bar" categories={cats} series={three} /> },
      { slug: "bar-chart", name: "Bar", variant: "Floating", thumb: () => <BarChart {...common} variant="floating" title="Floating bar" categories={cats} series={[{ id: "r", label: "R", base: [2, 1, 0.5, 3, 1.5], values: [8, 5, 3, 6, 4] }]} /> },
      { slug: "bar-chart", name: "Bar", variant: "Diverging", thumb: () => <BarChart {...common} variant="diverging" title="Diverging bar" categories={cats} series={[{ id: "d", label: "D", values: [4, -2, 3, -4, 1] }]} /> },
      { slug: "bar-chart", name: "Lollipop", variant: "Bar variant", thumb: () => <BarChart {...common} variant="lollipop" title="Lollipop" categories={cats} series={one} /> },
      { slug: "bullet-chart", name: "Bullet", variant: "Value against target", thumb: () => <BulletChart hideTitle height={100} title="Bullet" items={[{ id: "a", label: "A", value: 62, target: 70, ranges: [40, 60, 100] }, { id: "b", label: "B", value: 80, target: 75, ranges: [50, 70, 100] }]} /> },
      { slug: "radar-chart", name: "Radar", variant: "Profile on shared axes", thumb: () => <RadarChart {...common} height={120} max={10} title="Radar" categories={["A", "B", "C", "D", "E"]} series={[{ id: "a", label: "A", values: [8, 5, 3, 6, 4] }]} /> },
    ],
  },
  {
    heading: "Show change over time",
    note: "An ordered axis, usually time.",
    tiles: [
      { slug: "line-chart", name: "Line", variant: "Simple", thumb: () => <LineChart {...common} title="Line" categories={months} series={trend} /> },
      { slug: "line-chart", name: "Step", variant: "Line variant", thumb: () => <LineChart {...common} variant="step" title="Step line" categories={months} series={[trend[0]!]} /> },
      { slug: "area-chart", name: "Area", variant: "Simple", thumb: () => <AreaChart {...common} title="Area" categories={months} series={[trend[0]!]} /> },
      { slug: "area-chart", name: "Area", variant: "Stacked", thumb: () => <AreaChart {...common} variant="stacked" title="Stacked area" categories={months} series={trend} /> },
      { slug: "combo-chart", name: "Combo", variant: "Bars and a line, two axes", thumb: () => <ComboChart {...common} title="Combo" categories={months} series={[{ id: "a", label: "A", values: [4, 6, 5, 8, 7, 9, 8, 11] }, { id: "b", label: "B", type: "line", axis: "secondary", values: [30, 34, 33, 40, 38, 44, 41, 50] }]} /> },
      { slug: "sparkline", name: "Sparkline", variant: "Inline trend", thumb: () => <Sparkline title="Sparkline" values={[4, 6, 5, 8, 7, 9, 8, 11]} variant="area" width={140} height={48} /> },
    ],
  },
  {
    heading: "Show relationships and distributions",
    note: "How measures relate, and how values spread.",
    tiles: [
      { slug: "scatter-chart", name: "Scatter", variant: "Two measures", thumb: () => <ScatterChart {...common} height={100} title="Scatter" series={[{ id: "a", label: "A", points: pts(0) }, { id: "b", label: "B", points: pts(1) }]} /> },
      { slug: "scatter-chart", name: "Bubble", variant: "Three measures", thumb: () => <ScatterChart {...common} variant="bubble" height={100} title="Bubble" series={[{ id: "a", label: "A", points: pts(0) }]} /> },
      { slug: "histogram-chart", name: "Histogram", variant: "Distribution of one measure", thumb: () => <HistogramChart hideTitle height={90} title="Histogram" values={sample} bins={7} /> },
      { slug: "boxplot-chart", name: "Boxplot", variant: "Distribution by group", thumb: () => <BoxplotChart hideTitle height={90} title="Boxplot" groups={[{ label: "A", values: sample }, { label: "B", values: sample.map((v) => v + 2) }, { label: "C", values: sample.map((v) => v - 1) }]} /> },
      { slug: "heatmap-chart", name: "Heatmap", variant: "Sequential or diverging", thumb: () => <HeatmapChart hideTitle height={90} title="Heatmap" rows={["A", "B", "C", "D"]} columns={["1", "2", "3", "4", "5", "6"]} values={grid} /> },
    ],
  },
  {
    heading: "Show parts of a whole",
    note: "Shares of a total, with or without hierarchy.",
    tiles: [
      { slug: "pie-chart", name: "Pie", variant: "Shares", thumb: () => <PieChart hideTitle legend={false} height={100} title="Pie" slices={[{ id: "a", label: "A", value: 5 }, { id: "b", label: "B", value: 3 }, { id: "c", label: "C", value: 2 }]} /> },
      { slug: "pie-chart", name: "Donut", variant: "Shares with a total", thumb: () => <PieChart hideTitle legend={false} height={100} variant="donut" title="Donut" slices={[{ id: "a", label: "A", value: 5 }, { id: "b", label: "B", value: 3 }, { id: "c", label: "C", value: 2 }]} /> },
      { slug: "meter-chart", name: "Meter", variant: "Standard", thumb: () => <MeterChart hideTitle height={64} title="Meter" value={64} unit="%" /> },
      { slug: "meter-chart", name: "Meter", variant: "Proportional", thumb: () => <MeterChart hideTitle legend={false} height={64} variant="proportional" title="Proportional meter" max={10} segments={[{ id: "a", label: "A", value: 5 }, { id: "b", label: "B", value: 3 }, { id: "c", label: "C", value: 1 }]} /> },
      { slug: "gauge-chart", name: "Gauge", variant: "One value on a dial", thumb: () => <GaugeChart hideTitle height={100} title="Gauge" value={72} unit="%" /> },
      { slug: "treemap-chart", name: "Treemap", variant: "Nested parts by area", thumb: () => <TreemapChart hideTitle legend={false} height={100} title="Treemap" data={tree} /> },
      { slug: "circle-pack-chart", name: "Circle pack", variant: "Nested parts by circle", thumb: () => <CirclePackChart hideTitle legend={false} height={110} title="Circle pack" data={tree} /> },
    ],
  },
  {
    heading: "Show structure and flow",
    note: "Relationships between things, and quantities moving between them.",
    tiles: [
      { slug: "tree-chart", name: "Tree", variant: "Parent and child", thumb: () => <TreeChart hideTitle height={100} title="Tree" data={tree} /> },
      { slug: "tree-chart", name: "Dendrogram", variant: "Tree variant", thumb: () => <TreeChart hideTitle height={100} variant="dendrogram" title="Dendrogram" data={tree} /> },
      { slug: "sankey-chart", name: "Sankey and alluvial", variant: "Flow between stages", thumb: () => <SankeyChart hideTitle height={100} title="Sankey" nodes={sankeyNodes} links={sankeyLinks} /> },
      { slug: "word-cloud-chart", name: "Word cloud", variant: "Terms by value", thumb: () => <WordCloudChart hideTitle legend={false} height={100} title="Word cloud" words={[{ text: "emissions", value: 9 }, { text: "water", value: 5 }, { text: "safety", value: 4 }, { text: "audit", value: 3 }, { text: "waste", value: 3 }]} /> },
    ],
  },
];

/** Every tile, for tests and for tools that list the chart types. */
export const chartTypeTiles = groups.flatMap((g) => g.tiles.map(({ slug, name, variant }) => ({ slug, name, variant })));

export function Thumbnail() {
  return (
    <div className="faun-chart-types-mosaic">
      <BarChart {...common} height={56} title="Bar" categories={cats} series={one} />
      <LineChart {...common} height={56} title="Line" categories={months} series={[trend[0]!]} />
      <PieChart hideTitle legend={false} height={56} variant="donut" title="Donut" slices={[{ id: "a", label: "A", value: 5 }, { id: "b", label: "B", value: 3 }, { id: "c", label: "C", value: 2 }]} />
      <HeatmapChart hideTitle height={56} title="Heatmap" rows={["A", "B", "C", "D"]} columns={["1", "2", "3", "4", "5", "6"]} values={grid} />
    </div>
  );
}

export function Overview() {
  return (
    <div className="faun-chart-types">
      {groups.map((g) => (
        <section key={g.heading} className="faun-chart-types-group" aria-labelledby={`chart-types-${g.heading.replace(/\W+/g, "-").toLowerCase()}`}>
          <h3 id={`chart-types-${g.heading.replace(/\W+/g, "-").toLowerCase()}`} className="faun-chart-types-heading">{g.heading}</h3>
          <p className="faun-chart-types-note">{g.note}</p>
          <ul className="faun-chart-types-grid">
            {g.tiles.map((t) => (
              <li key={`${t.slug}-${t.variant}-${t.name}`}>
                <a className="faun-chart-types-tile" href={`#/components/${t.slug}`}>
                  <div className="faun-chart-types-thumb" aria-hidden="true" inert>{t.thumb()}</div>
                  <span className="faun-chart-types-name">{t.name}</span>
                  <span className="faun-chart-types-variant">{t.variant}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
