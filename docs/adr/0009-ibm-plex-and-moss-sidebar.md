# 0009 · IBM Plex typefaces and the moss sidebar

> Note: this project was previously named Bloom; it is now Faun. See [ADR 0010](0010-rename-to-faun.md).

- Status: accepted
- Date: 2026-10-23
- Amends: [0004 · Faun has its own identity](0004-faun-identity.md)

## Context

Two review findings on the docs and patterns.

1. The fonts should be IBM Plex.
2. The left panel had no dark green when open and was black when closed.

For the second: the navigation tokens used `moss.12` in light themes, which is `#20271a`, close to black and not readably green, and `gray.1` in dark themes, the same near-black as the canvas. The open panel therefore looked black, and so did the collapsed rail, which is the same element.

## Decision

**Type.** IBM Plex Serif (display), IBM Plex Sans (interface and body), IBM Plex Mono (identifiers, codes, numbers in charts). They replace Newsreader, Inter and JetBrains Mono. All three are SIL OFL.

- Plex has static weights and no optical-size axis. No token sets `font-variation-settings`, and the docs font link drops `opsz`.
- Weights: Sans 400, 500, 600; Serif 400, 500, 600; Mono 400, 500.
- Plex is wider than Inter and has a larger x-height, so negative tracking on roles is halved and the three serif figure roles shrink by 2 to 4px (figure-xl 56 to 52, figure-lg 40 to 36, figure-md 32 to 30) so six-digit totals still fit a KPI tile. Line heights keep the 2px grid.
- Stacks keep the same system fallbacks as before.
- Apps load the fonts either from Google Fonts (`@faun-ds/tokens/css/fonts`) or self-hosted through `@fontsource/ibm-plex-*` (`@faun-ds/tokens/fonts.css`, optional peer dependencies).

**Sidebar.** A new `sidebar` token group: `bg`, `bg-hover`, `bg-active`, `fg`, `fg-muted`, `fg-active`, `border`, `accent`, `badge-bg`, `badge-fg`. The open panel and the collapsed icon rail use the same surface.

- Light and light high-contrast: `bg` is `moss.10`. Dark and dark high-contrast: `bg` is the light scale's `moss.12`, pinned, so it stays visibly green and lighter than the near-black canvas. Print is white.
- Text is white at set opacities. The existing `nav.*` tokens remain as deprecated aliases with the same values.

## Contrast

No existing test was relaxed. New pairs are added to `packages/tokens/scripts/contrast.ts` and run in all five themes:

- `sidebar.fg` and `sidebar.fg-muted` on `bg`, `bg-hover` and `bg-active`: 4.5:1 (7:1 in high-contrast themes).
- `sidebar.fg-active` on the same three: 7:1.
- `sidebar.accent` (current bar and focus ring) and `sidebar.badge-bg` on the same three: 3:1.
- `sidebar.badge-fg` on `badge-bg`: 4.5:1.
- `sidebar.fg` on `sidebar.bg` at 3:1 for the collapsed rail icons.

The attention badge previously used `status.attention.solid`, which is 1.8:1 on a deep green surface. It now uses `sidebar.badge-bg`, a lighter plum from the dark scale.

## Consequences

- Products using `nav.*` keep working. They should move to `sidebar.*`; the aliases will be removed in the next major version.
- Products that self-host fonts under other names map `--faun-font-family-sans|serif|mono` as before.
- Tracking and sidebar values were checked visually in light and dark at 1440px and 390px.
