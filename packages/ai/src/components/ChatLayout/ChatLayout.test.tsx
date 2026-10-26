import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { ArtifactPanel } from "../ArtifactPanel/ArtifactPanel.js";
import { ProgressPanel } from "../ProgressPanel/ProgressPanel.js";
import { ChatLayout, ChatLayoutControls } from "./ChatLayout.js";

const steps = [{ id: "1", title: "Collect data", state: "done" as const }, { id: "2", title: "Apply factors", state: "in_progress" as const }];

function Harness({ initialProgress = false, initialArtifact = false }: { initialProgress?: boolean; initialArtifact?: boolean }) {
  const [progress, setProgress] = useState(initialProgress);
  const [artifact, setArtifact] = useState(initialArtifact);
  return (
    <ChatLayout
      label="Chat with the assistant"
      header={<ChatLayoutControls progressOpen={progress} onProgressOpenChange={setProgress} artifactOpen={artifact} onArtifactOpenChange={setArtifact} />}
      composer={<textarea aria-label="Message" />}
      progress={progress ? <ProgressPanel variant="docked" title="Drafting E1" steps={steps} onClose={() => setProgress(false)} autoFocus={false} /> : undefined}
      artifact={artifact ? <ArtifactPanel title="E1-6 draft" preview={<p>Draft</p>} code="x" onClose={() => setArtifact(false)} autoFocus={false} /> : undefined}
    >
      <p>Thread</p>
    </ChatLayout>
  );
}

describe("ChatLayout", () => {
  let width = 1200;
  const cbs: (() => void)[] = [];
  beforeEach(() => {
    class RO { cb: () => void; constructor(cb: () => void) { this.cb = cb; cbs.push(cb); } observe() {} disconnect() {} unobserve() {} }
    vi.stubGlobal("ResizeObserver", RO);
    HTMLElement.prototype.getBoundingClientRect = function () { return { width, height: 800 } as DOMRect; };
  });
  afterEach(() => { vi.unstubAllGlobals(); cbs.length = 0; width = 1200; });

  it("shows the thread, header and composer with no panels", () => {
    render(<Harness />);
    expect(screen.getByRole("region", { name: "Chat with the assistant" })).toHaveTextContent("Thread");
    expect(screen.getByRole("textbox", { name: "Message" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Drafting E1" })).not.toBeInTheDocument();
  });
  it("toggles each panel from the header controls, with pressed state", async () => {
    render(<Harness />);
    const progress = screen.getByRole("button", { name: "Show progress panel" });
    expect(progress).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(progress);
    expect(screen.getByRole("region", { name: "Drafting E1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hide progress panel" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "Show artifact panel" }));
    expect(screen.getByRole("region", { name: "E1-6 draft" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Hide artifact panel" }));
    expect(screen.queryByRole("region", { name: "E1-6 draft" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Drafting E1" })).toBeInTheDocument();
  });
  it("keeps the panels beside the thread, the thread live, when wide", () => {
    render(<Harness initialProgress initialArtifact />);
    expect(screen.getByRole("region", { name: "Chat with the assistant" })).not.toHaveAttribute("inert");
    expect(screen.getByRole("region", { name: "Drafting E1" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "E1-6 draft" })).toBeInTheDocument();
  });
  it("under 768 px the thread goes inert while a panel is open, and the progress panel is a sheet", () => {
    width = 390;
    const { container } = render(<Harness initialProgress />);
    act(() => cbs.forEach((f) => f()));
    expect(container.querySelector(".faun-chat-layout")).toHaveAttribute("data-compact");
    expect(screen.getByRole("region", { name: "Chat with the assistant" })).toHaveAttribute("inert");
  });
  it("Escape closes the docked progress panel and the thread is live again", async () => {
    render(<Harness initialProgress />);
    screen.getByRole("button", { name: "Close progress panel" }).focus();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("region", { name: "Drafting E1" })).not.toBeInTheDocument();
  });
  it("has no axe violations with no panels, both panels and compact", async () => {
    const { container, unmount } = render(<Harness />);
    expect(await axeViolations(container)).toEqual([]);
    unmount();
    const both = render(<Harness initialProgress initialArtifact />);
    expect(await axeViolations(both.container)).toEqual([]);
    both.unmount();
    width = 390;
    const compact = render(<Harness initialArtifact />);
    act(() => cbs.forEach((f) => f()));
    expect(await axeViolations(compact.container)).toEqual([]);
    expect(within(compact.container).getByRole("region", { name: "E1-6 draft" })).toBeInTheDocument();
  });
});
