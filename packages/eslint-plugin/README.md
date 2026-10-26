# @faun-ds/eslint-plugin

> **Status: pre-1.0 (0.1.0).** Rules and options can change in minor releases. Covered by unit tests on Node 22 and 24 in CI; not tested with every editor, agent client or package manager. [What is tested and what is not](https://github.com/SaquibPM/faun-design-system/blob/main/docs/STATUS.md)

ESLint rules that keep product code on [Faun](https://github.com/SaquibPM/faun-design-system). They enforce the rules in `AGENTS.md` that a linter can check.

```bash
npm install -D @faun-ds/eslint-plugin eslint
```

```js
// eslint.config.js (ESLint 9+, flat config)
import faun from "@faun-ds/eslint-plugin";

export default [faun.configs.recommended];
```

| Rule | Catches |
| --- | --- |
| `@faun-ds/no-hex-colors` | Hex colours and `rgb()`, `hsl()`, `oklch()` and similar in strings and templates |
| `@faun-ds/no-arbitrary-tailwind-values` | `text-[11px]`, `z-[80]`, `[prop:value]` in `className` and class helpers (`cn`, `clsx`, `cx`, `classnames`, `twMerge`, `twJoin`, `cva`, `tv`) |
| `@faun-ds/icon-button-needs-label` | `IconButton` without a non-empty `label`; native `button` holding only icons |
| `@faun-ds/no-raw-status-colors` | Palette hues such as `text-green-600` and `style={{ color: "red" }}`; use `StatusBadge` |

## Options

```js
{
  "@faun-ds/no-hex-colors": ["error", { allow: ["#123"], functions: true }],
  "@faun-ds/no-arbitrary-tailwind-values": ["error", { allow: ["^var\\(--radix-"], classFunctions: ["twx"] }],
  "@faun-ds/icon-button-needs-label": ["error", { components: ["IconButton"], nativeButtons: true }],
  "@faun-ds/no-raw-status-colors": ["error", { classFunctions: ["twx"] }],
}
```

`var(--faun-…)` inside brackets is on-system and always passes. A three-digit value such as `#123` is a valid colour, so ticket references need `allow`.

See the [Tooling guide](https://saquibpm.github.io/faun-design-system/#/guides/tooling).
