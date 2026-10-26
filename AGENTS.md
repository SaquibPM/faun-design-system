# Rules for coding agents

Read this before writing UI that uses Faun or changing Faun itself. Tests and presets enforce what they can; the rest is reviewed.

## Building with Faun (product code)

1. **Never write a colour.** No hex, `rgb()`, `hsl()` or Tailwind palette classes (`bg-blue-100`). Use semantic utilities (`bg-surface`, `text-fg-muted`, `border-line-control`) or `var(--faun-…)`. In JS use `vars` from `@faun-ds/tokens`.
2. **Never write an arbitrary value.** No `text-[11px]`, `rounded-[10px]`, `z-[80]`. Use type roles (`text-body-sm`), radii (`rounded-md`), the 4px spacing scale and named layers (`z-modal`).
3. **Use a component before writing markup.** Check `@faun-ds/react` first. Buttons, fields, menus, tabs, dialogs and tables exist; do not rebuild them.
4. **Pick tokens by role, not by look.**
   - Text: `fg` → `fg-muted` → `fg-subtle`. Nothing quieter for readable text.
   - Control outlines use `line-control`; decorative dividers use `line-subtle`.
   - One `solid accent` button per view. Destructive fills only inside a confirmation step.
5. **Status = tone + icon + label.** Use `StatusBadge` with a domain and state from `@faun-ds/tokens/status-map`. Never invent a tone and never show status by colour alone.
   - `running` (lagoon) is a machine working now. `attention` (plum) is waiting on a person. Do not swap them for `info` or `warning`.
6. **Mark AI output.** Generated content that a person has not accepted uses the `ai` roles and names the agent that produced it ("Drafted by CSRD Narrative Agent").
7. **Icons** come from `@faun-ds/icons`, decorative by default. Pass `label` when an icon carries meaning alone. Icon-only buttons require a label. No emoji in UI.
8. **Numbers** in tables and KPIs use tabular figures (`numeric`). GHG scopes always use `viz-scope-1/2/3`; categorical series take `viz-cat-1…8` in order.
9. **Themes and density** are attributes (`data-faun-theme`, `data-faun-density`) on any element. Do not fork styles per theme; if something looks wrong in one theme, the token is wrong.
10. **Sentence case** for all text. Follow the Content foundation.

## Changing Faun

- Sources live in `packages/*/src` and `packages/tokens/scripts`. `dist` is generated; never edit it.
- Follow [BUILDERS.md](BUILDERS.md) for components and [CONTRIBUTING.md](.github/CONTRIBUTING.md) for process.
- Run `pnpm build && pnpm test && pnpm typecheck` and `node scripts/check-icons.mjs` before proposing a change. The build fails if any contrast pair fails.
- Add every new foreground and background pairing to `packages/tokens/scripts/contrast.ts`.
- Colour scales are generated (`pnpm --filter @faun-ds/tokens scales`) and committed. Do not hand-edit `src/scales/scales.json`.
- Renaming or removing public API is a major change.
- Verify visual changes by screenshotting the docs (`scripts/shoot.mjs`) in light and dark at 1440px and 390px.

## Machine-readable references

| What | Where |
| --- | --- |
| Every token with values per theme and descriptions | `@faun-ds/tokens/json` |
| Domain state → tone, icon, label | `@faun-ds/tokens/status-map` |
| Contrast results | `@faun-ds/tokens/contrast` |
| Icons with categories and keywords | `@faun-ds/icons/manifest.json` |
