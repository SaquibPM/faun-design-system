# 0007 · Visible texture and pastel palettes

> Note: this project was previously named Bloom; it is now Faun. See [ADR 0010](0010-rename-to-faun.md).

- Status: accepted
- Date: 2026-10-22
- Amends: [0006 · Relief visual language](0006-relief-visual-language.md)
- Amended by: [0008 · Flat buttons, a faint texture, and a hue per chart type](0008-flat-buttons-faint-texture-chart-hues.md) (the texture is now a faint grain, not visible lines; button relief and texture removed; the pastel rule in section 2 stands)

## Context

Two review findings on relief (ADR 0006).

1. **The texture was not visible.** The wave texture was present but did not read. We checked the build rather than assume. In Chromium the `mask-image` data URI renders, on the docs build and on the Artifact build (`vite build --base ./`), and the computed `mask-image`, `mask-size` and `opacity` of a bar face and a button face are all set. At 200% device scale the wave resolved. At 100% it did not, for three reasons that stack:
   - the tile was 4 by 12 px with a 0.9 px stroke, so adjacent waves overlap after anti-aliasing and read as a flat grey-green hatch;
   - the wave colour was the series colour mixed 78% towards paper, pale lines on a pale tint;
   - on buttons the wave was a near-black at alpha 0.12 on a dark face, and 3 px high rows, invisible at any scale.
2. **Pastel palette options were requested, with moss staying the main colour.** The categorical palette is saturated by design, because every series colour must hold 3:1 against the chart surface (WCAG 1.4.11). Pastel fills cannot: a pastel at lightness 0.85 on white is about 1.3:1.

## Decision

### 1. Texture that reads at 1x

- **Bigger tiles, not thicker lines.** Each wave carries a `scale` and a `stroke` in `relief.json`. The design grid stays as drawn; the rendered tile is scaled (×2 for most waves) so the pitch is 8 to 16 px and the line is about 1.5 px. Waves resolve at 100% browser zoom.
- **Full-strength wave colour.** The wave is the series colour itself (`mix.relief.tex` 100, mixed towards ink rather than towards paper), at `--faun-dataviz-relief-tex-alpha` 0.85. Hatch themes are unchanged (surface-coloured lines over a solid fill).
- **Buttons.** The wave tile is 20 by 6 px. Solid faces draw it in the ink that sits away from the label (dark on a dark face, light on a light one) at 0.5. Soft faces draw it in a new `--faun-relief-ink-lift` (paper-light on light themes, canvas-dark on dark themes) at 0.85. Neutral solid faces, where the face is the ink itself, draw it in the label colour at 0.12.
- **Label contrast is the limit, and it is not relaxed.** Choosing the ink away from the label means the texture can only raise label contrast, and the existing test still computes the label against the face and against the darkest texture pixel for every intent, state and theme (4.5:1, 7:1 in high contrast). Neutral solid is the exception that proves the rule: its hover face leaves about 6:1 to spend, so 0.12 is the largest alpha that holds 4.5:1, and the test checks it. **Changed test:** the earlier "button texture alpha is at most 0.2" assertion capped strength directly. It is replaced by a floor (solid at least 0.4, soft at least 0.6) and by the contrast tests above, which are the real limit. No contrast or CVD threshold was lowered.
- **Tested in a browser.** `e2e/relief-texture.spec.ts` asserts a non-empty `mask-image` data URI, a non-zero tile and a visible opacity on a bar face and on solid and soft buttons, and measures the luminance spread of the face on a real screenshot at 1x and 2x, relief against `data-appearance="flat"`. `FAUN_DOCS_DIST` runs it against any build, including the Artifact build.

### 2. Pastel palettes: `meadow`, `dawn`, `harbour`

`data-viz-palette="default|meadow|dawn|harbour"` on any element recolours the categorical slots beneath it, in light and dark themes. `ChartCommonProps` takes the same thing as `palette`. `default` is a scope too: it puts the default colours back inside a palette scope, so a chart can opt out of its ancestor's palette. Moss is series 1 in every option, the brand solid step exactly. Slots 2 to 8 are a soft family: meadow is sage, butter, sky, blush, lilac, seafoam and stone; dawn is peach, lilac, butter, teal, rose, sky and clay; harbour is sky, sand, lavender, mint, periwinkle, blush and slate.

