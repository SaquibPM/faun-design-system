import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { durationOf, Toaster, toast } from "./Toast.js";

afterEach(() => act(() => toast.clearAll()));

describe("Toast", () => {
  it("shows a toast with title, description and tone, and has no axe violations", async () => {
    const { container } = render(<Toaster />);
    act(() => { toast.success({ title: "Materiality approved", description: "12 topics are now in scope." }); });
    const title = await screen.findByText("Materiality approved");
    const root = title.closest(".faun-toast")!;
    expect(root).toHaveAttribute("data-tone", "success");
    expect(screen.getByText("12 topics are now in scope.")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /Notifications/ })).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("runs the action and closes with the dismiss button by keyboard", async () => {
    const onClick = vi.fn();
    render(<Toaster />);
    act(() => { toast("Row archived", { action: { label: "Undo", onClick } }); });
    await userEvent.click(await screen.findByRole("button", { name: "Undo" }));
    expect(onClick).toHaveBeenCalledOnce();
    act(() => { toast("Draft saved", { id: "draft" }); });
    const close = await screen.findByRole("button", { name: "Dismiss notification" });
    close.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(screen.queryByText("Draft saved")).not.toBeInTheDocument());
  });

  it("auto-dismisses after its duration", async () => {
    render(<Toaster />);
    act(() => { toast.info("Sync complete", { duration: 50 }); });
    expect(await screen.findByText("Sync complete")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Sync complete")).not.toBeInTheDocument(), { timeout: 2000 });
  });

  it("toast.promise moves from loading to success on the same toast", async () => {
    render(<Toaster />);
    let resolve!: (v: number) => void;
    const p = new Promise<number>((r) => { resolve = r; });
    act(() => { toast.promise(p, { loading: "Calculating Scope 3…", success: (n) => `${n} categories calculated`, error: "Failed" }); });
    const loading = await screen.findByText("Calculating Scope 3…");
    expect(loading.closest(".faun-toast")).toHaveAttribute("data-tone", "loading");
    await act(async () => { resolve(15); await p; });
    const done = await screen.findByText("15 categories calculated");
    expect(done.closest(".faun-toast")).toHaveAttribute("data-tone", "success");
    expect(screen.queryByText("Calculating Scope 3…")).not.toBeInTheDocument();
  });

  it("caps the stack and renders through one Toaster only", async () => {
    render(<><Toaster max={2} /><Toaster max={2} /></>);
    act(() => { toast("One"); toast("Two"); toast("Three"); });
    await waitFor(() => expect(screen.queryByText("One")).not.toBeInTheDocument());
    expect(screen.getAllByText("Three")).toHaveLength(1);
    expect(screen.getByText("Two")).toBeInTheDocument();
  });

  it("a toast with an action does not auto-dismiss, and a timer can be opted back in", async () => {
    render(<Toaster />);
    act(() => { toast("Row archived", { action: { label: "Undo", onClick: () => {} } }); });
    act(() => { toast("Quick undo", { action: { label: "Undo it", onClick: () => {} }, duration: 50 }); });
    expect(await screen.findByText("Row archived")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Quick undo")).not.toBeInTheDocument(), { timeout: 2000 });
    await new Promise((r) => setTimeout(r, 300));
    expect(screen.getByText("Row archived")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
  });

  it("persistent keeps a toast even when a duration is given", async () => {
    render(<Toaster />);
    act(() => { toast.warning({ title: "Factors out of date", persistent: true, duration: 50 }); });
    await new Promise((r) => setTimeout(r, 300));
    expect(screen.getByText("Factors out of date")).toBeInTheDocument();
  });

  it("works out how long each kind of toast stays", () => {
    expect(durationOf({})).toBe(5000);
    expect(durationOf({ tone: "danger" })).toBe(8000);
    expect(durationOf({ action: { label: "Undo", onClick: () => {} } })).toBe(Infinity);
    expect(durationOf({ action: { label: "Undo", onClick: () => {} }, duration: 3000 })).toBe(3000);
    expect(durationOf({ persistent: true, duration: 10 })).toBe(Infinity);
    expect(durationOf({ tone: "danger", action: { label: "Retry", onClick: () => {} } })).toBe(Infinity);
  });
});
