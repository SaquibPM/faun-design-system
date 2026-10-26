import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { SegmentedControl } from "./SegmentedControl.js";

const views = [
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
  { value: "year", label: "Year" },
];

describe("SegmentedControl", () => {
  it("selects one option and cannot be emptied", async () => {
    const fn = vi.fn();
    render(<SegmentedControl aria-label="Period" options={views} defaultValue="quarter" onValueChange={fn} />);
    expect(screen.getByRole("radiogroup", { name: "Period" })).toBeInTheDocument();
    const q = screen.getByRole("radio", { name: "Quarter" });
    expect(q).toBeChecked();
    await userEvent.click(q);
    expect(q).toBeChecked();
    expect(fn).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("radio", { name: "Year" }));
    expect(fn).toHaveBeenLastCalledWith("year");
  });
  it("moves with arrow keys", async () => {
    render(<SegmentedControl aria-label="Period" options={views} defaultValue="month" />);
    screen.getByRole("radio", { name: "Month" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Quarter" })).toHaveFocus();
  });
  it("has no axe violations", async () => {
    const { container } = render(<SegmentedControl aria-label="Period" options={views} defaultValue="month" size="sm" fullWidth />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
