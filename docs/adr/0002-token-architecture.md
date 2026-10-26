# 0002 · Token architecture: primitives, semantic, foundations

> Note: this project was previously named Bloom; it is now Faun. See [ADR 0010](0010-rename-to-faun.md).

- Status: accepted
- Date: 2026-10-18

## Decision

1. **Primitives** are colour ramps generated in OKLCH (`scripts/generate-primitives.ts`) from Faun's palette hues: sand (neutral), moss (brand), oxblood, ochre, sage, slate, lagoon, plum. Values are committed so diffs are reviewable. CI checks they match the generator.
2. **Semantic colour** (`src/themes/color.json`) references primitives only. Each token defines `light` and `dark`; other themes inherit through `themes.json` (`light-subtle` and `high-contrast` from light, `dark-deep` from dark, `print` from light-subtle) and override what differs.
3. **Foundations** (`src/foundations/foundations.json`) hold theme-independent values: type roles, space, size, radius, elevation, motion, z-index, layout, density.
4. Output names are `--faun-<path>`. The Tailwind preset maps semantic tokens to short utility names (`bg-surface`, `text-fg-tertiary`, `border-line-control`, `bg-success-subtle`).

## Why not Style Dictionary

Six inheriting themes, alpha compositing, a contrast contract that must see resolved values, and a Tailwind v4 `@theme` emitter were simpler to express in ~400 lines of typed build code than through Style Dictionary transforms and filters. The source format stays DTCG, so moving to Style Dictionary later is a build swap, not a migration.

## Consequences

- Themes can be applied to any element and nest.
- Adding a theme means adding overrides, not copying 124 values.
- The contrast contract runs on resolved values for every theme.
