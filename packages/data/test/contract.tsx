import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { expect } from "vitest";
import { axeViolations } from "./a11y.js";

/**
 * The accessibility contract every Faun chart keeps: a named figure, one focusable plot, a visually hidden data table,
 * arrow-key reading with a tooltip and a live announcement, a tooltip under the pointer, and no axe violations.
 */
export async function expectChartContract(ui: ReactElement, title: string, opts: { keys?: string[]; single?: boolean } = {}) {
  const { container } = render(ui);
  const figure = screen.getByRole("figure", { name: title });
  const plot = within(figure).getByRole("group", { name: new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) });
  expect(plot).toHaveAttribute("tabindex", "0");
  expect(plot).toHaveAttribute("aria-roledescription", "chart");
  expect(container.querySelector(".faun-chart-svg")).toHaveAttribute("aria-hidden", "true");

  const table = within(figure).getByRole("table");
  expect(table.className).toContain("faun-visually-hidden");
  expect(within(table).getAllByRole("row").length).toBeGreaterThan(1);
  expect(table.querySelector("caption")).toHaveTextContent(title);

  // Keyboard: focus shows the first step, arrows move and announce.
  const user = userEvent.setup();
  await user.tab();
  const hasLegendButtons = document.activeElement !== plot;
  if (hasLegendButtons) act(() => plot.focus());
  expect(plot).toHaveFocus();
  expect(container.querySelector(".faun-chart-tooltip")).not.toBeNull();
  const live = container.querySelector('[aria-live="polite"]') as HTMLElement;
  const first = live.textContent;
  expect(first).toBeTruthy();
  for (const key of opts.keys ?? ["{ArrowRight}"]) await user.keyboard(key);
  if (!opts.single) expect(live.textContent).not.toBe(first);
  await user.keyboard("{Escape}");
  expect(container.querySelector(".faun-chart-tooltip")).toBeNull();
  act(() => plot.blur());

  // Pointer: the tooltip follows the pointer and goes on leave. Charts with gaps between marks (circles, words) may miss a given point, so sweep a grid.
  let shown = false;
  for (let y = 20; y < 320 && !shown; y += 20) for (let x = 40; x < 620 && !shown; x += 20) {
    fireEvent.pointerMove(plot, { clientX: x, clientY: y });
    shown = container.querySelector(".faun-chart-tooltip") !== null;
  }
  expect(shown).toBe(true);
  fireEvent.pointerLeave(plot);
  expect(container.querySelector(".faun-chart-tooltip")).toBeNull();

  expect(await axeViolations(container)).toEqual([]);
  return container;
}

/** Loading and empty states replace the plot, with a status or an empty message. */
export function expectLoadingAndEmpty(loading: ReactElement, empty: ReactElement, title: string) {
  const a = render(loading);
  expect(screen.getByRole("status", { name: `Loading ${title}` })).toBeInTheDocument();
  expect(a.container.querySelector(".faun-chart-plot")).toBeNull();
  a.unmount();
  const b = render(empty);
  expect(screen.getByText("No data to chart")).toBeInTheDocument();
  expect(b.container.querySelector(".faun-chart-plot")).toBeNull();
}
