# Component parity with Carbon

Audit date: 22 October 2026. Read-only analysis; nothing was built for the audit itself. Machine-readable copy: [carbon-parity.json](carbon-parity.json).

Carbon is the structural reference for completeness only ([ROADMAP.md](../ROADMAP.md), "Identity"). This audit asks one question: for every component and pattern Carbon documents, can a product team build the same thing with Faun, and what is missing.

## Summary

| | Covered | Partial | Missing | Total |
| --- | --- | --- | --- | --- |
| Components (63 rows) | 50 | 6 | 7 | 63 |
| Patterns (21 rows) | 8 | 10 | 3 | 21 |
| **Components and patterns** | **58** | **16** | **10** | **84** |
| Data table variants (table 1b, counted separately) | 16 | 1 | 2 | 19 |

Reading the numbers:

- Faun is strongest where it was designed for agent-driven reporting work: data table (virtualisation, resize, column menu, server paging), toasts, approvals, provenance and run trails. These exceed Carbon and are listed in section 3.
- Faun is weakest at the small connective pieces every product needs on day one: read-only and warning states on form controls, password input, inline loading, overflow menu and menu button, truncation, a table toolbar with search, and nested side navigation.
- Most "Partial" rows are one missing variant, not a missing component. Closing the P0 set is mostly S-sized work.

### Top P0 gaps (needed by any product)

- **Data table** (C11, Partial, effort L): no single-select rows, no toolbar slot with search, only three row sizes, no zebra or expand-all.
- **Inline loading** (C16, Missing, effort S): States inactive, active, finished, error with a text label ("Saving..." to "Saved"), auto-reset after about 1.5 s, success callback, polite live-region announcement.
- **Menu buttons** (C21, Partial, effort S): No `MenuButton` (button with chevron and menu in one) and no `ComboButton` (primary action plus chevron menu); no size tie-in between trigger and item height.
- **Overflow menu** (C22, Partial, effort S): No `OverflowMenu` (ghost "more" icon button with a fixed accessible label, flip-aware), no hover-reveal in table rows with persistent display on touch, no table-row helper.
- **Text input** (C39, Partial, effort M): No warn, no password toggle, no inline label, no fluid, no character counter on the single-line input, no skeleton, no AI label.
- **Password input†** (C40, Missing, effort S): Show/hide toggle (pressed state, accessible name), requirement helper text, autocomplete hints (`current-password`, `new-password`).
- **UI shell: side nav** (C50, Partial, effort M): Items are flat links: no expandable groups or second tier.
- **Disabled states (disabled, read-only, hidden)** (P03, Partial, effort S): Disabled is documented; read-only and hidden-by-permission rules are not, and read-only is implemented on only two controls.
- **Read-only inputs** (P12, Partial, effort M): Styled read-only exists on two of the 13 control families (Input, NumberField); Textarea, Select, Combobox, MultiSelect, DatePicker, Checkbox, Radio, Switch, Slider have none.
- **Overflow content (truncation, show more, ellipsis menu)†** (P16, Missing, effort M): No `Truncate` (end, middle, front), no `ShowMore`/load-more, no rule for tooltips on truncated text.

Data table P0 variants (table 1b): V08 search in the table toolbar (M), V09 toolbar slot with actions (M), V14 row overflow menu (S).

### Top P1 gaps (expected by enterprise; component rows that are Partial or Missing, pattern rows are in 1c)

