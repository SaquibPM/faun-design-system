/**
 * Faun token build.  pnpm --filter @faun-ds/tokens build
 *
 * dist/css/faun.css           foundations, component tokens, all themes (+ system, print, P3), density, motion, forced colours
 * dist/css/base.css            opt-in element defaults and .faun-type-* classes (cascade layers)
 * dist/css/fonts.css           Google Fonts import for IBM Plex Sans, IBM Plex Serif, IBM Plex Mono
 * dist/css/fonts-fontsource.css  Self-hosted alternative: @fontsource/ibm-plex-* imports (optional peer dependencies)
 * dist/css/themes/<t>.css      one theme on :root
 * dist/tailwind/faun.css      Tailwind v4 preset; faun-strict.css also removes Tailwind's defaults
 * dist/js/index.js|d.ts        typed vars, resolved colours, foundations, status map
 * dist/json/*                  tokens (all themes, described), DTCG per theme, scales, status map, contrast
 * dist/docs/contrast.md        contrast report
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { contrastReport } from "./contrast.ts";
import { PALETTE_IDS, paletteScopeCss, paletteValues, reliefColours, reliefDims, reliefScopeCss, reliefThemeDecls } from "./relief.ts";
import {
  ACCENT_SOURCE, SCALE_NAMES, STEPS, THEMES, TYPE_ROLES, collectComponentTokens, collectFoundations, collectSemantic,
  cssVar, foundations, scales, statusMap, themes, viz, type Semantic, type ThemeName,
} from "./lib.ts";

const DIST = resolve(import.meta.dirname, "../dist");
const VERSION = JSON.parse(readFileSync(resolve(import.meta.dirname, "../package.json"), "utf8")).version as string;
const BANNER = `/* Faun Design System — tokens v${VERSION} — Apache-2.0. Generated: edit packages/tokens/src. */\n`;
const write = (rel: string, s: string) => { const p = resolve(DIST, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, s); };
rmSync(DIST, { recursive: true, force: true });

const semantic = collectSemantic();
const allFoundation = [...collectFoundations(), ...reliefDims()];
const foundation = allFoundation.filter((f) => f.cssVar);
const comps = collectComponentTokens();
const d = (k: string, v: string, ind = "  ") => `${ind}${k}: ${v};`;
const v = (...p: string[]) => `var(${cssVar(p)})`;

/* ------------------------------------------------------------------------- CSS */
function scaleDecls(theme: ThemeName, ind = "  "): string[] {
  const ap = themes[theme].appearance;
  const out: string[] = [];
  for (const name of [...SCALE_NAMES, "accent"]) {
    const src = name === "accent" ? ACCENT_SOURCE : name;
    for (const step of STEPS) out.push(d(cssVar([name, step]), scales[src][ap].steps[step], ind));
  }
  return out;
}
function p3Decls(theme: ThemeName, ind = "    "): string[] {
  const ap = themes[theme].appearance;
  const out: string[] = [];
  for (const name of [...SCALE_NAMES, "accent"]) {
    const src = name === "accent" ? ACCENT_SOURCE : name;
    for (let s = 1; s <= 12; s++) out.push(d(cssVar([name, String(s)]), scales[src][ap].p3[String(s)], ind));
  }
  return out;
}
const semDecls = (theme: ThemeName, ind = "  ") => semantic.map((s) => d(s.cssVar, s.css[theme], ind));
const themeBlock = (theme: ThemeName, ind = "  ") => [d("color-scheme", themes[theme].colorScheme, ind), ...scaleDecls(theme, ind), ...semDecls(theme, ind), ...reliefThemeDecls(theme, ind)].join("\n");
const sel = (t: ThemeName) => (t === "light" ? `:root,\n[data-faun-theme="light"]` : `[data-faun-theme="${t}"]`);

const densityAlias = (mode: string, ind = "  ") =>
  foundation.filter((f) => f.path[0] === "density" && f.path[1] === mode).map((f) => d(cssVar(["density", ...f.path.slice(2)]), `var(${f.cssVar})`, ind)).join("\n");
const durations = foundation.filter((f) => f.path[0] === "motion" && f.path[1] === "duration");

const css: string[] = [BANNER];
css.push(`/* Foundations and component tokens (theme-independent). */\n:root {\n${[...foundation, ...comps].map((f) => d(f.cssVar, f.css)).join("\n")}\n${densityAlias("comfortable")}\n}`);
for (const t of THEMES) css.push(`${sel(t)} {\n${themeBlock(t)}\n}`);
css.push(`[data-faun-theme="system"] {\n${themeBlock("light")}\n}\n@media (prefers-color-scheme: dark) {\n  [data-faun-theme="system"] {\n${themeBlock("dark", "    ")}\n  }\n}`);
css.push(`/* Wide-gamut displays get Display P3 solids. */\n@media (color-gamut: p3) {\n${THEMES.map((t) => `  ${sel(t).replace(/\n/g, " ")} {\n${p3Decls(t).join("\n")}\n  }`).join("\n")}\n}`);
css.push(`/* Printing uses the print theme unless data-faun-print="off". */\n@media print {\n  :root:not([data-faun-print="off"]),\n  :root:not([data-faun-print="off"]) [data-faun-theme] {\n${themeBlock("print", "    ")}\n  }\n}`);
css.push(["compact", "comfortable", "spacious"].map((m) => `[data-faun-density="${m}"] {\n${densityAlias(m)}\n}`).join("\n"));
css.push(paletteScopeCss());
css.push(reliefScopeCss());
css.push(`@media (prefers-reduced-motion: reduce) {\n  :root {\n${durations.map((f) => d(f.cssVar, "0ms", "    ")).join("\n")}\n  }\n}\n[data-faun-motion="reduced"] {\n${durations.map((f) => d(f.cssVar, "0ms")).join("\n")}\n}`);
css.push(`/* Calm mode: no pulsing or spinning live indicators. */\n[data-faun-calm] {\n${d(cssVar(["motion", "duration", "pulse"]), "0ms")}\n${d(cssVar(["motion", "duration", "spin"]), "0ms")}\n}`);
css.push(`/* Forced colours (Windows High Contrast): hand control to system colours. */\n@media (forced-colors: active) {\n  :root, [data-faun-theme] {\n${[
  ["focus-ring", "Highlight"], ["border-control", "CanvasText"], ["border-default", "CanvasText"], ["border-strong", "CanvasText"],
  ["accent-solid-bg", "Highlight"], ["accent-solid-fg", "HighlightText"], ["bg-selected", "Highlight"], ["fg-link", "LinkText"],
].map(([k, val]) => d(`--faun-${k}`, val!, "    ")).join("\n")}\n  }\n}`);
write("css/faun.css", css.join("\n\n") + "\n");
for (const t of THEMES) write(`css/themes/${t}.css`, `${BANNER}:root,\n[data-faun-theme="${t}"] {\n${themeBlock(t)}\n}\n`);

write("types/css.d.ts", "// Lets TypeScript resolve side-effect CSS imports such as `import \"@faun-ds/tokens/css\"`.\nexport {};\n");

