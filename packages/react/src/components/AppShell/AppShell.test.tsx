import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IconFileText, IconFolder, IconHome, IconList, IconOrchestrator, IconStar, IconStatusAttention } from "@faun-ds/icons";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { AppShell, PageHeader, SideNav, SideNavAction, SideNavGroup, SideNavItem, SideNavSection, SideNavUser, SideNavWorkspace, TopBar } from "./AppShell.js";

function mockViewport(mobile: boolean) {
  const listeners = new Set<() => void>();
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: mobile,
    media: query,
    addEventListener: (_: string, l: () => void) => listeners.add(l),
    removeEventListener: (_: string, l: () => void) => listeners.delete(l),
  }));
}
afterEach(() => vi.unstubAllGlobals());

function Nav() {
  return (
    <SideNav workspace={<SideNavWorkspace mark={<IconOrchestrator />} name="Faun" context="Acme Industrial · FY2026" />} footer={<SideNavUser name="Alex Morgan" />}>
      <SideNavSection>
        <SideNavItem href="#home" icon={<IconHome />}>Home</SideNavItem>
        <SideNavItem href="#approvals" icon={<IconStatusAttention />} attention={2}>Approvals</SideNavItem>
      </SideNavSection>
      <SideNavSection title="Reporting">
        <SideNavItem href="#filings" icon={<IconFileText />} count={5} current>Filings</SideNavItem>
      </SideNavSection>
    </SideNav>
  );
}

function Shell(props: Partial<React.ComponentProps<typeof AppShell>>) {
  return (
    <AppShell nav={<Nav />} topBar={<TopBar start={<span>Filings</span>} />} {...props}>
      <PageHeader title="CSRD sustainability statement" meta={[{ label: "FY2026 · ESRS Set 1" }]} actions={<button type="button">Pause</button>} />
    </AppShell>
  );
}

