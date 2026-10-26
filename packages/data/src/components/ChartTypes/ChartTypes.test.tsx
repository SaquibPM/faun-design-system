import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import * as data from "../../index.js";
import { chartTypeTiles, Overview, Thumbnail } from "./ChartTypes.examples.js";

const root = resolve(import.meta.dirname, "..");
const slugify = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

describe("Chart types gallery", () => {
  it("links every tile to a docs page that exists", () => {
    const folders = readdirSync(root);
    for (const t of chartTypeTiles) {
      const folder = folders.find((f) => slugify(f) === t.slug);
      expect(folder, `no component folder for ${t.slug}`).toBeDefined();
      expect(existsSync(resolve(root, folder!, `${folder}.docs.mdx`)), `${t.slug} has no docs page`).toBe(true);
    }
  });

  it("covers every chart component the package exports", () => {
    const charts = Object.keys(data).filter((k) => /(Chart|Sparkline)$/.test(k) && k !== "StackedBarChart");
    const slugs = new Set(chartTypeTiles.map((t) => t.slug));
    const missing = charts.filter((c) => !slugs.has(slugify(c)));
    expect(missing).toEqual([]);
  });

  it("lists every variant a component offers as its own tile", () => {
    const names = chartTypeTiles.map((t) => `${t.name} ${t.variant}`);
    for (const wanted of ["Bar Simple", "Bar Grouped", "Bar Stacked", "Bar Floating", "Bar Diverging", "Lollipop", "Step", "Area Simple", "Area Stacked", "Scatter", "Bubble", "Pie", "Donut", "Meter Standard", "Meter Proportional", "Tree", "Dendrogram"]) {
      expect(names.some((n) => n.startsWith(wanted)), wanted).toBe(true);
    }
    expect(chartTypeTiles.length).toBeGreaterThanOrEqual(30);
  });

  it("renders a live thumbnail and a link in each tile, in labelled groups, with no axe violations", async () => {
    const { container } = render(<Overview />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(chartTypeTiles.length);
    for (const l of links) {
      expect(l.getAttribute("href")).toMatch(/^#\/components\/[a-z-]+$/);
      expect(l.querySelector("svg.faun-chart-svg")).not.toBeNull();
      expect(l.querySelector(".faun-chart-types-thumb")).toHaveAttribute("aria-hidden", "true");
    }
    expect(screen.getAllByRole("heading", { level: 3 }).length).toBe(5);
    expect(within(screen.getAllByRole("list")[0]!).getAllByRole("listitem").length).toBeGreaterThan(0);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("has a compact thumbnail for the components index", () => {
    const { container } = render(<Thumbnail />);
    expect(container.querySelectorAll("figure")).toHaveLength(4);
  });
});