write("css/fonts.css", `${BANNER}/* Convenience import. Products may self-host the same OFL families instead (see @faun-ds/tokens/fonts.css). */\n@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Serif:wght@400;500;600&display=swap");\n`);

write("css/fonts-fontsource.css", `${BANNER}/* Self-hosted IBM Plex via Fontsource. Install: pnpm add @fontsource/ibm-plex-sans @fontsource/ibm-plex-serif @fontsource/ibm-plex-mono */\n@import "@fontsource/ibm-plex-sans/400.css";\n@import "@fontsource/ibm-plex-sans/500.css";\n@import "@fontsource/ibm-plex-sans/600.css";\n@import "@fontsource/ibm-plex-serif/400.css";\n@import "@fontsource/ibm-plex-serif/500.css";\n@import "@fontsource/ibm-plex-serif/600.css";\n@import "@fontsource/ibm-plex-mono/400.css";\n@import "@fontsource/ibm-plex-mono/500.css";\n`);

const typeClass = (r: string) => `  .faun-type-${r} {\n    font-family: ${v("type", r, "font-family")};\n    font-size: ${v("type", r, "font-size")};\n    line-height: ${v("type", r, "line-height")};\n    font-weight: ${v("type", r, "font-weight")};\n    letter-spacing: ${v("type", r, "letter-spacing")};${r.startsWith("figure") ? `\n    font-feature-settings: ${v("font", "feature", "numeric")};` : ""}\n  }`;
write("css/base.css", `${BANNER}@layer faun.base, faun.components, faun.utilities;

@layer faun.base {
  :where(html) {
    background: ${v("bg", "canvas")};
    color: ${v("fg", "default")};
    font-family: ${v("font", "family", "sans")};
    font-size: ${v("type", "body-md", "font-size")};
    line-height: ${v("type", "body-md", "line-height")};
    letter-spacing: ${v("type", "body-md", "letter-spacing")};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    -webkit-text-size-adjust: 100%;
  }
  :where(*, *::before, *::after) { box-sizing: border-box; }
  :where(body) { margin: 0; }
  :where(:focus-visible) { outline: ${v("border-width", "focus")} solid ${v("focus", "ring")}; outline-offset: 2px; }
  :where(::selection) { background: ${v("accent", "a5")}; }
  :where(a) { color: ${v("fg", "link")}; text-underline-offset: 0.2em; text-decoration-thickness: 1px; }
  :where(a:hover) { color: ${v("fg", "link-hover")}; }
  :where(code, kbd, samp, pre) { font-family: ${v("font", "family", "mono")}; }
  :where(h1, h2, h3, h4, h5, h6, p) { margin: 0; }
}

@layer faun.utilities {
${TYPE_ROLES.map(typeClass).join("\n")}
  .faun-numeric { font-feature-settings: ${v("font", "feature", "numeric")}; }
  .faun-visually-hidden { position: absolute !important; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
}
`);

