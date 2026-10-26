import { forwardRef } from "react";
import { ChartShell, type ShellDrawing, type ShellSize, type ShellStep } from "../ChartKit/ChartShell.js";
import { buildHierarchy, treeRows, type HierarchyNode, type HNode } from "../ChartKit/hierarchy.js";
import { groupColor, groupLegend } from "../ChartKit/hierarchyParts.js";
import { chartColorVar, defaultFormat, truncate } from "../ChartKit/scale.js";
import type { ChartCommonProps } from "../ChartKit/types.js";

export interface TreeChartProps extends ChartCommonProps {
  /** The hierarchy, from root to leaves. The root is drawn. A `value` on any node is shown in the tooltip and table. */
  data: HierarchyNode;
  /** `tree` puts each node one level to the right of its parent. `dendrogram` aligns every leaf at the right edge, which reads better for clustering and deep trees. */
  variant?: "tree" | "dendrogram";
  /** Unit of node values. */
  unit?: string;
  /** Formats a value. Default: thousands separators, up to one decimal. */
  format?: (value: number) => string;
}

const ROW = 28;

/** Shows how things relate by parent and child: an organisation, a supplier hierarchy, a framework's disclosure structure. */
export const TreeChart = forwardRef<HTMLElement, TreeChartProps>(function TreeChart(props, ref) {
  const { data, variant = "tree", unit, format = defaultFormat, height: heightProp, legend, ...rest } = props;
  const root = buildHierarchy(data, true);
  const hasValues = (function has(n: HierarchyNode): boolean { return n.value !== undefined || (n.children ?? []).some(has); })(data);
  const withUnit = (v: number) => (unit ? `${format(v)} ${unit}` : format(v));
  const legendItems = groupLegend(root);
  const rowsAll = treeRows(root).rows;
  const height = heightProp ?? Math.max(200, rowsAll * ROW + 24);

  const layout = ({ width, height, active, isHidden }: ShellSize): ShellDrawing => {
    const view: HNode = { ...root, children: root.children.filter((g) => !isHidden(g.id)) };
    const { nodes, rows, depth } = treeRows(view);
    const labelRoom = Math.min(150, width * 0.32);
    const left = 14; const colW = depth === 0 ? 0 : (width - left - labelRoom - 8) / depth;
    const xOf = (n: HNode, leaf: boolean) => left + (variant === "dendrogram" && leaf ? depth : n.depth) * colW;
    const yOf = (row: number) => 14 + row * ((height - 28) / Math.max(rows - 1, 1));
    const pos = new Map(nodes.map(({ node, row, leaf }) => [node.id, { x: xOf(node, leaf), y: rows === 1 ? height / 2 : yOf(row), leaf }]));
    const steps: ShellStep[] = nodes.map(({ node }) => {
      const p = pos.get(node.id)!;
      const level = node.depth === 0 ? "Root" : `Level ${node.depth}`;
      return {
        label: node.depth === 0 ? node.label : node.path.join(" / "), x: p.x, y: p.y,
        rows: [{ name: "Level", value: level }, { name: "Children", value: String(node.children.length) }, ...(hasValues && node.value > 0 ? [{ name: "Value", value: withUnit(node.value) }] : [])],
      };
    });
    const edges = nodes.filter(({ node }) => node.parent && pos.has(node.parent.id)).map(({ node }) => {
      const a = pos.get(node.parent!.id)!; const b = pos.get(node.id)!;
      const mx = a.x + (b.x - a.x) / 2;
      return <path key={`e-${node.id}`} className="faun-chart-edge" d={`M${a.x} ${a.y}H${mx}V${b.y}H${b.x}`} />;
    });
    return {
      noun: "nodes",
      steps,
      pointer: "xy",
      table: {
        head: ["Node", "Level", "Parent", "Children", ...(hasValues ? [`Value${unit ? ` (${unit})` : ""}`] : [])],
        rows: nodes.map(({ node }) => [node.depth === 0 ? node.label : node.path.join(" / "), String(node.depth), node.parent?.label ?? "None", String(node.children.length), ...(hasValues ? [node.value > 0 ? format(node.value) : "None"] : [])]),
      },
      svg: (
        <>
          {edges}
          {nodes.map(({ node }, n) => {
            const p = pos.get(node.id)!;
            const room = p.leaf ? labelRoom : Math.max(colW - 12, 40);
            return (
              <g key={node.id}>
                <circle className="faun-chart-branch-node" data-active={n === active || undefined} cx={p.x} cy={p.y} r={node.depth === 0 ? 8 : p.leaf ? 5 : 6.5} style={{ fill: node.depth === 0 ? "var(--faun-dataviz-axis)" : chartColorVar(groupColor(node.group)) }} />
                {p.leaf
                  ? <text className="faun-chart-axis-label" x={p.x + 11} y={p.y} dy="0.32em">{truncate(node.label, Math.floor(room / 6.5))}</text>
                  : <text className="faun-chart-axis-label" x={p.x + 2} y={p.y - 13} textAnchor={node.depth === 0 ? "start" : "start"} fontWeight={600}>{truncate(node.label, Math.floor(room / 6.5))}</text>}
              </g>
            );
          })}
        </>
      ),
    };
  };
  return <ChartShell ref={ref} height={height} legendItems={legendItems} legend={legend ?? false} empty={root.children.length === 0} layout={layout} {...rest} />;
});
