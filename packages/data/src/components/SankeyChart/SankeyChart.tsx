import { forwardRef } from "react";
import { ChartShell, type ShellDrawing, type ShellSize, type ShellStep } from "../ChartKit/ChartShell.js";
import { chartColorVar, defaultFormat, resolveColors, truncate } from "../ChartKit/scale.js";
import type { ChartColor, ChartCommonProps } from "../ChartKit/types.js";

export interface SankeyNode {
  /** Stable id. A node with id `scope-1`, `scope-2` or `scope-3` takes the GHG scope colour. */
  id: string;
  label: string;
  /** Overrides the colour. By default first-column nodes take `cat-1`, `cat-2`, and so on, and later nodes follow the source that feeds them most. */
  color?: ChartColor;
}

export interface SankeyLink {
  /** Id of the node the flow leaves. */
  source: string;
  /** Id of the node the flow enters. */
  target: string;
  /** Zero or positive. The width of the ribbon. */
  value: number;
}

export interface SankeyChartProps extends ChartCommonProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  /** Unit of the flow values, for example "tCO₂e". */
  unit?: string;
  /** Formats a value. Default: thousands separators, up to one decimal. */
  format?: (value: number) => string;
}

const NODE_W = 12;
const GAP = 12;

interface LNode extends SankeyNode { col: number; value: number; into: number; out: number; y: number; h: number; x: number; color: ChartColor }
interface LLink extends SankeyLink { s: LNode; t: LNode; w: number; sy: number; ty: number }

/** Works out columns, node sizes and ribbon positions. Exported for tests. */
export function sankeyLayout(nodes: SankeyNode[], links: SankeyLink[], width: number, height: number, labelRoom = 0) {
  const byId = new Map<string, LNode>();
  const colors = resolveColors(nodes);
  nodes.forEach((n, i) => byId.set(n.id, { ...n, col: 0, value: 0, into: 0, out: 0, y: 0, h: 0, x: 0, color: n.color ?? colors[i]! }));
  const ls = links.filter((l) => l.value > 0 && byId.has(l.source) && byId.has(l.target) && l.source !== l.target);
  // Column = longest path from a source node. The pass count bounds the work if the data has a cycle.
  for (let pass = 0; pass < nodes.length; pass++) {
    let changed = false;
    for (const l of ls) { const s = byId.get(l.source)!; const t = byId.get(l.target)!; if (t.col < s.col + 1 && s.col + 1 < nodes.length) { t.col = s.col + 1; changed = true; } }
    if (!changed) break;
  }
  for (const l of ls) { byId.get(l.source)!.out += l.value; byId.get(l.target)!.into += l.value; }
  const all = [...byId.values()].filter((n) => n.into > 0 || n.out > 0);
  all.forEach((n) => { n.value = Math.max(n.into, n.out); });
  const cols = Math.max(...all.map((n) => n.col), 0) + 1;
  const colNodes = Array.from({ length: cols }, (_, c) => all.filter((n) => n.col === c));
  const ky = Math.min(...colNodes.filter((c) => c.length).map((c) => (height - 8 - GAP * (c.length - 1)) / (c.reduce((s, n) => s + n.value, 0) || 1)));
  const usableW = width - labelRoom * 2 - NODE_W;
  colNodes.forEach((c, ci) => {
    const total = c.reduce((s, n) => s + n.value * ky, 0) + GAP * (c.length - 1);
    let y = 4 + (height - 8 - total) / 2;
    for (const n of c) { n.h = n.value * ky; n.y = y; n.x = labelRoom + (cols === 1 ? 0 : (ci / (cols - 1)) * usableW); y += n.h + GAP; }
  });
  // Later nodes follow the colour of their biggest source.
  for (const c of colNodes.slice(1)) for (const n of c) {
    if (nodes.find((x) => x.id === n.id)?.color || /^scope-[123]$/.test(n.id)) continue;
    const feed = ls.filter((l) => l.target === n.id).sort((a, b) => b.value - a.value)[0];
    if (feed) n.color = byId.get(feed.source)!.color;
  }
  const links2: LLink[] = ls.map((l) => ({ ...l, s: byId.get(l.source)!, t: byId.get(l.target)!, w: l.value * ky, sy: 0, ty: 0 }));
  for (const n of all) {
    let oy = n.y; for (const l of links2.filter((l) => l.s === n).sort((a, b) => a.t.y - b.t.y)) { l.sy = oy; oy += l.w; }
    let iy = n.y; for (const l of links2.filter((l) => l.t === n).sort((a, b) => a.s.y - b.s.y)) { l.ty = iy; iy += l.w; }
  }
  return { nodes: all, links: links2, cols };
}

