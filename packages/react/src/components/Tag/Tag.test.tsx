import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover/Popover.js";
import { FilterChip, Tag, TagGroup } from "./Tag.js";

describe("Tag", () => {
  it("renders label, variant and size", () => {
    const { container } = render(<Tag variant="framework" size="sm">ESRS E1</Tag>);
    expect(screen.getByText("ESRS E1")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("data-variant", "framework");
    expect(container.firstElementChild).toHaveAttribute("data-size", "sm");
  });
  it("has no remove button unless onRemove is given", () => {
    render(<Tag>GRI 305</Tag>);
    expect(screen.queryByRole("button")).toBeNull();
  });
  it("removes with a labelled button, by click and keyboard", async () => {
    const onRemove = vi.fn();
    render(<Tag onRemove={onRemove}>Scope 3</Tag>);
    const btn = screen.getByRole("button", { name: "Remove Scope 3" });
    await userEvent.click(btn);
    btn.focus();
    await userEvent.keyboard("{Enter}");
    expect(onRemove).toHaveBeenCalledTimes(2);
  });
  it("accepts a custom remove label", () => {
    render(<Tag onRemove={() => {}} removeLabel="Clear framework filter">CSRD</Tag>);
    expect(screen.getByRole("button", { name: "Clear framework filter" })).toBeInTheDocument();
  });
  it("has no axe violations", async () => {
    const { container } = render(<Tag onRemove={() => {}}>CDP climate</Tag>);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("FilterChip", () => {
  it("is a toggle button that reports pressed state", async () => {
    function Harness() {
      const [on, setOn] = useState(false);
      return <FilterChip selected={on} onSelectedChange={setOn} count={7}>Awaiting you</FilterChip>;
    }
    render(<Harness />);
    const chip = screen.getByRole("button", { name: /Awaiting you/ });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(chip).toHaveTextContent("7");
  });
  it("does not toggle when the click is default-prevented, and has no axe violations", async () => {
    const onSelectedChange = vi.fn();
    const { container } = render(<FilterChip onSelectedChange={onSelectedChange} onClick={(e) => e.preventDefault()}>Estimated</FilterChip>);
    await userEvent.click(screen.getByRole("button"));
    expect(onSelectedChange).not.toHaveBeenCalled();
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("Tag upgrades", () => {
  it("selectable tags are toggle buttons with a check when selected", async () => {
    function Harness() {
      const [on, setOn] = useState(false);
      return <Tag selectable selected={on} onSelectedChange={setOn}>Scope 3</Tag>;
    }
    const { container } = render(<Harness />);
    const btn = screen.getByRole("button", { name: "Scope 3" });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector("svg")).not.toBeNull();
    btn.focus();
    await userEvent.keyboard(" ");
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(await axeViolations(container)).toEqual([]);
  });
  it("operational tags are buttons that call onClick and pass trigger props to the button", async () => {
    const onClick = vi.fn();
    render(
      <Popover>
        <PopoverTrigger asChild><Tag variant="operational" onClick={onClick}>All frameworks</Tag></PopoverTrigger>
        <PopoverContent aria-label="Frameworks">List</PopoverContent>
      </Popover>,
    );
    const btn = screen.getByRole("button", { name: "All frameworks" });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(btn).toHaveAttribute("aria-expanded", "true");
  });
  it("a selectable tag can also be dismissed, independently", async () => {
    const onRemove = vi.fn();
    const onSelectedChange = vi.fn();
    render(<Tag selectable onSelectedChange={onSelectedChange} onRemove={onRemove}>CDP</Tag>);
    await userEvent.click(screen.getByRole("button", { name: "Remove CDP" }));
    expect(onRemove).toHaveBeenCalled();
    expect(onSelectedChange).not.toHaveBeenCalled();
  });
  it("disabled tags cannot be pressed or removed; filter tags and size lg render", async () => {
    const fn = vi.fn();
    const { container, rerender } = render(<Tag selectable disabled onSelectedChange={fn} onRemove={fn}>TCFD</Tag>);
    expect(screen.getByRole("button", { name: "TCFD" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Remove TCFD" })).toBeDisabled();
    rerender(<Tag variant="filter" size="lg" onRemove={fn}>Scope: 3</Tag>);
    expect(container.firstElementChild).toHaveAttribute("data-variant", "filter");
    expect(container.firstElementChild).toHaveAttribute("data-size", "lg");
  });
});

describe("TagGroup", () => {
  const frameworks = ["CSRD", "ESRS E1", "GRI 305", "CDP climate", "TCFD"];
  it("shows all tags without max and is a named group", async () => {
    const { container } = render(<TagGroup label="Frameworks">{frameworks.map((f) => <Tag key={f}>{f}</Tag>)}</TagGroup>);
    expect(screen.getByRole("group", { name: "Frameworks" })).toBeInTheDocument();
    expect(screen.getAllByText(/CSRD|ESRS|GRI|CDP|TCFD/)).toHaveLength(5);
    expect(await axeViolations(container)).toEqual([]);
  });
  it("collapses tags past max into a +N tag that opens a popover listing the rest, removable too", async () => {
    const onRemove = vi.fn();
    render(<TagGroup label="Frameworks" max={2}>{frameworks.map((f) => <Tag key={f} onRemove={() => onRemove(f)}>{f}</Tag>)}</TagGroup>);
    expect(screen.queryByText("GRI 305")).toBeNull();
    const more = screen.getByRole("button", { name: "+3 more" });
    expect(more).toHaveTextContent("+3");
    await userEvent.click(more);
    const pop = await screen.findByRole("dialog", { name: "More frameworks" });
    expect(within(pop).getByText("GRI 305")).toBeInTheDocument();
    expect(within(pop).queryByText("CSRD")).toBeNull();
    await userEvent.click(within(pop).getByRole("button", { name: "Remove TCFD" }));
    expect(onRemove).toHaveBeenCalledWith("TCFD");
    expect(await axeViolations(pop)).toEqual([]);
    await userEvent.keyboard("{Escape}");
    expect(more).toHaveFocus();
  });
  it("shows no +N tag when the tags fit", () => {
    render(<TagGroup max={5}>{frameworks.map((f) => <Tag key={f}>{f}</Tag>)}</TagGroup>);
    expect(screen.queryByRole("button", { name: /more/ })).toBeNull();
  });
});
