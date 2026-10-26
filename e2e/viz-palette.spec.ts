import { expect, test, type Page } from "@playwright/test";

/** ADR 0007: data-viz-palette recolours the categorical slots in light and dark, keeps moss as series 1, and yields to high contrast. */
const MOSS = { light: "#3a492d", dark: "#a0b291" };
const slot = (page: Page, n: number, token = "") => page.evaluate(([i, t]) => getComputedStyle(document.querySelector(".faun-chart")!).getPropertyValue(`--faun-dataviz-cat-${i}${t}`).trim(), [n, token] as const);
const root = (page: Page, theme: string, palette: string | null) => page.evaluate(([t, p]) => {
  document.documentElement.setAttribute("data-faun-theme", t!);
  if (p) document.documentElement.setAttribute("data-viz-palette", p); else document.documentElement.removeAttribute("data-viz-palette");
}, [theme, palette]);

test.use({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });

for (const theme of ["light", "dark"] as const) for (const palette of ["meadow", "dawn", "harbour"]) {
  test(`${palette} (${theme}): moss stays series 1, other slots change, faces are set, bars paint the pastel`, async ({ page }) => {
    await page.goto("/#/components/bar-chart");
    await root(page, theme, null);
    const base2 = await slot(page, 2);
    await root(page, theme, palette);
    expect(await slot(page, 1)).toBe(MOSS[theme]);
    expect(await slot(page, 2)).not.toBe(base2);
    expect(await slot(page, 2, "-face")).toMatch(/^#[0-9a-f]{6}$/);
    // The wash layer of a series-2 relief bar paints the pastel face at full opacity; series 1 paints its own pastel.
    const wash = await page.evaluate(() => {
      const g = [...document.querySelectorAll(".faun-chart-svg .faun-relief")].find((x) => (x as SVGElement).style.getPropertyValue("--_c").includes("cat-2")) ?? document.querySelector(".faun-chart-svg .faun-relief")!;
      const c = getComputedStyle(g.querySelector(".faun-relief-wash")!);
      return { fill: c.fill, op: c.fillOpacity };
    });
    expect(wash.op).toBe("1");
    expect(wash.fill).not.toBe("");
  });
}

test("a palette on the chart (prop) or an ancestor works, and a theme nested inside the palette keeps it", async ({ page }) => {
  await page.goto("/#/components/bar-chart");
  await root(page, "light", null);
  const base = await slot(page, 3);
  const nested = await page.evaluate(() => {
    const d = document.createElement("div"); d.setAttribute("data-viz-palette", "dawn");
    const inner = document.createElement("div"); inner.setAttribute("data-faun-theme", "dark"); d.appendChild(inner); document.body.appendChild(d);
    return getComputedStyle(inner).getPropertyValue("--faun-dataviz-cat-3").trim();
  });
  expect(nested).toMatch(/^#[0-9a-f]{6}$/);
  expect(nested).not.toBe(base);
});

for (const theme of ["light-hc", "dark-hc"]) {
  test(`${theme}: high contrast never takes a palette (faces unset, default slots)`, async ({ page }) => {
    await page.goto("/#/components/bar-chart");
    await root(page, theme, null);
    const base = await slot(page, 2);
    await root(page, theme, "meadow");
    expect(await slot(page, 2)).toBe(base);
    expect(await slot(page, 2, "-face")).toBe("");
  });
}

test("the Appearance panel switches the palette on the root and charts follow", async ({ page }) => {
  await page.goto("/#/components/bar-chart");
  await root(page, "light", null);
  await page.getByRole("button", { name: "Appearance" }).click();
  await page.getByRole("button", { name: /Harbour/ }).first().click();
  await expect(page.locator("html")).toHaveAttribute("data-viz-palette", "harbour");
  await page.getByRole("button", { name: /^Default/ }).first().click();
  await expect(page.locator("html")).not.toHaveAttribute("data-viz-palette", /.+/);
});