/* ------------------------------------------------------------------- Tailwind v4 */
function twName(s: Semantic): string | null {
  const [g, a, b] = s.path;
  const strip = (x: string) => x.replace(/-bg(?=$|-)/, "").replace(/^solid-fg$/, "solid-fg");
  switch (g) {
    case "bg": return a!;
    case "fg": return a === "default" ? "fg" : `fg-${a}`;
    case "border": return a === "default" ? "line" : `line-${a}`;
    case "focus": return `focus-${a}`;
    case "accent": case "neutral": case "danger": {
      const key = a!;
      if (key === "fg") return `${g}-fg`;
      if (key === "fg-muted") return `${g}-fg-muted`;
      const n = strip(key).replace(/^outline-border/, "outline-line");
      return `${g}-${n}`;
    }
    case "status": return ({ fg: `status-${a}`, bg: `status-${a}-soft`, "bg-hover": `status-${a}-soft-hover`, border: `status-${a}-line`, solid: `status-${a}-solid`, "solid-hover": `status-${a}-solid-hover`, "on-solid": `on-status-${a}` } as Record<string, string | undefined>)[b!] ?? null;
    case "ai": return a === "fg" ? "ai" : a === "bg" ? "ai-soft" : a === "border" ? "ai-line" : `ai-${a}`;
    case "nav": return a === "bg" ? "nav" : `nav-${a}`;
    case "sidebar": return a === "bg" ? "sidebar" : `sidebar-${a}`;
    case "layer": return `layer-${a}`;
    case "dataviz": return `viz-${a}`;
    default: return null;
  }
}
const twColors: [string, string][] = semantic.map((s) => [twName(s), s.cssVar] as [string | null, string]).filter((x): x is [string, string] => !!x[0]);
for (const name of [...SCALE_NAMES, "accent"]) for (const step of STEPS) twColors.push([`${name}-${step}`, cssVar([name, step])]);
const seen = new Set<string>(); for (const [n] of twColors) { if (seen.has(n)) throw new Error(`Tailwind colour collision: ${n}`); seen.add(n); }

