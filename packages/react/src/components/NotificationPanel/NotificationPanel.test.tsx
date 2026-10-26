import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { NotificationList, NotificationPanel, type NotificationData } from "./NotificationPanel.js";

const ITEMS: NotificationData[] = [
  { id: "1", tone: "attention", title: "Materiality matrix needs approval", description: "Step 3 of 9 is paused.", source: "CSRD Filing Orchestrator", time: "2 min ago", unread: true, group: "Today", actionLabel: "Review approval" },
  { id: "2", tone: "danger", title: "Ledger import failed", description: "Row 418 has no unit.", time: "1 h ago", unread: true, group: "Today" },
  { id: "3", tone: "success", title: "Evidence package exported", time: "Yesterday", group: "Earlier", href: "#evidence" },
];

function Harness({ onMarkAll = () => {} }: { onMarkAll?: () => void }) {
  const [items, setItems] = useState(ITEMS);
  return (
    <NotificationPanel
      items={items}
      preferencesHref="#prefs"
      onMarkAllRead={() => { setItems((x) => x.map((n) => ({ ...n, unread: false }))); onMarkAll(); }}
      onToggleRead={(n) => setItems((x) => x.map((i) => (i.id === n.id ? { ...i, unread: !i.unread } : i)))}
      onDismiss={(n) => setItems((x) => x.filter((i) => i.id !== n.id))}
    />
  );
}

describe("NotificationPanel", () => {
  it("names the bell with the unread count and opens a labelled panel with grouped notifications", async () => {
    render(<Harness />);
    const bell = screen.getByRole("button", { name: "Notifications, 2 unread" });
    await userEvent.click(bell);
    const panel = await screen.findByRole("dialog", { name: "Notifications" });
    expect(within(panel).getByRole("heading", { name: "Today" })).toBeInTheDocument();
    expect(within(panel).getByRole("heading", { name: "Earlier" })).toBeInTheDocument();
    expect(within(panel).getAllByRole("listitem")).toHaveLength(3);
    expect(within(panel).getByRole("link", { name: "Notification preferences" })).toHaveAttribute("href", "#prefs");
    expect(await axeViolations(panel)).toEqual([]);
  });
  it("conveys tone and unread state in text, not colour", async () => {
    render(<NotificationList items={ITEMS} />);
    const first = screen.getAllByRole("listitem")[0]!;
    expect(first).toHaveAccessibleName(/Needs your attention,\s*unread:\s*Materiality matrix needs approval/);
    expect(screen.getAllByRole("listitem")[1]).toHaveAccessibleName(/^Error,\s*unread/);
  });
  it("marks all read, which clears the badge and disables the button", async () => {
    const onMarkAll = vi.fn();
    render(<Harness onMarkAll={onMarkAll} />);
    await userEvent.click(screen.getByRole("button", { name: /Notifications, 2 unread/ }));
    await userEvent.click(await screen.findByRole("button", { name: "Mark all as read" }));
    expect(onMarkAll).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Mark all as read" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
  });
  it("toggles one notification read, and dismisses it", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: /Notifications/ }));
    const panel = await screen.findByRole("dialog");
    await userEvent.click(within(panel).getAllByRole("button", { name: "Mark as read" })[0]!);
    expect(screen.getByRole("button", { name: "Notifications, 1 unread" })).toBeInTheDocument();
    await userEvent.click(within(panel).getAllByRole("button", { name: "Dismiss" })[0]!);
    expect(within(panel).getAllByRole("listitem")).toHaveLength(2);
  });
  it("closes on Escape and returns focus to the bell; shows an empty message", async () => {
    render(<Harness />);
    const bell = screen.getByRole("button", { name: /Notifications/ });
    await userEvent.click(bell);
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(bell).toHaveFocus();
    render(<NotificationList items={[]} />);
    expect(screen.getByText("You are all caught up.")).toBeInTheDocument();
  });
});
