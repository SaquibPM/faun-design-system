# Faun: notes for Claude Code

Follow [AGENTS.md](AGENTS.md); it is the source of truth for building with and changing Faun. Component spec: [BUILDERS.md](BUILDERS.md). Roadmap: [docs/ROADMAP.md](docs/ROADMAP.md). Verification status: [docs/STATUS.md](docs/STATUS.md).

## Commands

```bash
pnpm install
pnpm build                                  # tokens, icons, react, docs deps; fails on any contrast failure
pnpm test
pnpm typecheck
pnpm dev                                    # docs site
pnpm --filter @faun-ds/tokens scales       # regenerate colour scales after editing scripts/scales.ts
node scripts/check-icons.mjs                # every icon import must exist
node scripts/shoot.mjs --dist <docs dist> --out <dir> --routes "/,/foundations/colour" --themes light,dark --widths 1440,390 --full
```

## Identity

Faun's identity is its own: warm paper neutrals, moss brand, oxblood danger, lagoon machine, plum human; IBM Plex Serif (display), IBM Plex Sans (UI), IBM Plex Mono (identifiers). Carbon is a structural reference only. Do not introduce another visual language.

## Working agreements

- Plan milestones before coding; one concern per PR; add a changeset.
- If a contrast or data-viz test fails, fix the token. Never relax the test without an ADR.
