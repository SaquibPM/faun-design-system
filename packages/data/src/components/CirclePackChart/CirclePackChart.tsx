import { forwardRef } from "react";
import { ChartShell, type ShellDrawing, type ShellSize, type ShellStep } from "../ChartKit/ChartShell.js";
import { buildHierarchy, leavesOf, packHierarchy, type HierarchyNode, type HNode } from "../ChartKit/hierarchy.js";
import { Chip, groupColor, groupLegend, sharePct } from "../ChartKit/hierarchyParts.js";
import { seqRamp, seqVar } from "../ChartKit/ramps.js";
import { RampLegend } from "../ChartKit/RampLegend.js";
import { ReliefFace } from "../ChartKit/relief.js";
import { chartColorVar, type CssVar, defaultFormat } from "../ChartKit/scale.js";
import type { ChartCommonProps } from "../ChartKit/types.js";
import { CHART_DEFAULT_RAMP } from "../ChartKit/scale.js";
const HUE = CHART_DEFAULT_RAMP.circlepack;

export interface CirclePackChartProps extends ChartCommonProps {
  /** The hierarchy. The root is only a container: its children are the top-level groups. Leaves carry `value`; branches take the sum of their children. */
  data: HierarchyNode;
  /** `group` gives each top-level group a categorical colour (up to eight). `value` shades leaves with the sequential ramp by size. */
  colorBy?: "group" | "value";
  /** Unit of the leaf values. */
  unit?: string;
  /** Formats a value. Default: thousands separators, up to one decimal. */
  format?: (value: number) => string;
}

/** Shows a hierarchy as nested circles: leaf area is proportional to value and each group's circle encloses its members. Best for a handful of groups with a few dozen members. */
export const CirclePackChart = forwardRef<HTMLElement, CirclePackChartProps>(function CirclePackChart(props, ref) {
  const { data, colorBy = "group", unit, format = defaultFormat, height = 360, legend, ...rest } = props;
  const root = buildHierarchy(data);
  const withUnit = (v: number) => (unit ? `${format(v)} ${unit}` : format(v));
  const legendItems = colorBy === "group" ? groupLegend(root) : [];
  const leafValues = root.children.length === 0 ? [] : leavesOf(root).map((l) => l.value);
  const lo = Math.min(...leafValues, 0); const hi = Math.max(...leafValues, 1);

  const layout = ({ width, height, active, isHidden }: ShellSize): ShellDrawing => {
    const groups = root.children.filter((g) => !isHidden(g.id));
    const view: HNode = { ...root, children: groups, value: groups.reduce((n, g) => n + g.value, 0) };
    const packed = packHierarchy(view, 4);
    const top = packed[0]!;
    const scale = Math.max(Math.min(width, height) / 2 - 4, 10) / (top.r || 1);
    const px = (p: { x: number; y: number; r: number }) => ({ x: width / 2 + (p.x - top.x) * scale, y: height / 2 + (p.y - top.y) * scale, r: p.r * scale });
    const leaves = packed.filter((p) => p.node.children.length === 0);
    const total = view.value;
    const steps: ShellStep[] = leaves.map((p) => {
      const c = px(p);
      return { label: p.node.path.join(" / "), x: c.x, y: c.y, rows: [{ name: "Value", value: withUnit(p.node.value) }, { name: "Share", value: sharePct(p.node.value, total) }] };
    });
    const fill = (n: HNode) => (colorBy === "group" ? chartColorVar(groupColor(n.group)) : seqVar(hi === lo ? 1 : (n.value - lo) / (hi - lo), HUE));
    return {
      noun: "items",
      steps,
      hit: (x, y) => {
        let best = -1; let bestR = Infinity;
        leaves.forEach((p, i) => { const c = px(p); if (Math.hypot(x - c.x, y - c.y) <= c.r && c.r < bestR) { best = i; bestR = c.r; } });
        return best;
      },
      table: {
        head: ["Item", "Group", `Value${unit ? ` (${unit})` : ""}`, "Share"],
        rows: leaves.map((p) => [p.node.path.join(" / "), p.node.path[0] ?? "", format(p.node.value), sharePct(p.node.value, total)]),
        foot: [["Total", "", format(total), "100%"]],
      },
      svg: (
        <>
          {packed.slice(1).map((p) => {
            const c = px(p);
            const leaf = p.node.children.length === 0;
            const n = leaves.indexOf(p);
            return leaf
              ? <ReliefFace key={p.node.id} tag="circle" geom={{ cx: c.x, cy: c.y, r: Math.max(c.r, 0) }} color={fill(p.node) as CssVar} className="faun-chart-pack" active={n === active} shapeProps={{ "data-active": n === active ? "" : undefined }} />
              : <circle key={p.node.id} className="faun-chart-pack" data-branch="" cx={c.x} cy={c.y} r={Math.max(c.r, 0)} style={{ fill: fill(p.node) }} />;
          })}
          {packed.slice(1).map((p) => {
            const c = px(p);
            if (p.node.children.length === 0) return c.r >= 22 ? <Chip key={`l-${p.node.id}`} x={c.x} y={c.y} maxWidth={c.r * 1.8} text={p.node.label} anchor="middle" /> : null;
            return p.node.depth === 1 && c.r >= 40 ? <Chip key={`l-${p.node.id}`} x={c.x} y={c.y - c.r + 11} maxWidth={c.r * 1.4} text={p.node.label} anchor="middle" /> : null;
          })}
        </>
      ),
    };
  };
  const key = colorBy === "value" && legend !== false ? <RampLegend ramp={seqRamp(HUE)} label="Colour key: size" from={withUnit(lo)} to={withUnit(hi)} /> : null;
  return <ChartShell ref={ref} height={height} legendItems={legendItems} legend={colorBy === "group" ? legend : false} legendExtra={key} empty={leafValues.length === 0} layout={layout} {...rest} />;
});
