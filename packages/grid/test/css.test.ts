import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BREAKPOINTS } from "../src/breakpoints.js";
import { buildGridCss } from "../src/css.js";

const require = createRequire(import.meta.url);
const tokens = require("@faun-ds/tokens/json");
const css = buildGridCss(tokens);
const tok = (n: string) => String(tokens.tokens.find((t: any) => t.name === n).value);

describe("grid CSS", () => {
  it("opens one media query per breakpoint at the breakpoint token widths", () => {
    const queries = [...css.matchAll(/@media \(min-width: (\d+px)\)/g)].map((m) => m[1]);
    expect(queries).toEqual(["640px", "768px", "1024px", "1280px", "1536px"]);
    expect(queries).toEqual(["sm", "md", "lg", "xl", "2xl"].map((b) => tok(`breakpoint.${b}`)));
  });
  it("matches the Grid foundations page: 4, 8, 12 columns and 16/16/24/24/24 gutters", () => {
    const page = readFileSync(resolve(import.meta.dirname, "../../../apps/docs/src/pages/foundations/Grid.tsx"), "utf8");
    const rows = [...page.matchAll(/bp: "([^"]+)", min: "(\d+px)", cols: (\d+), gutter: "(\d+px)"/g)].map((m) => ({ bp: m[1], min: m[2], cols: Number(m[3]), gutter: m[4] }));
    expect(rows.map((r) => r.bp)).toEqual(["sm", "md", "lg", "xl", "2xl"]);
    for (const r of rows) {
      expect(tok(`breakpoint.${r.bp}`), r.bp).toBe(r.min);
      expect(Number(tok(`grid.columns.${r.bp}`)), r.bp).toBe(r.cols);
      expect(tok(`grid.gutter.${r.bp}`), r.bp).toBe(r.gutter);
    }
    expect(css).toContain("--_cols: 4;");
    expect(css).toContain("--_cols: 8;");
    expect(css).toContain("--_cols: 12;");
  });
  it("reads gutters and margins from grid tokens, never literals", () => {
    for (const b of BREAKPOINTS) {
      expect(css).toContain(`--_gutter: var(--faun-grid-gutter-${b});`);
      expect(css).toContain(`--_gutter: var(--faun-grid-gutter-narrow-${b});`);
      expect(css).toContain(`--_margin: var(--faun-grid-margin-${b});`);
    }
    expect(css).toContain("--_gutter: var(--faun-grid-gutter-condensed);");
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(|gutter:\s*\d/i);
  });
  it("references only tokens that exist", () => {
    const known = new Set(tokens.tokens.map((t: any) => t.cssVar));
    for (const m of css.matchAll(/var\((--faun-[a-z0-9-]+)\)/g)) expect(known.has(m[1]), m[1]).toBe(true);
  });
  it("clamps spans to the columns at each breakpoint", () => {
    // base and sm have 4 columns, md has 8, lg and up 12.
    expect(css).toContain('.faun-column[data-span-base="12"] { grid-column-end: span 4; }');
    expect(css).toContain('.faun-column[data-span-md="12"] { grid-column-end: span 8; }');
    expect(css).toContain('.faun-column[data-span-md="6"] { grid-column-end: span 6; }');
    expect(css).toContain('.faun-column[data-span-lg="12"] { grid-column-end: span 12; }');
    expect(css).toContain('.faun-column[data-span-2xl="full"] { grid-column-end: span var(--_cols); }');
  });
  it("offsets start on the next line and ignore offsets past the column count", () => {
    expect(css).toContain('.faun-column[data-offset-lg="3"] { grid-column-start: 4; }');
    expect(css).toContain('.faun-column[data-offset-md="0"] { grid-column-start: auto; }');
    expect(css).toContain('.faun-column[data-offset-md="8"] { grid-column-start: auto; }');
  });
  it("emits wide, narrow and condensed gutters, with condensed last so it wins", () => {
    expect(css.indexOf('[data-mode="condensed"]')).toBeGreaterThan(css.lastIndexOf('[data-mode="narrow"]'));
  });
  it("is wrapped in the faun.components layer", () => {
    expect(css).toContain("@layer faun.base, faun.components, faun.utilities;");
    expect(css).toContain("@layer faun.components {");
  });
  it("throws when a token is missing", () => {
    expect(() => buildGridCss({ tokens: [] })).toThrow(/missing token/);
  });
});

describe("built package", () => {
  const dist = resolve(import.meta.dirname, "../dist");
  it("ships dist/styles.css identical to the generator output (after pnpm build)", () => {
    if (!existsSync(resolve(dist, "styles.css"))) return;
    expect(readFileSync(resolve(dist, "styles.css"), "utf8")).toBe(css);
  });
  it("exports Grid and Column from the entry", () => {
    const out = execFileSync("node", ["-e", "import('./dist/index.js').then(m=>console.log(Object.keys(m).sort().join()))"], { cwd: resolve(import.meta.dirname, ".."), stdio: "pipe" }).toString().trim();
    expect(out).toContain("Column");
    expect(out).toContain("Grid");
  });
});
