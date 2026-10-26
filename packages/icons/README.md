# @faun-ds/icons

> **Status: pre-1.0 (0.1.0).** APIs can change in minor releases. Verified in Chromium only (Firefox and Safari untested). Forced colours are covered by CSS tests, not a real session. No manual screen-reader pass. Many component states have not been reviewed by eye. ESM only. [What is tested and what is not](https://github.com/SaquibPM/faun-design-system/blob/main/docs/STATUS.md)

173 icons for [Faun](https://github.com/SaquibPM/faun-design-system): a curated Lucide set (one glyph per meaning) plus Faun glyphs for ESG and agentic concepts.

```bash
npm install @faun-ds/icons
```

```tsx
import { IconApprovalGate, IconScope1, IconSearch } from "@faun-ds/icons";

<IconSearch />                                        // decorative, aria-hidden
<IconScope1 size="md" label="Scope 1 emissions" />    // role="img" with an accessible name
```

## Props

| Prop | Default | |
|---|---|---|
| `size` | `"md"` | `xs` 12 · `sm` 14 · `md` 16 · `lg` 20 · `xl` 24 · `2xl` 32, or a number |
| `label` | – | Accessible name. Omit for decorative icons. |
| `strokeWidth` | optical | 2 at ≤16px, 1.75 at ≤24px, 1.5 above. Leave unset. |

All SVG props pass through. Every icon renders `data-faun-icon="<name>"` and the `faun-icon` class.

## Data-driven icons

```tsx
import { DynamicIcon } from "@faun-ds/icons/registry";
<DynamicIcon name={statusMap.domains.run[run.status].icon} />
```

The registry imports every icon; use it only where names come from data. Unknown names render `status-unknown`.

## Categories

`navigation`, `actions`, `status`, `agentic`, `data`, `documents`, and `esg` (Faun glyphs: `scope-1`, `scope-2`, `scope-3`, `orchestrator`, `sub-agent`, `approval-gate`, `provenance`, `emission-factor`, `ledger`, `disclosure`, `materiality`). Full list with keywords in `@faun-ds/icons/manifest.json`.

Non-React consumers can use `@faun-ds/icons/sprite.svg`: `<svg><use href="sprite.svg#faun-scope-1"/></svg>`.

Lucide artwork is ISC-licensed; see the repository NOTICE.
