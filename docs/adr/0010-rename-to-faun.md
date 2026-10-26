# 0010 · Rename the design system from Bloom to Faun

- Status: accepted
- Date: 2026-10-26

> This project was previously named Bloom. ADRs 0001 to 0009 were written under that name and now read "Faun"; each carries a note at the top.

## Decision

The design system is renamed **Faun**. The rename happened before the first public release (nothing was published to npm, and the GitHub repository had not been created), so no deprecation period or codemod for outside users is needed. The visual identity (ADR 0004, 0006 to 0009) is unchanged: colours, type, relief and the logo glyph stay as they were. Only names and the wordmark text changed.

The rename was applied by a scripted, case-aware replacement (`Bloom` to `Faun`, `bloom` to `faun`, `BLOOM` to `FAUN`) over every file `git add -A` would add. Both names have five letters, so line lengths and table alignment did not move. Generated files (tokens, icons, MCP data, `llms.txt`, `props.json`, the lockfile) were rebuilt, not edited.

## Old and new identifiers

| Surface | Old | New |
| --- | --- | --- |
| Product name | Bloom, Bloom Design System | Faun, Faun Design System |
| npm scope and packages | `@bloom-ds/tokens`, `icons`, `react`, `data`, `ai`, `grid`, `eslint-plugin`, `mcp` | `@faun-ds/tokens`, `icons`, `react`, `data`, `ai`, `grid`, `eslint-plugin`, `mcp` |
| CLI binary | `bloom-mcp` | `faun-mcp` |
| Repository (placeholder owner) | `bloom-ds/bloom` | `faun-ds/faun` |
| Documentation site | `https://bloom-ds.github.io/bloom` | `https://faun-ds.github.io/faun` |
| CSS custom properties | `--bloom-*` | `--faun-*` |
| Class names | `.bloom-*` | `.faun-*` |
| Data attributes (and `dataset` keys) | `data-bloom-theme`, `data-bloom-density`, `data-bloom-*` (`bloomTheme`) | `data-faun-theme`, `data-faun-density`, `data-faun-*` (`faunTheme`) |
| Cascade layers | `bloom.base`, `bloom.components`, `bloom.utilities` | `faun.base`, `faun.components`, `faun.utilities` |
| Environment variables | `BLOOM_*` (for example `BLOOM_PREFLIGHT_FORBIDDEN`, `BLOOM_MCP_DATA`) | `FAUN_*` |
| ESLint plugin | `@bloom-ds/eslint-plugin`, rules `bloom/...` | `@faun-ds/eslint-plugin`, rules `faun/...` |
| MCP server | server name `bloom`, data file `bloom.json` | server name `faun`, data file `faun.json` |
| Token and Tailwind files | `bloom.css`, `bloom-strict.css` | `faun.css`, `faun-strict.css` |
| React and icon identifiers | `BloomIcon`, `BloomData`, icon `source: "bloom"` | `FaunIcon`, `FaunData`, `source: "faun"` |
| Docs storage keys | `bloom-docs-*` | `faun-docs-*` |
| Renamed files | `docs/adr/0004-bloom-identity.md`, `scripts/lib/bloom-docs.mjs`, `apps/docs/src/components/BloomMark.tsx`, `apps/docs/src/content/guides/adopting-bloom.mdx` | `0004-faun-identity.md`, `faun-docs.mjs`, `FaunMark.tsx`, `adopting-faun.mdx` |
| Copyright line | Saquib Jawed and Bloom contributors | Saquib Jawed and Faun contributors |

## Consequences

- Anything written against the old names (a product using `--bloom-*` variables, an agent prompt naming the old MCP server) must be updated; there is no alias layer, by design, because there are no users yet.
- `scripts/rename-scope.mjs` still renames only the npm scope and GitHub owner and repository. `scripts/set-owner.mjs <github-username>` rewrites the placeholder owner everywhere in one command.
- Earlier ADRs keep their text under the new name. They describe decisions taken before the rename; the history of the name lives here.
