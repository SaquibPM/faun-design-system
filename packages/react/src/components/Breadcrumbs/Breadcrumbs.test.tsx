import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Breadcrumbs } from "./Breadcrumbs.js";

const long = [
  { label: "Acme Industrial", href: "/" },
  { label: "Reports", href: "/reports" },
  { label: "CSRD FY2026", href: "/reports/csrd" },
  { label: "E1 Climate change", href: "/reports/csrd/e1" },
  { label: "E1-6 Gross GHG emissions", href: "/reports/csrd/e1/6" },
  { label: "Scope 1" },
];

describe("Breadcrumbs", () => {
  it("is a named navigation landmark with the current page marked, and has no axe violations", async () => {
    const { container } = render(<Breadcrumbs items={long.slice(0, 3)} />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("CSRD FY2026").closest("[aria-current]")).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Reports" })).toHaveAttribute("href", "/reports");
    expect(await axeViolations(container)).toEqual([]);
  });

  it("collapses middle levels into a menu that opens from the keyboard", async () => {
    const { container } = render(<Breadcrumbs items={long} />);
    expect(screen.queryByRole("link", { name: "CSRD FY2026" })).not.toBeInTheDocument();
    const more = screen.getByRole("button", { name: "Show 3 more levels" });
    await userEvent.tab();
    await userEvent.tab();
    expect(more).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const menu = await screen.findByRole("menu");
    const items = within(menu).getAllByRole("menuitem");
    expect(items.map((i) => i.textContent)).toEqual(["Reports", "CSRD FY2026", "E1 Climate change"]);
    expect(items[1]).toHaveAttribute("href", "/reports/csrd");
    expect(await axeViolations(container)).toEqual([]);
  });

  it("uses a custom link renderer", () => {
    render(<Breadcrumbs items={long.slice(0, 2)} renderLink={(p) => <a {...p} data-router="yes" />} />);
    expect(screen.getByRole("link", { name: "Acme Industrial" })).toHaveAttribute("data-router", "yes");
  });
});
