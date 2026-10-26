import { IconBell, IconChat, IconDatabase, IconEmissionFactor, IconFileText, IconHome, IconLedger, IconMateriality, IconOrchestrator, IconProvenance, IconStatusAttention, IconSubAgent, IconTarget, IconTool } from "@faun-ds/icons";
import { AppShell, Breadcrumbs, IconButton, SearchField, SideNav, SideNavItem, SideNavSection, SideNavUser, SideNavWorkspace, TopBar } from "@faun-ds/react";
import type { ReactNode } from "react";

type Current = "home" | "filings" | "ledger" | "datapoints";

function Nav({ current }: { current: Current }) {
  return (
    <SideNav
      workspace={<SideNavWorkspace mark={<IconOrchestrator />} name="Faun" context="Acme Industrial · FY2026" onSwitch={() => {}} />}
      footer={<SideNavUser name="Priya Raman" meta="Sustainability lead" onOpenMenu={() => {}} />}
    >
      <SideNavSection>
        <SideNavItem href="#home" icon={<IconHome />} current={current === "home"}>Home</SideNavItem>
        <SideNavItem href="#ask" icon={<IconChat />}>Ask the assistant</SideNavItem>
        <SideNavItem href="#approvals" icon={<IconStatusAttention />} attention={2}>Approvals</SideNavItem>
      </SideNavSection>
      <SideNavSection title="Reporting">
        <SideNavItem href="#filings" icon={<IconFileText />} count={5} current={current === "filings"}>Filings</SideNavItem>
        <SideNavItem href="#datapoints" icon={<IconDatabase />} current={current === "datapoints"}>Datapoints</SideNavItem>
        <SideNavItem href="#ledger" icon={<IconLedger />} current={current === "ledger"}>Emissions ledger</SideNavItem>
        <SideNavItem href="#materiality" icon={<IconMateriality />}>Materiality</SideNavItem>
        <SideNavItem href="#targets" icon={<IconTarget />}>Targets</SideNavItem>
      </SideNavSection>
      <SideNavSection title="Agents">
        <SideNavItem href="#agents" icon={<IconOrchestrator />} count={5}>Agents</SideNavItem>
        <SideNavItem href="#sub-agents" icon={<IconSubAgent />} count={30}>Sub-agents</SideNavItem>
        <SideNavItem href="#tools" icon={<IconTool />} count={64}>Tools</SideNavItem>
      </SideNavSection>
      <SideNavSection title="Data">
        <SideNavItem href="#factors" icon={<IconEmissionFactor />}>Factor library</SideNavItem>
        <SideNavItem href="#evidence" icon={<IconProvenance />}>Evidence</SideNavItem>
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
