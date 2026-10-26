import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { HeaderNav, type HeaderNavItemData } from "./HeaderNav.js";

const ITEMS: HeaderNavItemData[] = [
  { label: "Overview", href: "#overview" },
  { label: "Filings", href: "#filings", current: true },
  { label: "Data", children: [{ label: "Factor library", href: "#factors", description: "DEFRA, IEA" }, { label: "Evidence", href: "#evidence" }] },
];

afterEach(() => vi.unstubAllGlobals());

describe("HeaderNav", () => {
  it("is a named navigation with the current page marked", async () => {
    const { container } = render(<HeaderNav items={ITEMS} />);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(within(nav).getByRole("link", { name: "Filings" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: "Overview" })).not.toHaveAttribute("aria-current");
    expect(await axeViolations(container)).toEqual([]);
  });
  it("opens a sub-menu with the keyboard, navigates by arrow keys and closes on Escape", async () => {
    render(<HeaderNav items={ITEMS} />);
    const data = screen.getByRole("button", { name: "Data" });
    expect(data).toHaveAttribute("aria-haspopup", "menu");
    data.focus();
    await userEvent.keyboard("{Enter}");
    const menu = await screen.findByRole("menu");
    expect(within(menu).getAllByRole("menuitem")).toHaveLength(2);
    expect(within(menu).getByRole("menuitem", { name: /Factor library/ })).toHaveAttribute("href", "#factors");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(data).toHaveFocus();
  });
  it("underlines a sub-menu whose child is the current page", () => {
    render(<HeaderNav items={[{ label: "Data", children: [{ label: "Evidence", href: "#evidence", current: true }] }]} />);
    expect(screen.getByRole("button", { name: "Data" })).toHaveAttribute("data-current");
  });
  it("folds into one Menu button on narrow screens and lists every link in it", async () => {
    vi.stubGlobal("matchMedia", (q: string) => ({ matches: true, media: q, addEventListener: () => {}, removeEventListener: () => {} }));
    render(<HeaderNav items={ITEMS} />);
    expect(screen.queryByRole("link", { name: "Overview" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Menu" }));
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: "Overview" })).toBeInTheDocument();
    expect(within(menu).getByRole("menuitem", { name: "Filings" })).toHaveAttribute("aria-current", "page");
    expect(within(menu).getByRole("menuitem", { name: /Evidence/ })).toBeInTheDocument();
  });
});
