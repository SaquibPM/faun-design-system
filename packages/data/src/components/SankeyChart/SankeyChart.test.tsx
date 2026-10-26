import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectChartContract, expectLoadingAndEmpty } from "../../../test/contract.js";
import { SankeyChart, sankeyLayout } from "./SankeyChart.js";

const nodes = [{ id: "gas", label: "Gas" }, { id: "diesel", label: "Diesel" }, { id: "scope-1", label: "Scope 1" }, { id: "pune", label: "Pune" }, { id: "leeds", label: "Leeds" }];
const links = [
  { source: "gas", target: "scope-1", value: 70 }, { source: "diesel", target: "scope-1", value: 30 },
  { source: "scope-1", target: "pune", value: 80 }, { source: "scope-1", target: "leeds", value: 20 },
];

describe("sankeyLayout", () => {
  it("puts nodes in columns by longest path and sizes them by flow", () => {
    const g = sankeyLayout(nodes, links, 600, 300);
    const col = Object.fromEntries(g.nodes.map((n) => [n.id, n.col]));
    expect(col).toEqual({ gas: 0, diesel: 0, "scope-1": 1, pune: 2, leeds: 2 });
    const h = Object.fromEntries(g.nodes.map((n) => [n.id, n.h]));
    expect(h.gas! / h.diesel!).toBeCloseTo(70 / 30, 3);
    expect(h["scope-1"]!).toBeCloseTo(h.gas! + h.diesel!, 3);
  });
  it("keeps ribbons within their nodes and does not loop forever on a cycle", () => {
    const g = sankeyLayout(nodes, links, 600, 300);
    for (const l of g.links) {
      expect(l.sy).toBeGreaterThanOrEqual(l.s.y - 1e-6); expect(l.sy + l.w).toBeLessThanOrEqual(l.s.y + l.s.h + 1e-6);
      expect(l.ty).toBeGreaterThanOrEqual(l.t.y - 1e-6); expect(l.ty + l.w).toBeLessThanOrEqual(l.t.y + l.t.h + 1e-6);
    }
    const cyc = sankeyLayout([{ id: "a", label: "A" }, { id: "b", label: "B" }], [{ source: "a", target: "b", value: 1 }, { source: "b", target: "a", value: 1 }], 400, 200);
    expect(cyc.nodes).toHaveLength(2);
  });
});

describe("SankeyChart", () => {
  it("keeps the chart accessibility contract", async () => {
    await expectChartContract(<SankeyChart title="Energy to site" unit="t" nodes={nodes} links={links} />, "Energy to site");
  });

  it("draws a node bar per node and a ribbon per flow, with scope ids in the scope colour", () => {
    const { container } = render(<SankeyChart title="S" nodes={nodes} links={links} />);
    expect(container.querySelectorAll("rect.faun-chart-node")).toHaveLength(5);
    expect(container.querySelectorAll("path.faun-chart-link")).toHaveLength(4);
    const fills = [...container.querySelectorAll<SVGRectElement>("rect.faun-chart-node")].map((n) => n.style.fill);
    expect(fills).toContain("var(--faun-dataviz-scope-1)");
    expect(fills[0]).toBe("var(--faun-dataviz-cat-1)");
  });

  it("lists every flow and the node totals in the data table", () => {
    render(<SankeyChart title="S" unit="t" nodes={nodes} links={links} />);
    const t = screen.getByRole("table");
    expect(t).toHaveTextContent("Gas");
    expect(t).toHaveTextContent("Node total: Scope 1");
    expect(t).toHaveTextContent("100");
  });

  it("has loading and empty states", () => {
    expectLoadingAndEmpty(<SankeyChart title="S" loading nodes={[]} links={[]} />, <SankeyChart title="S" nodes={[]} links={[]} />, "S");
  });
});
