import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Badge, StatusBadge } from "./Badge.js";

describe("Badge and StatusBadge", () => {
  it("renders tone and variant", () => {
    render(<Badge tone="success" variant="solid">Evidenced</Badge>);
    const b = screen.getByText("Evidenced").closest(".faun-badge")!;
    expect(b).toHaveAttribute("data-tone", "success");
    expect(b).toHaveAttribute("data-variant", "solid");
  });
  it("maps a domain state to tone, icon and label from the status map", async () => {
    const { container } = render(<StatusBadge domain="run" state="awaiting_approval" />);
    expect(screen.getByText("Awaiting approval")).toBeInTheDocument();
    expect(container.querySelector(".faun-badge")).toHaveAttribute("data-tone", "attention");
    expect(container.querySelector('[data-faun-icon="status-attention"]')).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });
  it("falls back to neutral for unknown states", () => {
    const { container } = render(<StatusBadge domain="run" state="teleporting" />);
    expect(container.querySelector(".faun-badge")).toHaveAttribute("data-tone", "neutral");
    expect(screen.getByText("Teleporting")).toBeInTheDocument();
  });
});
