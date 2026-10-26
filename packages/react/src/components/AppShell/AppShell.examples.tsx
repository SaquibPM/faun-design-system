import {
  IconAdd,
  IconBell,
  IconBook,
  IconCalendar,
  IconChat,
  IconDatabase,
  IconEmissionFactor,
  IconFileCheck,
  IconFileText,
  IconFolder,
  IconHelp,
  IconHistory,
  IconHome,
  IconLayoutGrid,
  IconLedger,
  IconList,
  IconMateriality,
  IconMoreVertical,
  IconOrchestrator,
  IconPause,
  IconProvenance,
  IconStar,
  IconStatusAttention,
  IconSubAgent,
  IconTarget,
  IconTimer,
  IconTool,
} from "@faun-ds/icons";
import { Fragment, type ReactNode } from "react";
import { StatusBadge } from "../Badge/Badge";
import { Banner } from "../Banner/Banner";
import { Button } from "../Button/Button";
import { Card, CardBody, CardHeader } from "../Card/Card";
import { IconButton } from "../IconButton/IconButton";
import { Meter, ProgressBar } from "../Progress/Progress";
import { SearchField } from "../SearchField/SearchField";
import { Stat, StatGroup } from "../Stat/Stat";
import { Tag } from "../Tag/Tag";
import { Timeline } from "../Timeline/Timeline";
import { HeaderNav } from "../HeaderNav/HeaderNav";
import { HeaderAction, HeaderActions, HeaderPanel, SwitcherPanel } from "../HeaderPanel/HeaderPanel";
import { NotificationList } from "../NotificationPanel/NotificationPanel";
import { AppShell, PageHeader, SideNav, SideNavAction, SideNavGroup, SideNavItem, SideNavSection, SideNavUser, SideNavWorkspace, TopBar } from "./AppShell";

/* Shared pieces for the examples below (not exported, so they stay out of the code panels). */

