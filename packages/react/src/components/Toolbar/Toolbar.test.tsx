import { IconDownload, IconFilter, IconRefresh, IconSettings, IconShare } from "@faun-ds/icons";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Toolbar, ToolbarButton, ToolbarSeparator } from "./Toolbar.js";

function Basic({ onExport = () => {} }: { onExport?: () => void }) {
  return (
    <Toolbar label="Table actions">
      <ToolbarButton label="Filter" icon={<IconFilter />} />
      <ToolbarButton label="Refresh" icon={<IconRefresh />} />
      <ToolbarButton label="Share" icon={<IconShare />} disabled />
      <ToolbarSeparator />
      <ToolbarButton label="Export" icon={<IconDownload />} onClick={onExport} />
    </Toolbar>
  );
}

describe("Toolbar", () => {
  it("is a named toolbar and a single tab stop", async () => {
    const { container } = render(<><button type="button">Before</button><Basic /><button type="button">After</button></>);
    expect(screen.getByRole("toolbar", { name: "Table actions" })).toHaveAttribute("aria-orientation", "horizontal");
    const stops = within(screen.getByRole("toolbar")).getAllByRole("button").filter((b) => b.getAttribute("tabindex") === "0");
    expect(stops).toHaveLength(1);
    expect(stops[0]).toHaveAccessibleName("Filter");
    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Filter" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    expect(await axeViolations(container)).toEqual([]);
  });
  it("moves with the arrow keys, wraps, skips disabled controls and supports Home and End", async () => {
    render(<Basic />);
    screen.getByRole("button", { name: "Filter" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Refresh" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Export" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Filter" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("button", { name: "Export" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("button", { name: "Filter" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("button", { name: "Export" })).toHaveFocus();
  });
  it("remembers the last focused control as the tab stop", async () => {
    render(<><Basic /><button type="button">After</button></>);
    screen.getByRole("button", { name: "Filter" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Refresh" })).toHaveFocus();
  });
  it("vertical toolbars use the up and down arrows", async () => {
    render(<Toolbar label="Tools" orientation="vertical"><ToolbarButton label="One" icon={<IconFilter />} /><ToolbarButton label="Two" icon={<IconRefresh />} /></Toolbar>);
    screen.getByRole("button", { name: "One" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "One" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: "Two" })).toHaveFocus();
  });
  it("toggle buttons report pressed state and call onPressedChange; plain ones call onClick", async () => {
    const onPressedChange = vi.fn();
    const onExport = vi.fn();
    render(<Toolbar label="Tools"><ToolbarButton label="Zebra rows" icon={<IconSettings />} pressed onPressedChange={onPressedChange} /><ToolbarButton label="Export" icon={<IconDownload />} onClick={onExport} /></Toolbar>);
    const toggle = screen.getByRole("button", { name: "Zebra rows" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(toggle);
    expect(onPressedChange).toHaveBeenCalledWith(false);
    await userEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(onExport).toHaveBeenCalledTimes(1);
  });
  it("shows a text label with showLabel", () => {
    render(<Toolbar label="Tools"><ToolbarButton label="Export" showLabel icon={<IconDownload />} /></Toolbar>);
    expect(screen.getByRole("button", { name: "Export" })).toHaveTextContent("Export");
  });
});

describe("Toolbar overflow", () => {
  const widthDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth");
  const clientDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
  let available = 130;
  beforeEach(() => {
    // jsdom has no layout: every control is 40 wide, separators 9, the "More" button 40, the toolbar `available` wide.
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get() { return (this as HTMLElement).getAttribute("role") === "separator" ? 9 : 40; } });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get() { return (this as HTMLElement).getAttribute("role") === "toolbar" ? available : 0; } });
  });
  afterEach(() => {
    if (widthDesc) Object.defineProperty(HTMLElement.prototype, "offsetWidth", widthDesc);
    if (clientDesc) Object.defineProperty(HTMLElement.prototype, "clientWidth", clientDesc);
    available = 130;
  });

  function Overflowing({ onExport = () => {} }: { onExport?: () => void }) {
    return (
      <Toolbar label="Table actions" overflow>
        <ToolbarButton label="Filter" icon={<IconFilter />} />
        <ToolbarButton label="Refresh" icon={<IconRefresh />} />
        <ToolbarButton label="Zebra rows" icon={<IconSettings />} pressed onPressedChange={() => {}} />
        <ToolbarButton label="Export" icon={<IconDownload />} onClick={onExport} />
      </Toolbar>
    );
  }

  it("moves the controls that do not fit into a More menu, in order, and keeps the first ones visible", async () => {
    render(<Overflowing />);
    const toolbar = screen.getByRole("toolbar");
    expect(within(toolbar).getByRole("button", { name: "Filter" })).toBeVisible();
    expect(within(toolbar).getByRole("button", { name: "Refresh" })).toBeVisible();
    expect(within(toolbar).queryByRole("button", { name: "Export" })).toBeNull();
    const more = within(toolbar).getByRole("button", { name: "More actions" });
    await userEvent.click(more);
    const menu = await screen.findByRole("menu");
    expect(within(menu).getAllByRole("menuitem").map((m) => m.textContent)).toEqual(["Export"]);
    expect(within(menu).getByRole("menuitemcheckbox", { name: "Zebra rows" })).toHaveAttribute("aria-checked", "true");
  });
  it("runs a folded control's action from the menu", async () => {
    const onExport = vi.fn();
    render(<Overflowing onExport={onExport} />);
    await userEvent.click(screen.getByRole("button", { name: "More actions" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Export" }));
    expect(onExport).toHaveBeenCalledTimes(1);
  });
  it("shows no More button when everything fits", () => {
    available = 400;
    render(<Overflowing />);
    expect(screen.queryByRole("button", { name: "More actions" })).toBeNull();
    expect(screen.getByRole("button", { name: "Export" })).toBeVisible();
  });
  it("the More button joins the arrow-key order, and the toolbar has no axe violations", async () => {
    const { container } = render(<Overflowing />);
    screen.getByRole("button", { name: "Refresh" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "More actions" })).toHaveFocus();
    expect(await axeViolations(container)).toEqual([]);
  });
});
