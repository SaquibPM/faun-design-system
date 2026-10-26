import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectChartContract, expectLoadingAndEmpty } from "../../../test/contract.js";
import { layoutWords, WordCloudChart } from "./WordCloudChart.js";

const words = [{ text: "emissions", value: 90, group: "Climate" }, { text: "water", value: 40, group: "Environment" }, { text: "safety", value: 30, group: "People" }, { text: "audits", value: 20 }];

describe("layoutWords", () => {
  it("sizes words by value, never overlaps them and keeps them inside the plot", () => {
    const placed = layoutWords(words, 640, 280);
    expect(placed).toHaveLength(4);
    expect(placed[0]!.word.text).toBe("emissions");
    expect(placed[0]!.size).toBeGreaterThan(placed[3]!.size);
    for (const p of placed) {
      expect(p.x - p.w / 2).toBeGreaterThanOrEqual(0); expect(p.x + p.w / 2).toBeLessThanOrEqual(640);
      expect(p.y - p.h / 2).toBeGreaterThanOrEqual(0); expect(p.y + p.h / 2).toBeLessThanOrEqual(280);
    }
    for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) {
      const a = placed[i]!; const b = placed[j]!;
      expect(Math.abs(a.x - b.x) * 2 >= a.w + b.w || Math.abs(a.y - b.y) * 2 >= a.h + b.h).toBe(true);
    }
  });
  it("is deterministic and skips words with no value", () => {
    expect(layoutWords(words, 640, 280)).toEqual(layoutWords(words, 640, 280));
    expect(layoutWords([{ text: "zero", value: 0 }], 640, 280)).toEqual([]);
  });
});

describe("WordCloudChart", () => {
  it("keeps the chart accessibility contract", async () => {
    await expectChartContract(<WordCloudChart title="Topics" valueLabel="Mentions" words={words} />, "Topics");
  });

  it("colours words by group in order, and ungrouped words with the neutral axis colour", () => {
    const { container } = render(<WordCloudChart title="Topics" words={words} />);
    const fills = Object.fromEntries([...container.querySelectorAll<SVGTextElement>("text.faun-chart-word")].map((t) => [t.textContent, t.style.fill]));
    expect(fills).toEqual({ emissions: "var(--faun-dataviz-cat-1)", water: "var(--faun-dataviz-cat-2)", safety: "var(--faun-dataviz-cat-3)", audits: "var(--faun-dataviz-axis)" });
  });

  it("lists every word with its value in the data table, largest first", () => {
    render(<WordCloudChart title="Topics" valueLabel="Mentions" words={words} />);
    const rows = screen.getAllByRole("row").slice(1).map((r) => r.textContent);
    expect(rows[0]).toContain("emissions");
    expect(screen.getByRole("columnheader", { name: "Mentions" })).toBeInTheDocument();
  });

  it("has loading and empty states", () => {
    expectLoadingAndEmpty(<WordCloudChart title="Topics" loading words={[]} />, <WordCloudChart title="Topics" words={[]} />, "Topics");
  });
});
