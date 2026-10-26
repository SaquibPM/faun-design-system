# @faun-ds/tokens

> **Status: pre-1.0 (0.1.0).** APIs can change in minor releases. Verified in Chromium only (Firefox and Safari untested). Forced colours are covered by CSS tests, not a real session. No manual screen-reader pass. Many component states have not been reviewed by eye. ESM only. [What is tested and what is not](https://github.com/SaquibPM/faun-design-system/blob/main/docs/STATUS.md)

Design tokens for [Faun](https://github.com/SaquibPM/faun-design-system): 12-step colour scales, semantic roles, interaction states, five themes, type, space, shape, elevation, motion, layout, density and component tokens. Every token is a CSS variable (`--faun-*`), and is also available as typed JS, JSON and a Tailwind v4 preset.

## Install

```bash
npm install @faun-ds/tokens
```

```tsx
import "@faun-ds/tokens/css";       // all variables: themes, density, motion modes
import "@faun-ds/tokens/css/base";  // optional element defaults and .faun-type-<role> classes
```

```html
<html data-faun-theme="light" data-faun-density="comfortable">
```

## Fonts

Faun uses IBM Plex (Serif for display, Sans for the interface, Mono for identifiers), licensed under the SIL Open Font License. The fonts are not bundled; choose one:

- **Self-host with Fontsource** (no third-party request, works offline and under strict CSP):
  ```bash
  npm install @fontsource/ibm-plex-sans @fontsource/ibm-plex-serif @fontsource/ibm-plex-mono
  ```
  ```tsx
  import "@faun-ds/tokens/fonts.css";
  ```
  The three `@fontsource/*` packages are optional peer dependencies of this package. `fonts.css` fails to resolve if they are missing.
- **Google Fonts:** `import "@faun-ds/tokens/css/fonts";`
- **Next.js:** load the families with `next/font` and point the variables at them: `--faun-font-family-sans: var(--font-plex-sans)`, and likewise for `serif` and `mono`.

## Entry points

| Import | Contents |
| --- | --- |
| `@faun-ds/tokens/css` | All `--faun-*` variables: foundations, themes, `system`, print, density, reduced motion, calm mode, forced colours |
| `@faun-ds/tokens/css/base` | Optional element defaults (`html`, focus, links, selection) and `.faun-type-<role>` classes, in `@layer faun.base` |
| `@faun-ds/tokens/css/themes/<theme>` | One theme on `:root`, for single-theme consumers (`light`, `dark`, `light-hc`, `dark-hc`, `print`) |
| `@faun-ds/tokens/css/fonts` | IBM Plex from Google Fonts |
| `@faun-ds/tokens/fonts.css` | IBM Plex from Fontsource (needs the optional peer dependencies) |
| `@faun-ds/tokens/tailwind` | Tailwind v4 preset (`@theme inline`) |
| `@faun-ds/tokens/tailwind/strict` | Same, and removes Tailwind's default palette, type sizes, radii and shadows |
| `@faun-ds/tokens` | Typed JS: `vars`, `themes`, `version` and helpers |
| `@faun-ds/tokens/theme` | `createAccent(seed)`: a validated tenant accent scale for every theme |
| `@faun-ds/tokens/json`, `/scales`, `/status-map`, `/contrast` | Every token with descriptions, colour scales, domain state to tone map, contrast results for every required pair |

## Attributes

| Attribute | Values |
| --- | --- |
| `data-faun-theme` | `light`, `dark`, `light-hc`, `dark-hc`, `print`, `system`. Works on any element; themes nest. |
| `data-faun-density` | `compact`, `comfortable` (default), `spacious` |
| `data-faun-motion` | `reduced` forces reduced motion |
| `data-faun-calm` | Stops pulsing live indicators |
| `data-faun-print="off"` | Opt out of the automatic print theme |

## Tenant accent

```ts
import { createAccent } from "@faun-ds/tokens/theme";

const acme = createAccent("#0057B8");
acme.ok;   // false if the seed cannot meet contrast
acme.css;  // inject in a <style> after the Faun stylesheet
```

## Tailwind

See the [Tailwind guide](https://saquibpm.github.io/faun-design-system/#/guides/tailwind) for setup and the utility names.

## Building

```bash
pnpm --filter @faun-ds/tokens scales   # only after changing colour scale definitions
pnpm --filter @faun-ds/tokens build    # fails on any contrast failure
pnpm --filter @faun-ds/tokens test
```

## License

Apache-2.0
