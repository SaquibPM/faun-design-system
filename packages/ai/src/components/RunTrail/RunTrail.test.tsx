import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { NOW, run } from "../../utils/fixtures.js";
import { RunTrail } from "./RunTrail.js";

describe("RunTrail", () => {
  it("shows the run title, state in words, agent, who started it and overall progress", () => {
    render(<RunTrail run={run} now={NOW} />);
    expect(screen.getByRole("heading", { level: 3, name: "CSRD ESRS E1 disclosure, FY2025" })).toBeInTheDocument();
    expect(screen.getAllByText("Awaiting approval").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/CSRD Filing Orchestrator/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Started by/)).toBeInTheDocument();
    // 2 of 6 steps are done (collect, classify).
    expect(screen.getByText("2 of 6 steps done")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Run progress" })).toBeInTheDocument();
  });
  it("shows every step state as an icon and a word", () => {
    render(<RunTrail run={run} now={NOW} />);
    for (const word of ["Done", "In progress", "Awaiting you", "Pending"]) expect(screen.getAllByText(word).length).toBeGreaterThan(0);
  });
  it("nests steps, with active work open and finished work closed by default", () => {
    render(<RunTrail run={run} now={NOW} />);
    expect(screen.getByRole("list", { name: "Steps in Calculate Scope 3 category 1" })).toBeInTheDocument();
    expect(screen.getByText("Classify 340 suppliers by spend category")).toBeInTheDocument();
    const collect = screen.getByRole("button", { name: "Collect activity data" });
    expect(collect).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Read general ledger")).toBeNull();
  });
  it("opens and closes a step with the keyboard", async () => {
    render(<RunTrail run={run} now={NOW} />);
    const collect = screen.getByRole("button", { name: "Collect activity data" });
    collect.focus();
    await userEvent.keyboard("{Enter}");
    expect(collect).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Read general ledger")).toBeInTheDocument();
    await userEvent.keyboard(" ");
    expect(collect).toHaveAttribute("aria-expanded", "false");
  });
  it("reveals a tool call's input and output on demand", async () => {
    render(<RunTrail run={run} now={NOW} defaultExpanded="none" />);
    await userEvent.click(screen.getByRole("button", { name: "Collect activity data" }));
    expect(screen.queryByText(/"rows": 12480/)).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: /Read general ledger, input and output/ }));
    expect(screen.getByText("Input")).toBeInTheDocument();
    expect(screen.getByText(/"accounts": "5xxx-6xxx"/)).toBeInTheDocument();
    expect(screen.getByText(/"rows": 12480/)).toBeInTheDocument();
  });
  it("opens a failed tool call and announces its error", () => {
    render(<RunTrail run={run} now={NOW} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/No DEFRA 2025 factor/);
  });
  it("shows progress for a long step with its unit", () => {
    render(<RunTrail run={run} now={NOW} />);
    const bar = screen.getAllByRole("progressbar", { name: "Apply emission factors progress" })[0]!;
    expect(bar).toHaveAttribute("aria-valuenow", "212");
    expect(screen.getAllByText("212 of 340 suppliers").length).toBeGreaterThan(0);
  });
  it("supports expand-all, collapse-all and a header-less layout", () => {
    const { rerender } = render(<RunTrail run={run} now={NOW} defaultExpanded="all" />);
    expect(screen.getByText("Read general ledger")).toBeInTheDocument();
    rerender(<RunTrail key="none" run={run} now={NOW} defaultExpanded="none" hideHeader />);
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getByRole("list", { name: "CSRD ESRS E1 disclosure, FY2025" })).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "CSRD ESRS E1 disclosure, FY2025" })).getAllByRole("listitem").length).toBeGreaterThanOrEqual(4);
  });
  it("computes durations from timestamps and the reference time", () => {
    render(<RunTrail run={run} now={NOW} />);
    expect(screen.getByText("4 min 12 s")).toBeInTheDocument();
    expect(screen.getByText("18 min elapsed")).toBeInTheDocument();
  });
  it("has no axe violations, collapsed or fully open", async () => {
    const { container, rerender } = render(<RunTrail run={run} now={NOW} defaultExpanded="none" />);
    expect(await axeViolations(container)).toEqual([]);
    rerender(<RunTrail key="all" run={run} now={NOW} defaultExpanded="all" />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