function Trail({ items }: { items: string[] }) {
  return (
    <nav aria-label="Breadcrumb" style={{ minInlineSize: 0 }}>
      <ol style={{ display: "flex", alignItems: "center", gap: "var(--faun-space-1-5)", margin: 0, padding: 0, listStyle: "none", fontSize: "var(--faun-type-body-sm-font-size)", color: "var(--faun-fg-muted)", whiteSpace: "nowrap", overflow: "hidden" }}>
        {items.map((t, i) => (
          <Fragment key={t}>
            {i > 0 ? <li aria-hidden="true" style={{ color: "var(--faun-fg-subtle)" }}>/</li> : null}
            <li style={i === items.length - 1 ? { color: "var(--faun-fg-default)", fontWeight: 500 } : undefined}>
              {i === items.length - 1 ? <span aria-current="page">{t}</span> : <a href="#filings" style={{ color: "inherit", textDecoration: "none" }}>{t}</a>}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

function RowMenu({ name }: { name: string }) {
  return <IconButton icon={<IconMoreVertical />} label={`Actions for ${name}`} size="sm" tooltip={false} onClick={() => {}} />;
}

/* The product navigation: the same design as the collapsed rail, opened (ADR 0011). */
function ProductNav() {
  return (
    <SideNav
      workspace={<SideNavWorkspace mark={<IconOrchestrator />} name="Faun" />}
      action={<SideNavAction>New conversation</SideNavAction>}
      footer={<SideNavUser name="Saquib Jawed" meta="Sustainability lead" onOpenMenu={() => {}} />}
    >
      <SideNavSection title="Projects" icon={<IconFolder />} action={<IconButton icon={<IconAdd />} label="New project" size="sm" tooltip={false} onClick={() => {}} />}>
        <SideNavItem href="#acme-csrd" actions={<RowMenu name="Acme CSRD FY2026" />} current>Acme CSRD FY2026</SideNavItem>
        <SideNavItem href="#cdp" actions={<RowMenu name="CDP climate 2026" />}>CDP climate 2026</SideNavItem>
        <SideNavItem href="#scope3" actions={<RowMenu name="Scope 3 screening" />}>Scope 3 screening</SideNavItem>
      </SideNavSection>
      <SideNavSection title="Reports" icon={<IconList />}>
        <SideNavItem href="#csrd-report" progress={72} actions={<RowMenu name="CSRD statement" />}>CSRD statement</SideNavItem>
        <SideNavItem href="#gri-305" progress={100} actions={<RowMenu name="GRI 305 filing" />}>GRI 305 filing</SideNavItem>
        <SideNavItem href="#tcfd" progress={0} actions={<RowMenu name="TCFD disclosure" />}>TCFD disclosure</SideNavItem>
      </SideNavSection>
      <SideNavSection title="Pinned" icon={<IconStar />}>
        <SideNavItem href="#ledger" dot>Emissions ledger</SideNavItem>
        <SideNavItem href="#materiality" dot>Materiality matrix</SideNavItem>
      </SideNavSection>
      <SideNavSection title="Recent">
        <SideNavItem href="#r1">Chennai utility bills</SideNavItem>
        <SideNavItem href="#r2">Factor library update</SideNavItem>
        <SideNavItem href="#r3">Base year restatement</SideNavItem>
      </SideNavSection>
    </SideNav>
  );
}

function ProductTopBar() {
  return (
    <TopBar
      start={<Trail items={["Filings", "CSRD FY2026", "Run 482"]} />}
      search={<SearchField aria-label="Search or ask the assistant" placeholder="Search or ask the assistant" shortcut="⌘K" size="sm" />}
      actions={<IconButton icon={<IconBell />} label="Notifications, 3 unread" />}
    />
  );
}

function Frame({ children, height = 860 }: { children: ReactNode; height?: number }) {
  return <div style={{ blockSize: height, inlineSize: "100%", overflow: "hidden" }}>{children}</div>;
}

const activity = [
  { id: "a1", actor: { name: "CSRD Materiality Agent", kind: "agent" as const }, action: <>proposed the materiality matrix for <strong>E1–E5, S1</strong></>, time: "2026-10-18T09:42:00Z", timeLabel: "4 min ago", status: { domain: "task", state: "awaiting_human" } },
  { id: "a2", actor: { name: "Ledger Resolver", kind: "agent" as const }, action: <>reconciled 418 ledger rows into <strong>Gross Scope 1</strong></>, time: "2026-10-18T09:39:00Z", timeLabel: "7 min ago", status: { domain: "task", state: "done" } },
  { id: "a3", actor: { name: "Priya Raman" }, action: <>uploaded 214 utility bills for the Chennai plant</>, time: "2026-10-18T09:12:00Z", timeLabel: "34 min ago" },
];

/* Examples */

export function Thumbnail() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "56px 1fr", inlineSize: 220, blockSize: 120, borderRadius: "var(--faun-radius-md)", overflow: "hidden", border: "var(--faun-border-width-hairline) solid var(--faun-border-default)", background: "var(--faun-bg-canvas)" }}>
      <div style={{ background: "var(--faun-sidebar-bg)", display: "grid", alignContent: "start", gap: "var(--faun-space-1-5)", padding: "var(--faun-space-2-5) var(--faun-space-2)" }}>
        <span style={{ blockSize: 14, borderRadius: "var(--faun-radius-xs)", background: "var(--faun-sidebar-bg-active)" }} />
        {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ blockSize: 6, borderRadius: "var(--faun-radius-xs)", background: i === 2 ? "var(--faun-sidebar-accent)" : "var(--faun-sidebar-bg-active)" }} />)}
      </div>
      <div style={{ display: "grid", alignContent: "start", gap: "var(--faun-space-2)", padding: "var(--faun-space-2-5)" }}>
        <span style={{ blockSize: 8, inlineSize: "60%", borderRadius: "var(--faun-radius-xs)", background: "var(--faun-gray-a5)" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--faun-space-1-5)" }}>
          <span style={{ blockSize: 34, borderRadius: "var(--faun-radius-sm)", background: "var(--faun-bg-surface)", boxShadow: "var(--faun-elevation-1)" }} />
          <span style={{ blockSize: 34, borderRadius: "var(--faun-radius-sm)", background: "var(--faun-bg-surface)", boxShadow: "var(--faun-elevation-1)" }} />
        </div>
        <span style={{ blockSize: 34, borderRadius: "var(--faun-radius-sm)", background: "var(--faun-bg-surface)", boxShadow: "var(--faun-elevation-1)" }} />
      </div>
    </div>
  );
}

