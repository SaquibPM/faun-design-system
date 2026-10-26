import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectChartContract, expectLoadingAndEmpty } from "../../../test/contract.js";
import { TreeChart } from "./TreeChart.js";

const data = { label: "Group", children: [{ label: "Manufacturing", children: [{ label: "Pune", value: 8 }, { label: "Chennai", value: 5 }] }, { label: "Distribution", children: [{ label: "Leeds", value: 2 }] }] };
const nodes = (c: Element) => [...c.querySelectorAll<SVGCircleElement>("circle.faun-chart-branch-node")];

describe("TreeChart", () => {
  it("keeps the chart accessibility contract", async () => {
    await expectChartContract(<TreeChart title="Entities" data={data} />, "Entities");
  });

  it("draws a node for every entry and an edge to each parent, one level further right per generation", () => {
    const { container } = render(<TreeChart title="Entities" data={data} />);
    expect(nodes(container)).toHaveLength(6);
    expect(container.querySelectorAll("path.faun-chart-edge")).toHaveLength(5);
    const cx = (label: string) => {
      const i = ["Group", "Manufacturing", "Pune", "Chennai", "Distribution", "Leeds"].indexOf(label);
      return Number(nodes(container)[i]!.getAttribute("cx"));
    };
    expect(cx("Manufacturing")).toBeGreaterThan(cx("Group"));
    expect(cx("Pune")).toBeGreaterThan(cx("Manufacturing"));
    expect(cx("Pune")).toBe(cx("Leeds"));
  });

  it("aligns every leaf at the right edge in a dendrogram", () => {
    const deep = { label: "Root", children: [{ label: "A", children: [{ label: "A1" }] }, { label: "B" }] };
    const { container } = render(<TreeChart variant="dendrogram" title="D" data={deep} />);
    const xs = nodes(container).map((n) => Number(n.getAttribute("cx")));
    // Nodes in reading order: Root, A, A1, B. Both leaves (A1, B) share the right edge.
    expect(xs[2]).toBe(xs[3]);
    expect(xs[3]).toBeGreaterThan(xs[1]!);
  });

  it("lists each node with its level, parent and children in the table", () => {
    render(<TreeChart title="Entities" data={data} unit="t" />);
    const t = screen.getByRole("table");
    expect(t).toHaveTextContent("Manufacturing / Pune");
    expect(t).toHaveTextContent("Parent");
  });

  it("has loading and empty states", () => {
    expectLoadingAndEmpty(<TreeChart title="Entities" loading data={{ label: "x" }} />, <TreeChart title="Entities" data={{ label: "x" }} />, "Entities");
  });
});
