import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * ADR 0008 (which supersedes the visibility choice of ADR 0007): the wave texture of relief marks is a faint grain. It must be present but almost invisible. Two checks per surface:
 *  1. the computed style: a non-empty `mask-image` data URI, a non-zero tile, and a low opacity (a faint grain);
 *  2. the pixels: the luminance spread inside the face is above a small floor (it is a texture) and below a ceiling (it is not dark lines), against `data-appearance="flat"`, which has none,
 *     measured on a real screenshot at 100% (1x) and 200% (2x) device scale, so the wave resolves at 1x and not only on a retina screen.
 */
// Measured (luminance stdev, 0 to 255) at tex-alpha 0.09: bar 3.1 (dark 1x) to 4.4 (light 2x), 0 flat; ADR 0007 measured 34 to 47. Floor is about half of the weakest measurement; the ceiling stops a regression to dark lines. Buttons are flat (ADR 0008) and have no texture to measure.
const SPREAD_MIN = { bar: 1.5 };
const SPREAD_MAX = { bar: 8 };

async function spread(page: Page, el: Locator, inset: number): Promise<number> {
  const png = (await el.screenshot()).toString("base64");
  return page.evaluate(async ([b64, pad]) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const p = Number(pad);
    const d = ctx.getImageData(p, p, img.width - 2 * p, img.height - 2 * p).data;
    let n = 0, sum = 0, sq = 0;
    for (let i = 0; i < d.length; i += 4) { const l = 0.2126 * d[i]! + 0.7152 * d[i + 1]! + 0.0722 * d[i + 2]!; n++; sum += l; sq += l * l; }
    const mean = sum / n;
    return Math.sqrt(Math.max(sq / n - mean * mean, 0));
  }, [png, inset] as const);
}

const setTheme = (page: Page, theme: string, flat: boolean) =>
  page.evaluate(([t, f]) => {
    document.documentElement.setAttribute("data-faun-theme", t!);
    if (f === "yes") document.documentElement.setAttribute("data-appearance", "flat"); else document.documentElement.removeAttribute("data-appearance");
  }, [theme, flat ? "yes" : "no"]);

for (const scale of [1, 2]) {
  test.describe(`texture at ${scale * 100}% device scale`, () => {
    test.use({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: scale, reducedMotion: "reduce" });

    for (const theme of ["light", "dark"]) {
      test(`bar chart face is textured and reads at ${scale}x (${theme})`, async ({ page }) => {
        await page.goto("/#/components/bar-chart");
        await setTheme(page, theme, false);
        const tex = page.locator(".faun-chart-svg .faun-relief-tex").first();
        await expect(tex).toBeVisible();
        const style = await tex.evaluate((el) => { const c = getComputedStyle(el); return { mask: c.maskImage, size: c.maskSize, opacity: Number(c.opacity) }; });
        expect(style.mask).toMatch(/^url\("data:image\/svg\+xml,.{40,}/);
        expect(style.size).toMatch(/^[1-9]\d*px [1-9]\d*px$/);
        expect(style.opacity).toBeGreaterThan(0.05);
        expect(style.opacity).toBeLessThanOrEqual(0.2);
        const relief = await spread(page, tex, 4);
        await setTheme(page, theme, true);
        const flat = await spread(page, tex, 4);
        expect(flat, "flat face has no texture").toBeLessThan(2);
        expect(relief, `relief face spread ${relief.toFixed(2)}`).toBeGreaterThan(SPREAD_MIN.bar);
        expect(relief, `relief face spread ${relief.toFixed(2)} is a faint grain, not lines`).toBeLessThan(SPREAD_MAX.bar);
      });
    }
  });
}

test("buttons are flat: no extruded edge, no texture (ADR 0008)", async ({ page }) => {
  await page.goto("/#/components/button");
  for (const variant of ["solid", "soft"]) {
    const btn = page.locator(`.faun-button[data-variant="${variant}"]`).first();
    if ((await btn.count()) === 0) continue;
    const s = await btn.evaluate((el) => { const c = getComputedStyle(el); const b = getComputedStyle(el, "::before"); return { shadow: c.boxShadow, content: b.content, mask: b.maskImage }; });
    expect(s.shadow, `${variant} has no offset shadow`).not.toMatch(/\d+px \d+px 0px 0px/);
    expect(s.mask === "none" || s.content === "none" || s.content === "normal", `${variant} has no texture`).toBe(true);
  }
});