export function Overview() {
  return (
    <Frame>
      <AppShell fill="container" nav={<ProductNav />} topBar={<ProductTopBar />}>
        <PageHeader
          title="CSRD sustainability statement"
          status={<StatusBadge domain="run" state="running" />}
          meta={[
            { icon: <IconOrchestrator />, label: "CSRD Filing Orchestrator" },
            { icon: <IconCalendar />, label: "FY2026 · ESRS Set 1" },
            { icon: <IconTimer />, label: "Started 4 min ago" },
          ]}
          actions={
            <>
              <Button variant="ghost" leadingIcon={<IconHistory />}>Run history</Button>
              <Button variant="outline" leadingIcon={<IconPause />}>Pause</Button>
              <Button variant="solid" intent="accent" leadingIcon={<IconStatusAttention />}>Review 2 approvals</Button>
            </>
          }
        />
        <RunKpis />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: "var(--faun-space-4)", marginBlockStart: "var(--faun-space-4)", alignItems: "start" }}>
          <Card padding="none">
            <div style={{ padding: "var(--faun-card-padding)" }}>
              <Banner tone="attention" title="Approve the materiality matrix" actions={<Button size="sm" variant="solid" intent="accent">Review</Button>}>
                Step 3 of 9 is paused until you decide. Drafting continues on other topics.
              </Banner>
            </div>
            <CardBody style={{ display: "grid", gap: "var(--faun-space-3)", padding: "0 var(--faun-card-padding) var(--faun-card-padding)" }}>
              <Meter label="E1 Climate change" value={0.88} max={1} high={0.5} valueLabel="0.88" target={0.5} />
              <Meter label="E3 Water" value={0.61} max={1} high={0.5} valueLabel="0.61" target={0.5} />
              <Meter label="E2 Pollution" value={0.41} max={1} high={0.5} valueLabel="0.41" target={0.5} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Activity" description="This run, newest first" />
            <CardBody><Timeline items={activity} density="dense" /></CardBody>
          </Card>
        </div>
      </AppShell>
    </Frame>
  );
}

function RunKpis() {
  return (
    <StatGroup aria-label="Run summary" minItemWidth="200px">
      <Stat label="Total emissions" icon={<IconLedger />} value="12,480" unit="tCO₂e" delta={{ value: "4.2%", direction: "down", sentiment: "good", label: "vs base year 2022" }} />
      <Stat label="Datapoints covered" icon={<IconFileCheck />} value="812" unit="of 1,034">
        <ProgressBar aria-label="Datapoint coverage" size="sm" max={1034} segments={[{ value: 742, tone: "accent", label: "Evidenced" }, { value: 70, tone: "warning", label: "Estimated" }]} />
      </Stat>
      <Stat label="Evidence coverage" icon={<IconProvenance />} value="91" unit="%" footnote="73 figures still estimated" />
      <Stat label="Waiting on you" icon={<IconStatusAttention />} value="2" unit="approvals" footnote="Materiality, Scope 3 Cat. 1" />
    </StatGroup>
  );
}

export function CollapsedRail() {
  return (
    <Frame height={560}>
      <AppShell fill="container" defaultNavCollapsed nav={<ProductNav />} topBar={<ProductTopBar />}>
        <PageHeader title="Filings" description="Five filings across CSRD, CDP and GRI for FY2026." actions={<Button variant="solid" intent="accent">New filing</Button>} />
        <RunKpis />
      </AppShell>
    </Frame>
  );
}

export function NavigationOnly() {
  return (
    <div style={{ blockSize: 720, inlineSize: 280 }}>
      <ProductNav />
    </div>
  );
}

