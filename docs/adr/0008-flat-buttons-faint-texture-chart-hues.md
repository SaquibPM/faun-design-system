# 0008 · Flat buttons, a faint texture, and a hue per chart type

> Note: this project was previously named Bloom; it is now Faun. See [ADR 0010](0010-rename-to-faun.md).

- Status: accepted
- Date: 2026-10-23
- Amends: [0006 · Relief visual language](0006-relief-visual-language.md) (buttons leave relief), [0007 · Visible texture and pastel palettes](0007-visible-texture-and-pastel-palettes.md) (supersedes its choice to make the texture visible; keeps its pastel rule)

## Context

Review findings on ADR 0006 and 0007: buttons should not have the 3D treatment; the texture (dark, high-contrast wavy lines on bar faces) was too strong and should be very subtle across all components, almost visible; and different components should use different hues.

ADR 0007 answered the finding that the texture was not visible by drawing the wave in the full series colour at alpha 0.85. On a 24% tint face that is a dark line on a pale ground: measured luminance spread inside a bar face was 34 to 47 (0 to 255) against 0 when flat. That swung too far.

## Decision

### 1. Buttons are flat

Solid, soft, outline and ghost buttons have no extruded edge, no relief outline and no texture. Solid and soft are a plain face (the intent colour, or its tint). Hover and pressed shift the face one step; pressed also moves it down half a pixel; the focus ring is unchanged; disabled is as before. IconButton, MenuButton, ComboButton and ButtonGroup are flat with it.

Removed from tokens: every `--faun-relief-button-*` token (depth, depth-sm, edge-mix, line-mix, tex-alpha, tex-alpha-soft, tex-alpha-neutral, the wave and its size), `--faun-relief-ink-lift`, and the compact-density thinning of the edge. `--faun-relief-ink` and `--faun-relief-ink-shade` stay: charts use the shade ink for their side face.

**Tests.** The button relief tests of ADR 0006 and 0007 (edge and texture present, press flattens the shadow, label contrast "with the texture at its darkest", the soft and solid alpha floors) are replaced by `Button.relief.test.tsx`, which asserts the opposite (no relief token, no edge, no `::before` texture, no offset shadow) and keeps hover, pressed and focus states. The label-contrast requirement is not lowered: with no texture the label sits on the bare face, and every `solid-fg` on `solid-bg` and `solid-bg-hover`, and `soft-fg` on the soft faces, remains a contrast pair in `contrast.ts` (4.5:1, 7:1 in high-contrast themes; the build fails otherwise). The e2e spec gains a check that solid and soft have no offset shadow and no texture.

### 2. The texture is a faint grain

- **Low alpha.** `--faun-dataviz-relief-tex-alpha` goes from 0.85 to **0.09**. The wave is still the series colour, laid over the tinted face, so it is a tone slightly away from the face: about a 6% step (WCAG luminance contrast between the face and the wave pixel 1.04 to 1.3:1 in the default palette), not a line.
- **Thinner stroke.** Every wave's `stroke` in `relief.json` is 70% of its ADR 0007 value (0.55 to 0.56 grid units, about 1.1 px rendered at scale 2). Tiles and pitch are unchanged, so the waves keep their different directions and the series stay separable by shape when someone looks closely.
- **Hatch fallbacks are untouched.** High-contrast themes, print and forced colours still set the alpha to 1 with surface-coloured lines over a solid fill. They remain clearly visible there. The area chart keeps its 0.7 multiplier.
- **The 3D of charts stays.** The thin dark outline and the extruded side of chart marks are unchanged, because the feedback was about button 3D and texture darkness. The face is a pastel tint (ADR 0007's rule: pastel face, deeper series colour, outline carries 3:1) with a barely visible wave.
- **Honest limit.** Texture is now nearly a decoration, not a second colour channel. It no longer separates series for someone who cannot see the face colours; the outline hue, the legend, tooltips and the data table do, as before. A chart that must be read without colour should use the high-contrast or print theme, where the pattern is a strong hatch.

**Changed tests.**

| Was | Now |
| --- | --- |
| `relief-texture.spec.ts`: bar face spread greater than 17; opacity at least 0.5 | spread between **1.5 and 8** (measured 3.1 to 4.4 at 1x and 2x, light and dark; 0 flat; ADR 0007 measured 34 to 47); opacity above 0.05 and at most 0.2 |
| (none) | `relief.test.ts`: alpha at most 0.2, stroke at most 0.6, and the wave pixel against the face between 1.02 and 1.35:1 for every categorical slot in light and dark (dark ochre is the high end at 1.32) |
| `dataviz.test.ts` and `contrast.ts`: wave token on face at least 1.7:1; wave token on surface at least 1.5:1 | unchanged. They now describe the wave's **source colour**, the ceiling the grain can never exceed, not the rendered pixel. No threshold was lowered |

The floor of 1.5 is the new minimum: a texture that falls below it is gone, which is a regression of its own.

### 3. A hue per chart type

"Different colours for different components" is read as: when a chart draws a single series, its default colour depends on the chart type, so a page of charts is not a page of moss. Status components were checked and already differ by tone (success, warning, danger, info, running lagoon, attention plum, neutral); no change.

| Chart | Single-series default |
| --- | --- |
| Bar | moss (`cat-1`), the brand anchor |
| Line, step, sparkline, histogram | lagoon (`cat-2`) |
| Scatter, bubble | ochre (`cat-3`) |
| Area | plum (`cat-4`) |
| Radar, box plot | blue (`cat-6`) |
| Gauge, bullet, meter | grass (`cat-7`) |
| Pie, donut, stacked, grouped, combo, multi-series anything | categorical in order, from `cat-1` |

Heatmap, treemap by value and circle pack by value take **their own sequential ramp hue**: lagoon (`seq-lagoon-1` to `7`), mauve from the plum scale (`seq-mauve-N`) and ochre (`seq-ochre-N`). The moss ramp (`seq-N`) stays the brand ramp for custom use.

- Defaults are token references (`cat-N`, `seq-<hue>-N`), never literals. They live in `CHART_DEFAULT_SLOT` and `CHART_DEFAULT_RAMP` (`ChartKit/scale.ts`). Palettes and tenants recolour them; an explicit `color` wins.
- **Moss stays series 1** with two or more series, in every chart and in every pastel palette (the default only applies to a lone, unstyled, non-scope series), and moss remains the brand anchor on the bar chart.
- The three ramps are generated like the moss ramp (`viz.ts`: seven lightness stops along the scale's own curve) and are held to the same tests: ordered by lightness, each step at least ΔE 8 from the next for normal vision, protan and deutan.
- Moss in the pastel palettes is unchanged; the single-series defaults of a palette are that palette's slot colours.

## Tokens

`relief.json` (button namespace, compact and button flat/hatch scalars removed; chart `tex-alpha` 0.09; stroke widths), `semantic/color.json` (`dataviz.seq-lagoon-1` to `seq-ochre-7`, 21 tokens), `scripts/viz.ts` (`SEQ_HUES`, `sequential`), `src/scales/viz.json` regenerated.

## Consequences

- Anything that screenshots buttons or charts changes. Button CSS loses its pseudo-element.
- Single-series charts change colour (line, area, scatter, histogram, box plot, radar, gauge, bullet, meter, sparkline, heatmap, treemap, circle pack by value). Consumers who relied on moss pass `color="cat-1"`.
- `--faun-relief-button-*` is removed. It shipped in the same unreleased minor as ADR 0006, so this is not a breaking change for a released API.
