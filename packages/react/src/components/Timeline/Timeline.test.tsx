import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Timeline, type TimelineItem } from "./Timeline.js";

const items: TimelineItem[] = [
  { id: "1", actor: { name: "CSRD Narrative Agent", kind: "agent" }, action: "drafted ESRS E1-6", time: "2026-10-20T09:12:00Z", timeLabel: "20 Oct, 09:12", status: { domain: "run", state: "awaiting_approval" }, details: <p>Used 312 ledger rows.</p> },
  { id: "2", actor: { name: "Priya Nair" }, action: "approved the materiality matrix", time: "2026-10-19T16:40:00Z" },
];

describe("Timeline", () => {
  it("renders an ordered list of entries with actor, action and time", () => {
    render(<Timeline items={items} aria-label="Audit trail" />);
    const list = screen.getByRole("list", { name: "Audit trail" });
    expect(list.tagName).toBe("OL");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Priya Nair")).toBeInTheDocument();
    expect(screen.getByText("approved the materiality matrix")).toBeInTheDocument();
    expect(screen.getByText("20 Oct, 09:12")).toHaveAttribute("datetime", "2026-10-20T09:12:00Z");
  });
  it("shows status from the status map with a word, not just colour", () => {
    render(<Timeline items={items} />);
    expect(screen.getByText("Awaiting approval")).toBeInTheDocument();
  });
  it("reveals details on demand", async () => {
    render(<Timeline items={items} />);
    expect(screen.queryByText("Used 312 ledger rows.")).toBeNull();
    const toggle = screen.getByRole("button", { name: "Details" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);
    expect(screen.getByText("Used 312 ledger rows.")).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
  it("opens details initially when asked, supports dense density and has no axe violations", async () => {
    const { container } = render(<Timeline density="dense" items={[{ ...items[0]!, defaultOpen: true }]} />);
    expect(screen.getByText("Used 312 ledger rows.")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("data-density", "dense");
    expect(await axeViolations(container)).toEqual([]);
  });
});