export function PageHeaders() {
  return (
    <div style={{ display: "grid", gap: "var(--faun-space-8)", inlineSize: "100%" }}>
      <PageHeader
        title="Scope 3 Cat. 1 purchased goods"
        status={<StatusBadge domain="data-quality" state="estimated" />}
        meta={[{ icon: <IconEmissionFactor />, label: "Spend × EXIOBASE 3.8" }, { icon: <IconCalendar />, label: "FY2026" }]}
        actions={<><Button variant="outline">Change method</Button><Button variant="solid" intent="accent">Add supplier data</Button></>}
      />
      <PageHeader
        level={2}
        eyebrow={<a href="#agents" style={{ color: "inherit" }}>Agents</a>}
        title="CSRD Filing Orchestrator"
        status={<StatusBadge domain="lifecycle" state="published" />}
        description="Plans the CSRD filing, delegates to Sub-agents for each ESRS topic and pauses for human approval at the materiality and assurance gates."
      >
        <div style={{ display: "flex", gap: "var(--faun-space-1-5)", flexWrap: "wrap" }}>
          <Tag variant="framework">CSRD</Tag><Tag variant="framework">ESRS E1</Tag><Tag variant="framework">ESRS S1</Tag>
        </div>
      </PageHeader>
    </div>
  );
}

export function TopBars() {
  return (
    <div style={{ inlineSize: "100%", border: "var(--faun-border-width-hairline) solid var(--faun-border-subtle)", borderRadius: "var(--faun-radius-md)", overflow: "hidden" }}>
      <TopBar
        navToggle={false}
        start={<Trail items={["Agents", "Agents", "CSRD Filing Orchestrator"]} />}
        search={<SearchField aria-label="Search or ask the assistant" placeholder="Search or ask the assistant" shortcut="⌘K" size="sm" />}
        actions={<><IconButton icon={<IconHelp />} label="Help" /><IconButton icon={<IconBook />} label="Methodology" /><IconButton icon={<IconBell />} label="Notifications" /></>}
      />
    </div>
  );
}

export function DoIconsEverywhere() {
  return (
    <div style={{ blockSize: 220, inlineSize: 220 }}>
      <SideNav>
        <SideNavSection title="Reporting">
          <SideNavItem href="#filings" icon={<IconFileText />} count={5} current>Filings</SideNavItem>
          <SideNavItem href="#ledger" icon={<IconLedger />}>Emissions ledger</SideNavItem>
          <SideNavItem href="#targets" icon={<IconTarget />}>Targets</SideNavItem>
        </SideNavSection>
      </SideNav>
    </div>
  );
}

export function DontTooManySections() {
  return (
    <div style={{ blockSize: 220, inlineSize: 220 }}>
      <SideNav>
        <SideNavSection title="Filings"><SideNavItem href="#a" icon={<IconFileText />}>CSRD FY2026</SideNavItem></SideNavSection>
        <SideNavSection title="CDP"><SideNavItem href="#b" icon={<IconFileText />}>CDP 2026</SideNavItem></SideNavSection>
        <SideNavSection title="GRI"><SideNavItem href="#c" icon={<IconFileText />}>GRI 305</SideNavItem></SideNavSection>
      </SideNav>
    </div>
  );
}

export function DoOneAttention() {
  return (
    <div style={{ blockSize: 150, inlineSize: 220 }}>
      <SideNav>
        <SideNavSection>
          <SideNavItem href="#approvals" icon={<IconStatusAttention />} attention={2}>Approvals</SideNavItem>
          <SideNavItem href="#agents" icon={<IconOrchestrator />} count={5}>Agents</SideNavItem>
          <SideNavItem href="#tools" icon={<IconTool />} count={64}>Tools</SideNavItem>
        </SideNavSection>
      </SideNav>
    </div>
  );
}

export function DontAttentionForCounts() {
  return (
    <div style={{ blockSize: 150, inlineSize: 220 }}>
      <SideNav>
        <SideNavSection>
          <SideNavItem href="#approvals" icon={<IconStatusAttention />} attention={2}>Approvals</SideNavItem>
          <SideNavItem href="#agents" icon={<IconOrchestrator />} attention={5}>Agents</SideNavItem>
          <SideNavItem href="#tools" icon={<IconTool />} attention={64}>Tools</SideNavItem>
        </SideNavSection>
      </SideNav>
    </div>
  );
}

