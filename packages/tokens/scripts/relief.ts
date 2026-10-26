/**
 * Relief tokens (ADR 0006): the shallow-block look of charts (buttons are flat since ADR 0008).
 *
 * Source: src/foundations/relief.json. Emits
 *   - chart scalars as `--faun-dataviz-relief-*` (depth, bevel, outline width, face wash, texture alpha),
 *     plain custom properties on :root so any scope can override them;
 *   - wave textures as SVG data URIs plus their tile size, used through `mask-image`. No colour is written in a tile: only its alpha is used,
 *     the colour comes from the fill or background of the masked element;
 *   - per series slot and per theme, the outline (`--faun-dataviz-<slot>-line`), side face (`-shade`) and wave line (`-tex`) colours, mixed from
 *     the data-viz colour with color-mix, so a change to the data-viz palette flows through;
 *   - the flat (`[data-appearance="flat"]`), high-contrast, print and forced-colours overrides.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SRC, THEMES, collectSemantic, cssVar, rgba, toHex, statusMap, viz, type Dim, type ThemeName } from "./lib.ts";

const src = JSON.parse(readFileSync(resolve(SRC, "foundations/relief.json"), "utf8"));
const HATCH_THEMES: ThemeName[] = ["light-hc", "dark-hc", "print"];
const CHART = ["dataviz", "relief"];

/** A wave tile. `w` and `h` are the design grid; `scale` multiplies them to the rendered tile and `stroke` is the line width in grid units. */
const tile = (path: string, w: number, h: number, scale = 1, stroke = 0.9) =>
  `<svg xmlns='http://www.w3.org/2000/svg' width='${w * scale}' height='${h * scale}' viewBox='0 0 ${w} ${h}' fill='none' stroke='currentColor' stroke-width='${stroke}' stroke-linecap='round' stroke-linejoin='round'>${path}</svg>`;
/** A quoted data URI. Quotes inside the SVG are single, so the CSS string needs no escaping. */
export const dataUri = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg).replace(/\(/g, "%28").replace(/\)/g, "%29")}")`;

export const WAVES = Object.keys(src.chart.textures).filter((k) => !k.startsWith("$")) as string[];

export function reliefDims(): Dim[] {
  const out: Dim[] = [];
  const add = (ns: string[], key: string, type: string, css: string, description?: string) => {
    const path = [...ns, key];
    out.push({ path, name: path.join("."), cssVar: cssVar(path), type, description, css, raw: css });
  };
  for (const [k, n] of Object.entries<any>(src.chart.scalars)) add(CHART, k, n.$type, String(n.$value), n.$description);
  const texture = (ns: string[], key: string, t: any) => {
    const [w, h] = t.size as [number, number];
    const k = (t.scale ?? 1) as number;
    add(ns, key, "image", dataUri(tile(t.path, w, h, k, t.stroke)), `${t.$description}`);
    add(ns, `${key}-size`, "dimension-pair", `${w * k}px ${h * k}px`, `Rendered tile size of ${key}, for mask-size.`);
  };
  for (const name of WAVES) texture(CHART, name, src.chart.textures[name]);
  return out;
}

/* ------------------------------------------------------------------ derived colours */
const mixHex = (a: string, pct: number, b: string) => {
  const [r1, g1, b1] = rgba(a); const [r2, g2, b2] = rgba(b); const t = pct / 100;
  return toHex([r1 * t + r2 * (1 - t), g1 * t + g2 * (1 - t), b1 * t + b2 * (1 - t), 1]);
};

export type ReliefColour = { name: string; path: string[]; cssVar: string; description: string; value: Record<ThemeName, string>; css: Record<ThemeName, string> };

/** Slots that get a derived outline, side and wave colour: every categorical, scope, sequential and diverging data-viz colour, and the status solids. */
export function reliefSlots() {
  const sem = collectSemantic();
  const slots: { slot: string; source: string; value: Record<ThemeName, string> }[] = [];
  for (const s of sem) {
    if (s.path[0] === "dataviz" && /^(cat|scope|seq|div)-/.test(s.path[1]!)) slots.push({ slot: s.path[1]!, source: s.cssVar, value: s.value });
    if (s.path[0] === "status" && s.path[2] === "solid" && statusMap.tones[s.path[1]!]) slots.push({ slot: `status-${s.path[1]}`, source: s.cssVar, value: s.value });
  }
  return slots;
}

