import { IconBell, IconDatabase, IconFileCheck, IconFileText, IconHelp, IconLayoutGrid, IconLedger } from "@faun-ds/icons";
import { NotificationList } from "../NotificationPanel/NotificationPanel";
import { HeaderAction, HeaderActions, HeaderPanel, SwitcherPanel } from "./HeaderPanel";

const PRODUCTS = [
  { title: "Recent", items: [{ label: "Reporting", href: "#reporting", description: "Filings and disclosures", current: true, icon: <IconFileText /> }, { label: "Supplier portal", href: "#suppliers", description: "Questionnaires and evidence", icon: <IconDatabase /> }] },
  { title: "Frequent", items: [{ label: "Emissions ledger", href: "#ledger", icon: <IconLedger /> }] },
  { title: "All products", items: [{ label: "Sourcing", href: "#sourcing", icon: <IconLedger /> }, { label: "Contracts", href: "#contracts", icon: <IconFileCheck /> }] },
];

const NOTES = [
  { id: "1", tone: "attention" as const, title: "Materiality matrix needs approval", source: "CSRD Filing Orchestrator", time: "2 min ago", unread: true, group: "Today" },
  { id: "2", tone: "danger" as const, title: "Ledger import failed", description: "Row 418 has no unit.", time: "1 h ago", unread: true, group: "Today" },
  { id: "3", tone: "success" as const, title: "Evidence package exported", time: "Yesterday", group: "Earlier" },
];

/** A bar the panels hang from: the panel anchors to the nearest positioned ancestor, as the real top bar does. */
function Bar({ children, height = 460 }: { children: React.ReactNode; height?: number }) {
  return (
    <div style={{ position: "relative", blockSize: height, inlineSize: "100%" }}>
      <header style={{ position: "relative", display: "flex", justifyContent: "flex-end", alignItems: "center", minBlockSize: "var(--faun-layout-topbar-height)", paddingInline: "var(--faun-space-4)", background: "var(--faun-bg-surface)", borderBlockEnd: "var(--faun-border-width-hairline) solid var(--faun-border-subtle)" }}>{children}</header>
    </div>
  );
}

export function Thumbnail() {
  return (
    <HeaderActions>
      <HeaderAction id="n" label="Notifications" icon={<IconBell />} badge={3} />
      <HeaderAction id="h" label="Help" icon={<IconHelp />} />
      <HeaderAction id="s" label="Switch product" icon={<IconLayoutGrid />} />
    </HeaderActions>
  );
}

export function Overview() {
  return (
    <Bar>
      <HeaderActions>
        <HeaderAction id="notifications" label="Notifications" icon={<IconBell />} badge={2}>
          <HeaderPanel title="Notifications"><NotificationList items={NOTES} /></HeaderPanel>
        </HeaderAction>
        <HeaderAction id="help" label="Help" icon={<IconHelp />} onClick={() => {}} />
        <HeaderAction id="switcher" label="Switch product" icon={<IconLayoutGrid />}>
          <HeaderPanel title="Products" size="sm"><SwitcherPanel sections={PRODUCTS} /></HeaderPanel>
        </HeaderAction>
      </HeaderActions>
    </Bar>
  );
}

export function Switcher() {
  return (
    <Bar height={520}>
      <HeaderActions>
        <HeaderAction id="switcher" label="Switch product" icon={<IconLayoutGrid />}>
          <HeaderPanel title="Products" size="sm"><SwitcherPanel sections={PRODUCTS} /></HeaderPanel>
        </HeaderAction>
      </HeaderActions>
    </Bar>
  );
}

export function DoOrder() {
  return <HeaderActions><HeaderAction id="n" label="Notifications" icon={<IconBell />} badge={2} /><HeaderAction id="h" label="Help" icon={<IconHelp />} /><HeaderAction id="s" label="Switch product" icon={<IconLayoutGrid />} /></HeaderActions>;
}

export function DontBadgeEverything() {
  return <HeaderActions><HeaderAction id="n" label="Notifications" icon={<IconBell />} badge={12} /><HeaderAction id="h" label="Help" icon={<IconHelp />} badge /><HeaderAction id="s" label="Switch product" icon={<IconLayoutGrid />} badge={4} /></HeaderActions>;
}
