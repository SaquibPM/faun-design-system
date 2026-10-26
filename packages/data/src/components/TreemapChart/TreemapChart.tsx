import { forwardRef } from "react";
import { ChartShell, type ShellDrawing, type ShellSize, type ShellStep } from "../ChartKit/ChartShell.js";
import { buildHierarchy, leavesOf, squarify, type HierarchyNode, type HNode, type Rect } from "../ChartKit/hierarchy.js";
import { Chip, groupColor, groupLegend, sharePct } from "../ChartKit/hierarchyParts.js";
import { divRamp, divVar, seqRamp, seqVar } from "../ChartKit/ramps.js";
import { RampLegend } from "../ChartKit/RampLegend.js";
import { ReliefFace } from "../ChartKit/relief.js";
import { chartColorVar, type CssVar, defaultFormat } from "../ChartKit/scale.js";
import type { ChartCommonProps } from "../ChartKit/types.js";
import { CHART_DEFAULT_RAMP } from "../ChartKit/scale.js";
const HUE = CHART_DEFAULT_RAMP.treemap;

export interface TreemapChartProps extends ChartCommonProps {
  /** The hierarchy. The root is only a container: its children are the top-level groups. Leaves carry `value`; branches take the sum of their children. */
  data: HierarchyNode;
  /**
   * What the fill means. `group` gives each top-level group a categorical colour (up to eight). `value` shades leaves with the sequential ramp by size.
   * `change` shades leaves with the diverging ramp by their `change` field (for example change against last year), so one chart shows size and direction.
   */
  colorBy?: "group" | "value" | "change";
  /** For `change`: whether a positive change is the better or the worse end. Default `worse`, since the usual measure is emissions. */
  positiveIs?: "better" | "worse";
  /** Unit of the leaf values. */
  unit?: string;
  /** Formats a value. Default: thousands separators, up to one decimal. */
  format?: (value: number) => string;
  /** Unit of the `change` field. Default "%". */
  changeUnit?: string;
}

const HEAD = 20;

/** Shows how a whole divides into nested parts, with area proportional to value. Suits many parts where a pie would be unreadable. */
export const TreemapChart = forwardRef<HTMLElement, TreemapChartProps>(function TreemapChart(props, ref) {
  const { data, colorBy = "group", positiveIs = "worse", unit, format = defaultFormat, changeUnit = "%", height = 340, legend, ...rest } = props;
  const root = buildHierarchy(data);
  const withUnit = (v: number) => (unit ? `${format(v)} ${unit}` : format(v));
  const legendItems = colorBy === "group" ? groupLegend(root) : [];
  const allLeaves = leavesOf(root).filter((l) => l !== root);
  const vals = allLeaves.map((l) => l.value);
  const lo = Math.min(...vals, 0); const hi = Math.max(...vals, 1);
  const maxChange = Math.max(...allLeaves.map((l) => Math.abs(l.change ?? 0)), 1e-9);
  const changeText = (c?: number) => (c === undefined ? "No data" : `${c > 0 ? "+" : c < 0 ? "-" : ""}${format(Math.abs(c))}${changeUnit}`);
  const fillOf = (l: HNode) => {
    if (colorBy === "group") return chartColorVar(groupColor(l.group));
    if (colorBy === "value") return seqVar(hi === lo ? 1 : (l.value - lo) / (hi - lo), HUE);
    return divVar(((l.change ?? 0) / maxChange) * (positiveIs === "better" ? 1 : -1));
  };

  const layout = ({ width, height, active, isHidden }: ShellSize): ShellDrawing => {
    const groups = root.children.filter((g) => !isHidden(g.id));
    const total = groups.reduce((n, g) => n + g.value, 0);
    const leaves: { node: HNode; rect: Rect }[] = [];
    const heads: { node: HNode; rect: Rect }[] = [];
    const place = (nodes: HNode[], rect: Rect, depth: number) => {
      for (const { item, rect: r } of squarify(nodes.map((n) => ({ item: n, value: n.value })), rect)) {
        if (item.children.length === 0) { leaves.push({ node: item, rect: r }); continue; }
        if (depth === 0) heads.push({ node: item, rect: r });
        const head = depth === 0 ? HEAD : 0;
        place(item.children, { x: r.x + 2, y: r.y + head + 2, w: Math.max(r.w - 4, 0), h: Math.max(r.h - head - 4, 0) }, depth + 1);
      }
    };
    place(groups, { x: 0, y: 0, w: width, h: height }, 0);
    const steps: ShellStep[] = leaves.map(({ node, rect }) => ({
      label: node.path.join(" / "), x: rect.x + rect.w / 2, y: rect.y + rect.h / 2,
      rows: [
        { name: "Value", value: withUnit(node.value), color: undefined },
        { name: "Share", value: sharePct(node.value, total) },
        ...(node.change !== undefined ? [{ name: "Change", value: changeText(node.change) }] : []),
      ],
    }));
    return {
      noun: "items",
      steps,
      hit: (x, y) => leaves.findIndex(({ rect: r }) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h),
      table: {
        head: ["Item", "Group", `Value${unit ? ` (${unit})` : ""}`, "Share", ...(colorBy === "change" ? [`Change (${changeUnit})`] : [])],
        rows: leaves.map(({ node }) => [node.path.join(" / "), node.path[0] ?? "", format(node.value), sharePct(node.value, total), ...(colorBy === "change" ? [node.change === undefined ? "No data" : format(node.change)] : [])]),
        foot: [["Total", "", format(total), "100%"]],
      },
      svg: (
        <>
          {leaves.map(({ node, rect }, n) => (
            <ReliefFace key={node.id} tag="rect" geom={{ x: rect.x, y: rect.y, width: Math.max(rect.w, 0), height: Math.max(rect.h, 0) }} color={fillOf(node) as CssVar} className="faun-chart-tile" active={n === active} shapeProps={{ "data-active": n === active || undefined }} />
          ))}
          {leaves.map(({ node, rect }) => (rect.w >= 56 && rect.h >= 28 ? (
            <g key={`t-${node.id}`}>
              <Chip x={rect.x + 4} y={rect.y + 14} maxWidth={rect.w - 8} text={node.label} />
              {rect.h >= 52 && rect.w >= 64 ? <Chip x={rect.x + 4} y={rect.y + 36} maxWidth={rect.w - 8} text={format(node.value)} /> : null}
            </g>
          ) : null))}
          {heads.map(({ node, rect }) => (rect.w >= 48 ? <text key={`h-${node.id}`} className="faun-chart-axis-label" x={rect.x + 6} y={rect.y + 14} fontWeight={600}>{node.label.length * 7 > rect.w - 8 ? `${node.label.slice(0, Math.max(Math.floor((rect.w - 8) / 7) - 1, 1))}…` : node.label}</text> : null))}
        </>
      ),
    };
  };
  const key = colorBy === "value"
    ? <RampLegend ramp={seqRamp(HUE)} label="Colour key: size" from={withUnit(lo)} to={withUnit(hi)} />
    : colorBy === "change"
      ? <RampLegend ramp={divRamp()} label="Colour key: change" from={positiveIs === "better" ? `-${format(maxChange)}${changeUnit}` : `+${format(maxChange)}${changeUnit}`} mid="0" to={positiveIs === "better" ? `+${format(maxChange)}${changeUnit}` : `-${format(maxChange)}${changeUnit}`} />
      : null;
  return <ChartShell ref={ref} height={height} legendItems={legendItems} legend={colorBy === "group" ? legend : false} legendExtra={legend === false ? null : key} empty={allLeaves.length === 0} layout={layout} {...rest} />;
});
