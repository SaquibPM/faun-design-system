import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Tree, type TreeNode } from "./Tree.js";

const items: TreeNode[] = [
  { id: "group", label: "Acme Group", children: [
    { id: "uk", label: "Acme UK", children: [{ id: "uk-plant", label: "Leeds plant" }] },
    { id: "de", label: "Acme Deutschland" },
    { id: "off", label: "Closed entity", disabled: true },
  ] },
  { id: "jv", label: "Joint venture" },
];

/** Treeitem names include their descendants, so find rows by their own label. */
const maybeItem = (label: string) => screen.queryAllByRole("treeitem").find((el) => el.querySelector(":scope > .faun-tree-row .faun-tree-label")?.textContent === label) ?? null;
const item = (label: string) => {
  const el = maybeItem(label);
  if (!el) throw new Error(`No treeitem labelled ${label}`);
  return el;
};

describe("Tree", () => {
  it("exposes the tree pattern with levels, sets and expanded state", () => {
    render(<Tree aria-label="Organisational boundary" items={items} defaultExpanded={["group"]} />);
    expect(screen.getByRole("tree", { name: "Organisational boundary" })).toBeInTheDocument();
    const group = item("Acme Group");
    expect(group).toHaveAttribute("aria-expanded", "true");
    expect(group).toHaveAttribute("aria-level", "1");
    expect(group).toHaveAttribute("aria-setsize", "2");
    const uk = item("Acme UK");
    expect(uk).toHaveAttribute("aria-level", "2");
    expect(uk).toHaveAttribute("aria-expanded", "false");
    expect(maybeItem("Leeds plant")).toBeNull();
  });
  it("has a single tab stop and moves with the arrow keys", async () => {
    render(<Tree aria-label="Boundary" items={items} defaultExpanded={["group"]} />);
    await userEvent.tab();
    expect(item("Acme Group")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(item("Acme UK")).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(item("Joint venture")).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(item("Acme Group")).toHaveFocus();
  });
  it("expands with ArrowRight, collapses and moves to the parent with ArrowLeft", async () => {
    render(<Tree aria-label="Boundary" items={items} defaultExpanded={["group"]} />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}{ArrowRight}");
    expect(item("Acme UK")).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{ArrowRight}");
    expect(item("Leeds plant")).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(item("Acme UK")).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(item("Acme UK")).toHaveAttribute("aria-expanded", "false");
  });
  it("selects with Enter and click, but not disabled nodes", async () => {
    const onSelectedChange = vi.fn();
    render(<Tree aria-label="Boundary" items={items} defaultExpanded={["group"]} onSelectedChange={onSelectedChange} />);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(onSelectedChange).toHaveBeenLastCalledWith("group");
    await userEvent.click(screen.getByText("Acme Deutschland"));
    expect(onSelectedChange).toHaveBeenLastCalledWith("de");
    expect(item("Acme Deutschland")).toHaveAttribute("aria-selected", "true");
    onSelectedChange.mockClear();
    await userEvent.click(screen.getByText("Closed entity"));
    expect(onSelectedChange).not.toHaveBeenCalled();
  });
  it("jumps by type-ahead", async () => {
    render(<Tree aria-label="Boundary" items={items} defaultExpanded={["group"]} />);
    await userEvent.tab();
    await userEvent.keyboard("j");
    expect(item("Joint venture")).toHaveFocus();
  });
  it("supports controlled expansion and has no axe violations", async () => {
    const onExpandedChange = vi.fn();
    const { container } = render(<Tree aria-label="Boundary" items={items} expanded={[]} onExpandedChange={onExpandedChange} />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(onExpandedChange).toHaveBeenCalledWith(["group"]);
    expect(await axeViolations(container)).toEqual([]);
  });
});
