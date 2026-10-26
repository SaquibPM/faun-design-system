import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { ShowMore } from "./ShowMore.js";

const heights = (scroll: number, client: number) => {
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(scroll);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(client);
};
afterEach(() => vi.restoreAllMocks());

describe("ShowMore", () => {
  it("shows no toggle when the content fits", () => {
    heights(40, 40);
    render(<ShowMore>Short</ShowMore>);
    expect(screen.queryByRole("button")).toBeNull();
  });
  it("toggles expanded state with aria-expanded and aria-controls", async () => {
    heights(200, 60);
    const onExpandedChange = vi.fn();
    const { container } = render(<ShowMore lines={3} onExpandedChange={onExpandedChange}>A long narrative.</ShowMore>);
    const b = await screen.findByRole("button", { name: "Show more" });
    expect(b).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById(b.getAttribute("aria-controls")!)).toHaveTextContent("A long narrative.");
    expect(container.querySelector<HTMLElement>(".faun-show-more-content")!.style.getPropertyValue("--_lines")).toBe("3");
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(b);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    const less = screen.getByRole("button", { name: "Show less" });
    expect(less).toHaveAttribute("aria-expanded", "true");
    expect(container.querySelector<HTMLElement>(".faun-show-more-content")!.style.getPropertyValue("--_lines")).toBe("");
  });
  it("supports named toggle labels, defaultExpanded and a controlled value", async () => {
    heights(200, 60);
    const { rerender } = render(<ShowMore moreLabel="Read full narrative" lessLabel="Collapse" defaultExpanded>Text</ShowMore>);
    expect(screen.getByRole("button", { name: "Collapse" })).toBeInTheDocument();
    rerender(<ShowMore moreLabel="Read full narrative" expanded={false}>Text</ShowMore>);
    expect(await screen.findByRole("button", { name: "Read full narrative" })).toBeInTheDocument();
  });
});
