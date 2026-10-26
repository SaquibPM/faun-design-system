import { BREAKPOINTS, MAX_COLUMNS, type BreakpointKey } from "./breakpoints.js";

type TokenJson = { tokens: { name: string; cssVar: string | null; value?: unknown }[] };

/**
 * Builds the grid stylesheet from the token JSON (`@faun-ds/tokens/json`).
 * Column counts and breakpoint widths are read from the tokens; gutters and margins stay `var(--faun-grid-…)`
 * references so a product can override them. Media queries cannot use custom properties, hence the generation.
 */
export function buildGridCss(json: TokenJson): string {
  const by = new Map(json.tokens.map((t) => [t.name, t]));
  const val = (name: string) => { const t = by.get(name); if (!t || t.value === undefined) throw new Error(`@faun-ds/grid: missing token ${name}`); return String(t.value); };
  const cols = (b: BreakpointKey) => Number(val(`grid.columns.${b}`));
  const min = (b: BreakpointKey) => val(`breakpoint.${b}`);
  const v = (name: string) => `var(--faun-${name.replace(/\./g, "-")})`;

  const gridBlock = (b: BreakpointKey, ind: string) => [
    `${ind}.faun-grid {`,
    `${ind}  --_cols: ${cols(b)};`,
    `${ind}  --_gutter: ${v(`grid.gutter.${b}`)};`,
    `${ind}  --_margin: ${v(`grid.margin.${b}`)};`,
    `${ind}}`,
    `${ind}.faun-grid[data-mode="narrow"] {`,
    `${ind}  --_gutter: ${v(`grid.gutter-narrow.${b}`)};`,
    `${ind}}`,
  ].join("\n");

  const columnBlock = (b: BreakpointKey, ind: string) => {
    const c = cols(b);
    const out: string[] = [];
    out.push(`${ind}.faun-column[data-span-${b}="full"] { grid-column-end: span var(--_cols); }`);
    for (let n = 1; n <= MAX_COLUMNS; n++) out.push(`${ind}.faun-column[data-span-${b}="${n}"] { grid-column-end: span ${Math.min(n, c)}; }`);
    for (let n = 0; n < MAX_COLUMNS; n++) out.push(`${ind}.faun-column[data-offset-${b}="${n}"] { grid-column-start: ${n === 0 || n >= c ? "auto" : n + 1}; }`);
    return out.join("\n");
  };

  const blocks = BREAKPOINTS.map((b) => {
    const body = `${gridBlock(b, b === "base" ? "" : "  ")}\n${columnBlock(b, b === "base" ? "" : "  ")}`;
    return b === "base" ? `/* base (below ${min("sm")}): ${cols(b)} columns */\n${body}` : `/* ${b} (min-width ${min(b)}): ${cols(b)} columns */\n@media (min-width: ${min(b)}) {\n${body}\n}`;
  });

  return `/* Faun Design System — @faun-ds/grid. Apache-2.0. Generated from @faun-ds/tokens; import after @faun-ds/tokens/css. */
@layer faun.base, faun.components, faun.utilities;
@layer faun.components {
.faun-grid {
  --_cols: ${cols("base")};
  --_gutter: ${v("grid.gutter.base")};
  --_margin: ${v("grid.margin.base")};
  display: grid;
  grid-template-columns: repeat(var(--_cols), minmax(0, 1fr));
  column-gap: var(--_gutter);
  row-gap: var(--_gutter);
  box-sizing: border-box;
  inline-size: 100%;
  max-inline-size: calc(${v("grid.max-width")} + 2 * var(--_margin));
  margin-inline: auto;
  padding-inline: var(--_margin);
}
.faun-grid[data-flush] {
  max-inline-size: none;
  margin-inline: 0;
  padding-inline: 0;
}
.faun-column {
  box-sizing: border-box;
  min-inline-size: 0;
  grid-column-end: span var(--_cols);
}

${blocks.join("\n\n")}

/* Condensed keeps its hairline gutter at every breakpoint. */
.faun-grid[data-mode="condensed"] {
  --_gutter: ${v("grid.gutter-condensed")};
}
}
`;
}
