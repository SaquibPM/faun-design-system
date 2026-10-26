import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { JsonViewer } from "./JsonViewer.js";

const data = { runId: "run_1", confidence: 0.91, approved: false, approvedBy: null, scopes: [1, 2, 3], output: { value: 18240, evidence: [{ id: "ev_1" }] } };

describe("JsonViewer", () => {
  it("shows the first level expanded and deeper levels collapsed, in a named group", async () => {
    const { container } = render(<JsonViewer label="Run payload" data={data} />);
    expect(screen.getByRole("group", { name: "Run payload" })).toBeInTheDocument();
    expect(screen.getByText('"run_1"')).toBeInTheDocument();
    expect(screen.getByText("0.91")).toBeInTheDocument();
    expect(screen.getByText("false")).toBeInTheDocument();
    expect(screen.getByText("null")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "scopes, 3 items" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("18240")).not.toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("expands and collapses a node with the keyboard", async () => {
    render(<JsonViewer label="Run payload" data={data} />);
    const toggle = screen.getByRole("button", { name: "output, 2 keys" });
    toggle.focus();
    await userEvent.keyboard("{Enter}");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("18240")).toBeInTheDocument();
    await userEvent.keyboard(" ");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("18240")).not.toBeInTheDocument();
  });

  it("expands all and collapses all", async () => {
    render(<JsonViewer label="Run payload" data={data} />);
    await userEvent.click(screen.getByRole("button", { name: "Expand all" }));
    expect(screen.getByText('"ev_1"')).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Collapse all" }));
    expect(screen.queryByText('"ev_1"')).not.toBeInTheDocument();
    expect(screen.getByText('"run_1"')).toBeInTheDocument();
  });

  it("honours defaultExpandedDepth, including a collapsed root", () => {
    render(<JsonViewer label="Collapsed" data={data} defaultExpandedDepth={0} />);
    expect(screen.getByRole("button", { name: "root, 6 keys" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText('"run_1"')).not.toBeInTheDocument();
  });

  it("copies formatted JSON and confirms", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const onCopied = vi.fn();
    render(<JsonViewer label="Run payload" data={{ a: 1 }} onCopied={onCopied} />);
    await userEvent.click(screen.getByRole("button", { name: "Copy JSON" }));
    expect(writeText).toHaveBeenCalledWith(JSON.stringify({ a: 1 }, null, 2));
    expect(onCopied).toHaveBeenCalled();
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Copied JSON to clipboard");
  });

  it("renders primitives and empty containers, and hides the toolbar on request", () => {
    render(<JsonViewer label="Primitive" data={[]} toolbar={false} />);
    expect(screen.queryByRole("button", { name: "Copy JSON" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "root, 0 items" })).toBeInTheDocument();
  });
});
