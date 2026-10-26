# @faun-ds/grid

> **Status: pre-1.0 (0.1.0).** APIs can change in minor releases. Verified in Chromium only (Firefox and Safari untested). Forced colours are covered by CSS tests, not a real session. No manual screen-reader pass. Many component states have not been reviewed by eye. ESM only. [What is tested and what is not](https://github.com/SaquibPM/faun-design-system/blob/main/docs/STATUS.md)

Faun's layout grid: a responsive CSS grid with 4, 8 and 12 columns, plus React `Grid` and `Column` components. Columns, gutters, margins and the content maximum come from the `grid.*` and `breakpoint.*` tokens in `@faun-ds/tokens`, so the stylesheet is generated from them.

| Breakpoint | Min width | Columns | Gutter (wide) | Gutter (narrow) | Margin |
| --- | --- | --- | --- | --- | --- |
| base | 0 | 4 | 16px | 8px | 16px |
| sm | 640px | 4 | 16px | 8px | 16px |
| md | 768px | 8 | 16px | 8px | 24px |
| lg | 1024px | 12 | 24px | 12px | 24px |
| xl | 1280px | 12 | 24px | 12px | 32px |
| 2xl | 1536px | 12 | 24px | 12px | 32px, content centred up to 1440px |

Condensed mode uses a 1px gutter at every breakpoint.

## Install

```bash
npm install @faun-ds/grid @faun-ds/tokens
```

```ts
import "@faun-ds/tokens/css";
import "@faun-ds/grid/styles.css";
```

## Use

```tsx
import { Column, Grid } from "@faun-ds/grid";

<Grid>
  <Column md={8} lg={9}>Emissions by scope</Column>
  <Column md={8} lg={3}>Filing status</Column>
  <Column lg={{ span: 6, offset: 3 }}>Centred on large screens</Column>
</Grid>
```

Spans are mobile first: `span` applies below 640px, and each of `sm`, `md`, `lg`, `xl`, `xxl` (the 2xl breakpoint) applies from its width upward until a larger one sets its own. A column with no span fills the row. A span larger than the columns at a breakpoint fills the row, so `span={12}` is safe on mobile.

### Props

`Grid`: `mode` (`"wide"` default, `"narrow"`, `"condensed"`), `flush` (drop the page margin and maximum width, for a grid inside a card or column), `as` (`div`, `section`, `main`, `article`, `aside`, `header`, `footer`, `nav`, `ul`, `ol`).

`Column`: `span` (1 to 12 or `"full"`), `offset` (0 to 11), `sm`, `md`, `lg`, `xl`, `xxl` (a span or `{ span, offset }`), `as` (adds `li`).

An offset with no span at or below its breakpoint also gets a span of the remaining columns, so it cannot push the column past the row. Invalid values are ignored with a development warning.

### Nesting and semantics

Nest a `Grid flush` inside a `Column` to subdivide it; the inner grid counts its own columns. Use `Grid as="ul"` with `Column as="li"` for lists of cards. The grid is layout only: it adds no roles and no landmarks.

### Without React

The stylesheet works on plain markup:

```html
<div class="faun-grid" data-mode="narrow">
  <div class="faun-column" data-span-md="4" data-span-lg="3">…</div>
</div>
```

Attributes are `data-span-<bp>` and `data-offset-<bp>` with `bp` one of `base`, `sm`, `md`, `lg`, `xl`, `2xl`.

### Overriding

Override `--faun-grid-gutter-<bp>` and `--faun-grid-margin-<bp>` on any element. Breakpoint widths are baked into the media queries when the stylesheet is generated; change them in the tokens and rebuild.

## Use with layout primitives

Use the grid for page structure. For siblings inside a column use `Stack` and `Inline` from `@faun-ds/react` with gap tokens.
