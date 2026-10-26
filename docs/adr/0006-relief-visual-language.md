# 0006 · Relief visual language

> Note: this project was previously named Bloom; it is now Faun. See [ADR 0010](0010-rename-to-faun.md).

- Status: accepted
- Date: 2026-10-22
- Amended by: [0008 · Flat buttons, a faint texture, and a hue per chart type](0008-flat-buttons-faint-texture-chart-hues.md) (buttons are flat; texture is a faint grain), [0007 · Visible texture and pastel palettes](0007-visible-texture-and-pastel-palettes.md) (wave size and colour, button texture alpha cap replaced by label-contrast tests, pastel palettes)

## Context

Faun's charts and call-to-action buttons were flat: solid fills, a hairline separator, a soft shadow on solid buttons. The product direction is a more tactile, recognisable look for the two surfaces people read and press most: a shallow, printed-block "relief" in which a mark has a light tinted face filled with a fine wavy line texture, a thin dark outline and a darker extruded side. The reference for the shape language is a four-bar chart with mono value labels, uppercase letter-spaced axis labels and hairline gridlines that fade at the ends. Its colours are not Faun's. Faun keeps its own identity (ADR 0004): moss brand, oxblood danger, the categorical data-viz ramp and warm paper neutrals.

## Decision

Faun adopts **relief** as the default look of charts and of the solid and soft buttons, and keeps a flat look available everywhere.

### Principles

1. **A shallow block, not a 3D chart.** Depth is a few pixels (charts 6, thin marks 3, buttons 3 or 2), toward the bottom right. The side face carries a small slanted cap. Marks never rotate, perspective is never applied, and the footprint a mark covers is the same in relief and flat, so layout, labels and tooltips do not move.
2. **Texture is a second channel.** Each series slot wears its own wave (direction, amplitude and frequency differ), so series separate without colour. Legend swatches and tooltip keys use the same small relief block.
3. **Colour is derived, never written.** The face is the series colour washed with paper (a tint). The outline, side face and wave lines are `color-mix` derivations of the series colour, defined in tokens per slot and per theme (`--faun-dataviz-<slot>-line`, `-shade`, `-tex`). Textures are SVG tiles used as `mask-image`, with no colour in the tile. A change to the data-viz palette flows through on the next token build.
4. **Chrome stays quiet.** Value labels are in the mono face above marks. Category axis labels are uppercase and letter-spaced (an exception to the sentence-case rule, limited to chart category labels). Gridlines are hairlines that fade at both ends. Tooltips, the keyboard model and the visually hidden data table are unchanged.
5. **One switch.** Charts take `appearance="relief" | "flat"` (default `relief`). `data-appearance="flat"` on any ancestor flattens charts and buttons beneath it, because the scalar tokens (depth, bevel, face wash, texture strength) are plain custom properties that any scope can override.

### Where it applies

- **Charts:** simple, grouped, stacked, floating, diverging and combo bars, histogram bins, lollipop heads, boxplot boxes, bullet bars, meter and gauge fills (blocks with a texture); treemap tiles, circle-pack leaves, pie and donut slices (textured, outlined, slightly extruded on pie and donut); area fills (wave hatch under a crisp top line). Heatmap cells and sankey nodes stay flat with a hairline outline: their colour is a value scale and texture would add noise.
- **Buttons:** `Button`, and through it `IconButton`, `MenuButton`, `ComboButton` and `ButtonGroup`. Solid is the intent face with a very low-alpha wave, a thin dark outline and an extruded darker edge. Soft is the tint face with the wave, outline and edge. Outline and ghost stay light: no extrusion, no texture. Danger uses the oxblood scale. Pressed moves the face into its edge and flattens the shadow; focus rings are unchanged.

### Where it does not apply

- **Dense tables and text stay flat.** `DataTable`, `DataQualityCell`, `JsonViewer`, forms, menus, cards, dialogs and every text surface keep the flat language. Relief is for marks and call-to-action controls, never for rows, cells or reading text.
- Sparklines, line and scatter marks, radar polygons, word clouds and trees are strokes or glyphs and stay as they are.
- Only one `solid accent` button per view (AGENTS.md) still holds: relief makes it louder, not more numerous.

### Accessibility rules

- **Texture adds a non-colour channel.** Every slot has a distinct wave; texture never replaces the tooltip, the table fallback or the status icon and label.
- **Outline contrast.** Every outline is at least 3:1 against the chart surface in every theme (WCAG 1.4.11), tested for all categorical, scope, sequential, diverging and status slots. The face is a tint and is not relied on for boundary contrast; the outline and the texture identify the mark.
- **Label contrast is unchanged.** Axis, tick, value and legend text use the same foreground roles as before. On buttons, the label meets 4.5:1 against the face **including the texture at its darkest** (7:1 in high-contrast themes), for every intent, state (rest, hover, active) and theme; the test computes this from tokens.
- **Fallback is flat.** High-contrast themes, print and `forced-colors` draw solid fills with a distinct hatch per series (surface-coloured wave lines over a solid face), no extrusion and no texture on buttons. This is done in tokens (`light-hc`, `dark-hc`, `print`, `@media print`, `@media (forced-colors: active)`), so chart geometry follows (depth reads 0).
- **Motion.** Relief adds no entrance animation. Pressed-state movement on buttons uses the existing fast duration and is removed under reduced motion by the existing global rule.
- **Disabled and loading.** Disabled buttons are flat with no texture. Loading keeps the relief and the spinner.

### Tokens

`packages/tokens/src/foundations/relief.json` (generator: `scripts/relief.ts`): chart scalars `--faun-dataviz-relief-{depth,depth-sm,bevel,outline-width,face-mix,tex-alpha}`; eight wave textures `--faun-dataviz-relief-wave-1…8` with `-size`; button scalars `--faun-relief-button-{depth,depth-sm,edge-mix,line-mix,tex-alpha}` and `--faun-relief-button-wave` with `-size`; themed inks `--faun-relief-ink` and `--faun-relief-ink-shade`; derived per-slot colours; `--faun-dataviz-cell-line`. Compact density thins the button edge.

## Consequences

- Charts and buttons look different from earlier releases. `appearance="flat"` restores the earlier look for charts; `data-appearance="flat"` does so for both.
- A relief mark is a group of four to five SVG elements instead of one. The semantic element (class and series fill) is kept, so tests and tooling that look for marks still find them.
- Texture uses CSS `mask-image` on SVG shapes. Browsers without it show the tinted face with its outline and side, which still reads as a block.
- The data-viz palette is owned elsewhere; relief only consumes it. The outline contrast test is the guard if a re-derived palette ever produces a pale slot.
- The BUILDERS "no all-caps labels" rule gains one exception (chart category axis labels in relief).
