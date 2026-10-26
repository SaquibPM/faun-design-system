import { forwardRef } from "react";
import { ChartShell, type ShellDrawing, type ShellLegendItem, type ShellSize, type ShellStep } from "../ChartKit/ChartShell.js";
import { chartColorVar, defaultFormat } from "../ChartKit/scale.js";
import type { ChartCommonProps } from "../ChartKit/types.js";

export interface CloudWord {
  text: string;
  /** Zero or positive. Sets the type size. */
  value: number;
  /** Optional category. Up to eight groups take `cat-1` to `cat-8` in order of first appearance; without groups all words use one neutral colour. */
  group?: string;
}

export interface WordCloudChartProps extends ChartCommonProps {
  words: CloudWord[];
  /** Name of what `value` counts, for example "Mentions". Default "Count". */
  valueLabel?: string;
  /** Formats a value. Default: thousands separators, up to one decimal. */
  format?: (value: number) => string;
}

interface Placed { word: CloudWord; index: number; x: number; y: number; size: number; w: number; h: number }

const MIN = 13;
const MAX = 44;
const wordWidth = (t: string, size: number) => t.length * size * 0.58;

/** Places words by value on an outward spiral, largest first, without overlap. Words that cannot fit shrink, then are left out of the drawing (they stay in the table). Exported for tests. */
export function layoutWords(words: CloudWord[], width: number, height: number): Placed[] {
  const order = words.map((word, index) => ({ word, index })).filter((w) => w.word.value > 0).sort((a, b) => b.word.value - a.word.value || a.index - b.index);
  if (order.length === 0) return [];
  const hi = order[0]!.word.value; const lo = order[order.length - 1]!.word.value;
  const out: Placed[] = [];
  const hit = (b: { x: number; y: number; w: number; h: number }) => out.some((p) => Math.abs(p.x - b.x) * 2 < p.w + b.w + 4 && Math.abs(p.y - b.y) * 2 < p.h + b.h + 2);
  for (const { word, index } of order) {
    let size = hi === lo ? (MIN + MAX) / 2 : MIN + (MAX - MIN) * Math.sqrt((word.value - lo) / (hi - lo));
    for (let attempt = 0; attempt < 6; attempt++) {
      const w = wordWidth(word.text, size); const h = size * 1.15;
      let placed = false;
      for (let t = 0; t < 900 && !placed; t++) {
        const a = t * 0.35; const rad = 1.2 * a;
        const b = { x: width / 2 + rad * Math.cos(a) * 1.6, y: height / 2 + rad * Math.sin(a), w, h };
        if (b.x - w / 2 < 2 || b.x + w / 2 > width - 2 || b.y - h / 2 < 2 || b.y + h / 2 > height - 2) continue;
        if (!hit(b)) { out.push({ word, index, x: b.x, y: b.y, size, w, h }); placed = true; }
      }
      if (placed) break;
      size *= 0.85;
      if (size < 10) break;
    }
  }
  return out;
}

/** Shows which terms stand out in a body of text, such as the topics raised in stakeholder feedback. Size carries the value; use a bar chart when readers need to compare values exactly. */
export const WordCloudChart = forwardRef<HTMLElement, WordCloudChartProps>(function WordCloudChart(props, ref) {
  const { words, valueLabel = "Count", format = defaultFormat, height = 320, ...rest } = props;
  const groups = [...new Set(words.flatMap((w) => (w.group ? [w.group] : [])))].slice(0, 8);
  const legendItems: ShellLegendItem[] = groups.map((g, i) => ({ id: g, label: g, color: `cat-${i + 1}` as ShellLegendItem["color"] }));
  const colorOf = (w: CloudWord) => { const i = w.group ? groups.indexOf(w.group) : -1; return i >= 0 ? chartColorVar(`cat-${i + 1}` as never) : "var(--faun-dataviz-axis)"; };

  const layout = ({ width, height, active, isHidden }: ShellSize): ShellDrawing => {
    const visible = words.filter((w) => !(w.group && isHidden(w.group)));
    const placed = layoutWords(visible, width, height);
    const total = visible.reduce((n, w) => n + Math.max(w.value, 0), 0);
    const steps: ShellStep[] = placed.map((p) => ({
      label: p.word.text, x: p.x, y: p.y,
      rows: [{ name: valueLabel, value: format(p.word.value) }, { name: "Share", value: `${((p.word.value / (total || 1)) * 100).toFixed(1)}%` }, ...(p.word.group ? [{ name: "Group", value: p.word.group }] : [])],
    }));
    const withGroup = visible.some((w) => w.group);
    return {
      noun: "words",
      steps,
      hit: (x, y) => placed.findIndex((p) => Math.abs(p.x - x) <= p.w / 2 && Math.abs(p.y - y) <= p.h / 2),
      table: {
        head: ["Word", valueLabel, ...(withGroup ? ["Group"] : [])],
        rows: [...visible].sort((a, b) => b.value - a.value).map((w) => [w.text, format(w.value), ...(withGroup ? [w.group ?? "None"] : [])]),
      },
      svg: (
        <>
          {placed.map((p, n) => (
            <text key={`${p.word.text}-${p.index}`} className="faun-chart-word" data-active={n === active || undefined} x={p.x} y={p.y} dy="0.32em" textAnchor="middle" fontSize={p.size} style={{ fill: colorOf(p.word) }}>{p.word.text}</text>
          ))}
        </>
      ),
    };
  };
  return <ChartShell ref={ref} height={height} legendItems={legendItems} empty={words.every((w) => w.value <= 0)} layout={layout} {...rest} />;
});
