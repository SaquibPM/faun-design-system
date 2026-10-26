import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../test/a11y.js";
import { Column, Grid, resolveColumn } from "./index.js";

describe("Grid", () => {
  it("renders a div with the grid class and wide mode by default", () => {
    render(<Grid data-testid="g">x</Grid>);
    const g = screen.getByTestId("g");
    expect(g.tagName).toBe("DIV");
    expect(g).toHaveClass("faun-grid");
    expect(g).toHaveAttribute("data-mode", "wide");
    expect(g).not.toHaveAttribute("data-flush");
  });
  it.each(["narrow", "condensed"] as const)("sets %s mode", (mode) => {
    render(<Grid data-testid="g" mode={mode} />);
    expect(screen.getByTestId("g")).toHaveAttribute("data-mode", mode);
  });
  it("flushes margins", () => {
    render(<Grid data-testid="g" flush />);
    expect(screen.getByTestId("g")).toHaveAttribute("data-flush");
  });
  it("merges className, forwards the ref and passes DOM props through", () => {
    const ref = createRef<HTMLElement>();
    render(<Grid ref={ref} className="mine" aria-label="Metrics" role="region" id="m" />);
    const g = screen.getByRole("region", { name: "Metrics" });
    expect(g).toHaveClass("faun-grid", "mine");
    expect(ref.current).toBe(g);
    expect(g.id).toBe("m");
  });
  it("renders as a list with list items", () => {
    render(<Grid as="ul" aria-label="Cards"><Column as="li" md={6}>a</Column><Column as="li" md={6}>b</Column></Grid>);
    expect(screen.getByRole("list", { name: "Cards" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});

describe("Column", () => {
  it("fills the row with no props", () => {
    render(<Column data-testid="c" />);
    const c = screen.getByTestId("c");
    expect(c).toHaveClass("faun-column");
    expect([...c.getAttributeNames()].filter((n) => /^data-(span|offset)/.test(n))).toEqual([]);
  });
  it("sets spans per breakpoint, mobile first", () => {
    render(<Column data-testid="c" span={4} sm={2} md={4} lg={6} xl={3} xxl="full" />);
    const c = screen.getByTestId("c");
    expect(c).toHaveAttribute("data-span-base", "4");
    expect(c).toHaveAttribute("data-span-sm", "2");
    expect(c).toHaveAttribute("data-span-md", "4");
    expect(c).toHaveAttribute("data-span-lg", "6");
    expect(c).toHaveAttribute("data-span-xl", "3");
    expect(c).toHaveAttribute("data-span-2xl", "full");
  });
  it("accepts { span, offset } objects", () => {
    render(<Column data-testid="c" lg={{ span: 6, offset: 3 }} />);
    expect(screen.getByTestId("c")).toHaveAttribute("data-span-lg", "6");
    expect(screen.getByTestId("c")).toHaveAttribute("data-offset-lg", "3");
  });
  it("forwards the ref and className", () => {
    const ref = createRef<HTMLElement>();
    render(<Column ref={ref} className="x" data-testid="c" />);
    expect(ref.current).toBe(screen.getByTestId("c"));
    expect(ref.current).toHaveClass("faun-column", "x");
  });
  it("ignores invalid spans and offsets with a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveColumn({ span: 13 as number, md: { span: 0, offset: 12 } })).toEqual({});
    expect(resolveColumn({ lg: 2.5 })).toEqual({});
    expect(warn).toHaveBeenCalledTimes(4);
    warn.mockRestore();
  });
});

describe("resolveColumn offsets", () => {
  it("fills the remaining columns when an offset has no span", () => {
    expect(resolveColumn({ md: { offset: 2 } })).toEqual({ "data-offset-md": "2", "data-span-md": "6" });
    expect(resolveColumn({ lg: { offset: 3 } })).toEqual({ "data-offset-lg": "3", "data-span-lg": "9" });
  });
  it("keeps an explicit span, and does not add one when a lower breakpoint already set it", () => {
    expect(resolveColumn({ lg: { span: 6, offset: 3 } })).toEqual({ "data-offset-lg": "3", "data-span-lg": "6" });
    expect(resolveColumn({ span: 2, lg: { offset: 3 } })).toEqual({ "data-span-base": "2", "data-offset-lg": "3" });
  });
  it("adds nothing for offset 0", () => {
    expect(resolveColumn({ md: { offset: 0 } })).toEqual({ "data-offset-md": "0" });
  });
});

describe("a11y", () => {
  it("has no axe violations in a typical page layout", async () => {
    const { container } = render(
      <Grid as="section" aria-label="Overview">
        <Column md={8} lg={9}><h2>Emissions</h2><p>Scope 1, 2 and 3 in tCO₂e.</p></Column>
        <Column md={8} lg={3}><h2>Filing</h2><p>CSRD E1-6 due 30 April.</p></Column>
      </Grid>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
