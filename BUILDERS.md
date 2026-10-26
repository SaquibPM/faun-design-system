# Faun builder spec

Every component in Faun is built to this spec. It applies to people and to coding agents. The exemplars are `packages/react/src/components/{Button,IconButton,Tooltip,Field,Input,Badge,Dialog,Spinner}`: read them before writing anything.

## Visual language

- Warm paper neutrals: surfaces sit on a warm gray canvas (light); dark themes use a warm near-black canvas with lifted surfaces.
- Brand is the **accent** scale (moss by default; tenants replace it). Never hard-code moss in components; use `--faun-accent-*` or the `accent.*` roles. Oxblood (the `ember` scale) is danger.
- IBM Plex Sans for UI and body text; IBM Plex Serif only for display (page titles, `type.figure-*`, tile and section headings); IBM Plex Mono for codes and identifiers.
- Radii by role: 4 xs (checkbox, inline code), 6 sm (menu items, tooltips, small controls), 9 md (buttons, inputs, selects), 14 lg (cards, panels, popovers), 20 xl (dialogs, sheets), full (badges, tags, avatars).
- Depth: soft shadows (`--faun-elevation-1…5`) plus a 1px subtle border on raised surfaces. Popovers and menus use elevation 3, sheets and toasts 4, dialogs 5.
- Motion: fast 120ms for colour and hover, moderate 200ms for popovers, slow 300ms for dialogs and sheets; enter easing on the way in, exit on the way out. Respect reduced motion (shared.css handles the global reduction).
- Density: anything with a control height uses `var(--faun-density-control-height)` (via component tokens) so compact, comfortable and spacious just work. Table rows use `--faun-density-row-height`.
- Sentence case everywhere. No all-caps labels, except chart category axis labels in relief (ADR 0006). No emoji.

## Files per component

```
packages/<pkg>/src/components/<Name>/
  <Name>.tsx            implementation (forwardRef, typed props with JSDoc on every prop)
  <Name>.css            styles, plain CSS, class `faun-<kebab-name>`, parts `faun-<name>-<part>`
  <Name>.test.tsx       vitest + Testing Library: roles, keyboard, ARIA, controlled/uncontrolled, axeViolations() = []
  <Name>.examples.tsx   named exports used by docs; MUST include `Thumbnail` (small, for the index card) and `Overview`
  <Name>.docs.mdx       docs page (see below)
  index.ts              re-exports public API with types
```

A folder may hold a family (e.g. `Menu/` exporting DropdownMenu, ContextMenu parts). Folder name = docs slug source.

## Implementation rules

- React 18 and 19: `forwardRef`, no `use()`; `"use client"` is added by the bundler.
- Behaviour from Radix primitives where one exists (dialog, popover, dropdown-menu, select, tabs, tooltip, checkbox, radio-group, switch, slider, toggle-group, accordion, collapsible, toast, scroll-area, avatar, progress). `cmdk` for command/combobox lists. `react-day-picker` v9 for calendars (style it fully with Faun CSS; do not import its stylesheet).
- Styling via `data-*` attributes (`data-variant`, `data-size`, `data-tone`, `data-state`), never via class name props. Variant mapping rules use `:where()` so state rules (`:hover`, `:disabled`, `[data-disabled]`) always win.
- CSS uses **Faun tokens only**: `var(--faun-…)`. No hex/rgb/hsl. No px values above 3 except 6px dots; use space/size/radius/component tokens. Private custom properties are `--_name`. The lint test (`test/css-lint.test.ts`) enforces this, including that every referenced token exists.
- Colours come from semantic roles: `bg.*`, `fg.*`, `border.*`, `focus.*`, the interaction matrix `accent|neutral|danger.{solid,soft,outline,ghost}-*`, `status.<tone>.*`, `ai.*`, `nav.*`, `dataviz.*`. Scale steps (`--faun-gray-a3`, `--faun-accent-9`) only when no role fits.
- Focus: `:focus-visible { outline: var(--faun-border-width-focus) solid var(--faun-focus-ring); outline-offset: 2px; }`. Text inputs use border colour + `box-shadow: 0 0 0 3px var(--faun-focus-halo)` instead.
- Form controls call `useFieldControl(props)` so they work inside `<Field>` (ids, aria-describedby, aria-invalid, required, disabled).
- Icons from `@faun-ds/icons` (named imports). Icon-only controls require a `label` prop that becomes `aria-label`.
- Status always icon + label. Use `StatusBadge` or `statusOf()` from `@faun-ds/tokens`.
- Overlays portal; z-index from `--faun-z-*`. Popover/menu content gets `faun-pop-in` animation and `data-state="closed"` exit.
- Forced colours: give bordered/filled controls a `@media (forced-colors: active)` fallback when the shape would vanish.
- Export every public part and its props type from `index.ts`.

## Docs page (`<Name>.docs.mdx`)

Start with `export const meta = { title, description, category, status: "stable" | "new" | "beta", components: [...prop table names], order }`.
Categories: Actions, Forms, Selection, Overlays, Navigation, Feedback, Display, Layout, Data, Charts, AI and agents.

Four sections, each wrapped in `<Section tab="usage|style|code|accessibility">`:
- **Usage**: `<Example of="Name/Overview" />`, When to use, When not to use (name the alternative component), key variants as `<Example>`s with titles and one-line descriptions, at least one `<DoDont>` pair (both sides rendered from examples), content/writing guidance.
- **Style**: anatomy, sizes/density, states, `<UsesTokens names={[...]}/>`, `<ComponentTokens name="..."/>` if it has component tokens.
- **Code**: notable usage examples with `code="open"` (controlled usage, composition), notes on behaviour. The page adds install + import + props tables automatically.
- **Accessibility**: `<Keys rows={[...]}/>` keyboard table, screen-reader behaviour, visual (contrast/focus/target size) notes.

Examples use realistic enterprise ESG content (CSRD, ESRS E1-6, Scope 1/2/3, tCO₂e, agents/Sub-agents/Tools, approvals, runs, evidence, factors). Never lorem ipsum. Example functions render self-contained; keep each under ~40 lines.

## Verify before calling it done

```bash
cd packages/<pkg>
node scripts/barrel.mjs
npx vitest run src/components/<Name> test/css-lint.test.ts      # all green, axe = []
npx tsc --noEmit -p . 2>&1 | grep 'components/<Name>'            # no errors in your files
cd ../../apps/docs && npx tsx scripts/props.ts && npx vite build --outDir /tmp/faun-docs-<you> --emptyOutDir
cd ../.. && node scripts/shoot.mjs --dist /tmp/faun-docs-<you> --out /tmp/shots-<you> --routes "/components/<slug>" --themes light,dark --widths 1440,390 --full
```

Open the screenshots and look at them. Fix anything clipped, misaligned, low-contrast, or that looks off-system. No console errors, no horizontal overflow.
