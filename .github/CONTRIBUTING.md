# Contributing to Faun

Thank you for helping. Faun is a shared foundation for many products, so every addition is a long-term commitment. Proposals are reviewed for need before polish.

## Ways to contribute

- Report a bug, an accessibility problem or a documentation gap.
- Propose a token, icon, component or pattern (open an issue first).
- Fix something labelled `good first issue`.
- Improve the docs: clearer usage guidance, better examples, corrections.

## Setup

```bash
git clone https://github.com/SaquibPM/faun-design-system.git
cd faun-design-system
nvm use          # Node 22 (development default; CI also tests 20 and 24)
corepack enable  # pnpm 9
pnpm install
pnpm build
pnpm test
pnpm dev         # documentation site
pnpm check:generated   # re-run every generator and fail if an output drifted (CI does the same)
node scripts/consumer-smoke.mjs   # optional: install the packed tarballs into fresh Vite and Next.js apps
```

## How a change flows

1. **Open an issue.** For anything new, describe the product problem, where it appears and why existing pieces do not solve it. Component proposals need at least two real use cases.
2. **Branch.** `feat/<topic>`, `fix/<topic>` or `docs/<topic>`. Keep a pull request to one concern.
3. **Build it to the bar** below.
4. **Add a changeset:** `pnpm changeset`.
5. **Open a pull request.** Fill in the template. Visual changes need screenshots in light and dark at 1440px and 390px.
6. **Review.** A code owner reviews design, accessibility and API. CI must pass.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org): `feat(react): add Tree`, `fix(tokens): raise fg-muted contrast in dark`.

## The bar for a component

Each component lives in its own folder with six files: implementation, CSS, tests, examples, docs and an index. See [BUILDERS.md](../BUILDERS.md) for the full spec. Before a component is marked stable it must:

1. Use tokens only. A test fails the build on raw colours or sizes.
2. Pass axe in every documented state and have keyboard tests for every interaction.
3. Work in all five themes and three densities at 390px and 1440px.
4. Forward refs, accept `className`, and pass remaining props to its root element.
5. Be documented: usage, style, code and accessibility, with a do and a don't for the most common misuse.

## Tokens

- Edit sources in `packages/tokens/src` and `packages/tokens/scripts`, never `dist`.
- Colour scales are generated: change a definition in `scripts/scales.ts`, run `pnpm --filter @faun-ds/tokens scales`, and commit the JSON.
- Semantic roles reference scale steps only.
- New foreground and background combinations belong in `scripts/contrast.ts`. If it is used together, it is tested together.
- If a contrast or colour-vision test fails, fix the token. Never relax a test without an ADR.

## Icons

Prefer the curated set. Adding an icon means adding one meaning, not a synonym. Custom glyphs live in `packages/icons/src/custom`: 24×24 grid, 1.75px stroke, round caps and joins, no fills. Check them at 16px.

## Versioning

Semantic versioning per package, managed with Changesets.

| Change | Bump |
| --- | --- |
| New token, icon, component or prop that passes every check | minor |
| Fix, or a value tweak within a token's documented intent | patch |
| Renamed or removed public API, or a changed meaning | **major**, with a deprecation in the previous minor |

## Accessibility

Accessibility is a release criterion. Changes that lower a contrast ratio below the contract, remove a focus state or rely on colour alone will not be merged.

## Decisions

Significant decisions are recorded as ADRs in [`docs/adr`](../docs/adr). Propose one with your pull request when you change structure, naming or a documented principle.

## Code of conduct

Participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).