const twTheme = [
  ...twColors.map(([n, cv]) => `  --color-${n}: var(${cv});`),
  "  --color-white: #ffffff;", "  --color-black: #000000;", "  --color-transparent: transparent;", "  --color-current: currentColor;",
  `  --font-sans: ${v("font", "family", "sans")};`, `  --font-serif: ${v("font", "family", "serif")};`, `  --font-mono: ${v("font", "family", "mono")};`,
  ...TYPE_ROLES.flatMap((r) => [`  --text-${r}: ${v("type", r, "font-size")};`, `  --text-${r}--line-height: ${v("type", r, "line-height")};`, `  --text-${r}--letter-spacing: ${v("type", r, "letter-spacing")};`, `  --text-${r}--font-weight: ${v("type", r, "font-weight")};`]),
  ...["regular", "medium", "semibold"].map((w) => `  --font-weight-${w}: ${v("font", "weight", w)};`), `  --font-weight-normal: ${v("font", "weight", "regular")};`,
  "  --spacing: 4px;",
  ...["none", "xs", "sm", "md", "lg", "xl", "full"].map((r) => `  --radius-${r}: ${v("radius", r)};`),
  ...["1", "2", "3", "4", "5"].map((e) => `  --shadow-${e}: ${v("elevation", e)};`),
  ...["standard", "enter", "exit", "emphasized"].map((e) => `  --ease-${e}: ${v("motion", "easing", e)};`),
  ...["snappy", "gentle"].map((e) => `  --ease-spring-${e}: ${v("motion", "spring", e)};`),
  ...foundation.filter((f) => f.path[0] === "breakpoint").map((f) => `  --breakpoint-${f.path[1]}: ${f.css};`),
].join("\n");
const twUtilities = [
  ...Object.keys(foundations.z).filter((k) => !k.startsWith("$")).map((z) => `@utility z-${z} {\n  z-index: ${v("z", z)};\n}`),
  ...["fast", "moderate", "slow", "deliberate"].map((x) => `@utility duration-${x} {\n  transition-duration: ${v("motion", "duration", x)};\n}`),
  `@utility numeric {\n  font-feature-settings: ${v("font", "feature", "numeric")};\n}`,
  `@utility h-control {\n  height: ${v("density", "control-height")};\n}`,
  `@utility focus-ring {\n  outline: ${v("border-width", "focus")} solid ${v("focus", "ring")};\n  outline-offset: 2px;\n}`,
].join("\n\n");
write("tailwind/faun.css", `${BANNER}/* Tailwind v4:  @import "@faun-ds/tokens/css";  @import "tailwindcss";  @import "@faun-ds/tokens/tailwind"; */\n@theme inline {\n${twTheme}\n}\n\n${twUtilities}\n`);
write("tailwind/faun-strict.css", `${BANNER}/* Strict: removes Tailwind's default palette, type sizes, radii, shadows and easings. */\n@theme inline {\n  --color-*: initial;\n  --text-*: initial;\n  --radius-*: initial;\n  --shadow-*: initial;\n  --font-*: initial;\n  --font-weight-*: initial;\n  --ease-*: initial;\n${twTheme}\n}\n\n${twUtilities}\n`);

