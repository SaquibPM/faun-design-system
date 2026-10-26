import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { NOW, actors, approval } from "../../utils/fixtures.js";
import { ApprovalCard } from "./ApprovalCard.js";

describe("ApprovalCard", () => {
  it("shows the ask, who asked, the state in words and what each answer does", () => {
    render(<ApprovalCard request={approval} now={NOW} />);
    expect(screen.getByRole("heading", { level: 3, name: approval.title })).toBeInTheDocument();
    expect(screen.getByText("Approval needed")).toBeInTheDocument();
    expect(screen.getByText("E1 Narrative Sub-agent")).toBeInTheDocument();
    expect(screen.getByText(/41,820 tCO₂e/)).toBeInTheDocument();
    expect(screen.getByText("If you approve")).toBeInTheDocument();
    expect(screen.getByText(/E1-6 text is locked for audit/)).toBeInTheDocument();
    expect(screen.getByText("If you reject")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: approval.title })).toBeInTheDocument();
  });
  it("approves in one step", async () => {
    const onApprove = vi.fn();
    render(<ApprovalCard request={approval} now={NOW} onApprove={onApprove} />);
    await userEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(onApprove).toHaveBeenCalledWith(approval);
  });
  it("asks for words before requesting changes, then sends them", async () => {
    const onRequestChanges = vi.fn();
    render(<ApprovalCard request={approval} now={NOW} onRequestChanges={onRequestChanges} />);
    await userEvent.click(screen.getByRole("button", { name: "Request changes" }));
    const box = screen.getByRole("textbox", { name: /What should change/ });
    expect(box).toHaveFocus();
    const send = screen.getByRole("button", { name: "Send changes" });
    expect(send).toBeDisabled();
    await userEvent.type(box, "  Use the market-based factor for Germany.  ");
    expect(send).toBeEnabled();
    await userEvent.click(send);
    expect(onRequestChanges).toHaveBeenCalledWith(approval, "Use the market-based factor for Germany.");
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
  });
  it("requires a reason to reject and confirms with a danger button", async () => {
    const onReject = vi.fn();
    render(<ApprovalCard request={approval} now={NOW} onReject={onReject} />);
    await userEvent.click(screen.getByRole("button", { name: "Reject" }));
    const confirm = screen.getByRole("button", { name: "Reject" });
    expect(confirm).toHaveAttribute("data-intent", "danger");
    expect(confirm).toHaveAttribute("data-variant", "solid");
    expect(confirm).toBeDisabled();
    await userEvent.type(screen.getByRole("textbox", { name: /Why are you rejecting/ }), "Boundary excludes Pune.");
    await userEvent.keyboard("{Enter}");
    expect(onReject).not.toHaveBeenCalled(); // Enter adds a line in a textarea
    await userEvent.click(confirm);
    expect(onReject).toHaveBeenCalledWith(approval, "Boundary excludes Pune.");
  });
  it("cancels with Escape and returns focus to the action that opened the form", async () => {
    render(<ApprovalCard request={approval} now={NOW} />);
    const trigger = screen.getByRole("button", { name: "Request changes" });
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("textbox")).toBeNull();
    await vi.waitFor(() => expect(screen.getByRole("button", { name: "Request changes" })).toHaveFocus());
  });
  it("disables decisions while busy", () => {
    render(<ApprovalCard request={approval} now={NOW} busy />);
    for (const name of ["Approve", "Request changes", "Reject"]) expect(screen.getByRole("button", { name })).toBeDisabled();
  });
  it("shows a decided request without actions, with who decided and why", () => {
    render(<ApprovalCard now={NOW} request={{ ...approval, state: "rejected", decidedBy: actors.arjun, decidedAt: "2026-10-21T09:16:00Z", comment: "Rerun with all six entities." }} />);
    expect(screen.getByText("Rejected", { selector: ".faun-badge-label" })).toBeInTheDocument();
    expect(screen.getByText("Arjun Mehta")).toBeInTheDocument();
    expect(screen.getByText("Rerun with all six entities.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve" })).toBeNull();
  });
  it("hosts evidence between the summary and the actions", () => {
    render(<ApprovalCard request={approval} now={NOW}><p>Coverage table</p></ApprovalCard>);
    expect(screen.getByText("Coverage table")).toBeInTheDocument();
  });
  it("has no axe violations: pending, open form and decided", async () => {
    const { container, rerender } = render(<ApprovalCard request={approval} now={NOW} />);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(await axeViolations(container)).toEqual([]);
    rerender(<ApprovalCard now={NOW} request={{ ...approval, state: "approved", decidedBy: actors.priya, decidedAt: "2026-10-21T09:16:00Z" }} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
