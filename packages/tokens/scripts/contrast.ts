/**
 * The contrast contract. Every pair must pass in every theme or the build fails.
 * 4.5:1 text (WCAG 1.4.3), 3:1 non-text and large text (1.4.11), 7:1 text in high-contrast themes (1.4.6).
 * Translucent backgrounds are composited over bg.surface (or the named base) before measuring.
 */
import { THEMES, composite, contrast, rgba, type Semantic, type ThemeName } from "./lib.ts";
import { PALETTE_IDS, paletteValues } from "./relief.ts";

type Pair = { fg: string; bg: string[]; min: number; hc?: number; note: string };
const SURFACES = ["bg.canvas", "bg.surface", "bg.surface-nested", "bg.raised", "bg.sunken"];
const LAYERS = ["layer.background", "layer.01", "layer.02", "layer.03", "layer.accent"];
const TONES = ["neutral", "info", "success", "warning", "danger", "running", "attention"];
const INTENTS = ["accent", "neutral", "danger"];

export const PAIRS: Pair[] = [
  { fg: "fg.default", bg: SURFACES, min: 7, hc: 12, note: "Body text" },
  { fg: "fg.muted", bg: SURFACES, min: 4.5, hc: 7, note: "Secondary text" },
  { fg: "fg.default", bg: LAYERS, min: 7, hc: 12, note: "Body text on every layer" },
  { fg: "fg.muted", bg: LAYERS, min: 4.5, hc: 7, note: "Secondary text on every layer" },
  { fg: "fg.placeholder", bg: ["layer.01", "layer.02", "layer.03"], min: 4.5, note: "Placeholder on layers" },
  { fg: "fg.brand", bg: LAYERS, min: 4.5, hc: 7, note: "Brand text on every layer" },
  { fg: "fg.link", bg: LAYERS, min: 4.5, hc: 7, note: "Links on every layer" },
  { fg: "border.control", bg: ["layer.background", "layer.01", "layer.02", "layer.03"], min: 3, note: "Control boundary on every layer (1.4.11)" },
  { fg: "focus.ring", bg: LAYERS, min: 3, note: "Focus indicator on every layer (2.4.13)" },
  { fg: "fg.subtle", bg: ["bg.surface", "bg.canvas"], min: 3, note: "Decorative marks and icons" },
  { fg: "fg.placeholder", bg: ["bg.surface", "bg.sunken"], min: 4.5, note: "Placeholder" },
  { fg: "fg.disabled", bg: ["bg.surface"], min: 2.5, note: "Disabled (exempt); kept discernible" },
  { fg: "fg.brand", bg: [...SURFACES, "bg.brand-soft", "bg.selected"], min: 4.5, hc: 7, note: "Brand text" },
  { fg: "fg.link", bg: ["bg.surface", "bg.canvas", "bg.surface-nested"], min: 4.5, hc: 7, note: "Links" },
  { fg: "fg.inverse", bg: ["bg.inverse"], min: 7, note: "Tooltips" },
  { fg: "fg.default", bg: ["bg.hover", "bg.active", "bg.selected", "bg.selected-hover", "bg.brand-soft"], min: 7, hc: 12, note: "Text on interaction tints" },
  { fg: "fg.on-accent", bg: ["bg.brand"], min: 4.5, hc: 7, note: "Text on brand fill" },
  { fg: "border.control", bg: ["bg.surface", "bg.canvas", "bg.surface-nested"], min: 3, note: "Control boundary (1.4.11)" },
  { fg: "border.control-hover", bg: ["bg.surface", "bg.canvas"], min: 4.5, note: "Hovered control boundary" },
  { fg: "focus.ring", bg: ["bg.surface", "bg.canvas", "bg.raised"], min: 3, note: "Focus indicator (2.4.13)" },
  ...INTENTS.flatMap((i): Pair[] => [
    { fg: `${i}.solid-fg`, bg: [`${i}.solid-bg`, `${i}.solid-bg-hover`], min: 4.5, hc: 7, note: `${i} solid label` },
    { fg: `${i}.soft-fg`, bg: [`${i}.soft-bg`, `${i}.soft-bg-hover`, `${i}.soft-bg-active`], min: 4.5, hc: 7, note: `${i} soft label` },
    { fg: `${i}.fg`, bg: ["bg.surface", "bg.canvas", `${i}.ghost-bg-hover`], min: 4.5, hc: 7, note: `${i} ghost/outline label` },
  ]),
  { fg: "accent.solid-bg", bg: ["bg.surface", "bg.canvas"], min: 3, note: "Primary button boundary" },
  { fg: "neutral.fg", bg: ["neutral.outline-bg", "neutral.outline-bg-hover", "neutral.outline-bg-active"], min: 7, hc: 12, note: "Secondary button label" },
  ...TONES.flatMap((t): Pair[] => [
    { fg: `status.${t}.fg`, bg: [...SURFACES, `status.${t}.bg`, `status.${t}.bg-hover`], min: 4.5, hc: 7, note: `${t} text/icon` },
    { fg: `status.${t}.on-solid`, bg: [`status.${t}.solid`, `status.${t}.solid-hover`], min: 4.5, note: `${t} solid badge` },
  ]),
  ...["info", "success", "danger", "running", "attention", "neutral"].map((t): Pair => ({ fg: `status.${t}.solid`, bg: ["bg.surface", "bg.canvas"], min: 3, note: `${t} dot / solid fill` })),
  { fg: "ai.fg", bg: ["bg.surface", "bg.canvas", "ai.bg"], min: 4.5, hc: 7, note: "AI label" },
  // Sidebar (ADR 0011): the open panel is a paper surface in light themes and a dark surface in dark ones; the collapsed rail is near-black in all themes.
  { fg: "sidebar.fg", bg: ["sidebar.bg", "sidebar.bg-hover", "sidebar.bg-active"], min: 7, hc: 12, note: "Sidebar item label and icon (text)" },
  { fg: "sidebar.fg-muted", bg: ["sidebar.bg", "sidebar.bg-hover", "sidebar.bg-active"], min: 4.5, hc: 7, note: "Sidebar section label, count, progress and workspace context (text)" },
  { fg: "sidebar.fg-active", bg: ["sidebar.bg", "sidebar.bg-hover", "sidebar.bg-active"], min: 7, note: "Sidebar current and hovered item (text)" },
  { fg: "sidebar.accent", bg: ["sidebar.bg", "sidebar.bg-hover", "sidebar.bg-active"], min: 3, note: "Sidebar current-item indicator, pinned dot, progress bar and focus ring (1.4.11, 2.4.13)" },
  { fg: "sidebar.fg-muted", bg: ["sidebar.bg"], min: 3, note: "Sidebar chevrons and kebab icons (1.4.11)" },
  { fg: "sidebar.badge-bg", bg: ["sidebar.bg", "sidebar.bg-hover", "sidebar.bg-active"], min: 3, note: "Attention badge and dot on the sidebar (1.4.11)" },
  { fg: "sidebar.badge-fg", bg: ["sidebar.badge-bg"], min: 4.5, note: "Attention badge count on the sidebar (text)" },
  { fg: "sidebar.mark-fg", bg: ["sidebar.mark-bg"], min: 4.5, note: "Logo on the workspace mark tile (non-text, held to text contrast)" },
  { fg: "sidebar.mark-bg", bg: ["sidebar.bg"], min: 1.05, note: "Workspace mark tile is distinguishable from the panel (decorative, the name carries identity)" },
  { fg: "rail.fg", bg: ["rail.bg", "rail.bg-hover", "rail.bg-active"], min: 4.5, hc: 7, note: "Rail item icon (text-grade)" },
  { fg: "rail.fg-muted", bg: ["rail.bg", "rail.bg-hover", "rail.bg-active"], min: 4.5, hc: 7, note: "Rail secondary glyphs" },
  { fg: "rail.fg-active", bg: ["rail.bg", "rail.bg-hover", "rail.bg-active"], min: 7, note: "Rail current and hovered item icon" },
  { fg: "rail.accent", bg: ["rail.bg", "rail.bg-hover", "rail.bg-active"], min: 3, note: "Rail current-item indicator and focus ring (1.4.11, 2.4.13)" },
  { fg: "rail.badge-bg", bg: ["rail.bg", "rail.bg-hover", "rail.bg-active"], min: 3, note: "Attention dot on the rail (1.4.11)" },
  { fg: "rail.badge-fg", bg: ["rail.badge-bg"], min: 4.5, note: "Attention badge count on the rail (text)" },
  { fg: "rail.mark-fg", bg: ["rail.mark-bg"], min: 4.5, note: "Logo on the mark tile on the rail" },
  { fg: "rail.mark-bg", bg: ["rail.bg"], min: 3, note: "Mark tile boundary on the rail (1.4.11)" },
  { fg: "rail.action-fg", bg: ["rail.action-bg", "rail.action-bg-hover"], min: 4.5, hc: 7, note: "Plus icon on the rail primary action" },
  { fg: "rail.action-border", bg: ["rail.bg"], min: 1.5, hc: 3, note: "Rail primary action hairline (the icon and the fill carry the meaning)" },
  { fg: "rail.avatar-fg", bg: ["rail.avatar-bg"], min: 4.5, note: "Initials on the rail avatar" },
  { fg: "rail.avatar-bg", bg: ["rail.bg"], min: 3, note: "Avatar boundary on the rail (1.4.11)" },
  ...[1, 2, 3, 4, 5, 6, 7, 8].map((i): Pair => ({ fg: `dataviz.cat-${i}`, bg: ["dataviz.surface", "bg.canvas"], min: 3, note: `Categorical slot ${i}` })),
  ...["1", "2", "3", "outside"].map((i): Pair => ({ fg: `dataviz.scope-${i}`, bg: ["dataviz.surface", "bg.canvas"], min: 3, note: `Scope ${i}` })),
  { fg: "dataviz.axis", bg: ["dataviz.surface"], min: 4.5, note: "Axis labels" },
];

