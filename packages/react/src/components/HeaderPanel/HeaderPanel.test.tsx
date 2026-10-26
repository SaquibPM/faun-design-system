import { IconBell, IconHelp, IconLayoutGrid } from "@faun-ds/icons";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { HeaderAction, HeaderActions, HeaderPanel, SwitcherPanel } from "./HeaderPanel.js";

const SECTIONS = [
  { title: "Recent", items: [{ label: "Reporting", href: "#reporting", description: "Filings and disclosures", current: true }, { label: "Supplier portal", href: "#suppliers" }] },
  { title: "All products", items: [{ label: "Sourcing", href: "#sourcing" }] },
];

function Header({ onHelp = () => {} }: { onHelp?: () => void }) {
  return (
    <HeaderActions>
      <HeaderAction id="notifications" label="Notifications" icon={<IconBell />} badge={3}>
        <HeaderPanel title="Notifications"><p>Nothing new.</p><button type="button">Inside</button></HeaderPanel>
      </HeaderAction>
      <HeaderAction id="switcher" label="Switch product" icon={<IconLayoutGrid />}>
        <HeaderPanel title="Products" size="sm"><SwitcherPanel sections={SECTIONS} /></HeaderPanel>
      </HeaderAction>
      <HeaderAction id="help" label="Help" icon={<IconHelp />} onClick={onHelp} />
    </HeaderActions>
  );
}

describe("HeaderAction and HeaderPanel", () => {
  it("names the action with its badge count and opens a labelled panel, with no axe violations", async () => {
    render(<Header />);
    const btn = screen.getByRole("button", { name: "Notifications, 3 new" });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(btn);
    const panel = await screen.findByRole("dialog", { name: "Notifications" });
    expect(btn).toHaveAttribute("aria-expanded", "true");
    expect(btn).toHaveAttribute("data-open");
    expect(await axeViolations(panel)).toEqual([]);
  });
  it("pressing the trigger again closes the panel", async () => {
    render(<Header />);
    const btn = screen.getByRole("button", { name: /Notifications/ });
    await userEvent.click(btn);
    await screen.findByRole("dialog");
    await userEvent.click(btn);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("only one panel is open at a time", async () => {
    render(<Header />);
    await userEvent.click(screen.getByRole("button", { name: /Notifications/ }));
    await screen.findByRole("dialog", { name: "Notifications" });
    await userEvent.click(screen.getByRole("button", { name: "Switch product" }));
    expect(await screen.findByRole("dialog", { name: "Products" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Notifications" })).toBeNull();
  });
  it("Escape closes the panel and returns focus to the trigger; the page behind stays interactive", async () => {
    const onHelp = vi.fn();
    render(<Header onHelp={onHelp} />);
    const btn = screen.getByRole("button", { name: /Notifications/ });
    await userEvent.click(btn);
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(btn).toHaveFocus();
    await userEvent.click(screen.getByRole("button", { name: "Help" }));
    expect(onHelp).toHaveBeenCalled();
  });
  it("closes when a link in the switcher is chosen and marks the current product", async () => {
    render(<Header />);
    await userEvent.click(screen.getByRole("button", { name: "Switch product" }));
    const panel = await screen.findByRole("dialog", { name: "Products" });
    const nav = within(panel).getByRole("navigation", { name: "Products" });
    expect(within(nav).getByRole("link", { name: /Reporting/ })).toHaveAttribute("aria-current", "true");
    expect(within(nav).getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["Recent", "All products"]);
    await userEvent.click(within(nav).getByRole("link", { name: "Sourcing" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("closes with its close button", async () => {
    render(<Header />);
    await userEvent.click(screen.getByRole("button", { name: /Notifications/ }));
    await userEvent.click(await screen.findByRole("button", { name: "Close panel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
