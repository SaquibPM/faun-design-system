import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Kbd } from "./Kbd.js";

describe("Kbd", () => {
  it("renders one key per cap", () => {
    const { container } = render(<Kbd keys={["⌘", "K"]} />);
    expect(container.querySelectorAll("kbd.faun-kbd")).toHaveLength(2);
  });
  it("speaks symbols as names for a combination", () => {
    render(<Kbd keys={["⌘", "⇧", "P"]} />);
    expect(screen.getByLabelText("Command Shift P")).toBeInTheDocument();
  });
  it("parses a plus-joined string", () => {
    const { container } = render(<Kbd keys="Ctrl+Shift+P" />);
    expect(container.querySelectorAll("kbd.faun-kbd")).toHaveLength(3);
    expect(screen.getByLabelText("Ctrl Shift P")).toBeInTheDocument();
  });
  it("names special single keys and leaves plain ones alone", () => {
    const { rerender } = render(<Kbd keys="Esc" />);
    expect(screen.getByLabelText("Escape")).toBeInTheDocument();
    rerender(<Kbd keys="K" />);
    expect(screen.queryByLabelText("K")).toBeNull();
    expect(screen.getByText("K")).toBeInTheDocument();
  });
  it("treats a lone plus as a key", () => {
    const { container } = render(<Kbd keys="+" />);
    expect(container.querySelectorAll("kbd.faun-kbd")).toHaveLength(1);
  });
  it("exposes size and has no axe violations", async () => {
    const { container } = render(<Kbd size="sm" keys={["⌘", "K"]} />);
    expect(container.firstElementChild).toHaveAttribute("data-size", "sm");
    expect(await axeViolations(container)).toEqual([]);
  });
});