const themeSet = (theme: ThemeName) => (HATCH_THEMES.includes(theme) ? src.mix.hatch : src.mix.relief) as { line: number; shade: number; tex: number };

export function reliefColours(): ReliefColour[] {
  const sem = collectSemantic();
  const by = new Map(sem.map((s) => [s.name, s]));
  const out: ReliefColour[] = [];
  const ref = (name: string) => { const s = by.get(name); if (!s) throw new Error(`relief: unknown semantic token ${name}`); return s; };
  // Themed inks. Buttons use them directly; the chart colours below are mixed towards them.
  for (const [k, n] of Object.entries<any>(src.colour).filter(([k]) => !k.startsWith("$"))) {
    const value = {} as Record<ThemeName, string>; const css = {} as Record<ThemeName, string>;
    for (const t of THEMES) { const s = ref(n[t] ?? n.default); value[t] = s.value[t]; css[t] = `var(${s.cssVar})`; }
    out.push({ name: `relief.${k}`, path: ["relief", k], cssVar: cssVar(["relief", k]), description: n.$description, value, css });
  }
  const ink = ref("fg.default"); const surface = ref("dataviz.surface");
  const shadeInk = out.find((c) => c.name === "relief.ink-shade")!;
  const kinds: [string, string, (t: ThemeName) => number][] = [
    ["line", "Thin outline of a relief mark: the series colour mixed towards ink, kept at 3:1 or more against the chart surface.", (t) => themeSet(t).line],
    ["shade", "Side face of a relief mark: the series colour mixed towards the shade ink.", (t) => themeSet(t).shade],
    ["tex", "Wave lines of a relief mark: the series colour mixed towards ink (the series colour itself by default, so the wave reads at full strength on the tinted face). In hatch themes the lines are drawn in the surface colour over a solid fill.", (t) => themeSet(t).tex],
  ];
  for (const { slot, source, value } of reliefSlots()) {
    for (const [kind, description, pct] of kinds) {
      const v = {} as Record<ThemeName, string>; const css = {} as Record<ThemeName, string>;
      for (const t of THEMES) {
        const p = pct(t);
        const toward = kind === "tex" && HATCH_THEMES.includes(t) ? { value: surface.value[t], css: `var(${surface.cssVar})` } : kind === "tex" || kind === "line" ? { value: ink.value[t], css: `var(${ink.cssVar})` } : { value: shadeInk.value[t], css: shadeInk.css[t] };
        v[t] = mixHex(value[t], p, toward.value);
        css[t] = p === 0 ? toward.css : `color-mix(in srgb, var(${source}) ${p}%, ${toward.css})`;
      }
      const path = ["dataviz", slot, kind];
      out.push({ name: path.join("."), path, cssVar: cssVar(path), description: `${description} Slot: ${slot}.`, value: v, css });
    }
  }
  const cell = {} as Record<ThemeName, string>; const cellCss = {} as Record<ThemeName, string>;
  for (const t of THEMES) { cell[t] = mixHex(ink.value[t], 45, surface.value[t]); cellCss[t] = `color-mix(in srgb, var(${ink.cssVar}) 45%, var(${surface.cssVar}))`; }
  out.push({ name: "dataviz.cell-line", path: ["dataviz", "cell-line"], cssVar: cssVar(["dataviz", "cell-line"]), description: "Hairline outline of heatmap cells and sankey nodes, which stay flat in relief.", value: cell, css: cellCss });
  return out;
}

const decl = (ns: string[], o: Record<string, string>, ind = "  ") => Object.entries(o).map(([k, val]) => `${ind}${cssVar([...ns, k])}: ${val};`).join("\n");
const both = (o: { chart: Record<string, string> }, ind = "  ") => decl(CHART, o.chart, ind);

const CAT_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8];
const faceVar = (i: number) => cssVar(["dataviz", `cat-${i}`, "face"]);
const faceOpVar = (i: number) => cssVar(["dataviz", `cat-${i}`, "face-op"]);

