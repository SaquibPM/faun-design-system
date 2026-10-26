import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { DescriptionList } from "./DescriptionList.js";

const items = [
  { term: "Boundary", value: "Operational control" },
  { term: "Run ID", value: "run_482", mono: true, copyValue: "run_482" },
];

describe("DescriptionList", () => {
  it("renders terms and values as a description list", () => {
    const { container } = render(<DescriptionList items={items} />);
    expect(container.querySelector("dl")).toBeInTheDocument();
    expect(container.querySelectorAll("dt")).toHaveLength(2);
    expect(container.querySelectorAll("dd")).toHaveLength(2);
    expect(screen.getByText("Boundary")).toBeInTheDocument();
  });
  it("exposes layout, divided and mono", () => {
    const { container, rerender } = render(<DescriptionList items={items} layout="stacked" divided={false} />);
    const dl = container.querySelector("dl")!;
    expect(dl).toHaveAttribute("data-layout", "stacked");
    expect(dl).not.toHaveAttribute("data-divided");
    expect(container.querySelectorAll("dd")[1]).toHaveAttribute("data-mono");
    rerender(<DescriptionList items={items} termWidth="120px" />);
    expect(container.querySelector("dl")!.style.getPropertyValue("--_term")).toBe("120px");
  });
  it("copies a value to the clipboard and confirms", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<DescriptionList items={items} />);
    const btn = screen.getByRole("button", { name: "Copy" });
    await userEvent.click(btn);
    expect(writeText).toHaveBeenCalledWith("run_482");
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
  });
  it("only offers copy for items with a copyValue", () => {
    render(<DescriptionList items={items} />);
    expect(screen.getAllByRole("button", { name: /Copy/ })).toHaveLength(1);
  });
  it("has no axe violations", async () => {
    const { container } = render(<DescriptionList items={items} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
