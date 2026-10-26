import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const tokens = require("@faun-ds/tokens/json") as { tokens: { name: string; cssVar: string | null }[] };
const raw = readFileSync(resolve(import.meta.dirname, "Button.css"), "utf8");
const css = raw.replace(/\/\*[\s\S]*?\*\//g, "");
const rule = (selector: string) => css.split("}").map((r) => r.trim()).filter((r) => r.startsWith(selector)).join(" ");

/** ADR 0008: buttons are flat. The relief look of ADR 0006 stays on charts only. */
describe("Button is flat", () => {
  it("has no extruded edge, relief outline, wave texture or relief token", () => {
    expect(css).not.toMatch(/--faun-relief-button/);
    expect(css).not.toMatch(/--_edge|--_d\b|--_tex|mask-image/);
    expect(css).not.toContain("::before");
    expect(tokens.tokens.filter((t) => t.cssVar?.startsWith("--faun-relief-button"))).toEqual([]);
  });

  it("gives solid and soft a plain face: no box-shadow with an offset, no outline colour", () => {
    for (const v of ["solid", "soft"]) {
      const r = rule(`.faun-button:where([data-variant="${v}"]`);
      expect(r, v).not.toMatch(/box-shadow/);
      expect(r, v).not.toMatch(/--_shadow:/);
      expect(r, v).not.toMatch(/--_border:/);
    }
    expect(css).not.toMatch(/translate\(var/);
  });

  it("keeps clear hover, pressed and focus states on every filled variant", () => {
    expect(rule(".faun-button:hover")).toContain("background: var(--_bg-hover)");
    expect(rule(".faun-button:active")).toContain("background: var(--_bg-active)");
    expect(rule(".faun-button:active")).toContain("translateY(0.5px)");
    expect(rule(".faun-button:focus-visible")).toContain("var(--faun-focus-ring)");
    for (const intent of ["accent", "neutral", "danger"]) {
      const solid = rule(`.faun-button:where([data-variant="solid"][data-intent="${intent}"])`);
      expect(solid).toContain("--_bg-hover:");
      const soft = rule(`.faun-button:where([data-variant="soft"][data-intent="${intent}"])`);
      expect(soft).toContain("--_bg-hover:");
      expect(soft).toContain("--_bg-active:");
    }
  });

  it("only references tokens that exist", () => {
    const used = [...css.matchAll(/var\((--faun-[a-z0-9-]+)/g)].map((m) => m[1]!);
    const known = new Set(tokens.tokens.map((t) => t.cssVar));
    expect(used.filter((u) => !known.has(u) && !u.startsWith("--faun-button-") && !u.startsWith("--faun-type-") && !u.startsWith("--faun-size-") && !u.startsWith("--faun-motion-") && !u.startsWith("--faun-border-") && !u.startsWith("--faun-space-") && !u.startsWith("--faun-focus") && !u.startsWith("--faun-fg-") && !u.startsWith("--faun-elevation"))).toEqual([]);
  });
});
