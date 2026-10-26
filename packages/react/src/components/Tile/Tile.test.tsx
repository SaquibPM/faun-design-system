import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { ClickableTile, ExpandableTile, SelectableTile, Tile, TileGroup } from "./Tile.js";

describe("Tile", () => {
  it("is a plain surface and can be disabled", () => {
    const { container } = render(<Tile disabled>Scope 3 inventory</Tile>);
    expect(container.firstElementChild).toHaveClass("faun-tile");
    expect(container.firstElementChild).toHaveAttribute("data-disabled");
  });
});

describe("ClickableTile", () => {
  it("renders a link with href, named by its text", async () => {
    const { container } = render(<ClickableTile href="/inventory"><span>Open the Scope 3 inventory</span><span>14 categories</span></ClickableTile>);
    const link = screen.getByRole("link", { name: /Open the Scope 3 inventory/ });
    expect(link).toHaveAttribute("href", "/inventory");
    expect(await axeViolations(container)).toEqual([]);
  });
  it("renders a button without href and calls onClick, by mouse and keyboard", async () => {
    const fn = vi.fn();
    render(<ClickableTile onClick={fn}><span>Start a new run</span></ClickableTile>);
    const b = screen.getByRole("button", { name: "Start a new run" });
    await userEvent.click(b);
    b.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(fn).toHaveBeenCalledTimes(3);
  });
  it("disabled link has no href and is announced as disabled; disabled button does not fire", async () => {
    const fn = vi.fn();
    render(<><ClickableTile href="/x" disabled><span>Locked link</span></ClickableTile><ClickableTile disabled onClick={fn}><span>Locked button</span></ClickableTile></>);
    expect(screen.getByRole("link", { name: "Locked link" })).not.toHaveAttribute("href");
    expect(screen.getByRole("link", { name: "Locked link" })).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(screen.getByRole("button", { name: "Locked button" }));
    expect(fn).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Locked button" })).toBeDisabled();
  });
});

describe("SelectableTile (checkbox semantics)", () => {
  it("toggles on click and Space, uncontrolled", async () => {
    const fn = vi.fn();
    render(<SelectableTile onSelectedChange={fn}><span>Include Scope 3</span></SelectableTile>);
    const box = screen.getByRole("checkbox", { name: "Include Scope 3" });
    expect(box).not.toBeChecked();
    await userEvent.click(box);
    expect(box).toBeChecked();
    expect(fn).toHaveBeenLastCalledWith(true);
    box.focus();
    await userEvent.keyboard(" ");
    expect(box).not.toBeChecked();
    expect(box.closest(".faun-tile")).not.toHaveAttribute("data-selected");
  });
  it("shows selected state on the tile and respects disabled and read-only", async () => {
    const { rerender } = render(<SelectableTile defaultSelected><span>Include Scope 3</span></SelectableTile>);
    expect(screen.getByRole("checkbox").closest(".faun-tile")).toHaveAttribute("data-selected");
    rerender(<SelectableTile defaultSelected readOnly><span>Include Scope 3</span></SelectableTile>);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-readonly", "true");
    rerender(<SelectableTile disabled><span>Include Scope 3</span></SelectableTile>);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });
});

describe("TileGroup", () => {
  const group = (props = {}) => (
    <TileGroup legend="Reporting framework" description="Choose one." {...props}>
      <SelectableTile value="csrd"><span>CSRD</span><span>ESRS set 1</span></SelectableTile>
      <SelectableTile value="issb"><span>ISSB</span><span>IFRS S1 and S2</span></SelectableTile>
      <SelectableTile value="cdp" disabled><span>CDP</span></SelectableTile>
    </TileGroup>
  );
  it("radio: one choice, a named group, arrow keys move the choice", async () => {
    const fn = vi.fn();
    const { container } = render(group({ type: "radio", onValueChange: fn }));
    expect(screen.getByRole("group", { name: "Reporting framework" })).toHaveAccessibleDescription("Choose one.");
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    await userEvent.click(radios[0]!);
    expect(fn).toHaveBeenLastCalledWith("csrd");
    expect(radios[0]).toBeChecked();
    await userEvent.keyboard("{ArrowDown}");
    expect(radios[1]).toBeChecked();
    expect(radios[0]).not.toBeChecked();
    expect(fn).toHaveBeenLastCalledWith("issb");
    expect(radios[2]).toBeDisabled();
    expect(await axeViolations(container)).toEqual([]);
  });
  it("radio: controlled", async () => {
    function C() {
      const [v, setV] = useState<string | null>("issb");
      return group({ type: "radio", value: v, onValueChange: setV });
    }
    render(<C />);
    expect(screen.getByRole("radio", { name: /ISSB/ })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: /CSRD/ }));
    expect(screen.getByRole("radio", { name: /CSRD/ })).toBeChecked();
  });
  it("checkbox: several choices, reported as values", async () => {
    const fn = vi.fn();
    render(group({ type: "checkbox", defaultValues: ["csrd"], onValuesChange: fn }));
    await userEvent.click(screen.getByRole("checkbox", { name: /ISSB/ }));
    expect(fn).toHaveBeenLastCalledWith(["csrd", "issb"]);
    await userEvent.click(screen.getByRole("checkbox", { name: /CSRD/ }));
    expect(fn).toHaveBeenLastCalledWith(["issb"]);
  });
  it("disabled disables every tile; read-only keeps the choice", async () => {
    const first = render(group({ type: "radio", disabled: true }));
    screen.getAllByRole("radio").forEach((r) => expect(r).toBeDisabled());
    first.unmount();
    render(group({ type: "radio", defaultValue: "csrd", readOnly: true }));
    await userEvent.click(screen.getByRole("radio", { name: /ISSB/ }));
    expect(screen.getByRole("radio", { name: /CSRD/ })).toBeChecked();
  });
});

describe("ExpandableTile", () => {
  const tile = (props = {}) => (
    <ExpandableTile summary={<><span>Scope 2 methods</span><span>Location and market based</span></>} {...props}>
      <p>Report both methods. Market-based uses supplier-specific factors.</p>
    </ExpandableTile>
  );
  it("toggles in place with aria-expanded and aria-controls", async () => {
    const fn = vi.fn();
    const { container } = render(tile({ onOpenChange: fn }));
    const trigger = screen.getByRole("button", { name: /Scope 2 methods/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(/Report both methods/)).toBeInTheDocument();
    expect(container.querySelector(".faun-tile-content")).toHaveAttribute("data-state", "closed");
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(fn).toHaveBeenLastCalledWith(true);
    const region = screen.getByRole("region", { name: /Scope 2 methods/ });
    expect(trigger).toHaveAttribute("aria-controls", region.id);
    await userEvent.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(await axeViolations(container)).toEqual([]);
  });
  it("can start open, be controlled, and be disabled", async () => {
    const { rerender } = render(tile({ defaultOpen: true }));
    expect(screen.getByRole("button", { name: /Scope 2/ })).toHaveAttribute("aria-expanded", "true");
    rerender(tile({ open: false }));
    expect(screen.getByRole("button", { name: /Scope 2/ })).toHaveAttribute("aria-expanded", "false");
    rerender(tile({ disabled: true }));
    expect(screen.getByRole("button", { name: /Scope 2/ })).toBeDisabled();
  });
});
