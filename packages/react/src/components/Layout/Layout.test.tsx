import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Divider, Inline, Separator, Stack } from "./Layout.js";

describe("Layout", () => {
  it("Stack sets its gap from the space scale and exposes alignment", () => {
    const { container } = render(<Stack gap="3" align="center"><span>E1</span><span>E2</span></Stack>);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveClass("faun-stack");
    expect(el.style.getPropertyValue("--_gap")).toBe("var(--faun-space-3)");
    expect(el).toHaveAttribute("data-align", "center");
  });
  it("Inline maps half steps and density, and can opt out of wrapping", () => {
    const { container, rerender } = render(<Inline gap="1.5">x</Inline>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue("--_gap")).toBe("var(--faun-space-1-5)");
    expect(el).toHaveAttribute("data-wrap");
    rerender(<Inline gap="density" wrap={false}>x</Inline>);
    expect(el.style.getPropertyValue("--_gap")).toBe("var(--faun-density-gap)");
    expect(el).not.toHaveAttribute("data-wrap");
  });
  it("renders a child element with asChild", () => {
    render(<Stack asChild gap="2"><ul aria-label="Topics"><li>E1</li></ul></Stack>);
    expect(screen.getByRole("list", { name: "Topics" })).toHaveClass("faun-stack");
  });
  it("Divider is decorative by default and a separator when asked", () => {
    const { rerender } = render(<Divider />);
    expect(screen.queryByRole("separator")).toBeNull();
    rerender(<Divider decorative={false} orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
    rerender(<Separator decorative={false} label="Earlier this week" />);
    expect(screen.getByRole("separator")).toHaveTextContent("Earlier this week");
  });
  it("has no axe violations", async () => {
    const { container } = render(<Stack><Inline><span>a</span></Inline><Divider label="or" /><Divider decorative={false} /></Stack>);
    expect(await axeViolations(container)).toEqual([]);
  });
});
