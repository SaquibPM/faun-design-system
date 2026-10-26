import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Skeleton, SkeletonRows } from "./Skeleton.js";

describe("Skeleton", () => {
  it("is hidden from assistive technology", () => {
    const { container } = render(<Skeleton shape="rect" width="120px" height="64px" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el).toHaveAttribute("data-shape", "rect");
    expect(el.style.inlineSize).toBe("120px");
  });
  it("draws several text lines with a shorter last line", () => {
    const { container } = render(<Skeleton lines={3} />);
    const lines = container.querySelectorAll(".faun-skeleton");
    expect(lines).toHaveLength(3);
    expect((lines[2] as HTMLElement).style.inlineSize).toBe("60%");
  });
  it("circle height follows its width", () => {
    const { container } = render(<Skeleton shape="circle" width="40px" />);
    expect((container.firstElementChild as HTMLElement).style.blockSize).toBe("40px");
  });
  it("SkeletonRows announces loading once", () => {
    const { container } = render(<SkeletonRows rows={3} columns={4} label="Loading datapoints" />);
    expect(screen.getByRole("status", { name: "Loading datapoints" })).toBeInTheDocument();
    expect(container.querySelectorAll(".faun-skeleton-row")).toHaveLength(3);
  });
  it("has no axe violations", async () => {
    const { container } = render(<div><Skeleton lines={2} /><SkeletonRows /></div>);
    expect(await axeViolations(container)).toEqual([]);
  });
});
