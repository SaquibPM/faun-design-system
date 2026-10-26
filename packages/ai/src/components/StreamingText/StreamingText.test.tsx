import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { actors } from "../../utils/fixtures.js";
import { StreamingText } from "./StreamingText.js";

const reduceMotion = (on: boolean) => {
  window.matchMedia = ((q: string) => ({ matches: on && q.includes("reduce"), media: q, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false })) as never;
};
afterEach(() => reduceMotion(false));

describe("StreamingText", () => {
  it("shows the text, names the agent and marks the text as a draft", () => {
    render(<StreamingText text="Scope 3 is 41,820 tCO₂e." agent={actors.narrative} />);
    expect(screen.getByText("Scope 3 is 41,820 tCO₂e.")).toBeInTheDocument();
    expect(screen.getByText(/Drafted by/)).toBeInTheDocument();
    expect(screen.getByText("E1 Narrative Sub-agent")).toBeInTheDocument();
  });
  it("while streaming: busy, a Writing badge, a Stop button, and a polite announcement instead of every word", async () => {
    const onStop = vi.fn();
    const { container } = render(<StreamingText state="streaming" text="Scope 3" onStop={onStop} />);
    expect(container.querySelector(".faun-streaming-text")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Writing")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Generating response");
    expect(container.querySelector(".faun-streaming-text")).not.toHaveAttribute("aria-live");
    await userEvent.click(screen.getByRole("button", { name: "Stop generating" }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });
  it("fades in only the newly arrived text", () => {
    const { container, rerender } = render(<StreamingText state="streaming" text="Scope 3 is " />);
    rerender(<StreamingText state="streaming" text="Scope 3 is 41,820 " />);
    rerender(<StreamingText state="streaming" text="Scope 3 is 41,820 tCO₂e" />);
    const chunks = [...container.querySelectorAll(".faun-streaming-chunk")].map((c) => c.textContent);
    expect(chunks).toEqual(["Scope 3 is ", "41,820 ", "tCO₂e"]);
    expect(container.querySelector(".faun-streaming-text")?.textContent).toBe("Scope 3 is 41,820 tCO₂e");
  });
  it("restarts cleanly when the text is replaced", () => {
    const { container, rerender } = render(<StreamingText state="streaming" text="First answer" />);
    rerender(<StreamingText state="streaming" text="Second" />);
    expect(container.querySelector(".faun-streaming-text")?.textContent).toBe("Second");
  });
  it("shows no per-word elements and no animation hooks when reduced motion is requested", () => {
    reduceMotion(true);
    const { container, rerender } = render(<StreamingText state="streaming" text="Scope 3 is " />);
    rerender(<StreamingText state="streaming" text="Scope 3 is 41,820" />);
    expect(container.querySelector(".faun-streaming-chunk")).toBeNull();
    expect(container.querySelector(".faun-streaming-text")?.textContent).toBe("Scope 3 is 41,820");
  });
  it("hides Stop and announces completion once streaming ends", () => {
    const { rerender } = render(<StreamingText state="streaming" text="Done" onStop={() => {}} />);
    rerender(<StreamingText state="complete" text="Done" onStop={() => {}} />);
    expect(screen.queryByRole("button", { name: "Stop generating" })).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Response complete");
  });
  it("does not announce anything for static text", () => {
    render(<StreamingText text="Static" />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
  it("explains a stopped response in words", () => {
    const { rerender } = render(<StreamingText state="streaming" text="Half a sen" />);
    rerender(<StreamingText state="stopped" text="Half a sen" />);
    expect(screen.getByText("Stopped")).toBeInTheDocument();
    expect(screen.getByText(/text above is incomplete/)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Generation stopped");
  });
  it("supports a plain appearance for transcripts", () => {
    const { container } = render(<StreamingText appearance="plain" text="Hello" agent={actors.narrative} />);
    expect(container.firstElementChild).toHaveAttribute("data-appearance", "plain");
    expect(screen.getByText(/From/)).toBeInTheDocument();
  });
  it("has no axe violations in each state", async () => {
    const { container, rerender } = render(<StreamingText state="streaming" text="Scope 3" agent={actors.narrative} onStop={() => {}} />);
    expect(await axeViolations(container)).toEqual([]);
    rerender(<StreamingText state="stopped" text="Scope 3" agent={actors.narrative} />);
    expect(await axeViolations(container)).toEqual([]);
    rerender(<StreamingText state="complete" text="Scope 3 is 41,820 tCO₂e." agent={actors.narrative} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