/**
 * Declarations that belong in every theme block: the derived colours, and the palette face tokens set to `initial`, so a theme block (an
 * element that sets its own theme) always starts from the default palette and a mark falls back to the series colour wash.
 */
export const reliefThemeDecls = (theme: ThemeName, ind = "  ") => [
  ...reliefColours().map((c) => `${ind}${c.cssVar}: ${c.css[theme]};`),
  ...CAT_SLOTS.flatMap((i) => [`${ind}${faceVar(i)}: initial;`, `${ind}${faceOpVar(i)}: initial;`]),
];

/* ------------------------------------------------------------------ pastel palettes (ADR 0007) */
export const PALETTE_IDS = Object.keys(viz.palettes) as string[];
export const PALETTE_ATTR = "data-viz-palette";

/**
 * The tokens a palette sets on its scope for one mode: per categorical slot the deep series colour, the pastel face, the face opacity, and the outline, side and
 * wave colours derived from the deep colour with the same mixes as every other slot. The mixes are written as color-mix() over the scope's own tokens, so a tenant theme
 * or a change to ink flows through.
 */
export function paletteDecls(palette: string, mode: "light" | "dark", ind = "  "): string[] {
  const m = src.mix.relief as { line: number; shade: number; tex: number };
  const p = viz.palettes[palette][mode] as Record<string, string>;
  return CAT_SLOTS.flatMap((i) => {
    const c = cssVar(["dataviz", `cat-${i}`]);
    const mix = (pct: number, toward: string) => `color-mix(in srgb, var(${c}) ${pct}%, ${toward})`;
    return [
      `${ind}${c}: ${p[`cat-${i}`]};`,
      `${ind}${faceVar(i)}: ${p[`face-${i}`]};`,
      `${ind}${faceOpVar(i)}: 100%;`,
      `${ind}${cssVar(["dataviz", `cat-${i}`, "line"])}: ${mix(m.line, "var(--faun-fg-default)")};`,
      `${ind}${cssVar(["dataviz", `cat-${i}`, "shade"])}: ${mix(m.shade, "var(--faun-relief-ink-shade)")};`,
      `${ind}${cssVar(["dataviz", `cat-${i}`, "tex"])}: ${mix(m.tex, "var(--faun-fg-default)")};`,
    ];
  });
}

/** What a palette slot resolves to in a mode: the deep colour, the pastel face, and the derived outline, side and wave colours (hex). For docs, JSON and tests. */
export function paletteValues(palette: string, mode: "light" | "dark") {
  const p = viz.palettes[palette][mode] as Record<string, string>;
  const m = src.mix.relief as { line: number; shade: number; tex: number };
  const theme: ThemeName = mode;
  const by = new Map(collectSemantic().map((s) => [s.name, s]));
  const ink = by.get("fg.default")!.value[theme];
  const shadeInk = reliefColours().find((c) => c.name === "relief.ink-shade")!.value[theme];
  return CAT_SLOTS.map((i) => {
    const deep = p[`cat-${i}`]!;
    return { slot: i, name: viz.palettes[palette].names[i - 1] as string, deep, face: p[`face-${i}`]!, line: mixHex(deep, m.line, ink), shade: mixHex(deep, m.shade, shadeInk), tex: mixHex(deep, m.tex, ink) };
  });
}

/** Declarations that put every palette slot back to the theme's own values, for high-contrast themes and print, which never take a palette. */
function paletteResetDecls(theme: ThemeName, ind: string): string[] {
  const sem = new Map(collectSemantic().map((s) => [s.cssVar, s]));
  const rel = new Map(reliefColours().map((c) => [c.cssVar, c]));
  return CAT_SLOTS.flatMap((i) => {
    const out: string[] = [];
    for (const v of [cssVar(["dataviz", `cat-${i}`]), ...["line", "shade", "tex"].map((k) => cssVar(["dataviz", `cat-${i}`, k]))]) {
      const css = sem.get(v)?.css[theme] ?? rel.get(v)!.css[theme];
      out.push(`${ind}${v}: ${css};`);
    }
    out.push(`${ind}${faceVar(i)}: initial;`, `${ind}${faceOpVar(i)}: initial;`);
    return out;
  });
}

