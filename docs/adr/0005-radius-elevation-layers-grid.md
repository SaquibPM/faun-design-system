# 0005 · Radius and elevation verified; layers, grid and F1 completeness

> Note: this project was previously named Bloom; it is now Faun. See [ADR 0010](0010-rename-to-faun.md).

- Status: accepted
- Date: 2026-10-22

## Context

PLAN F1 asks for radius and elevation to be checked against component usage, layer tokens, a grid package and a complete token set. Evidence available in this repository:

- Audit findings on products without a radius or elevation scale: a dozen radius variants used for the same element types, and ad hoc shadows (`shadow`, `-sm`, `-lg`, `-xl` plus inline `rgba` values).
- PLAN: "rounded-lg cards, light shadows only on floating layers".
- BUILDERS.md role table (xs 4, sm 6, md 9, lg 14, xl 20, full) and elevation roles (popovers and menus 3, sheets and toasts 4, dialogs 5).
- The component CSS in `packages/{react,data,ai}` (token references counted 22 Oct 2026).

This ADR checks Faun's values against the written roles and against how components use them.

## Findings

Radius use across components: `full` 33, `sm` 29, `md` 18, `xs` 13, `lg` 9, `xl` 2. The roles hold: `lg` is cards, banners, radio cards and tab panels; `md` buttons and inputs; `xl` sheets and dialogs. The scale is ordered (none < xs < sm < md < lg < xl < full) and has seven stops where audited products had a dozen or more.

Elevation use: `1` 13, `2` 7, `3` 10, `4` 3, `5` 2. Levels 3 to 5 sit only on floating layers (menus, popovers, tooltips, sheets, toasts, dialogs). Level 1 on controls is a 1px ambient shadow with an inset highlight, an edge rather than a lift; level 2 is on Card only. PLAN's "light shadows only on floating layers" is read as "no lift on in-flow content": cards carry level 2 plus a subtle border, which is the one in-flow exception and is retained because it is Faun's card language.

Note: Faun's `rounded-lg` is 14px, not 12px. The adoption guide states this value.

## Decision

1. **No radius or elevation value changes.** Nothing is clearly mismatched: the values match the written roles and component usage, and changing them would move every card and dialog without evidence. Tests now pin the role radii (4/6/9/14/20), the ordering of the radius scale and monotonic growth of elevation 1 to 5.
2. **Layer tokens** `layer.background`, `layer.01`, `layer.02`, `layer.03`, `layer.accent`, `layer.hover`, `layer.selected` are aliases of existing bg roles (`canvas`, `surface`, `surface-nested`, `sunken`, `brand-soft`, `hover`, `selected`). They are emitted as `var(--faun-bg-…)`, so theme and tenant overrides of the role flow through, and they are in the Tailwind preset (`bg-layer-01`). A product's own bridge can map its legacy surface variables through them. Contrast pairs for default, muted, placeholder, brand and link text, control borders and the focus ring are tested on every layer in all five themes.
   - **layer-03** is `bg.sunken`, not a further lift. On warm paper a third nesting step reads as an inset well; stacking deeper than three layers is discouraged.
3. **Grid tokens** (`grid.columns|gutter|gutter-narrow|gutter-condensed|margin|max-width`) hold the values from the Grid foundations page: 4/8/12 columns, gutters 16/16/24/24/24 at sm 640, md 768, lg 1024, xl 1280, 2xl 1536 (`base` below sm). `@faun-ds/grid` is generated from these tokens.
4. **Spacing** gains `space.40` (160px).

## F1 completeness: decisions where a Carbon-style category is not literally present

| PLAN F1 item | Status |
| --- | --- |
| background, layer-01..03, layer-accent | Present as `layer.*` (above). |
| field-01..03 | Not added. Inputs sit on `bg.surface` and are bounded by `border.control` (3:1), not by a fill that changes per layer, so a per-layer field fill would not be used. |
| border-subtle-01..03 | Not added. `border.subtle` is translucent, so one token reads correctly on every layer. `border.strong` and `border.control` exist. |
| text-primary/secondary/placeholder/helper/error/on-color/inverse | Present as `fg.default`, `fg.muted`, `fg.placeholder`, `fg.muted` (helper), `status.danger.fg`, `fg.on-accent`, `fg.inverse`. |
| icon-* | Not added. Icons are `currentColor` and take `fg.*` roles; separate icon colours would only duplicate them. |
| link-*, support-*, focus, highlight, overlay | `fg.link`/`fg.link-hover`, `status.<tone>.*`, `focus.ring`/`focus.halo`, `bg.selected`, `bg.scrim`. |
| Type: fluid display sizes by breakpoint | Not implemented (decision: deferred). Roles are fixed px because the Tailwind preset, `base.css` and the 11px/12px floor test read plain sizes; `clamp()` values would break them. Display roles are used at fixed sizes and stepped by layout. Revisit with F3 (Typography). The IBM Plex Serif display set is the `figure-*` roles; page titles remain IBM Plex Sans per the current roles. |
| Spacing: 2x mini-unit scale 2…160 | Faun keeps its 4px base with half steps (2…160 now covered). An 8px mini-unit would drop 4/12/20/28px steps components use. |
| Grid: 16-column, sm 320 / md 672 / lg 1056 / xlg 1312 / max 1584 | Superseded by the Grid foundations page: 12 columns collapsing to 8 and 4 at Faun's Tailwind-aligned breakpoints. PLAN item 5 should be read that way. |
| Motion: productive and expressive durations and curves | Faun expresses the same split as roles: `standard`/`enter`/`exit` easings with `fast`/`moderate`/`slow` are productive; `emphasized`, `deliberate` and the `spring.*` curves are expressive. No second set of names. |
| Themes light, dark, light-hc, dark-hc, print | Present. |

## Consequences

- `test/layers-and-completeness.test.ts` fails if a listed category disappears or if this ADR stops recording a deviation.
- `test/tokens.test.ts` fails if a Tailwind preset value references a token that does not exist.
