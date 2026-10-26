import { IconBell, IconFolder, IconList, IconOrchestrator, IconStar } from "@faun-ds/icons";
import { AppShell, Breadcrumbs, IconButton, SearchField, SideNav, SideNavAction, SideNavItem, SideNavSection, SideNavUser, SideNavWorkspace, TopBar } from "@faun-ds/react";
import type { ReactNode } from "react";

type Current = "home" | "filings" | "ledger" | "datapoints";

function Nav({ current }: { current: Current }) {
  return (
    <SideNav
      workspace={<SideNavWorkspace mark={<IconOrchestrator />} name="Faun" />}
      action={<SideNavAction>New conversation</SideNavAction>}
      footer={<SideNavUser name="Priya Raman" meta="Sustainability lead" onOpenMenu={() => {}} />}
    >
      <SideNavSection title="Projects" icon={<IconFolder />}>
        <SideNavItem href="#home" current={current === "home"}>Acme CSRD FY2026</SideNavItem>
        <SideNavItem href="#cdp">CDP climate 2026</SideNavItem>
        <SideNavItem href="#scope3">Scope 3 screening</SideNavItem>
      </SideNavSection>
      <SideNavSection title="Reports" icon={<IconList />}>
        <SideNavItem href="#filings" current={current === "filings"} progress={72}>CSRD statement</SideNavItem>
        <SideNavItem href="#datapoints" current={current === "datapoints"} progress="done">GRI 305 filing</SideNavItem>
        <SideNavItem href="#tcfd" progress={0}>TCFD disclosure</SideNavItem>
      </SideNavSection>
      <SideNavSection title="Pinned" icon={<IconStar />}>
        <SideNavItem href="#ledger" current={current === "ledger"} dot>Emissions ledger</SideNavItem>
        <SideNavItem href="#materiality" dot>Materiality matrix</SideNavItem>
      </SideNavSection>
      <SideNavSection title="Recent">
        <SideNavItem href="#r1">Chennai utility bills</SideNavItem>
        <SideNavItem href="#r2">Factor library update</SideNavItem>
      </SideNavSection>
    </SideNav>
  );
}

/** A full product screen inside a fixed-height demo frame: AppShell, side navigation, top bar with breadcrumbs. */
export function AppScreen({ current, crumbs, tall, children }: { current: Current; tall?: boolean; crumbs: { label: string; href?: string }[]; children: ReactNode }) {
  return (
    <div className="pt-frame" data-tall={tall || undefined}>
      <AppShell
        fill="container"
        nav={<Nav current={current} />}
        topBar={
          <TopBar
            start={<Breadcrumbs items={crumbs} />}
            search={<SearchField aria-label="Search or ask the assistant" placeholder="Search or ask the assistant" shortcut="⌘K" size="sm" />}
            actions={<IconButton icon={<IconBell />} label="Notifications, 3 unread" />}
          />
        }
      >
        {children}
      </AppShell>
    </div>
  );
}