/**
 * Palette scopes: `data-viz-palette="meadow|dawn|harbour"` on any element recolours the categorical slots (and their relief faces) beneath it, in light and dark
 * themes, whether the theme attribute is on the same element, an ancestor or a descendant. High-contrast themes and print never take a palette: they draw solid
 * fills with a hatch. `data-appearance="flat"` hides the pastel face (the wash is switched off), so flat marks show the deep colour, which holds 3:1 on its own.
 */
export function paletteScopeCss(): string {
  const a = (p: string) => `[${PALETTE_ATTR}="${p}"]`;
  const block = (sels: string[], decls: string[]) => `${sels.join(",\n")} {\n${decls.join("\n")}\n}`;
  const out: string[] = [`/* Pastel palettes (ADR 0007). data-viz-palette on any element recolours the categorical slots beneath it. Placed after the theme blocks so it wins on the same element. */`];
  // "default" is a scope too: it puts the default palette back inside a palette scope (a chart that opts out of its ancestor's palette).
  for (const p of ["default", ...PALETTE_IDS]) {
    const forms = (theme: string) => [`[data-faun-theme="${theme}"]${a(p)}`, `[data-faun-theme="${theme}"] ${a(p)}`, `${a(p)} [data-faun-theme="${theme}"]`];
    const decls = (mode: "light" | "dark", ind: string) => (p === "default" ? paletteResetDecls(mode, ind) : paletteDecls(p, mode, ind));
    out.push(block([a(p), ...forms("light"), ...forms("system")], decls("light", "  ")));
    out.push(block(forms("dark"), decls("dark", "  ")));
    out.push(`@media (prefers-color-scheme: dark) {\n${block(forms("system"), decls("dark", "    ")).replace(/^/gm, "  ")}\n}`);
  }
  for (const t of ["light-hc", "dark-hc"] as ThemeName[]) {
    out.push(`/* ${t} never takes a palette. */\n${block([`[data-faun-theme="${t}"][${PALETTE_ATTR}]`, `[data-faun-theme="${t}"] [${PALETTE_ATTR}]`], paletteResetDecls(t, "  "))}`);
  }
  const printRoot = ':root:not([data-faun-print="off"])';
  out.push(`@media print {\n${block([`${printRoot}[${PALETTE_ATTR}]`, `${printRoot} [${PALETTE_ATTR}]`], paletteResetDecls("print", "  ")).replace(/^/gm, "  ")}\n}`);
  return out.join("\n\n");
}

/** Overrides that are not tied to a theme block: density, flat appearance, and the hatch fallback for high contrast, print and forced colours. */
export function reliefScopeCss(): string {
  const flatAttr = '[data-appearance="flat"]';
  const hatchFlat = { chart: { "tex-alpha": src.hatch.chart["tex-alpha"] } };
  const inThemes = HATCH_THEMES.flatMap((t) => [`[data-faun-theme="${t}"] ${flatAttr}`, `[data-faun-theme="${t}"]${flatAttr}`]);
  const printRoot = ':root:not([data-faun-print="off"])';
  return [
    `/* Relief (ADR 0006, buttons are flat since ADR 0008): appearance="flat" on any ancestor draws charts the classic flat way. */\n${flatAttr} {\n${both(src.flat)}\n}`,
    `/* Relief fallback: high-contrast themes, print and forced colours draw solid fills with a distinct hatch per series instead of depth. */\n${HATCH_THEMES.map((t) => `[data-faun-theme="${t}"]`).join(",\n")} {\n${both(src.hatch)}\n}\n${inThemes.join(",\n")} {\n${both(hatchFlat)}\n}`,
    `@media print {\n  ${printRoot},\n  ${printRoot} [data-faun-theme] {\n${both(src.hatch, "    ")}\n  }\n  ${printRoot} ${flatAttr},\n  ${printRoot} [data-faun-theme]${flatAttr} {\n${both(hatchFlat, "    ")}\n  }\n}`,
    `@media (forced-colors: active) {\n  :root,\n  [data-faun-theme] {\n${both(src.hatch, "    ")}\n  }\n  :root ${flatAttr},\n  [data-faun-theme]${flatAttr},\n  [data-faun-theme] ${flatAttr} {\n${both(hatchFlat, "    ")}\n  }\n}`,
  ].join("\n\n");
}

export const reliefSource = src;
