import { useState } from "react";
import { Card } from "../Card/Card";
import { NotificationBell, NotificationList, NotificationPanel, type NotificationData } from "./NotificationPanel";

const SEED: NotificationData[] = [
  { id: "n1", tone: "attention", title: "Materiality matrix needs your approval", description: "Step 3 of 9 is paused until you decide.", source: "CSRD Filing Orchestrator", time: "2 min ago", unread: true, group: "Today", actionLabel: "Review approval" },
  { id: "n2", tone: "danger", title: "Ledger import failed", description: "Row 418 has no unit. Fix the file and import again.", source: "Ledger import", time: "1 hour ago", unread: true, group: "Today" },
  { id: "n3", tone: "warning", title: "73 figures are still estimated", source: "Evidence coverage", time: "3 hours ago", group: "Today" },
  { id: "n4", tone: "success", title: "Evidence package exported", description: "2,316 items bundled for assurance.", source: "Assurance agent", time: "Yesterday, 16:20", group: "Earlier", href: "#evidence" },
  { id: "n5", tone: "info", title: "DEFRA 2026 factors are available", source: "Factor library", time: "Mon, 09:05", group: "Earlier" },
];

function useNotifications() {
  const [items, setItems] = useState(SEED);
  return {
    items,
    markAll: () => setItems((x) => x.map((n) => ({ ...n, unread: false }))),
    toggle: (n: NotificationData) => setItems((x) => x.map((i) => (i.id === n.id ? { ...i, unread: !i.unread } : i))),
    dismiss: (n: NotificationData) => setItems((x) => x.filter((i) => i.id !== n.id)),
  };
}

export function Thumbnail() {
  return <NotificationBell unread={3} />;
}

export function Overview() {
  const s = useNotifications();
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", inlineSize: "min(100%, 480px)" }}>
      <NotificationPanel items={s.items} onMarkAllRead={s.markAll} onToggleRead={s.toggle} onDismiss={s.dismiss} preferencesHref="#preferences" centreHref="#centre" />
    </div>
  );
}

export function OpenPanel() {
  const s = useNotifications();
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", inlineSize: "min(100%, 480px)" }}>
      <NotificationPanel defaultOpen items={s.items} onMarkAllRead={s.markAll} onToggleRead={s.toggle} onDismiss={s.dismiss} preferencesHref="#preferences" />
    </div>
  );
}

export function Centre() {
  const s = useNotifications();
  return (
    <Card style={{ inlineSize: "min(100%, 640px)", padding: 0, overflow: "hidden" }}>
      <NotificationList items={s.items} headingLevel={2} onToggleRead={s.toggle} onDismiss={s.dismiss} />
    </Card>
  );
}

export function DoGrouped() {
  return <Card style={{ inlineSize: 360, padding: 0, overflow: "hidden" }}><NotificationList items={SEED.slice(0, 2)} /></Card>;
}

export function DontEverything() {
  return <Card style={{ inlineSize: 360, padding: 0, overflow: "hidden" }}><NotificationList items={[{ id: "x", tone: "info", title: "Page viewed", time: "now" }, { id: "y", tone: "info", title: "Filter changed", time: "now" }, { id: "z", tone: "info", title: "Row selected", time: "now" }]} /></Card>;
}