/* ------------------------------------------------------------------------- JS */
const nest = (entries: [string[], string][]) => {
  const root: any = {};
  for (const [path, val] of entries) {
    let n = root;
    path.forEach((k, i) => { const key = k.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()); if (i === path.length - 1) n[key] = val; else n = n[key] ??= {}; });
  }
  return root;
};
const vizPalettes = Object.fromEntries(PALETTE_IDS.map((p) => [p, { label: viz.palettes[p].label, description: viz.palettes[p].description, light: paletteValues(p, "light"), dark: paletteValues(p, "dark") }]));
const scaleVarEntries: [string[], string][] = [];
for (const name of [...SCALE_NAMES, "accent"]) for (const step of STEPS) scaleVarEntries.push([["scale", name, step], `var(${cssVar([name, step])})`]);
const vars = nest([
  ...semantic.map((s) => [s.path, `var(${s.cssVar})`] as [string[], string]),
  ...foundation.map((f) => [f.path, `var(${f.cssVar})`] as [string[], string]),
  ...comps.map((f) => [["component", ...f.path], `var(${f.cssVar})`] as [string[], string]),
  ...reliefColours().map((c) => [c.path[0] === "dataviz" ? ["relief", c.path.slice(1).join("-")] : c.path, `var(${c.cssVar})`] as [string[], string]),
  ...scaleVarEntries,
]);
const colors = Object.fromEntries(THEMES.map((t) => [t, Object.fromEntries(semantic.map((s) => [s.name, s.value[t]]))]));
const scaleValues = Object.fromEntries(Object.entries(scales).map(([n, s]) => [n, { light: s.light.steps, dark: s.dark.steps, "light-hc": s["light-hc"].steps, "dark-hc": s["dark-hc"].steps }]));
write("js/index.js", `${BANNER}export const version = ${JSON.stringify(VERSION)};
export const themes = ${JSON.stringify(themes, null, 2)};
/** var(--faun-…) references. Use in inline styles, canvas and chart configs so themes and tenants keep working. */
export const vars = ${JSON.stringify(vars, null, 2)};
/** Resolved semantic colours per theme (hex, #rrggbbaa for translucent). */
export const colors = ${JSON.stringify(colors, null, 2)};
/** Resolved 12-step scales per appearance. */
export const scales = ${JSON.stringify(scaleValues)};
export const foundations = ${JSON.stringify(Object.fromEntries(foundation.map((f) => [f.name, f.css])), null, 2)};
export const statusMap = ${JSON.stringify(statusMap, null, 2)};
export const vizOrder = ${JSON.stringify(viz.order)};
/**
 * Pastel data-viz palettes (ADR 0007), set with data-viz-palette="meadow|dawn|harbour" on any element. Per palette and mode (light, dark), eight slots:
 * deep (the series colour, 3:1 on the chart surface), face (the pastel fill of a relief mark), and the outline, side and wave colours derived from deep.
 * Slot 1 is the brand moss solid step in every palette. High-contrast themes and print never take a palette.
 */
export const vizPalettes = ${JSON.stringify(vizPalettes, null, 2)};
/** Categorical chart colours in fixed order. Never cycle: fold a 9th series into "Other". Pass a palette name for a pastel option (light and dark themes only; deep colours). */
export function categorical(theme = "light", palette) {
  const c = colors[theme] ?? colors.light;
  const p = palette && vizPalettes[palette]?.[theme === "dark" ? "dark" : theme === "light" ? "light" : null];
  if (p) return p.map((s) => s.deep);
  return [1, 2, 3, 4, 5, 6, 7, 8].map((i) => c["dataviz.cat-" + i]);
}
/** Status entry for a domain state, with a neutral fallback so unknown data never breaks the UI. */
export function statusOf(domain, state) {
  const e = statusMap.domains[domain]?.[state];
  return e ?? { tone: "neutral", icon: "status-unknown", label: String(state).replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()) };
}
`);
const typeOf = (n: any, ind = "  "): string => `{\n${Object.entries(n).map(([k, val]) => `${ind}readonly ${JSON.stringify(k)}: ${typeof val === "string" ? "string" : typeOf(val, ind + "  ")};`).join("\n")}\n${ind.slice(2)}}`;
write("js/index.d.ts", `${BANNER}export type ThemeName = ${THEMES.map((t) => JSON.stringify(t)).join(" | ")};
export type ColorToken = ${semantic.map((s) => JSON.stringify(s.name)).join(" | ")};
export type StatusTone = ${Object.keys(statusMap.tones).map((t) => JSON.stringify(t)).join(" | ")};
export type StatusEntry = { tone: StatusTone; icon: string; label: string };
export type ThemeMeta = { appearance: "light" | "dark" | "light-hc" | "dark-hc"; extends: ThemeName | null; colorScheme: "light" | "dark"; label: string; description: string };
export declare const version: string;
export declare const themes: Record<ThemeName, ThemeMeta>;
export declare const vars: ${typeOf(vars)};
export declare const colors: Record<ThemeName, Record<ColorToken, string>>;
export declare const scales: Record<${SCALE_NAMES.map((s) => JSON.stringify(s)).join(" | ")}, Record<"light" | "dark" | "light-hc" | "dark-hc", Record<string, string>>>;
export declare const foundations: Record<string, string>;
export declare const statusMap: { tones: Record<StatusTone, { icon: string; meaning: string }>; domains: Record<string, Record<string, StatusEntry>> };
export declare const vizOrder: string[];
export type VizPaletteName = ${PALETTE_IDS.map((x) => JSON.stringify(x)).join(" | ")};
export type VizPaletteSlot = { slot: number; name: string; deep: string; face: string; line: string; shade: string; tex: string };
export declare const vizPalettes: Record<VizPaletteName, { label: string; description: string; light: VizPaletteSlot[]; dark: VizPaletteSlot[] }>;
export declare function categorical(theme?: ThemeName, palette?: VizPaletteName): string[];
export declare function statusOf(domain: string, state: string): StatusEntry;
`);

