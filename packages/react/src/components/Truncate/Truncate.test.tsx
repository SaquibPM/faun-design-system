import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Truncate } from "./Truncate.js";

const widths = (scroll: number, client: number) => {
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(scroll);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(client);
};
afterEach(() => vi.restoreAllMocks());

describe("Truncate", () => {
  it("keeps the full text in the DOM and is not focusable when it fits", async () => {
    widths(100, 100);
    const { container } = render(<Truncate>Gross Scope 1 emissions</Truncate>);
    const el = screen.getByText("Gross Scope 1 emissions");
    expect(el).not.toHaveAttribute("tabindex");
    expect(el).not.toHaveAttribute("data-cut");
    await userEvent.hover(el);
    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(await axeViolations(container)).toEqual([]);
  });
  it("becomes focusable and shows the full text in a tooltip only when cut", async () => {
    widths(300, 100);
    render(<Truncate>Gross location-based Scope 2 emissions, all UK sites</Truncate>);
    const el = await screen.findByText("Gross location-based Scope 2 emissions, all UK sites");
    expect(el).toHaveAttribute("data-cut");
    expect(el).toHaveAttribute("tabindex", "0");
    el.focus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Gross location-based Scope 2 emissions, all UK sites");
  });
  it("can opt out of the tooltip", () => {
    widths(300, 100);
    render(<Truncate tooltip={false}>Long text that is cut</Truncate>);
    const el = screen.getByText("Long text that is cut");
    expect(el).not.toHaveAttribute("tabindex");
  });
  it("middle mode keeps the tail visible and exposes the whole text once to screen readers", async () => {
    widths(300, 100);
    const id = "run_01HZX8Q4N7B2K9T3VWE5F6Y1AD";
    const { container } = render(<Truncate mode="middle" tail={6}>{id}</Truncate>);
    expect(container.querySelector(".faun-truncate-tail")).toHaveTextContent("6Y1AD".padStart(6, "F"));
    expect(container.querySelector(".faun-truncate-head")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getAllByText(id)).toHaveLength(1);
    expect(await axeViolations(container)).toEqual([]);
  });
  it("middle mode falls back to a plain end cut for short text", () => {
    const { container } = render(<Truncate mode="middle">short</Truncate>);
    expect(container.querySelector(".faun-truncate-tail")).toBeNull();
    expect(container.querySelector(".faun-truncate")).toHaveAttribute("data-mode", "end");
  });
  it("start mode isolates the text for the leading ellipsis; multi-line sets the clamp", () => {
    const { container, rerender } = render(<Truncate mode="start">/a/b/c.pdf</Truncate>);
    expect(container.querySelector("bdi")).toHaveTextContent("/a/b/c.pdf");
    rerender(<Truncate lines={3}>x</Truncate>);
    expect(container.querySelector<HTMLElement>(".faun-truncate")!.style.getPropertyValue("--_lines")).toBe("3");
  });
});