describe("AppShell", () => {
  it("renders landmarks, a skip link and the current page", () => {
    render(<Shell />);
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "CSRD sustainability statement" })).toBeInTheDocument();
    const skip = screen.getByRole("link", { name: "Skip to main content" });
    expect(skip.getAttribute("href")).toBe(`#${screen.getByRole("main").id}`);
    expect(screen.getByRole("link", { name: /Filings/ })).toHaveAttribute("aria-current", "page");
  });

  it("announces counts and attention badges in link names", () => {
    render(<Shell />);
    expect(screen.getByRole("link", { name: "Approvals 2 awaiting you" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Filings 5" })).toBeInTheDocument();
  });

  it("collapses to a rail with the toggle (uncontrolled) and reports changes", async () => {
    mockViewport(false);
    const onChange = vi.fn();
    const { container } = render(<Shell onNavCollapsedChange={onChange} />);
    const toggle = screen.getByRole("button", { name: "Collapse navigation" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(container.querySelector(".faun-app-shell")).toHaveAttribute("data-collapsed");
    expect(container.querySelector(".faun-side-nav")).toHaveAttribute("data-collapsed");
    expect(screen.getByRole("button", { name: "Expand navigation" })).toHaveAttribute("aria-expanded", "false");
    // labels stay in the accessibility tree when collapsed
    expect(screen.getByRole("link", { name: /Home/ })).toBeInTheDocument();
  });

  it("respects a controlled collapsed state", async () => {
    mockViewport(false);
    const onChange = vi.fn();
    const { container } = render(<Shell navCollapsed onNavCollapsedChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Expand navigation" }));
    expect(onChange).toHaveBeenCalledWith(false);
    expect(container.querySelector(".faun-app-shell")).toHaveAttribute("data-collapsed");
  });

  it("opens an off-canvas drawer on small screens, makes the page inert and closes on Escape", async () => {
    mockViewport(true);
    const { container } = render(<Shell />);
    const open = screen.getByRole("button", { name: "Open navigation" });
    expect(open).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(open);
    const shell = container.querySelector(".faun-app-shell")!;
    expect(shell).toHaveAttribute("data-drawer-open");
    expect(container.querySelector(".faun-app-shell-body")).toHaveAttribute("inert");
    expect(screen.getByRole("link", { name: "Home" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(shell).not.toHaveAttribute("data-drawer-open");
    expect(container.querySelector(".faun-app-shell-body")).not.toHaveAttribute("inert");
    expect(screen.getByRole("button", { name: "Open navigation" })).toHaveFocus();
  });

  it("closes the drawer when a destination is chosen or the scrim is clicked", async () => {
    mockViewport(true);
    const { container } = render(<Shell />);
    await userEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    await userEvent.click(screen.getByRole("link", { name: /Filings/ }));
    expect(container.querySelector(".faun-app-shell")).not.toHaveAttribute("data-drawer-open");
    await userEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    await act(async () => { (container.querySelector(".faun-app-shell-scrim") as HTMLElement).click(); });
    expect(container.querySelector(".faun-app-shell")).not.toHaveAttribute("data-drawer-open");
  });

  it("supports router links with asChild", () => {
    render(
      <SideNav>
        <SideNavSection>
          <SideNavItem asChild label="Targets" icon={<IconHome />}><a href="/targets" data-router="" /></SideNavItem>
        </SideNavSection>
      </SideNav>,
    );
    const link = screen.getByRole("link", { name: "Targets" });
    expect(link).toHaveAttribute("data-router");
    expect(link).toHaveClass("faun-side-nav-item");
  });

  it("makes the workspace and user blocks buttons only when interactive", async () => {
    const onSwitch = vi.fn();
    render(<SideNav workspace={<SideNavWorkspace mark={<IconOrchestrator />} name="Faun" onSwitch={onSwitch} />} footer={<SideNavUser name="Alex Morgan" />} />);
    await userEvent.click(screen.getByRole("button", { name: /Faun/ }));
    expect(onSwitch).toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /Alex/ })).toBeNull();
  });

  it("has no axe violations", async () => {
    mockViewport(false);
    const { container } = render(<Shell />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

function GroupNav({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <SideNav collapsed={collapsed}>
      <SideNavSection title="Reporting">
        <SideNavItem href="#home" icon={<IconHome />}>Home</SideNavItem>
        <SideNavGroup icon={<IconFileText />} label="Filings">
          <SideNavItem href="#csrd" current>CSRD</SideNavItem>
          <SideNavItem href="#cdp">CDP climate</SideNavItem>
        </SideNavGroup>
        <SideNavGroup icon={<IconOrchestrator />} label="Agents">
          <SideNavItem href="#orchestrators" attention={2}>Orchestrators</SideNavItem>
          <SideNavItem href="#tools">Tools</SideNavItem>
        </SideNavGroup>
      </SideNavSection>
    </SideNav>
  );
}

describe("SideNavGroup (second tier)", () => {
  it("starts open when it holds the current page and closed otherwise, with aria-expanded wiring", () => {
    render(<GroupNav />);
    const filings = screen.getByRole("button", { name: "Filings" });
    const agents = screen.getByRole("button", { name: /Agents/ });
    expect(filings).toHaveAttribute("aria-expanded", "true");
    expect(agents).toHaveAttribute("aria-expanded", "false");
    expect(filings).toHaveAttribute("data-has-current");
    expect(screen.getByRole("link", { name: "CSRD" })).toHaveAttribute("aria-current", "page");
    expect(document.getElementById(filings.getAttribute("aria-controls")!)).toContainElement(screen.getByRole("link", { name: "CSRD" }));
    expect(screen.queryByRole("link", { name: /Orchestrators/ })).toBeNull();
  });
  it("toggles with Enter and Space and shows a dot on a closed group that has attention items", async () => {
    render(<GroupNav />);
    const agents = screen.getByRole("button", { name: /Agents/ });
    expect(within(agents).getByText("awaiting you")).toBeInTheDocument();
    agents.focus();
    await userEvent.keyboard("{Enter}");
    expect(agents).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: /Orchestrators/ })).toBeVisible();
    await userEvent.keyboard(" ");
    expect(agents).toHaveAttribute("aria-expanded", "false");
  });
  it("in the collapsed rail a group opens a panel beside the rail with the same links, and Escape returns focus", async () => {
    render(<GroupNav collapsed />);
    const trigger = screen.getByRole("button", { name: "Filings, 2 pages" });
    await userEvent.click(trigger);
    const flyout = await screen.findByRole("dialog", { name: "Filings" });
    expect(within(flyout).getByRole("link", { name: "CSRD" })).toHaveAttribute("aria-current", "page");
    expect(within(flyout).getByRole("link", { name: "CDP climate" })).toHaveAttribute("href", "#cdp");
    expect(await axeViolations(flyout)).toEqual([]);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
  });
  it("has no axe violations expanded or collapsed", async () => {
    const { container, rerender } = render(<GroupNav />);
    expect(await axeViolations(container)).toEqual([]);
    rerender(<GroupNav collapsed />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("TopBar nav slot", () => {
  it("renders header navigation before the location", () => {
    render(<AppShell nav={<Nav />} topBar={<TopBar nav={<nav aria-label="Primary"><a href="#a">Overview</a></nav>} start={<span>Filings</span>} />}><p>x</p></AppShell>);
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
  });
});

describe("SideNav panel design (ADR 0011)", () => {
  function PanelNav({ collapsed }: { collapsed?: boolean }) {
    return (
      <SideNav
        collapsed={collapsed}
        workspace={<SideNavWorkspace mark={<IconOrchestrator />} name="Faun" />}
        action={<SideNavAction>New conversation</SideNavAction>}
        footer={<SideNavUser name="Saquib Jawed" meta="Lead" onOpenMenu={() => {}} />}
      >
        <SideNavSection title="Projects" icon={<IconFolder />} action={<button type="button" aria-label="New project">+</button>}>
          <SideNavItem href="#a" current actions={<button type="button" aria-label="Actions for Alpha">⋮</button>}>Alpha</SideNavItem>
        </SideNavSection>
        <SideNavSection title="Reports" icon={<IconList />}>
          <SideNavItem href="#r1" progress={40}>Draft</SideNavItem>
          <SideNavItem href="#r2" progress="done">Filed</SideNavItem>
        </SideNavSection>
        <SideNavSection title="Pinned" icon={<IconStar />}>
          <SideNavItem href="#p" dot>Ledger</SideNavItem>
        </SideNavSection>
      </SideNav>
    );
  }

  it("shows the primary action, section action and row action when open", () => {
    render(<PanelNav />);
    expect(screen.getByRole("button", { name: "New conversation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New project" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Actions for Alpha" })).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("reports progress to assistive technology and draws the percentage", () => {
    render(<PanelNav />);
    expect(screen.getByRole("link", { name: /Draft.*40% complete/ })).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Filed.*complete/ })).toBeInTheDocument();
  });

  it("keeps the user's menu", () => {
    render(<PanelNav />);
    expect(screen.getByRole("button", { name: /Saquib Jawed/ })).toBeInTheDocument();
  });

  it("collapses to one icon per section, with the primary action kept as a button", async () => {
    render(<PanelNav collapsed />);
    expect(screen.getByRole("button", { name: "New conversation" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "New project" })).toBeNull();
    const reports = screen.getByRole("button", { name: /Reports, 2 pages/ });
    await userEvent.click(reports);
    const flyout = await screen.findByRole("dialog", { name: "Reports" });
    expect(within(flyout).getByRole("link", { name: "Draft" })).toHaveAttribute("href", "#r1");
    await userEvent.keyboard("{Escape}");
    expect(reports).toHaveFocus();
  });

  it("has no axe violations open or collapsed", async () => {
    const { container, rerender } = render(<PanelNav />);
    expect(await axeViolations(container)).toEqual([]);
    rerender(<PanelNav collapsed />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
