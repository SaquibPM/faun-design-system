import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { ScrollArea } from "./ScrollArea.js";

describe("ScrollArea", () => {
  it("renders its content and applies max height", () => {
    const { container } = render(<ScrollArea maxHeight="12rem"><p>Run 418 started</p></ScrollArea>);
    expect(screen.getByText("Run 418 started")).toBeInTheDocument();
    expect(container.querySelector(".faun-scroll-area")).toHaveStyle({ maxBlockSize: "12rem" });
  });
  it("makes a labelled region keyboard focusable", () => {
    render(<ScrollArea label="Run log"><p>Entry</p></ScrollArea>);
    const region = screen.getByRole("region", { name: "Run log" });
    expect(region).toHaveAttribute("tabindex", "0");
  });
  it("is not a tab stop without a label", () => {
    const { container } = render(<ScrollArea><p>Entry</p></ScrollArea>);
    expect(container.querySelector(".faun-scroll-viewport")).not.toHaveAttribute("tabindex");
  });
  it("forwards its ref and has no axe violations", async () => {
    let node: HTMLDivElement | null = null;
    const { container } = render(<ScrollArea ref={(n) => { node = n; }} label="Evidence list" orientation="both"><p>Item</p></ScrollArea>);
    expect(node).toBeInstanceOf(HTMLDivElement);
    expect(await axeViolations(container)).toEqual([]);
  });
});
