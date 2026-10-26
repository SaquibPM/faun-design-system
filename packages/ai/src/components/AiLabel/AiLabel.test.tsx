import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { actors, citations } from "../../utils/fixtures.js";
import { AILabel } from "./AiLabel.js";

const explain = {
  agent: actors.narrative,
  model: "narrative-drafter 2026-09",
  summary: "Drafted from 148 supplier records and the DEFRA 2025 factors.",
  confidence: { level: "medium" as const, score: 0.78, reason: "15 suppliers are estimated from spend." },
  sources: citations.map((c) => c.source),
};

describe("AILabel", () => {
  it("is a button that says AI generated and opens an explanation with agent, model, confidence and sources", async () => {
    render(<AILabel {...explain} />);
    const btn = screen.getByRole("button", { name: "AI generated" });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(btn);
    const card = await screen.findByRole("dialog", { name: "About this AI content" });
    expect(card).toHaveTextContent("Drafted from 148 supplier records");
    expect(within(card).getByText("E1 Narrative Sub-agent")).toBeInTheDocument();
    expect(within(card).getByText("narrative-drafter 2026-09")).toBeInTheDocument();
    expect(within(card).getByText(/Medium confidence/)).toBeInTheDocument();
    expect(within(card).getByRole("region", { name: "Sources" })).toHaveTextContent("3 sources");
    expect(within(card).getAllByRole("listitem")).toHaveLength(3);
    expect(await axeViolations(card)).toEqual([]);
  });
  it("icon kind is named and keyboard operable; Escape returns focus", async () => {
    render(<AILabel kind="icon" text="AI suggested" />);
    const btn = screen.getByRole("button", { name: "AI suggested. Show details" });
    btn.focus();
    await userEvent.keyboard("{Enter}");
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(btn).toHaveFocus();
  });
  it("offers revert only when onRevert is given, runs it and closes", async () => {
    const onRevert = vi.fn();
    render(<AILabel {...explain} onRevert={onRevert} />);
    await userEvent.click(screen.getByRole("button", { name: "AI generated" }));
    await userEvent.click(await screen.findByRole("button", { name: "Revert to original" }));
    expect(onRevert).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("disables revert and says so when the content matches the original", async () => {
    render(<AILabel {...explain} onRevert={() => {}} modified={false} />);
    await userEvent.click(screen.getByRole("button", { name: "AI generated" }));
    expect(await screen.findByRole("button", { name: "Revert to original" })).toBeDisabled();
    expect(screen.getByText("Matches the original.")).toBeInTheDocument();
  });
  it("has no revert button without onRevert, and no axe violations closed", async () => {
    const { container } = render(<AILabel />);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(screen.getByRole("button", { name: "AI generated" }));
    expect(screen.queryByRole("button", { name: /Revert/ })).toBeNull();
  });
});
