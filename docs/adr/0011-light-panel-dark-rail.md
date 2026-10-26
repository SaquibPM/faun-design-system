# 0011 · A light open panel and a near-black rail, drawn as one design

- Status: accepted
- Date: 2026-10-26
- Amends: [0009 · IBM Plex typefaces and the moss sidebar](0009-ibm-plex-and-moss-sidebar.md)

## Context

A review of the docs found that the left navigation did not look like the same product in its two states, and that every sidebar example in the docs drew its own variation. Two reference designs were supplied for the target: an open panel and a collapsed rail.

- **Open.** A light paper panel with a hairline right border, about 280px wide. A rounded-square mark tile and a bold wordmark. A full-width moss "New conversation" button. Uppercase, tracked section labels (Projects, Reports, Pinned, Recent) in a muted grey, with an add control beside Projects. Plain text rows, each with a right-aligned vertical kebab. Report rows carry a percentage and a thin progress bar; pinned rows carry a small moss dot. Hairline dividers between sections. A round avatar with name, subtitle and a chevron at the bottom.
- **Collapsed.** A near-black rail about 64px wide. A light rounded-square mark tile, a moss rounded-square "+" button, then folder, list and star icons, and a light round avatar at the bottom.

ADR 0009 made both states one deep moss surface. That is no longer the target: the references use moss as the action colour, not as the surface.

## Decision

**Two surfaces, one component.** `SideNav` still draws both states. The CSS reads local `--_sn-*` custom properties that default to the `sidebar.*` tokens and are overridden to `rail.*` when the nav is collapsed. Nothing in the component branches on colour.

**Tokens.**

- `sidebar.*` now describes the open panel: `gray.1` in light themes and `gray.2` in dark themes, so the panel sits on the page the way the main column does. Text is the gray scale; borders are gray alphas; `accent` is the moss accent and is used for the current-item bar, the pinned dot, the progress bar and the focus ring. `mark-bg` and `mark-fg` colour the tile and the avatar. The primary action uses the ordinary accent solid button tokens.
- `rail.*` is new and describes the collapsed rail: a near-black `bg` (`#17171a`) in every theme including dark and print, white alphas for hover, current and text, a light mark tile and avatar, and a moss action fill. Because the rail is dark in every theme, it never inherits a theme's light text pair.
- The token parser accepts a literal hex reference, `{#17171a}`, for this one fixed colour. It is not on any scale.
- Layout: `layout.nav-width` 248px to 280px, `layout.nav-collapsed-width` 60px to 64px, `nav.item-height` 34px to 32px.

**Component.**

- `SideNav` gains an `action` slot, and `SideNavAction` renders the primary action: a full-width moss button when open and a 36px square "+" when collapsed, named by its label in the tooltip.
- `SideNavSection` gains `action` (a control at the end of the heading) and `icon`. A titled section with an icon becomes one icon on the rail that opens its rows in a panel beside the rail. Sections without an icon, such as Recent, are left out of the rail.
- `SideNavItem` gains `progress` (0 to 100 or `"done"`), `dot` and `actions`. Row actions render beside the link, not inside it, so the menu button is its own tab stop and no interactive element nests in a link.
- `SideNavUser` shows a chevron when it opens a menu; the avatar is round.
- On small screens the drawer shows the open light panel.
- Keyboard behaviour, `aria-current`, tooltips on the rail, flyouts, and forced-colours support are unchanged.

**One design everywhere.** Every sidebar example in the docs (the AppShell examples, the app screen pattern, the assistant home pattern) uses the same panel structure: workspace, action, Projects, Reports, Pinned, Recent, user.

## Contrast

No existing test was relaxed. The `sidebar.*` pairs are re-targeted at the light surface and the new `rail.*` pairs are added to `packages/tokens/scripts/contrast.ts`, all run in the five themes:

- `fg` and `fg-muted` on `bg`, `bg-hover` and `bg-active`: 4.5:1 (7:1 in high-contrast themes). `fg-active` on the same three: 7:1.
- `accent` and `badge-bg` on the same three: 3:1. `badge-fg` on `badge-bg`: 4.5:1.
- `action-fg` on `action-bg` and `action-bg-hover`; `mark-fg` on `mark-bg`; `avatar-fg` on `avatar-bg`: 4.5:1.
- White alphas for hover and current are composited over `bg` before measurement, through the `BASE` map in the same file.

The first run failed 18 print-theme pairs on the rail because print overrides gave it grey text on the ink background. The fix was to remove the print overrides from `rail.*`, so print keeps the dark rail with white text, rather than to loosen a threshold.

## Consequences

- The open panel is light and the rail is dark. Moving between them changes the surface but keeps the mark tile, the moss action, the avatar and the corner language, which is what the references show.
- Existing `sidebar.*` token names are kept, so consumers that used them still resolve. Their values change from deep moss to light paper, so a custom surface that drew on top of the old green needs checking. Two places in the docs still read these tokens (the login aside in the patterns CSS and the foundations layout frame); both stay legible with the new values.
- The deprecated `nav.*` aliases from ADR 0009 keep their previous values.
- Pages that asserted the deep-moss surface are updated to assert the light panel and the dark rail.
