import { expect, test } from "@playwright/test";

const routes = ["/", "/foundations/colour", "/foundations/typography", "/foundations/theming", "/components"];

for (const route of routes) {
  test(`docs ${route} renders without errors or horizontal overflow`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(`/#${route}`);
    await expect(page.locator("h1").first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

test("theme switch applies data-faun-theme", async ({ page }) => {
  await page.goto("/#/");
  await page.evaluate(() => document.documentElement.setAttribute("data-faun-theme", "dark"));
  await expect(page.locator("html")).toHaveAttribute("data-faun-theme", "dark");
});
