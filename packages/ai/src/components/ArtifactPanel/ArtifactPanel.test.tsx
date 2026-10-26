import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { ChatLayout } from "../ChatLayout/ChatLayout.js";
import { ArtifactPanel, type ArtifactPanelProps } from "./ArtifactPanel.js";

const versions = [{ id: "v3", label: "v3, 10:42" }, { id: "v2", label: "v2, 10:31" }, { id: "v1", label: "v1, 10:12" }];
const CODE = "## E1-6 Gross emissions\nScope 1: 3,212 tCO2e";
const base: ArtifactPanelProps = { title: "ESRS E1-6 draft", kind: "Document", preview: <p>Gross emissions were 48,212 tCO2e.</p>, code: CODE, versions, onClose: () => {}, autoFocus: false };

let written: string | undefined;
beforeEach(() => {
  if (typeof window.PointerEvent === "undefined") {
    class PE extends MouseEvent { pointerId: number; constructor(type: string, init: PointerEventInit = {}) { super(type, init); this.pointerId = init.pointerId ?? 1; } }
    Object.defineProperty(window, "PointerEvent", { configurable: true, value: PE });
  }
  written = undefined;
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn(async (t: string) => { written = t; }) } });
});
afterEach(() => vi.restoreAllMocks());

describe("ArtifactPanel", () => {
  it("is a named region with kind, title, tabs and the preview showing", () => {
    render(<ArtifactPanel {...base} />);
    const region = screen.getByRole("region", { name: "ESRS E1-6 draft" });
    expect(within(region).getByRole("heading", { level: 2, name: "ESRS E1-6 draft" })).toBeInTheDocument();
    expect(within(region).getByText("Document")).toBeInTheDocument();
    expect(within(region).getByRole("tab", { name: "Preview", selected: true })).toBeInTheDocument();
    expect(within(region).getByRole("region", { name: "Preview of ESRS E1-6 draft" })).toHaveTextContent("48,212");
  });
  it("switches to the Code tab by click and by keyboard", async () => {
    const onTabChange = vi.fn();
    render(<ArtifactPanel {...base} onTabChange={onTabChange} />);
    await userEvent.click(screen.getByRole("tab", { name: "Code" }));
    expect(onTabChange).toHaveBeenCalledWith("code");
    expect(screen.getByLabelText("Code of ESRS E1-6 draft")).toHaveTextContent("Scope 1: 3,212 tCO2e");
    screen.getByRole("tab", { name: "Code" }).focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Preview" })).toHaveAttribute("aria-selected", "true");
  });
  it("hides the tabs when there is no code", () => {
    render(<ArtifactPanel {...base} code={undefined} />);
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Preview of ESRS E1-6 draft" })).toBeInTheDocument();
  });
  it("shows a version picker only with two or more versions", () => {
    const { rerender } = render(<ArtifactPanel {...base} defaultVersion="v3" />);
    expect(screen.getByRole("combobox", { name: "Version" })).toHaveTextContent("v3, 10:42");
    rerender(<ArtifactPanel {...base} versions={[versions[0]!]} />);
    expect(screen.queryByRole("combobox", { name: "Version" })).not.toBeInTheDocument();
  });
  it("copies the code and says so politely", async () => {
    const onCopy = vi.fn();
    render(<ArtifactPanel {...base} onCopy={onCopy} />);
    await userEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(written).toBe(CODE);
    expect(onCopy).toHaveBeenCalled();
    expect(screen.getAllByRole("status").some((s) => s.textContent === "Copied to the clipboard")).toBe(true);
  });
  it("reports a failed copy", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn(async () => { throw new Error("denied"); }) } });
    render(<ArtifactPanel {...base} />);
    await userEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(screen.getAllByRole("status").some((s) => s.textContent === "Copy failed")).toBe(true);
  });
  it("downloads through onDownload when given, otherwise as a text file", async () => {
    const onDownload = vi.fn();
    const { rerender } = render(<ArtifactPanel {...base} onDownload={onDownload} />);
    await userEvent.click(screen.getByRole("button", { name: "Download" }));
    expect(onDownload).toHaveBeenCalled();
    const create = vi.fn(() => "blob:x");
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    rerender(<ArtifactPanel {...base} filename="e1-6.md" />);
    await userEvent.click(screen.getByRole("button", { name: "Download" }));
    expect(create).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
  });
  it("closes with the Close button and with Escape from inside", async () => {
    const onClose = vi.fn();
    render(<ArtifactPanel {...base} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Close artifact panel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    screen.getByRole("tab", { name: "Preview" }).focus();
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(2);
  });
  it("Escape restores a maximised panel before it closes it", async () => {
    const onClose = vi.fn();
    const onMaximizedChange = vi.fn();
    render(<ArtifactPanel {...base} onClose={onClose} defaultMaximized onMaximizedChange={onMaximizedChange} />);
    const max = screen.getByRole("button", { name: "Restore panel size" });
    expect(max).toHaveAttribute("aria-pressed", "true");
    max.focus();
    await userEvent.keyboard("{Escape}");
    expect(onMaximizedChange).toHaveBeenCalledWith(false);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Maximise panel" })).toHaveAttribute("aria-pressed", "false");
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  it("hides the resize handle while maximised", async () => {
    render(<ArtifactPanel {...base} />);
    expect(screen.getByRole("separator", { name: "Resize artifact panel" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Maximise panel" }));
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });
  it("resizes with the keyboard within its limits", async () => {
    const onWidthChange = vi.fn();
    render(<ArtifactPanel {...base} defaultWidth={500} minWidth={400} maxWidth={600} onWidthChange={onWidthChange} />);
    const handle = screen.getByRole("separator");
    expect(handle).toHaveAttribute("aria-valuenow", "500");
    expect(handle).toHaveAttribute("aria-valuemin", "400");
    expect(handle).toHaveAttribute("aria-valuemax", "600");
    handle.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(handle).toHaveAttribute("aria-valuenow", "516");
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(handle).toHaveAttribute("aria-valuenow", "484");
    await userEvent.keyboard("{Shift>}{ArrowLeft}{/Shift}");
    expect(handle).toHaveAttribute("aria-valuenow", "548");
    await userEvent.keyboard("{End}");
    expect(handle).toHaveAttribute("aria-valuenow", "600");
    await userEvent.keyboard("{ArrowLeft}");
    expect(handle).toHaveAttribute("aria-valuenow", "600");
    await userEvent.keyboard("{Home}");
    expect(handle).toHaveAttribute("aria-valuenow", "400");
    expect(onWidthChange).toHaveBeenCalledWith(400);
  });
  it("resizes by dragging the handle to the left", () => {
    render(<ArtifactPanel {...base} defaultWidth={500} minWidth={400} maxWidth={700} />);
    const handle = screen.getByRole("separator");
    handle.setPointerCapture = vi.fn();
    handle.hasPointerCapture = vi.fn(() => false);
    fireEvent.pointerDown(handle, { clientX: 900, pointerId: 1, button: 0 });
    fireEvent.pointerMove(handle, { clientX: 840, pointerId: 1 });
    expect(handle).toHaveAttribute("aria-valuenow", "560");
    fireEvent.pointerMove(handle, { clientX: 100, pointerId: 1 });
    expect(handle).toHaveAttribute("aria-valuenow", "700");
    fireEvent.pointerUp(handle, { pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 900, pointerId: 1 });
    expect(handle).toHaveAttribute("aria-valuenow", "700");
  });
  it("takes focus when it mounts and gives it back when it unmounts", () => {
    const opener = document.createElement("button");
    document.body.append(opener);
    opener.focus();
    const { unmount } = render(<ArtifactPanel {...base} autoFocus />);
    expect(screen.getByRole("heading", { name: "ESRS E1-6 draft" })).toHaveFocus();
    unmount();
    expect(opener).toHaveFocus();
    opener.remove();
  });
  it("ignores Escape from outside the panel", () => {
    const onClose = vi.fn();
    render(<ArtifactPanel {...base} onClose={onClose} />);
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
  it("has no axe violations on either tab, maximised, and with node code", async () => {
    const { container, rerender } = render(<ArtifactPanel {...base} />);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(screen.getByRole("tab", { name: "Code" }));
    expect(await axeViolations(container)).toEqual([]);
    rerender(<ArtifactPanel {...base} defaultMaximized code={<p>Rendered code</p>} />);
    expect(await axeViolations(container)).toEqual([]);
  });

  describe("inside a ChatLayout", () => {
    const observers: ((w: number) => void)[] = [];
    beforeEach(() => {
      class RO { cb: ResizeObserverCallback; constructor(cb: ResizeObserverCallback) { this.cb = cb; } observe(el: Element) { observers.push((w) => { (el as HTMLElement).getBoundingClientRect = () => ({ width: w } as DOMRect); this.cb([], this as never); }); } disconnect() {} unobserve() {} }
      vi.stubGlobal("ResizeObserver", RO);
      HTMLElement.prototype.getBoundingClientRect = function () { return { width: 1200, height: 800, top: 0, left: 0, right: 1200, bottom: 800, x: 0, y: 0, toJSON() {} } as DOMRect; };
    });
    afterEach(() => { observers.length = 0; vi.unstubAllGlobals(); });

    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <ChatLayout label="Chat with the assistant" composer={<textarea aria-label="Message" />} artifact={open ? <ArtifactPanel {...base} onClose={() => setOpen(false)} /> : undefined}>
          <p>Thread</p>
        </ChatLayout>
      );
    }
    it("maximising covers the thread and makes it inert; Escape brings it back", async () => {
      render(<Harness />);
      const main = screen.getByRole("region", { name: "Chat with the assistant" });
      expect(main).not.toHaveAttribute("inert");
      await userEvent.click(screen.getByRole("button", { name: "Maximise panel" }));
      expect(main).toHaveAttribute("inert");
      await userEvent.keyboard("{Escape}");
      expect(main).not.toHaveAttribute("inert");
      expect(screen.getByRole("region", { name: "ESRS E1-6 draft" })).toBeInTheDocument();
    });
    it("becomes a full-screen sheet when the layout is under 768 px, with the thread inert and no maximise or resize", () => {
      render(<Harness />);
      act(() => { observers.forEach((f) => f(390)); });
      const panel = screen.getByRole("region", { name: "ESRS E1-6 draft" });
      expect(panel).toHaveAttribute("data-sheet");
      expect(screen.getByRole("region", { name: "Chat with the assistant" })).toHaveAttribute("inert");
      expect(screen.queryByRole("button", { name: "Maximise panel" })).not.toBeInTheDocument();
      expect(screen.queryByRole("separator")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Close artifact panel" })).toBeInTheDocument();
    });
    it("closing returns the thread to the page", async () => {
      render(<Harness />);
      await userEvent.click(screen.getByRole("button", { name: "Close artifact panel" }));
      expect(screen.queryByRole("region", { name: "ESRS E1-6 draft" })).not.toBeInTheDocument();
    });
  });
});