/* ----------------------------------------------------------------------- JSON */
const flat = [
  ...semantic.map((s) => ({ name: s.name, cssVar: s.cssVar, type: "color", category: s.path[0], description: s.description ?? null, values: s.value, references: s.expr })),
  ...allFoundation.filter((f) => f.type !== "typography-part").map((f) => ({ name: f.name, cssVar: f.cssVar || null, type: f.type, category: f.path[0], description: f.description ?? null, value: f.type === "typography" ? f.raw : f.css })),
  ...reliefColours().map((c) => ({ name: c.name, cssVar: c.cssVar, type: "color", category: c.path[0], description: c.description, values: c.value, references: Object.fromEntries(THEMES.map((t) => [t, c.css[t]])) })),
  ...comps.map((c) => ({ name: `component.${c.name}`, cssVar: c.cssVar, type: "dimension", category: "component", description: null, value: c.css })),
];
write("json/tokens.json", JSON.stringify({ name: "Faun Design System", version: VERSION, prefix: "faun", themes, tokens: flat, vizPalettes }, null, 2) + "\n");
write("json/scales.json", JSON.stringify(scaleValues, null, 2) + "\n");
write("json/status-map.json", JSON.stringify(statusMap, null, 2) + "\n");
for (const t of THEMES) {
  const tree: any = {};
  for (const s of semantic) { let n = tree; s.path.forEach((k, i) => { if (i === s.path.length - 1) n[k] = { $type: "color", $value: s.value[t], ...(s.description ? { $description: s.description } : {}) }; else n = n[k] ??= {}; }); }
  write(`json/dtcg/${t}.json`, JSON.stringify(tree, null, 2) + "\n");
}

const report = contrastReport(semantic);
write("docs/contrast.md", report.markdown);
write("json/contrast.json", JSON.stringify(report.rows.map((r) => ({ ...r, ratio: Math.round(r.ratio * 100) / 100 }))) + "\n");
const fail = report.rows.filter((r) => !r.pass);
console.log(`faun tokens v${VERSION}: ${semantic.length} semantic colours × ${THEMES.length} themes, ${SCALE_NAMES.length} scales × 24 steps, ${foundation.length} foundation vars, ${comps.length} component tokens, ${twColors.length} Tailwind colours.`);
console.log(`contrast: ${report.rows.length - fail.length}/${report.rows.length} pass`);
for (const f of fail) console.log(`  FAIL [${f.theme}] ${f.fg} on ${f.bg}: ${f.ratio.toFixed(2)} < ${f.min}`);
if (fail.length) process.exitCode = 1;