**The rule: the pastel is the face, a deeper colour of the same hue is the series colour, and the outline carries 3:1.** Each palette slot is two OKLCH colours (`scripts/viz.ts`):

| | Token | Used for | Held to |
| --- | --- | --- | --- |
| deep | `--faun-dataviz-cat-N` (overridden in scope) | strokes, points, flat marks, and the source of the outline, side and wave | the default palette's contract: lightness band, chroma floor, 3:1 on the chart surface and canvas, adjacent CVD separation (ΔE ≥ 8 protan and deutan, ≥ 15 normal) |
| face | `--faun-dataviz-cat-N-face` | the fill of a relief mark (the wash layer paints it at `-face-op` 100%) | a looser, documented separation (below), and it must stay off the surface |

Slot 1 is the exception that shows the shape: its deep colour is the brand moss, its face a tint of moss.

- **Outline carries the boundary.** The outline (`-line`) is the deep colour mixed 50% towards ink, as for every other slot. Measured minimum against the chart surface: 7.3:1 light, 8.2:1 dark. The 3:1 test for outlines in ADR 0006 now also runs over every palette slot, and `contrast.ts` gains the deep colour and outline of every palette slot against the chart surface and canvas in light and dark (192 pairs; the build fails on any failure).
- **The wave reads on the face.** Wave on face at least 1.7:1 (measured 2.0 to 3.1 light, 1.8 dark). Texture stays a second channel: every slot keeps its own wave.
- **Flat shows the deep colour.** `appearance="flat"` and `data-appearance="flat"` switch the face off (the wash opacity is 0), so flat marks are the deep colour, which holds 3:1 by itself. Pastel is a relief option.
- **High contrast, print and forced colours never take a palette.** Reset blocks put the default colours back and unset the faces; theme blocks declare the faces `initial`, so a theme nested inside a palette scope never inherits a pastel.
- **Lines, points, sparklines, scopes and ramps.** Strokes and points use the deep colour. GHG scopes, sequential and diverging ramps and status colours are not part of a palette: their colours carry meaning.

### Honest limits (CVD and the pastel faces)

- **Deep colours** pass the same CVD tests as the default palette, adjacent slots, protan, deutan and normal vision, in every option and mode (tightest adjacent protan or deutan ΔE 10.0, normal 16.1).
- **Pastel faces are a weak colour channel.** They are light, low-chroma colours and sit close together. Measured adjacent separation: normal vision ΔE 5.4 to 9.7; protan or deutan ΔE 2.8 to 10.1 (dawn is the weakest, 2.8 in dark and 3.8 in light). The test is set just under the measured minimum (normal ≥ 5, CVD ≥ 2.5) and says so. **Faces alone do not identify a series.** The wave (a different direction, amplitude and pitch per slot), the outline hue and the legend do. A chart that must be read by colour alone should use the default palette.

## Tokens

`packages/tokens/scripts/viz.ts` (`PALETTES`, `paletteSlots`), pinned in `src/scales/viz.json` under `palettes`; `scripts/relief.ts` (`paletteScopeCss`, `paletteValues`) emits the scope CSS in `faun.css`; `dist/js` exports `vizPalettes` and `categorical(theme, palette)`; `dist/json/tokens.json` carries `vizPalettes`. Per slot, in scope: `--faun-dataviz-cat-N`, `-face`, `-face-op`, `-line`, `-shade`, `-tex`. New scalars: `--faun-relief-button-tex-alpha-soft`, `-neutral`, and the themed `--faun-relief-ink-lift`.

## Consequences

- Charts and buttons look more textured on every surface and zoom. Anything that screenshots them changes.
- A chart that picks a palette changes its stroke colours too (deep, hue-matched) and its relief faces (pastel). Charts that mix a palette with their own explicit `var(--faun-…)` colours get those colours as written.
- The palette selectors support the palette attribute on the same element as the theme, on an ancestor, or on a descendant of the theme element; `[data-faun-theme="system"]` follows the colour scheme.
- Adding a fourth option is an entry in `PALETTES`, a regenerate (`pnpm --filter @faun-ds/tokens viz`) and a build; the tests run over every entry.
