import { describe, expect, it } from "vitest";
import { buildHierarchy, leavesOf, packHierarchy, squarify, treeRows, type HierarchyNode } from "./hierarchy.js";
import { divIndex, divVar, seqVar } from "./ramps.js";

const data: HierarchyNode = {
  label: "Emissions",
  children: [
    { label: "Purchased goods", children: [{ label: "Steel", value: 40 }, { label: "Packaging", value: 20 }, { label: "Chemicals", value: 10 }] },
    { label: "Logistics", children: [{ label: "Road", value: 20 }, { label: "Sea", value: 10 }] },
    { label: "Empty", children: [{ label: "None", value: 0 }] },
  ],
};

describe("hierarchy helpers", () => {
  it("sums branch values, numbers colour groups by top-level child and drops empty leaves", () => {
    const root = buildHierarchy(data);
    expect(root.value).toBe(100);
    expect(root.children.map((c) => c.value)).toEqual([70, 30]);
    expect(leavesOf(root).map((l) => l.label)).not.toContain("None");
    expect(leavesOf(root).find((l) => l.label === "Sea")!.group).toBe(1);
    expect(leavesOf(root).find((l) => l.label === "Sea")!.path).toEqual(["Logistics", "Sea"]);
  });

  it("squarifies into rectangles that fill the area in proportion to value", () => {
    const out = squarify([{ item: "a", value: 6 }, { item: "b", value: 3 }, { item: "c", value: 1 }], { x: 0, y: 0, w: 100, h: 50 });
    const area = (r: { w: number; h: number }) => r.w * r.h;
    expect(out.reduce((s, o) => s + area(o.rect), 0)).toBeCloseTo(5000, 3);
    expect(area(out[0]!.rect) / area(out[2]!.rect)).toBeCloseTo(6, 3);
    for (const o of out) { expect(o.rect.x).toBeGreaterThanOrEqual(-1e-9); expect(o.rect.x + o.rect.w).toBeLessThanOrEqual(100 + 1e-9); expect(o.rect.y + o.rect.h).toBeLessThanOrEqual(50 + 1e-9); }
  });

  it("packs circles without overlap, leaf area in proportion to value", () => {
    const packed = packHierarchy(buildHierarchy(data), 0);
    const leaves = packed.filter((p) => p.node.children.length === 0);
    for (let i = 0; i < leaves.length; i++) for (let j = i + 1; j < leaves.length; j++) {
      expect(Math.hypot(leaves[i]!.x - leaves[j]!.x, leaves[i]!.y - leaves[j]!.y)).toBeGreaterThanOrEqual(leaves[i]!.r + leaves[j]!.r - 1e-6);
    }
    const steel = leaves.find((l) => l.node.label === "Steel")!; const chem = leaves.find((l) => l.node.label === "Chemicals")!;
    expect((steel.r * steel.r) / (chem.r * chem.r)).toBeCloseTo(4, 3);
    const root = packed[0]!;
    for (const l of leaves) expect(Math.hypot(l.x - root.x, l.y - root.y) + l.r).toBeLessThanOrEqual(root.r + 1e-6);
  });

  it("gives leaves consecutive rows and parents the mean of their children", () => {
    const { nodes, rows, depth } = treeRows(buildHierarchy(data));
    expect(rows).toBe(5);
    expect(depth).toBe(2);
    expect(nodes.find((n) => n.node.label === "Purchased goods")!.row).toBe(1);
    expect(nodes.find((n) => n.node.label === "Logistics")!.row).toBe(3.5);
  });
});

describe("ramps", () => {
  it("maps positions to the seven sequential and diverging tokens", () => {
    expect(seqVar(0)).toBe("var(--faun-dataviz-seq-1)");
    expect(seqVar(1)).toBe("var(--faun-dataviz-seq-7)");
    expect(seqVar(0.5)).toBe("var(--faun-dataviz-seq-4)");
    expect(divVar(-1)).toBe("var(--faun-dataviz-div-neg-3)");
    expect(divVar(0)).toBe("var(--faun-dataviz-div-mid)");
    expect(divVar(1)).toBe("var(--faun-dataviz-div-pos-3)");
    expect(divIndex(NaN)).toBe(3);
  });
});