function TieredNav() {
  return (
    <SideNav
      workspace={<SideNavWorkspace mark={<IconOrchestrator />} name="Faun" context="Acme Industrial · FY2026" onSwitch={() => {}} />}
      footer={<SideNavUser name="Alex Morgan" meta="Sustainability lead" onOpenMenu={() => {}} />}
    >
      <SideNavSection>
        <SideNavItem href="#home" icon={<IconHome />}>Home</SideNavItem>
        <SideNavItem href="#approvals" icon={<IconStatusAttention />} attention={2}>Approvals</SideNavItem>
      </SideNavSection>
      <SideNavSection title="Reporting">
        <SideNavGroup icon={<IconFileText />} label="Filings">
          <SideNavItem href="#csrd" current>CSRD statement</SideNavItem>
          <SideNavItem href="#cdp">CDP climate</SideNavItem>
          <SideNavItem href="#gri">GRI 305</SideNavItem>
        </SideNavGroup>
        <SideNavGroup icon={<IconLedger />} label="Emissions">
          <SideNavItem href="#ledger">Ledger</SideNavItem>
          <SideNavItem href="#scope3">Scope 3 categories</SideNavItem>
        </SideNavGroup>
        <SideNavGroup icon={<IconOrchestrator />} label="Agents">
          <SideNavItem href="#orchestrators" attention={1}>Orchestrators</SideNavItem>
          <SideNavItem href="#sub-agents">Sub-agents</SideNavItem>
          <SideNavItem href="#tools">Tools</SideNavItem>
        </SideNavGroup>
        <SideNavItem href="#targets" icon={<IconTarget />}>Targets</SideNavItem>
      </SideNavSection>
    </SideNav>
  );
}

export function SecondTier() {
  return <div style={{ blockSize: 560, inlineSize: 280 }}><TieredNav /></div>;
}

export function SecondTierRail() {
  return (
    <Frame height={420}>
      <AppShell fill="container" defaultNavCollapsed nav={<TieredNav />} topBar={<TopBar start={<Trail items={["Filings", "CSRD FY2026"]} />} />}>
        <PageHeader title="CSRD statement" description="Collapsed rail: press Filings, Emissions or Agents to open its pages beside the rail." />
      </AppShell>
    </Frame>
  );
}

const NAV_ITEMS = [
  { label: "Overview", href: "#overview" },
  { label: "Filings", href: "#filings", current: true },
  { label: "Data", children: [{ label: "Factor library", href: "#factors", description: "DEFRA 2025, IEA 2025" }, { label: "Evidence", href: "#evidence", description: "2,316 items" }, { label: "Sources", href: "#sources" }] },
  { label: "Agents", href: "#agents" },
];

const PRODUCTS = [
  { title: "Recent", items: [{ label: "Reporting", href: "#reporting", description: "Filings and disclosures", current: true, icon: <IconFileText /> }, { label: "Supplier portal", href: "#suppliers", description: "Questionnaires and evidence", icon: <IconDatabase /> }] },
  { title: "All products", items: [{ label: "Sourcing", href: "#sourcing", icon: <IconLedger /> }, { label: "Contracts", href: "#contracts", icon: <IconFileCheck /> }] },
];

const NOTES = [
  { id: "1", tone: "attention" as const, title: "Materiality matrix needs approval", source: "CSRD Filing Orchestrator", time: "2 min ago", unread: true, group: "Today" },
  { id: "2", tone: "success" as const, title: "Evidence package exported", time: "Yesterday", group: "Earlier" },
];

export function HeaderWithNavigation() {
  return (
    <Frame height={520}>
      <AppShell fill="container" nav={<ProductNav />} topBar={
        <TopBar
          nav={<HeaderNav items={NAV_ITEMS} />}
          start={<span />}
          actions={
            <HeaderActions>
              <HeaderAction id="notifications" label="Notifications" icon={<IconBell />} badge={3}>
                <HeaderPanel title="Notifications" size="md"><NotificationList items={NOTES} /></HeaderPanel>
              </HeaderAction>
              <HeaderAction id="help" label="Help" icon={<IconHelp />} onClick={() => {}} />
              <HeaderAction id="switcher" label="Switch product" icon={<IconLayoutGrid />}>
                <HeaderPanel title="Products" size="sm"><SwitcherPanel sections={PRODUCTS} /></HeaderPanel>
              </HeaderAction>
            </HeaderActions>
          }
        />
      }>
        <PageHeader title="Filings" description="Press the bell or the product switcher: the panel opens under the header, one at a time." />
      </AppShell>
    </Frame>
  );
}