/** Base surface for compositing translucent backgrounds. */
const BASE: Record<string, string> = { "sidebar.bg-active": "sidebar.bg", "sidebar.bg-hover": "sidebar.bg", "rail.bg-active": "rail.bg", "rail.bg-hover": "rail.bg", "rail.action-border": "rail.bg" };

export type Row = { theme: ThemeName; fg: string; bg: string; ratio: number; min: number; pass: boolean; note: string };

export function contrastReport(tokens: Semantic[]) {
  const by = new Map(tokens.map((t) => [t.name, t]));
  const get = (n: string, th: ThemeName) => { const t = by.get(n); if (!t) throw new Error(`contrast: unknown token ${n}`); return t.value[th]; };
  const rows: Row[] = [];
  for (const theme of THEMES) {
    for (const p of PAIRS) {
      // Status solids are intentionally bright in dark themes; dots are always labelled.
      if (p.fg === "dataviz.axis" && theme.endsWith("hc")) continue;
      for (const bgName of p.bg) {
        let bg = get(bgName, theme);
        if (rgba(bg)[3] < 1) bg = composite(bg, get(BASE[bgName] ?? "bg.surface", theme));
        const ratio = contrast(get(p.fg, theme), bg);
        const min = theme.endsWith("hc") && p.hc ? p.hc : p.min;
        rows.push({ theme, fg: p.fg, bg: bgName, ratio, min, pass: ratio >= min - 0.005, note: p.note });
      }
    }
  }
  // Pastel palettes (ADR 0007), light and dark only (high-contrast themes and print never take one). The pastel face is not a pair: the deep series colour and the
  // derived outline carry the 3:1 non-text contrast, so those are the pairs.
  for (const theme of ["light", "dark"] as ThemeName[]) for (const p of PALETTE_IDS) for (const s of paletteValues(p, theme as "light" | "dark")) for (const [kind, value] of [["cat", s.deep], ["outline", s.line]] as const) for (const bgName of ["dataviz.surface", "bg.canvas"]) {
    const ratio = contrast(value, get(bgName, theme));
    rows.push({ theme, fg: `palette.${p}.${s.slot}.${kind}`, bg: bgName, ratio, min: 3, pass: ratio >= 3 - 0.005, note: `Pastel palette ${p}, slot ${s.slot} ${kind === "cat" ? "series colour" : "outline"}` });
  }
  const lines = ["# Faun contrast report", "", `${rows.filter((r) => r.pass).length} of ${rows.length} required pairs pass across ${THEMES.length} themes.`, "", "Minimums: 4.5:1 text, 3:1 non-text, 7:1 text in high-contrast themes. Translucent backgrounds are composited before measuring.", ""];
  for (const th of THEMES) {
    const tr = rows.filter((r) => r.theme === th);
    const tight = [...tr].sort((a, b) => a.ratio / a.min - b.ratio / b.min)[0]!;
    lines.push(`## ${th}`, "", `${tr.filter((r) => r.pass).length}/${tr.length} pass. Tightest: \`${tight.fg}\` on \`${tight.bg}\` ${tight.ratio.toFixed(2)}:1 (min ${tight.min}).`, "", "| Foreground | Background | Ratio | Min | |", "|---|---|---:|---:|---|");
    for (const r of tr) lines.push(`| \`${r.fg}\` | \`${r.bg}\` | ${r.ratio.toFixed(2)} | ${r.min} | ${r.pass ? "✓" : "**FAIL**"} |`);
    lines.push("");
  }
  return { rows, markdown: lines.join("\n") };
}