const ribbon = (l: LLink) => {
  const x0 = l.s.x + NODE_W; const x1 = l.t.x; const xm = (x0 + x1) / 2;
  return `M${x0} ${l.sy}C${xm} ${l.sy},${xm} ${l.ty},${x1} ${l.ty}L${x1} ${l.ty + l.w}C${xm} ${l.ty + l.w},${xm} ${l.sy + l.w},${x0} ${l.sy + l.w}Z`;
};

/** Shows how a quantity flows from sources to destinations through one or more stages (also called an alluvial diagram). Ribbon width is the flow. */
export const SankeyChart = forwardRef<HTMLElement, SankeyChartProps>(function SankeyChart(props, ref) {
  const { nodes, links, unit, format = defaultFormat, height: heightProp, ...rest } = props;
  const withUnit = (v: number) => (unit ? `${format(v)} ${unit}` : format(v));
  const probe = sankeyLayout(nodes, links, 600, 400);
  const tallest = Math.max(...Array.from({ length: probe.cols }, (_, c) => probe.nodes.filter((n) => n.col === c).length), 1);
  const height = heightProp ?? Math.max(280, tallest * 40 + 40);

  const layout = ({ width, height, active }: ShellSize): ShellDrawing => {
    const labelRoom = Math.min(120, width * 0.2);
    const g = sankeyLayout(nodes, links, width, height, labelRoom);
    const steps: ShellStep[] = [
      ...g.links.map((l) => ({
        label: `${l.s.label} to ${l.t.label}`, x: (l.s.x + NODE_W + l.t.x) / 2, y: (l.sy + l.ty + l.w) / 2,
        rows: [{ name: "Flow", value: withUnit(l.value), color: l.s.color }, { name: `Share of ${l.s.label}`, value: `${((l.value / (l.s.out || 1)) * 100).toFixed(1)}%` }],
      })),
      ...g.nodes.map((n) => ({
        label: n.label, x: n.x + NODE_W / 2, y: n.y + n.h / 2,
        rows: [{ name: "Total", value: withUnit(n.value), color: n.color }, ...(n.into > 0 ? [{ name: "In", value: withUnit(n.into) }] : []), ...(n.out > 0 ? [{ name: "Out", value: withUnit(n.out) }] : [])],
      })),
    ];
    const nLinks = g.links.length;
    return {
      noun: "flows and nodes",
      steps,
      pointer: "xy",
      hit: (x, y) => {
        const ni = g.nodes.findIndex((n) => x >= n.x - 2 && x <= n.x + NODE_W + 2 && y >= n.y && y <= n.y + n.h);
        if (ni >= 0) return nLinks + ni;
        let best = -1; let bestD = Infinity;
        g.links.forEach((l, i) => {
          const x0 = l.s.x + NODE_W; const x1 = l.t.x;
          if (x < x0 || x > x1) return;
          const t = (x - x0) / (x1 - x0 || 1); const s = t * t * (3 - 2 * t);
          const top = l.sy + (l.ty - l.sy) * s;
          const d = y < top ? top - y : y > top + l.w ? y - top - l.w : 0;
          if (d < bestD) { bestD = d; best = i; }
        });
        return bestD <= 4 ? best : -1;
      },
      table: {
        head: ["From", "To", `Flow${unit ? ` (${unit})` : ""}`],
        rows: g.links.map((l) => [l.s.label, l.t.label, format(l.value)]),
        foot: g.nodes.map((n) => [`Node total: ${n.label}`, format(n.value)]),
      },
      svg: (
        <>
          {g.links.map((l, i) => <path key={`${l.source}-${l.target}`} className="faun-chart-link" data-active={i === active || undefined} d={ribbon(l)} style={{ fill: chartColorVar(l.s.color) }} />)}
          {g.nodes.map((n, i) => (
            <g key={n.id}>
              <rect className="faun-chart-node" x={n.x} y={n.y} width={NODE_W} height={Math.max(n.h, 1)} style={{ fill: chartColorVar(n.color) }} />
              {active === nLinks + i ? <rect className="faun-chart-active-ring" x={n.x - 2} y={n.y - 2} width={NODE_W + 4} height={n.h + 4} /> : null}
              {n.col === g.cols - 1 && g.cols > 1
                ? <text className="faun-chart-axis-label faun-chart-knockout" x={n.x - 6} y={n.y + n.h / 2} dy="0.32em" textAnchor="end">{truncate(n.label, Math.floor(labelRoom / 6.5))}</text>
                : <text className="faun-chart-axis-label faun-chart-knockout" x={n.col === 0 ? n.x - 6 : n.x + NODE_W + 6} y={n.y + n.h / 2} dy="0.32em" textAnchor={n.col === 0 ? "end" : "start"}>{truncate(n.label, Math.floor(labelRoom / 6.5))}</text>}
            </g>
          ))}
        </>
      ),
    };
  };
  return <ChartShell ref={ref} height={height} legend={false} empty={probe.links.length === 0} layout={layout} {...rest} />;
});
