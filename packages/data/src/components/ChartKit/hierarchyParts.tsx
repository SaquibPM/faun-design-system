import { textWidth, truncate } from "./scale.js";
import type { ShellLegendItem } from "./ChartShell.js";
import type { HNode } from "./hierarchy.js";
import type { ChartColor } from "./types.js";

/** Categorical colour slot for a top-level group. Groups beyond the eighth reuse the last slot; group the tail as "Other" instead. */
export const groupColor = (group: number): ChartColor => `cat-${Math.min(Math.max(group, 0) + 1, 8)}` as ChartColor;

/** One legend entry per top-level group. */
export const groupLegend = (root: HNode): ShellLegendItem[] => root.children.slice(0, 8).map((g) => ({ id: g.id, label: g.label, color: groupColor(g.group) }));

/** A label on a quiet surface chip, so text stays readable on any fill. Draws nothing when the label would not fit. */
export function Chip({ x, y, maxWidth, text, anchor = "start" }: { x: number; y: number; maxWidth: number; text: string; anchor?: "start" | "middle" }) {
  const chars = Math.floor((maxWidth - 12) / 6.5);
  if (chars < 3) return null;
  const t = truncate(text, chars);
  const w = textWidth(t) + 10;
  const left = anchor === "middle" ? x - w / 2 : x;
  return (
    <g>
      <rect className="faun-chart-chip" x={left} y={y - 9} width={w} height={18} rx={4} />
      <text className="faun-chart-chip-text" x={left + 5} y={y} dy="0.32em">{t}</text>
    </g>
  );
}

export const sharePct = (v: number, total: number) => `${((v / (total || 1)) * 100).toFixed(1)}%`;