- **AI label** (C02, Partial, effort M): no AILabel, explainability popover, revert control or AI-presence styling on fields.
- **Code snippet** (C07, Missing, effort M): Inline, single-line (horizontal scroll) and multi-line (show more/less, scroll after ~9 lines) snippets; copy with live "Copied" confirmation; wrap option; on-layer background.
- **Combo box** (C08, Partial, effort M): trigger is a button, so no typing in the field and no custom values.
- **Contained list** (C09, Missing, effort M): On-page and disclosed lists with header (title, search, action), row sizes 32-64, inline row actions, optional sticky header, dividers.
- **Date picker** (C12, Partial, effort M): Trigger is a button; no typed or masked text entry, no simple text-only variant, no time picker, no warn/read-only/fluid/skeleton.
- **Form** (C15, Partial, effort M): no Form anatomy, error summary component, multistep or fluid form.
- **Loading** (C19, Partial, effort S): No full-screen or container overlay with inert background, no overlay-with-spinner for a region, no documented thresholds (spinner vs skeleton vs progress).
- **Notification panel†** (C26, Missing, effort M): Chronological list grouped by time/source/urgency, read state, preferences link, unread dot on trigger, works alongside toasts.
- **Progress bar** (C30, Partial, effort S): No status prop: no success/error state with icon and required helper text (tone is colour-only, against Faun's own icon-plus-label rule); no inline/indent label alignment.
- **Tag** (C38, Partial, effort M): no operational tag, hue palette, lg size, truncation tooltip, disabled or skeleton.
- **Tile (base, clickable, selectable, expandable)** (C42, Partial, effort M): no selectable (radio or check) or expandable tile, no disabled state.
- **Time picker** (C43, Missing, effort M): Hour/minute entry with 12/24 h, AM/PM and time-zone selects, validation.
- **Toggletip** (C45, Partial, effort S): No `Toggletip`: info icon button that opens a small popover on click/Enter/Space, may hold actions, Escape closes, content announced politely.
- **Definition tooltip** (C47, Missing, effort S): Dotted-underline term whose definition opens on hover, focus or click.
- **UI shell: header** (C49, Partial, effort M): No header navigation links with dropdown sub-menus, no defined utilities order (search left, switcher right), no unread badge slot on header icons.
- **UI shell: header panel** (C51, Missing, effort M): Right panel anchored to a header icon, one open at a time, outlined trigger, closes on item select or trigger press.
- **UI shell: switcher** (C52, Partial, effort M): No switcher panel: recent/frequent/all products, dividers, far-right placement rule.
- **Shape indicator** (C55, Partial, effort S): Only a round dot, so meaning rests on colour; Carbon varies the shape and outlines light tones.
- **Notification badge (count, dot)** (C56, Partial, effort S): No badge overlay for `IconButton` (header and toolbar icons); no overflow cap rule (99+).
- **Copy button†** (C61, Missing, effort S): Icon button with "Copied" feedback and live-region announcement; shared by snippets, IDs and tables.
- **Toolbar†** (C62, Missing, effort M): `role="toolbar"` container with roving tabindex, arrow-key movement, overflow into a menu.

## Build progress

- **Batch 1 (22 Oct 2026): done.** Form state contract (`warn`, `readOnly`, `skeleton` on all 13 control families through `Field` and `useFieldControl`), `Input` password toggle, counter, inline and fluid layouts, `InlineLoading`, `OverflowMenu`, `MenuButton`, `ComboButton`, `ButtonGroup`, `Truncate`, `ShowMore`, and the `Button` gaps (xs and xl, wrapping labels, success and error outcome). Counts above and the rows marked **Batch 1** reflect it. The skeleton flag is named `skeleton`, not `loading`, because `loading` already means "fetching options" on three controls. Truncate and ShowMore were pulled forward from batch 2 item 5.

- **Batch 2 (22 Oct 2026): done for the data table, selection and time items.** `DataTable` single select, toolbar slot (`DataTableToolbar`, row-height menu), five row sizes, zebra, sticky first column and `DataTableRowActions`; `Combobox` as a typed field with opt-in custom values; typed, masked and validated `DatePicker` and `DateRangePicker` (the old trigger stays as `entry="button"`) and a new `TimePicker`; the tile family (`ClickableTile`, `SelectableTile`, `TileGroup`, `ExpandableTile`); `ProgressBar` status states with an announcement contract and `Stepper` disabled steps and visible status; toasts with an action no longer auto-dismiss. Not in this pass (still open from the batch 2 table): the `Toolbar` primitive with roving focus and overflow (item 1) and `Tag` upgrades (item 6). Counts above reflect the rows marked **Batch 2**.
- **Batch 3 and 4 (22 Oct 2026): done for overlays, app shell, AI and Tag/Toolbar.** Dialog xs, passive, danger and scrolling body; Popover caret and inverse; `Toggletip`, `DefinitionTooltip`; Banner contrast, timestamp and action; `NotificationPanel` family; `SkipLink`, `HeaderNav`, header actions, `HeaderPanel`, `SwitcherPanel`, SideNav second tier; `AILabel`, `AISlot`, `AIFeedback`, AI chat; Tag upgrades and `TagGroup`; `Toolbar`; patterns Login, Saving and editing, Search results with filters, Form page. Rows marked **Batch 3**.
- **Chat panels (22 Oct 2026): Faun-led, no Carbon equivalent.** `ProgressPanel`, `ArtifactPanel` and `ChatLayout` in `@faun-ds/ai`, with docs pages in Components and the Patterns index at `/patterns`; patterns Assistant home (renamed from Home with assistant) and Chat with panels. Extends P20 (chat) with the panels around the thread.

## How to read this

**Status.** Covered: every core variant and state Carbon documents for the component exists in Faun's source; remaining gaps are secondary. Partial: a distinct Carbon variant, a core state class, or a required behaviour is absent. Missing: no equivalent in the library.

**Priority** applies to closing the gap. P0: needed by any product. P1: expected by enterprise buyers. P2: nice to have. For Covered rows it is the priority of the residual gaps.

**Effort** includes the full BUILDERS.md deliverable (component, CSS on tokens only, tests with `axeViolations() = []`, examples with `Thumbnail` and `Overview`, docs page with four tabs). S: under 2 days. M: 2 to 5 days. L: over 5 days or cross-cutting.

**Evidence.** Each Faun judgement comes from opening the component source (`packages/react/src/components/*`, `packages/data/src/components/*`, `packages/ai/src/components/*`, `packages/grid/src`) and, for states, its `.css`. Docs claims were not trusted over code. Pattern judgements come from `apps/docs/src/pages/patterns/*.tsx` and `apps/docs/src/pages/foundations/*.tsx`.

**Carbon sources.** Component usage pages, the components overview list (41 components), the patterns overview list (14 universal patterns) and pattern pages were fetched from carbondesignsystem.com. Rows marked with a dagger (†) rely on Carbon's published catalogue as named in the brief because the page could not be retrieved (listed in the appendix). Their gap text describes the commonly documented behaviour and should be re-checked against the live page before building.

**Out of scope here.** Charts (tracked in [carbon-chart-parity.md](carbon-chart-parity.md)), icons, colour, type, motion (Foundations F3), and Carbon for IBM Products components other than the side panel and tearsheet row (C63), which is included because it completes the overlay family.

## 1. Matrix

### 1a. Components

| ID | Carbon | Faun equivalent | Status | Gaps | Priority | Effort |
| --- | --- | --- | --- | --- | --- | --- |
| C01 | Accordion | `Accordion`, `AccordionItem/Trigger/Content`, `Collapsible` | Covered | No flush alignment (zero inline padding for side panels); heading level fixed at h3 (Radix Header), no `level` prop; no start-side chevron. Extras: icon, description, meta, separated variant. | P2 | S |
| C02 | AI label | None as a component. Neighbours: `ActorChip`, `ConfidenceBadge`, `StreamingText appearance="draft"`, `CitationMarker` | Covered | No `AILabel` (default 16-64 px and inline sizes), no explainability popover (overview, details, artefacts, actions), no revert-to-AI-value control, no AI-presence styling hook on Input, Select, Textarea, Tag, Card or table cells. `ai.*` colour roles exist in tokens but nothing consumes them as a label. **Batch 3 (22 Oct 2026): AILabel (`@faun-ds/ai`): label or icon, agent and model, summary, confidence, sources and revert in one explainability popover; `AISlot` gives fields, tiles and text areas the suggested/accepted/edited treatment. Still open: AI presence on table cells and Tag.** | P1 | M |
| C03 | Aspect ratio† | None | Missing | Fixed-ratio media/chart/tile wrapper (16:9, 4:3, 1:1 and inverses). Today consumers set `aspect-ratio` by hand. | P2 | S |
| C04 | Breadcrumb | `Breadcrumbs` | Covered | No size prop (Carbon sm/md); no explicit mobile rule (collapse to one crumb); long labels rely on CSS ellipsis plus `title`. Overflow menu (first + last two) and `renderLink` router hook are present. | P2 | S |
| C05 | Button | `Button`, `IconButton` | Covered | Sizes: only sm 28 / md 32 / lg 40 exposed; xs (24) and xl (48) tokens exist but no prop value; no 2xl. No `ButtonGroup`/button set. `loading` has no finished/error outcome. Label is `white-space: nowrap` (Carbon wraps to a second line). Danger is not blocked from icon-only use. See section 2. **Batch 1 (22 Oct 2026): `xs` (24) and `xl` (48) sizes, `wrap` for long labels, `status` success/error with `statusLabel`, `ButtonGroup` (set, joined, equal, stacked), icon-only `danger` removed from the `IconButton` type. Still open: no 2xl, no fluid joined set with 1px separator across a form.** | P1 | S |
| C06 | Checkbox | `Checkbox`, `CheckboxGroup` | Covered | No read-only and no warning state (invalid only); sizes sm/md only; no AI variant. Group has legend, description, error, horizontal, select-all with indeterminate. **Batch 1: `warn` message on `CheckboxGroup` and via `Field`, `readOnly` (value kept, `aria-readonly`), `skeleton`. Still open: AI variant.** | P1 | S |
| C07 | Code snippet | None in the library (a docs-only `CodeBlock` lives in apps/docs; `JsonViewer` has copy) | Missing | Inline, single-line (horizontal scroll) and multi-line (show more/less, scroll after ~9 lines) snippets; copy with live "Copied" confirmation; wrap option; on-layer background. | P1 | M |
|  C08 | Combo box | `Combobox` (typed input with listbox popup) | Covered | The control is a button that opens a search panel, not an editable input: no typing in the field, no inline autocomplete, no custom value committed on blur/Enter, no multi-token entry. No warn/read-only/fluid. Present: async `onSearchChange`, `loading`, groups, clear button, empty message. **Batch 2 (22 Oct 2026): a real typed field: `input role="combobox"` with `aria-expanded`, `aria-controls`, `aria-autocomplete` and `aria-activedescendant`, local filter on label, description and keywords, clear, chevron toggle, polite result count, `allowCustomValue` (opt in; commit on Enter, blur or the Use row; `customValueLabel`), same props as before (`searchPlaceholder` now ignored, ref is the input). Still open: inline autocomplete, multi-token entry.** | P1 | M  |
| C09 | Contained list | None | Missing | On-page and disclosed lists with header (title, search, action), row sizes 32-64, inline row actions, optional sticky header, dividers. `Listbox` is internal only. | P1 | M |
| C10 | Content switcher | `SegmentedControl`; `Tabs variant="segmented"` | Covered | No high/low contrast pair; selection is activation-only (no auto vs manual choice). Sizes sm/md/lg, icon-only with `aria-label`, disabled per item and whole group are present. | P2 | S |
|  C11 | Data table | `DataTable` (@faun-ds/data), `Pagination`, `FilterBar` | Covered | Strong core (sorting, selection, expansion, batch bar, server paging, sticky, resize, column menu, virtualisation). Missing distinct Carbon variants: single-select (radio), built-in toolbar with search and action slot, five row sizes (Faun has three densities), zebra, expand-all, row overflow integration, inline editing, AI presence. Variant breakdown in table 1b. **Batch 2 (22 Oct 2026): single select (`selectionMode="single"`, radio), `toolbar` slot with `DataTableToolbar` (search, filters, actions) that the selection bar replaces while rows are selected, five row sizes (`rowSize` xs 24 to xl 64, `rowSizeMenu`), `zebra`, `stickyFirstColumn`, and `DataTableRowActions`. Still open: expand-all, inline editing, AI presence.** | P0 | L  |
|  C12 | Date picker | `DatePicker`, `DateRangePicker`, `Calendar` (typed by default; `entry="button"` keeps the trigger) | Covered | Trigger is a button; no typed or masked text entry, no simple text-only variant, no time picker, no warn/read-only/fluid/skeleton. Present: single and range, presets with fiscal year, min/max, disabled dates, clear, locale, week start, arrow-key grid. **Batch 2 (22 Oct 2026): typed entry with a format mask (`inputFormat`: dd/MM/yyyy, MM/dd/yyyy, yyyy-MM-dd), validation in words (not a real date, before min, after max, disabled) with `aria-invalid`, `onValidate`, calendar button and Alt+Down; range has start and end fields in one box; time picker is C43. Still open: time-zone select, fluid layout check, locale-driven default format.** | P1 | M  |
| C13 | Dropdown | `Select` (Radix); `Combobox`; `MultiSelect` | Covered | No inline variant, no warn, no read-only, no fluid. Sizes follow 28/32/40 (Carbon 32/40/48). Groups, descriptions, icons, scroll buttons and keyboard type-ahead are present. **Batch 1: `warn`, `readOnly` (focusable, does not open, `aria-readonly`), `skeleton` on Select, Combobox and MultiSelect via the shared state contract; `Field variant="fluid"` styles the trigger. Still open: inline label inside the control, typed entry.** | P1 | S |
| C14 | File uploader | `FileUpload` | Covered | Drop-zone only: no button-only variant (Carbon's default). Per-file queued/uploading/done/error with progress bar, retry and remove are present, plus type, size and count validation. Visible focus on the hidden input is handled (`:has(input:focus-visible)`). | P2 | S |
| C15 | Form | `Field`, `Fieldset`, `TextField`; pattern "Settings form" | Partial | No `Form` anatomy component (header, body, footer, spacing), no form-level error summary component (the pattern composes `Banner`), no multistep/wizard form, no fluid form, no column grid helper. Required and optional markers are both supported. Validation timing differs on purpose (on submit, then live). | P1 | M |
| C16 | Inline loading | None (`Spinner`; `Button loading`) | Covered | States inactive, active, finished, error with a text label ("Saving..." to "Saved"), auto-reset after about 1.5 s, success callback, polite live-region announcement. **Batch 1: `InlineLoading` (inactive, active, finished, error; description text; `successDelay` default 1500 ms; `onSuccess`; polite live region, assertive for error).** | P0 | S |
| C17 | Link | `Link` | Covered | No visited colour; disabled only through `aria-disabled` styling (no `disabled` prop); no sizes (inherits text); no leading/trailing icon slot except the external icon. Inline vs standalone is covered by `underline="always" / "hover"`. | P2 | S |
| C18 | List† | None | Missing | Ordered/unordered lists with nested levels and the dash/square/number/letter markers; productive and expressive sizes. | P2 | S |
| C19 | Loading | `Spinner` (5 sizes), `Skeleton`, `SkeletonRows`, `Button loading`, `DataTable loading` | Partial | No full-screen or container overlay with inert background, no overlay-with-spinner for a region, no documented thresholds (spinner vs skeleton vs progress). Spinner has no determinate form (use `ProgressCircle`). | P1 | S |
| C20 | Menu | `DropdownMenu*`, `ContextMenu*` | Covered | No size scale matching trigger height (xs-lg); no item-count guard. Present: groups, separators, labels, submenus, checkbox and radio items, danger intent, shortcut hints, descriptions, context menu, type-ahead, matchTriggerWidth. | P2 | S |
| C21 | Menu buttons | Compose `DropdownMenuTrigger` + `Button` | Covered | No `MenuButton` (button with chevron and menu in one) and no `ComboButton` (primary action plus chevron menu); no size tie-in between trigger and item height. **Batch 1: `MenuButton` and `ComboButton` (primary action plus chevron menu, named chevron); `DropdownMenuContent size` ties item height to the trigger size.** | P0 | S |
|  C22 | Overflow menu | Compose `IconButton` + `DropdownMenu` | Covered | No `OverflowMenu` (ghost "more" icon button with a fixed accessible label, flip-aware), no hover-reveal in table rows with persistent display on touch, no table-row helper. Needed by every list and table. **Batch 1: `OverflowMenu` (required `label`, horizontal and vertical, size-matched menu). Still open (batch 2): hover-reveal in table rows with persistent display on touch, table row helper.** Batch 2: `DataTableRowActions` (icon buttons for one or two actions, overflow menu for three or more or any destructive one; hover-reveal on pointer devices that stays visible on focus, while open and always on touch and forced colours; disabled while rows are selected for a batch). Remaining: lists and cards other than DataTable do not have a row helper. | P0 | S  |
| C23 | Modal | `Dialog` (sm/md/lg/xl), `AlertDialog` | Covered | Passive, transactional and danger (typed confirmation, async confirm) are covered. Missing: non-modal dialog, acknowledgement and multi-step (Cancel/Previous/Next) footers as presets, scroll-shadow on the body, full-screen size. Focus trap, Escape, focus return and scrim handling come from Radix. **Batch 3 (22 Oct 2026): `size="xs"`, `variant` passive and danger (labelled icon, danger rule), scrolling body that is keyboard reachable with dividers. Still open: non-modal preset, multi-step footer, full-screen size.** | P1 | M |
| C24 | Multiselect | `MultiSelect` | Covered | No tri-state parent "All" row (a footer has Select all/Clear), no inline variant, no warn, no read-only, no fluid. Chips with +N, search, groups, async, bulk actions are present. | P1 | S |
|  C25 | Notification (inline, toast, actionable, callout) | `Banner` (inline, page), `Toast` + `toast()` store | Covered | No high/low contrast pair on Banner; no toast timestamp; a toast with an action still auto-dismisses after 5 s (Carbon keeps actionable toasts until dismissed); no callout-specific role (a Banner without `onDismiss` works). Present: 5 tones with icon, actions, dismiss, promise/loading/update API, max stack, swipe, position. **Batch 2 (22 Oct 2026): a toast with an action no longer auto-dismisses (stays until acted on or dismissed); `duration` opts back in to a timer and `persistent` keeps any toast. Still open: toast timestamp.** **Batch 3 (22 Oct 2026): Popover `tone` inverse, SVG caret, `arrowPadding`, alignment checked.** | P1 | S  |
| C26 | Notification panel† | None (pattern text mentions a notification centre) | Covered | Chronological list grouped by time/source/urgency, read state, preferences link, unread dot on trigger, works alongside toasts. **Batch 3 (22 Oct 2026): `NotificationPanel`, `NotificationList`, `NotificationItem`, `NotificationBell`: grouped by time, read state, actions, mark all as read.** | P1 | M |
| C27 | Number input | `NumberField` | Covered | No warn, no fluid. Present: min/max clamp, step and Shift x10, PageUp/PageDown, Home/End, locale formatting on blur, unit and prefix, steppers, read-only, `aria-valuenow`/`valuetext`. | P2 | S |
| C28 | Pagination | `Pagination` (+ `paginationRange`) | Covered | No size prop to match table density; no jump-to-page select; no looping; no unknown-total ("unbound") mode. Page buttons with ellipsis, items per page, summary, compact variant and live announcements are present. | P2 | S |
| C29 | Popover | `Popover*` | Covered | No tab-tip variant (attached to a toolbar/header), no inverse/high-contrast style, no flush "no tip" alignment. Arrow, close button, sizes, header/body/footer, collision handling present. | P2 | S |
|  C30 | Progress bar | `ProgressBar`, `Meter`, `ProgressCircle` | Covered | No status prop: no success/error state with icon and required helper text (tone is colour-only, against Faun's own icon-plus-label rule); no inline/indent label alignment. Determinate, indeterminate, value label, segments, ARIA are present. **Batch 2 (22 Oct 2026): `status` (`active`, `finished`, `error`) with icon plus text ("Finished", "Failed" or `statusText`), `aria-valuetext`, and an announcement contract (silent on mount; "in progress" on turning indeterminate; 25, 50 and 75 percent milestones; finished polite; failed as an alert; `announce={false}`). Still open: inline and indent label alignment.** | P1 | S  |
|  C31 | Progress indicator | `Stepper` | Covered | No disabled step, no arrow-key movement between interactive steps (steps are buttons in tab order), no secondary label slot beyond description. States complete, current, upcoming, error and awaiting-human; horizontal and vertical; interactive via `onSelect`. **Batch 2 (22 Oct 2026): disabled step (`disabled`, reads Unavailable) and `showStatus` for visible text status. Still open: arrow-key movement between interactive steps, secondary label slot.** | P2 | S  |
| C32 | Radio button | `RadioGroup` | Covered | No warn, no read-only. Vertical and horizontal, card (tile) variant with icon and meta, helper text, group error present. **Batch 1: `warn`, `readOnly` (`aria-readonly`, selection kept), `skeleton` on `RadioGroup`.** | P1 | S |
| C33 | Search | `SearchField`; `CommandPalette` | Covered | Sizes sm/md/lg (Carbon xs-lg); no expandable (icon-collapse) variant, no scope select, no fluid, no results-panel behaviour (active/focused search) outside `CommandPalette`. Clear, Escape, Enter to `onSearch`, loading, shortcut hint present. | P1 | S |
| C34 | Select (native) | `Select` is Radix-based; no native `<select>` component (Pagination uses an unstyled one) | Partial | No `NativeSelect` for mobile pickers and plain forms; inline, warn, read-only, fluid shared with C13. | P2 | S |
| C35 | Slider | `Slider` | Covered | No paired number input(s) (Carbon default), no read-only, no warn. Single and range, marks with labels, vertical, `onValueCommit`, `formatValue`, per-thumb labels present. | P1 | S |
| C36 | Structured list | None (`DescriptionList` is key-value; a compact `DataTable` covers most uses) | Missing | Header row with columns, condensed and flush modes, selectable single-row list with radio/check icon. | P2 | M |
| C37 | Tabs | `Tabs`, `TabsList/Trigger/Content` | Covered | No dismissible tabs, no secondary label, no scroll arrows (Faun scrolls with edge fades), manual-activation mode not documented (Radix `activationMode` passes through), vertical is line-only, no icon-only guard. Line, contained, segmented, sm/md, icon, count, end slot present. | P2 | S |
| C38 | Tag | `Tag`, `FilterChip` | Covered | Read-only (default/framework/brand), dismissible and selectable (`FilterChip`) exist. Missing: operational tag (opens a popover/modal of more tags), the hue palette (Carbon ~12 colours; Faun 3 variants, status colour lives on `Badge`), lg size, truncation with tooltip, disabled, skeleton, inline AI label. **Batch 3 (22 Oct 2026): Selectable, dismissible, operational and filter variants, lg, disabled, and `TagGroup` with a +N popover.** | P1 | M |
| C39 | Text input | `Input`, `TextField`, `Field` | Covered | No warn, no password toggle, no inline label, no fluid, no character counter on the single-line input, no skeleton, no AI label. Invalid, read-only styling, disabled, helper, prefix/suffix, numeric alignment present. See section 2. **Batch 1: `warn`, shared read-only style (also Textarea), `skeleton`, `showCount` counter on `Input`, password toggle, Field `inline` and `fluid` variants. Still open: word counter, AI label and revert.** | P0 | M |
| C40 | Password input† | None | Covered | Show/hide toggle (pressed state, accessible name), requirement helper text, autocomplete hints (`current-password`, `new-password`). **Batch 1: `PasswordInput` and `type="password"` toggle with changing accessible name, custom labels, `autoComplete` default. Requirement helper text is the Field description.** | P0 | S |
| C41 | Text area | `Textarea` | Covered | No word counter, no read-only styling (native attribute passes through but nothing marks it), no warn, no skeleton. Character counter with polite near-limit message, auto-grow, resize control present. | P1 | S |
|  C42 | Tile (base, clickable, selectable, expandable) | `Card` (surface), `Tile`, `ClickableTile`, `SelectableTile`, `TileGroup`, `ExpandableTile` | Covered | Clickable works through `asChild`. No `SelectableTile` (radio/check icon, hover-selected state, multi-select), no `ExpandableTile`, no disabled state. Single-select cards exist only inside `RadioGroup variant="card"`. **Batch 2 (22 Oct 2026): `ClickableTile` (link or button), `SelectableTile` with checkbox semantics alone or in `TileGroup type="checkbox"` and radio semantics in `TileGroup type="radio"` (native inputs, fieldset legend, disabled, read-only, filled check or dot indicator), `ExpandableTile` (button with `aria-expanded`, region). Still open: tile-level AI label.** | P1 | M  |
|  C43 | Time picker | `TimePicker` | Covered | Hour/minute entry with 12/24 h, AM/PM and time-zone selects, validation. **Batch 2 (22 Oct 2026): `TimePicker`: masked hh:mm field, 12 or 24 hour (`hourCycle`, AM/PM select, A and P keys), `step` with Arrow Up and Down, `min`, `max`, validation in words, `onValidate`, value always 24 hour HH:mm. Still open: time-zone select, a list of slots.** | P1 | M  |
| C44 | Toggle | `Switch` | Covered | No state text ("On"/"Off"), no read-only, no skeleton. Sizes sm/md, label position, description, disabled present. | P2 | S |
| C45 | Toggletip | None (`Popover` is the base; `HoverCard` is hover-only) | Covered | No `Toggletip`: info icon button that opens a small popover on click/Enter/Space, may hold actions, Escape closes, content announced politely. **Batch 3 (22 Oct 2026): `Toggletip`: button trigger, non-modal popover, Escape and focus return.** | P1 | S |
| C46 | Tooltip | `Tooltip`, `TooltipProvider` | Covered | Icon tooltip behaviour is built into `IconButton`. Delay, side, align, Escape, shortcut hint present; content is deliberately non-interactive. Definition tooltip is separate (C47). | P2 | S |
| C47 | Definition tooltip | None | Covered | Dotted-underline term whose definition opens on hover, focus or click. **Batch 3 (22 Oct 2026): `DefinitionTooltip`: dotted-underline term, definition on focus, hover and tap.** | P1 | S |
| C48 | Tree view | `Tree` | Covered | No xs size, no multi-select or checkbox tree, no async/lazy children, collapsed parent does not inherit the selected state of a hidden descendant. WAI-ARIA tree keys (arrows, Home/End, `*`, type-ahead), guides, icons, meta present. | P1 | M |
| C49 | UI shell: header | `TopBar`, `PageHeader`, `AppShell` skip link | Covered | No header navigation links with dropdown sub-menus, no defined utilities order (search left, switcher right), no unread badge slot on header icons. Nav toggle, breadcrumbs slot, search slot, actions slot, skip link and `<header>` landmark present. **Batch 3 (22 Oct 2026): `HeaderNav` links with current page and collapse below 768, `HeaderActions`, `SkipLink`.** | P1 | M |
| C50 | UI shell: side nav | `SideNav`, `SideNavSection/Item/Workspace/User` | Covered | Items are flat links: no expandable groups or second tier. Present: icon rail with tooltips, mobile drawer with inert page and focus return, sections, counts, attention badges, `aria-current`, workspace and user blocks. **Batch 3 (22 Oct 2026): `SideNavGroup` second tier: collapsible, current page marked, flyout popover in the collapsed rail.** | P0 | M |
| C51 | UI shell: header panel | None (a non-modal `Sheet` could host one) | Covered | Right panel anchored to a header icon, one open at a time, outlined trigger, closes on item select or trigger press. **Batch 3 (22 Oct 2026): `HeaderPanel` with `useHeaderPanel`, one panel open at a time, focus return.** | P1 | M |
| C52 | UI shell: switcher | `SideNavWorkspace onSwitch` (callback only) | Covered | No switcher panel: recent/frequent/all products, dividers, far-right placement rule. **Batch 3 (22 Oct 2026): `SwitcherPanel`: grouped product list with current marked.** | P1 | M |
| C53 | Skeleton | `Skeleton`, `SkeletonRows` | Covered | No per-component skeleton states (input, button, tag, tile, list) and no card preset. Text, circle, rect, multi-line and table shapes present. | P2 | S |
| C54 | Icon indicator | `StatusBadge`, `Badge` with icon | Covered | Pill chrome only: no chrome-less inline icon + label form, one icon size. 20 status icons across 7 tones, always icon plus label, from the status map. | P2 | S |
| C55 | Shape indicator | `Badge dot` | Partial | Only a round dot, so meaning rests on colour; Carbon varies the shape and outlines light tones. No dedicated component or shape set. | P1 | S |
| C56 | Notification badge (count, dot) | `SideNavItem attention/count`, `TabsTrigger count` | Partial | No badge overlay for `IconButton` (header and toolbar icons); no overflow cap rule (99+). | P1 | S |
| C57 | Differential indicator | `Stat delta` | Covered | Direction arrow plus sentiment colour present. No standalone inline `Delta` for table cells. | P2 | S |
| C58 | Stack | `Stack`, `Inline`, `Divider` (Layout) | Covered | Gap from the space scale, align, justify, wrap, `asChild`. No responsive gap values. | P2 | S |
| C59 | Grid and layers | `@faun-ds/grid` (`Grid`, `Column`); layers via tokens | Covered | Wide, narrow, condensed modes; 4/8/12 columns; offsets; per-breakpoint spans. No subgrid helper, no `Layer` component. | P2 | S |
| C60 | Fluid variants | None | Missing | Fluid text input, text area, dropdown, select, number, date, search, time, form: label inside the field, 64 px height, helper in a tooltip. | P2 | L |
| C61 | Copy button† | None (`DescriptionList copyValue`, `JsonViewer` copy) | Missing | Icon button with "Copied" feedback and live-region announcement; shared by snippets, IDs and tables. | P1 | S |
| C62 | Toolbar† | None | Covered | `role="toolbar"` container with roving tabindex, arrow-key movement, overflow into a menu. Needed by table toolbars and the text-toolbar pattern. **Batch 3 (22 Oct 2026): `Toolbar`, `ToolbarButton`, `ToolbarSeparator`: roving tabindex, overflow menu. Overflow tested with stubbed widths only.** | P1 | M |
| C63 | Side panel and tearsheet† | `Sheet` (modal and non-modal, left/right/bottom, sm/md/lg) | Partial | Side panel covered. No tearsheet (large overlay stacking above a page with steps) and no stacked-panel behaviour. | P2 | L |

### 1b. Data table variants

Carbon's data table is one component with many documented variants. Faun's `DataTable` is judged per variant here; the headline row is C11.

| ID | Carbon | Faun equivalent | Status | Gaps | Priority | Effort |
| --- | --- | --- | --- | --- | --- | --- |
|  V01 | Default, five row sizes (24/32/40/48/64) | `density` compact 36 / comfortable 44 / spacious 52 | Covered | No xs 24 or xl 64 rows; header height does not separate from rows. **Batch 2 (22 Oct 2026): `rowSize` xs 24, sm 32, md 40, lg 48, xl 64 px from control-size tokens, overriding density; header height unchanged.** | P1 | S  |
| V02 | Selection, multi (checkbox) | `selectable`, indeterminate header, per-page vs all semantics | Covered | Header checkbox labelled; selection survives paging. | - | - |
|  V03 | Selection, single (radio) | None | Covered | Radio column, one row at a time. **Batch 2 (22 Oct 2026): `selectionMode="single"`: radio column, no select-all or bar, arrow keys move between rows, Space chooses.** | P1 | S  |
|  V04 | Batch actions | Selection bar with count, Clear selection, `selectionActions` slot | Covered | Does not take over the toolbar; row-level actions are not disabled in batch mode; no Cancel wording. **Batch 2 (22 Oct 2026): the selection bar replaces the toolbar strip while rows are selected, and row actions switch off in batch mode.** | P2 | S  |
| V05 | Expansion | `renderExpanded`, Left/Right keys, `isRowExpandable` | Covered | No expand-all control in the header. | P2 | S |
| V06 | Expansion + selection | Both props together | Covered | - | - | - |
| V07 | Sorting | `sortable`, `aria-sort`, three states, announcements, `manualSort` | Covered | - | - | - |
|  V08 | Search in toolbar | `SearchField` placed above the table by the consumer | Covered | No toolbar slot inside the table surface; no collapsible active-search. **Batch 2 (22 Oct 2026): search lives in `DataTableToolbar` (a `SearchField` in the `search` slot), inside the table surface. Collapsible active-search is not built.** | P0 | M  |
|  V09 | Toolbar (actions, filter, export) | `columnMenu` only; `FilterBar` composed outside | Covered | No `toolbar` slot, no overflow into a menu, no size pairing with row height. **Batch 2 (22 Oct 2026): `toolbar` slot with search, filters and actions, plus the Row height menu (`rowSizeMenu`); the strip wraps on narrow screens. No overflow-into-menu (the Toolbar primitive is still open).** | P0 | M  |
| V10 | Skeleton / loading | `loading`, `loadingRows`, `aria-busy` | Covered | - | - | - |
|  V11 | Sticky header | `stickyHeader`, `maxHeight`, `virtualize` | Covered | No sticky first column or sticky toolbar. **Batch 2 (22 Oct 2026): `stickyFirstColumn` pins the selection and first data columns. Sticky toolbar not built.** | P2 | M  |
| V12 | Pagination | Client and server (`totalRows`), page size options, announcements | Covered | Pagination size does not follow row size. | P2 | S |
|  V13 | Zebra stripes | None | Covered | Optional alternating row background. **Batch 2 (22 Oct 2026): `zebra`, by data position, under hover and selected.** | P2 | S  |
|  V14 | Row overflow menu / inline actions | None (compose in a cell) | Covered | Persistent vs hover-reveal, disabled in batch mode, icon buttons when fewer than three. **Batch 2 (22 Oct 2026): `DataTableRowActions`: persistent or hover-reveal, always visible on touch, on focus and while open; disabled in batch mode; icon buttons when fewer than three actions, otherwise `OverflowMenu`.** | P0 | S  |
| V15 | Inline editing | None | Missing | Editable cells with commit/cancel and validation. | P2 | L |
| V16 | AI presence | None | Missing | AI label on table, column, row or cell. | P2 | M |
| V17 | Filtering | `FilterBar` chips above the table | Partial | See pattern P06. | P1 | M |
| V18 | Empty and error | `emptyState`, `error` with retry | Covered | - | - | - |
| V19 | Column resize, hide, virtualise (Faun extras) | `resizableColumns`, `columnMenu`, `virtualize` | Covered | Beyond Carbon. | - | - |

### 1c. Patterns

| ID | Carbon | Faun equivalent | Status | Gaps | Priority | Effort |
| --- | --- | --- | --- | --- | --- | --- |
| P01 | Common actions (add, cancel, clear, close, copy, delete, edit, errors, next, refresh, remove, reset) | Button/IconButton docs; "Confirm destructive action" pattern | Partial | No pattern page for the 12 actions. Delete tiering exists in part (reversible vs typed confirmation). No copy-with-tooltip feedback, no refresh, reset or remove guidance. | P1 | S |
| P02 | Dialogs (modal passive, transactional, acknowledgement, progress; non-modal) | `Dialog`, `AlertDialog`, "Confirm destructive action" | Partial | Only the confirm case is a pattern. No guidance for passive, acknowledgement, progress or non-modal, nor button placement rules. | P1 | S |
| P03 | Disabled states (disabled, read-only, hidden) | Foundations > States (disabled tokens) | Partial | Disabled is documented; read-only and hidden-by-permission rules are not, and read-only is implemented on only two controls. **Batch 1: read-only is now documented and implemented on all 13 control families. Still open: hidden-by-permission rule.** | P0 | S |
| P04 | Disclosures (profile menu, settings/filter popover, combo button, toggletip) | `Popover`, `Accordion`, `Collapsible`, `HoverCard` | Partial | No pattern page; combo button and toggletip components missing; no rule set (one open at a time, no nesting, width cap). | P2 | S |
| P05 | Empty states | `EmptyState` + "Empty, error and no access" | Covered | Four kinds, sizes sm/md, actions. Missing the in-depth alternatives (in-line documentation, onboarding, starter content); the Home pattern shows a first-use hint set. | P2 | S |
| P06 | Filtering (single/multi, batch/instant, applied indicator, reset) | `FilterBar`, `FilterChip`, `MultiSelect` | Partial | Chips, add menu and Clear all are good. No batch mode with Apply, no filter drawer/popover with applied-count on the trigger, no per-category reset, no range (date, number) filters, no saved views. | P1 | M |
| P07 | Forms | `Field`, `Fieldset`, "Settings form" | Partial | Covers labels, required/optional, error summary banner, save. Missing: dialog vs side panel vs multistep guidance, wizard, button placement and spacing rules, fluid forms. | P1 | M |
| P08 | Global header | `TopBar`, `AppShell` | Partial | See C49 to C52. | P1 | M |
| P09 | Loading (skeleton, indicators, progress, progressive, load more) | `Skeleton`, `Spinner`, `ProgressBar`, `DataTable loading` | Partial | Components exist; no pattern page with thresholds; no inline loading, overlay or load-more. | P1 | S |
| P10 | Login | None | Covered | Progressive/SSO/password variants, centred and split layouts, server error handling, generic credentials message. **Batch 3 (22 Oct 2026): New `Login` pattern: centred and split, validation, generic credential error, SSO.** | P1 | M |
| P11 | Notifications | "Notifications and toasts" pattern; `Banner`, `Toast` | Covered | Toast vs banner vs notification centre vs dialog is explained. The notification centre has no component (C26). | P1 | S |
| P12 | Read-only inputs | `Input`, `NumberField` only | Covered | Styled read-only exists on two of the 13 control families (Input, NumberField); Textarea, Select, Combobox, MultiSelect, DatePicker, Checkbox, Radio, Switch, Slider have none. **Batch 1: read-only styling and semantics on all 13 families (native `readonly` where the element supports it; `aria-readonly` plus blocked changes elsewhere).** | P0 | M |
| P13 | Search (basic, active, focused, scoped, recent, no results) | `SearchField`, `CommandPalette`, "Search and command palette" | Partial | Command palette is solid. No results-page, active-search panel, scope filter with counts, recent/trending searches or zero-result guidance. | P1 | M |
| P14 | Text toolbar | None | Missing | Formatting toolbar pattern (needs `Toolbar`, rich-text surface). | P2 | M |
| P15 | Status indicators (icon, shape, badge, differential; severity tiers) | `StatusBadge`, status map (ADR 0003), `Stat delta`, `DataQualityCell` | Covered | Icon + label, 7 tones, domain/state map. Gaps: shape indicator set, notification badge, a pattern page stating severity tiers and the five-or-six-per-view limit. | P1 | S |
| P16 | Overflow content (truncation, show more, ellipsis menu)† | None; ad hoc CSS ellipsis | Covered | No `Truncate` (end, middle, front), no `ShowMore`/load-more, no rule for tooltips on truncated text. **Batch 1: `Truncate` (end, middle, start, multi-line, tooltip only when cut, focusable while cut) and `ShowMore` (line clamp, toggle only when cut). Load-more for lists is not part of this.** | P0 | M |
| P17 | Saving and editing† | "Settings form" (explicit save; Switch applies at once) | Covered | No inline edit, autosave, unsaved-changes guard, or saving/saved feedback pattern. **Batch 3 (22 Oct 2026): New `Saving and editing` pattern: autosave status, edit in place, unsaved-changes guard.** | P1 | M |
| P18 | Drag and drop† | None | Missing | No sortable list, drop target or keyboard-operable reorder; column resize is the only drag. | P2 | L |
| P19 | Data table patterns (bulk, list and detail, empty, filtering)† | "Bulk actions on a table", "List and detail" | Partial | Bulk and list-detail covered; toolbar, inline editing, row actions and filtering patterns absent. | P1 | M |
| P20 | Generative AI patterns (AI label, explainability, revert, feedback, chat)† | `@faun-ds/ai` + "Agent run viewer", "Approval flow", foundations > Agents | Covered | Run, approval, provenance, confidence and streaming are ahead of Carbon. Missing: AI label and explainability popover, revert, feedback controls (helpful, copy, regenerate), suggested prompts component, message list/bubbles, reasoning disclosure, AI-presence styling. **Batch 3 (22 Oct 2026): AILabel, AISlot, AIFeedback and AIChatMessage built; chat builds on PromptComposer and StreamingText.** **Chat panels (22 Oct 2026): `ProgressPanel`, `ArtifactPanel`, `ChatLayout`; patterns Assistant home and Chat with panels.** | P1 | L |
| P21 | Text-based navigation (links, tabs, breadcrumbs, pagination)† | `Link`, `Tabs`, `Breadcrumbs`, `Pagination`, `SideNav` | Partial | Components exist; no page on choosing between them. | P2 | S |

## 2. Deep check of Covered components

Legend: Yes = present in source; No = absent; Part = present with a limit named in the note.

### 2.1 Form control state grid

Read from each control's `.tsx` and `.css`. Carbon treats enabled, hover, focus, error, warning, disabled, read-only and skeleton as the state set for fields.

| Control | Sizes | Invalid | Warn | Read-only | Disabled | Helper | Skeleton | Fluid | Inline | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `Input` | sm/md/lg (28/32/40 by density) | Yes | No | Yes (styled) | Yes | Yes (Field) | No | No | No | Prefix, suffix, numeric extras. No counter, no password toggle |
| `Textarea` | rows min/max | Yes | No | No (native attr only, unstyled) | Yes | Yes (Field) | No | No | No | Character count with polite near-limit message; no word count |
| `Checkbox` / `CheckboxGroup` | sm/md | Yes | No | No | Yes | Yes | No | n/a | n/a | Indeterminate and select-all present |
| `RadioGroup` | n/a | Yes | No | No | Yes | Yes | No | n/a | n/a | Card variant, horizontal |
| `Switch` | sm/md | n/a | n/a | No | Yes | Yes | No | n/a | n/a | No on/off state text |
| `Select` | sm/md/lg | Yes | No | No | Yes | Yes | No | No | No | Groups, icons |
| `Combobox` | sm/md/lg | Yes | No | No | Yes | Yes | No | No | No | Button trigger, no typed entry |
| `MultiSelect` | sm/md/lg | Yes | No | No | Yes | Yes | No | No | No | Chips, +N, bulk actions |
| `NumberField` | sm/md/lg | Yes | No | Yes (styled) | Yes | Yes | No | No | No | Stepper, units, locale |
| `Slider` | n/a | Yes | No | No | Yes | Yes | No | n/a | n/a | No paired number input |
| `SearchField` | sm/md/lg | Yes | n/a | Part (clear hidden, not styled) | Yes | n/a | No | No | n/a | Loading, shortcut hint |
| `DatePicker` / `DateRangePicker` | sm/md/lg | Yes | No | No | Yes | Yes | No | No | No | Button trigger |
| `FileUpload` | n/a | Yes | No | No | Yes | Yes | No | n/a | n/a | Per-file errors |

Cross-cutting finding: **warn is absent from all 13 control families, read-only styling from 11 of 13, and skeleton from all 13.** A single state contract (a `warn` prop on `Field` that sets `data-warn`, a shared `data-readonly` style, a `skeleton` flag) closes most of P0 row P12 and the Partial rows above in one change. That is the first item in build batch 1.

### 2.2 Button and IconButton

| Carbon requirement | Faun | Evidence |
| --- | --- | --- |
| Kinds: primary, secondary, tertiary, ghost, danger (primary, tertiary, ghost) | Yes. `variant` solid, soft, outline, ghost, link x `intent` accent, neutral, danger. Mapping: primary = solid accent, tertiary = outline accent, ghost = ghost neutral, danger primary/tertiary/ghost = solid/outline/ghost danger. Soft and link are extras | `Button.tsx`, `Button.css` lines 56 to 82 |
| Sizes: xs 24, sm 32, md 40, lg 48, xl, 2xl | Part. `size` sm/md/lg = 28/density/40. Tokens `size.control.xs` (24) and `xl` (48) exist but no prop value uses them. No 2xl | `types.ts`, `Button.css`, `foundations.json` |
| Icon-only with required tooltip | Yes. `IconButton` requires `label`, uses it as `aria-label` and tooltip, optional shortcut and side | `IconButton.tsx` |
| Icon-only danger forbidden | No. `intent` is not restricted on `IconButton` | `IconButton.tsx` |
| Icon beside label | Yes. `leadingIcon`, `trailingIcon`, `aria-hidden` | `Button.tsx` |
| Loading | Part. Spinner, width kept, `aria-busy`, click blocked. No finished or error outcome (needs `InlineLoading`, C16) | `Button.tsx` |
| Disabled | Yes. Native `disabled`, `aria-disabled` when `asChild` | `Button.tsx`, `Button.css` line 85 |
| Label wraps instead of truncating | No. `white-space: nowrap` | `Button.css` line 31 |
| Button set (2 to 3 related actions, one high emphasis, equal widths) | No component | not present |
| Full width, router link | Yes. `fullWidth`, `asChild` | `Button.tsx` |
| Keyboard Enter/Space, focus ring | Yes (native button, `:focus-visible` outline) | `Button.css` |
| Fluid joined buttons with 1px separator | No (fluid family absent) | not present |

### 2.3 Text input and Textarea

Carbon list: sizes, invalid, warn, read-only, helper, counter, password toggle, inline, fluid, skeleton, AI label.

| Feature | Faun | Note |
| --- | --- | --- |
| Sizes | Part. sm/md/lg follow density (28/32/40); Carbon is 32/40/48; no xs |
| Invalid | Yes. `invalid` prop or `Field error`; red border, `aria-invalid`, error message with icon and `role="alert"` |
| Warn | No. No `warn` prop, no `data-warn`, no warning message role |
| Read-only | Yes on `Input` (`data-readonly`, flat nested surface, still focusable). No on `Textarea` |
| Helper text | Yes via `Field description`, linked with `aria-describedby`. Not replaced by the error (both shown) |
| Character counter | Textarea only (`showCount` + `maxLength`, polite message from 90 percent). Not on `Input` |
| Word counter | No |
| Password toggle | No (C40) |
| Inline (label to the left) | No |
| Fluid | No (C60) |
| Skeleton | No |
| AI label and revert | No (C02) |
| Prefix, suffix, numeric alignment | Yes (Faun extra) |
| Label rules (always visible, placeholder is not a label) | Yes. `Field` requires `label`; `hideLabel` keeps it for screen readers |

### 2.4 Other Covered components

**Select, MultiSelect, Combobox (Carbon dropdown family).** Opening, selection, type-ahead, scroll buttons and group labels come from Radix and cmdk. Present: sizes, invalid, disabled, groups, descriptions, icons, async search, loading, empty message, clear button, chips with +N, select all and clear. Absent: warn, read-only, inline, fluid, skeleton, tri-state "All" parent row, typing into the combobox field itself.

**Checkbox, RadioGroup, Switch.** Group legends, descriptions, errors, horizontal layout, indeterminate and select-all, card tiles for radios are present. Absent: warn, read-only, skeleton, switch state text, AI variant.

**NumberField, Slider, SearchField.** NumberField is complete apart from warn and fluid (clamp, step, Shift x10, PageUp/Down, Home/End, locale formatting, units). Slider has single and range, marks, vertical, commit event, per-thumb labels; lacks paired number inputs, read-only, warn. SearchField has clear, Escape, Enter, loading and shortcut hint; lacks expandable, scoped and fluid forms.

**Tabs.** Line, contained, segmented, sm/md, icon, count, end slot, scroll with edge fades, vertical (line), disabled tabs, Radix roving focus. Absent: dismissible, secondary label, documented manual activation.

**Accordion.** Single and multiple, collapsible, divided and separated, icon, description, meta, disabled. Absent: flush alignment, configurable heading level (fixed h3).

**Menu.** Dropdown and context menus with groups, labels, separators, submenus, checkbox and radio items, danger, shortcuts, descriptions, type-ahead. Absent: size scale tied to trigger height.

**Dialog and AlertDialog.** Sizes sm 420, md 560, lg 760, xl 1040; focus trap, Escape, focus return, `dismissible` for unsaved input; `AlertDialog` starts focus on Cancel, supports typed confirmation and async confirm with error text. Absent: non-modal, acknowledgement and progress presets, full-screen.

**Banner and Toast.** Tones info, success, warning, danger, attention with icon; inline and page variants; actions and dismiss; toast store with promise, loading, update, dismiss, max visible, swipe, five positions, `role` by urgency. Absent: high and low contrast pair, timestamp, persistence of actionable toasts (currently 5 s regardless of action).

**Tooltip, Popover.** Tooltip: delay, side, align, shortcut, Escape, non-interactive content. Popover: sizes, arrow, close, header/body/footer, flush. Absent: definition tooltip, toggletip, tab tip, inverse style.

**Pagination, Breadcrumbs, Tree, Stepper.** Pagination: pages with ellipsis, page size, summary, compact, live region. Breadcrumbs: overflow menu, router hook, `aria-current`. Tree: full WAI-ARIA keys, controlled expansion and selection, guides. Stepper: five states, vertical, interactive. Absent items are listed in the matrix rows C27, C04, C48, C31.

**FileUpload.** Drop, browse, accept, max size and count validation, per-file progress, retry, remove, visible focus. Absent: button-only variant.

**Skeleton.** Text lines, circle, rect, table rows with density-matched height, `aria-hidden` with a status wrapper. Absent: per-component skeletons.

**Link, Switch, Stat delta, StatusBadge.** See rows C17, C44, C57, C54.

## 3. Faun components Carbon lacks (differentiators)

Keep, document as strengths, and do not remove in the name of parity.

| Faun | What Carbon does not offer |
| --- | --- |
| `CommandPalette` | Search-first launcher with groups, shortcuts, Ctrl/Cmd+K binding |
| `DataTable` extras | Column resize with keyboard handles, column visibility menu, virtualisation for tens of thousands of rows with correct `aria-rowcount`, server-side paging and sorting contract |
| `FilterBar` | Applied filters as removable chips, add-filter menu with submenus, live count |
| `DateRangePicker` presets | Fiscal-year, quarter and rolling-period presets, two-month range panel with live hint |
| `AlertDialog` | Typed confirmation, async confirm that stays open on rejection, intent accent or danger |
| `toast()` store | Imperative API with `promise`, `loading`, `update`; single owner `Toaster` |
| `Stat`, `StatGroup` | KPI figure with unit, delta, sentiment and comparison basis |
| `Meter`, `ProgressCircle`, segmented `ProgressBar` | `role="meter"` with thresholds and target marker, segmented coverage bars with legend |
| `Timeline` | Audit trail of who did what, with status and expandable detail |
| `Avatar`, `AvatarGroup` | Agent kind (never looks like a person), activity ring for running and attention |
| `StatusBadge`, `DataQualityCell` | Domain and state status map (ADR 0003), figure paired with its data quality |
| `DescriptionList` | Key-value rows with per-row copy |
| `JsonViewer` | Collapsible JSON with copy, expand and collapse all |
| `Kbd`, `HoverCard`, `ScrollArea`, `Collapsible`, `Divider` with label, `Inline` | Small primitives with no Carbon counterpart |
| `RadioGroup variant="card"`, `CheckboxGroup selectAll`, `SegmentedControl`, `Tabs variant="segmented"` | Richer choice controls |
| `NumberField` locale and units, `Textarea autoGrow`, `Slider formatValue`, `SearchField` shortcut hint | Behaviours Carbon leaves to the consumer |
| `Sheet modal={false}` | Inspector panel that leaves the page interactive |
| `AppShell`, `PageHeader`, `SideNav` attention badges | Complete app frame with mobile drawer, skip link and "awaiting you" counts |
| `@faun-ds/ai`: `ActorChip`, `ApprovalCard`, `RunTrail`, `ProvenanceTrail`, `Citation` + `SourceList`, `ConfidenceBadge`, `StreamingText`, `PromptComposer` | An agent-run vocabulary: who acted, what is waiting on a person, where a number came from, how sure the system is |

Deliberate differences that are not gaps: validation runs on submit then live (Carbon validates on blur); toasts default bottom-right (Carbon top-right); `solid / soft / outline / ghost` x `accent / neutral / danger` replaces Carbon's primary-to-tertiary naming; sentence case and icon-plus-label status are stricter than Carbon's.

## 4. Recommended build order

Batches of about six. Order is set by (1) breadth of products blocked, (2) dependencies between items, (3) effort. Each batch ends with the BUILDERS.md verify gates.

### Batch 1. State contract and the small P0 pieces

| # | Build | Rows | Effort |
| --- | --- | --- | --- |
| 1 | Form state contract: `warn` on `Field` and every control, shared read-only style, skeleton flag | C39, C06, C32, C13, P03, P12 | M |
| 2 | `PasswordInput` and counter on `Input` | C40, C39 | S |
| 3 | `InlineLoading`, and finished/error outcome on `Button` | C16, C05 | S |
| 4 | `OverflowMenu` | C22 | S |
| 5 | `MenuButton` and `ComboButton` | C21 | S |
| 6 | `ButtonGroup`, `Button` xs and xl, wrapping labels | C05 | S |

Why first: every product hits these within the first week, they are small, and 4 and 5 are prerequisites for table row actions in batch 2. Item 1 touches many components, so doing it early avoids reworking each control later.

### Batch 2. Complete the data surface

| # | Build | Rows | Effort |
| --- | --- | --- | --- |
| 1 | `Toolbar` primitive (roving focus, overflow into menu) | C62 | M |
| 2 | `DataTable` toolbar slot with search and actions | V08, V09 | M |
| 3 | Single-select rows, row sizes xs and xl, zebra, expand-all | V01, V03, V05, V13 | M |
| 4 | Row actions helper on top of `OverflowMenu` (hover-reveal, persistent on touch, disabled in batch mode) | V14, V04 | S |
| 5 | `Truncate` (end, middle, front) and `ShowMore` | P16 | M |
| 6 | `Tag` upgrades: operational, hue palette, lg, truncation tooltip, disabled | C38 | M |

Why second: tables are the highest-traffic surface; 2 depends on 1, 4 on batch 1. Truncation (5) is P0 and shows up first in tables and tags.

### Batch 3. Selection, entry and time

| # | Build | Rows | Effort |
| --- | --- | --- | --- |
| 1 | `SelectableTile`, `ExpandableTile`, clickable `Tile` | C42 | M |
| 2 | `Combobox` as an editable field with custom values | C08 | M |
| 3 | Typed entry in `DatePicker`, and `TimePicker` | C12, C43 | M |
| 4 | `CodeSnippet` and `CopyButton` | C07, C61 | M |
| 5 | `NativeSelect`, `Slider` paired number input | C34, C35 | S |
| 6 | `ContainedList` | C09 | M |

Why third: these are P1 form and content controls; none blocks another batch. `CopyButton` also feeds table and ID cells.

### Batch 4. Overlays, disclosure and feedback

| # | Build | Rows | Effort |
| --- | --- | --- | --- |
| 1 | `Toggletip` and `DefinitionTooltip` | C45, C47 | S |
| 2 | `Dialog` presets: non-modal, acknowledgement, multi-step footer, scroll shadow | C23 | M |
| 3 | `NotificationPanel`, toast timestamp, actionable toasts persist, Banner contrast pair | C26, C25 | M |
| 4 | `ProgressBar` status with icon and helper text, loading overlay | C30, C19 | S |
| 5 | `Tabs` dismissible and secondary label, `Accordion` flush and heading level | C37, C01 | S |
| 6 | `Form` anatomy component with error summary and focus handling | C15 | M |

Why fourth: depend on batch 1 (buttons, inline loading) and complete the notification and dialog families.

### Batch 5. Application shell

| # | Build | Rows | Effort |
| --- | --- | --- | --- |
| 1 | `SideNav` expandable groups (second tier) | C50 | M |
| 2 | `TopBar` header navigation with sub-menus | C49 | M |
| 3 | `HeaderPanel` | C51 | M |
| 4 | Switcher panel | C52 | M |
| 5 | Badge overlay for `IconButton`, shape indicator set, inline `Delta` | C55, C56, C57 | S |
| 6 | Login page template (centred and split) | P10 | M |

Why fifth: side nav depth is P0 for products with more than one navigation level, but it is one product class; the rest is P1. Header panel and switcher share one anchoring mechanism, so build them together.

### Batch 6. AI parity

| # | Build | Rows | Effort |
| --- | --- | --- | --- |
| 1 | `AILabel` and explainability popover | C02 | M |
| 2 | Revert-to-AI-value control | C02 | S |
| 3 | AI-presence styling hook on fields, tag, tile, table cell (uses `ai.*` roles) | C02, P20 | M |
| 4 | Feedback controls (helpful, not helpful, copy, regenerate) | P20 | S |
| 5 | Suggested prompts and message list for `PromptComposer` | P20 | M |
| 6 | Reasoning and step disclosure in `StreamingText` | P20 | M |

Why sixth: Faun already leads on runs and approvals, so these refine rather than unblock. They need batch 3 tiles and batch 1 form states for AI-presence styling.

### Batch 7. Pattern pages and the long tail

Pattern pages (docs only, S each): P01 common actions, P02 dialogs, P04 disclosures, P09 loading, P21 text navigation, P15 status severity tiers. Pattern pages with behaviour to prove (M each): P06 filtering with batch mode and applied-count trigger, P07 forms (wizard, dialog vs side panel), P13 search (active, focused, scoped, recent), P17 saving and editing (inline edit, unsaved guard), P19 data table patterns.

Long tail (P2): `List`, `AspectRatio`, `StructuredList`, `Tree` multi-select and async, `Stepper` disabled steps and arrow keys, `Pagination` size and jump-to-page, text toolbar (P14, needs `Toolbar`), drag and drop with keyboard reorder (P18, L), tearsheet (C63, L), fluid variants (C60, L), inline table editing (V15, L), AI in tables (V16).

Why last: patterns document components that must exist first, and the L items are P2.

## Appendix: Carbon sources

Fetched and used: components list (41 components) at `/components/overview/components`; patterns overview (14 universal patterns); usage pages for accordion, AI label, breadcrumb, button, checkbox, code snippet, combo box and dropdown and multiselect, contained list, content switcher, data table (usage and accessibility), date picker, file uploader, form, inline loading, link, list, menu, menu buttons, modal, notification, number input, pagination, popover, progress bar, progress indicator, radio button, search, select, slider, structured list, tabs, tag, text input, tile, toggle, toggletip, tooltip, tree view, UI shell header (usage and accessibility), left panel and right panel (switcher); pattern pages for common actions, dialogs, disabled states, disclosures, empty states, filtering, forms, global header, loading, login, notifications, overflow content, search, status indicators, text toolbar.

Not retrievable (site returned an error): `/components/overview/` (trailing slash), aspect ratio, stack, icon indicator, shape indicator, skeleton states, saving and editing, drag and drop, generative AI, read-only inputs, text-based navigation, data table patterns. Rows depending on them carry the dagger. The patterns overview page lists no separate generative AI, drag and drop or saving patterns among the 14 universal patterns; those rows come from the brief and need confirmation.
