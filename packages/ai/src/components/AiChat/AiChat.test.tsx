import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { actors, citations } from "../../utils/fixtures.js";
import { AIChatList, AIChatMessage, AIPromptSuggestions } from "./AiChat.js";

describe("AIChatMessage", () => {
  it("an assistant reply names the agent, carries the AI label, lists sources and offers feedback once complete", async () => {
    const onRegenerate = vi.fn();
    const { container } = render(
      <AIChatList>
        <AIChatMessage role="user" author={actors.priya} text="How much is Scope 3 category 1?" time="09:41" />
        <AIChatMessage role="assistant" author={actors.scope3} time="09:42" text="Scope 3 category 1 is 41,820 tCO₂e for FY2025." citations={citations.slice(0, 2)} confidence={{ level: "medium", score: 0.8 }} feedback={{ onRegenerate }} />
      </AIChatList>,
    );
    expect(screen.getByRole("log", { name: "Conversation" })).toHaveAttribute("aria-live", "off");
    const reply = screen.getByRole("article", { name: "Scope 3 Sub-agent, 09:42" });
    expect(within(reply).getByRole("button", { name: "AI generated" })).toBeInTheDocument();
    expect(within(reply).getByText("Scope 3 category 1 is 41,820 tCO₂e for FY2025.")).toBeInTheDocument();
    expect(within(reply).getByRole("region", { name: "Sources" })).toBeInTheDocument();
    await userEvent.click(within(reply).getByRole("button", { name: "Regenerate" }));
    expect(onRegenerate).toHaveBeenCalled();
    expect(screen.getByRole("article", { name: "Priya Raman, 09:41" })).toHaveTextContent("How much is Scope 3");
    expect(await axeViolations(container)).toEqual([]);
  });
  it("a streaming reply shows Stop and no sources or feedback until it completes", async () => {
    const onStop = vi.fn();
    const { rerender } = render(<AIChatMessage role="assistant" author={actors.scope3} text="Scope 3 is" state="streaming" onStop={onStop} citations={citations} />);
    expect(screen.queryByRole("group", { name: "Response actions" })).toBeNull();
    expect(screen.queryByRole("region", { name: "Sources" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Stop generating" }));
    expect(onStop).toHaveBeenCalled();
    rerender(<AIChatMessage role="assistant" author={actors.scope3} text="Scope 3 is 41,820 tCO₂e." state="complete" citations={citations} />);
    expect(screen.getByRole("group", { name: "Response actions" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Sources" })).toBeInTheDocument();
  });
  it("feedback can be switched off", () => {
    render(<AIChatMessage role="assistant" author={actors.scope3} text="Done." feedback={false} />);
    expect(screen.queryByRole("group", { name: "Response actions" })).toBeNull();
  });
});

describe("AIPromptSuggestions", () => {
  it("hands the pressed prompt back", async () => {
    const onSelect = vi.fn();
    const { container } = render(<AIPromptSuggestions suggestions={["Summarise open approvals", "Which suppliers are estimated?"]} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: "Which suppliers are estimated?" }));
    expect(onSelect).toHaveBeenCalledWith("Which suppliers are estimated?");
    expect(screen.getByRole("group", { name: "Suggested prompts" })).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });
});
