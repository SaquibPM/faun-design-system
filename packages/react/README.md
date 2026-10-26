# @faun-ds/react

> **Status: pre-1.0 (0.1.0).** APIs can change in minor releases. Verified in Chromium only (Firefox and Safari untested). Forced colours are covered by CSS tests, not a real session. No manual screen-reader pass. Many component states have not been reviewed by eye. ESM only. [What is tested and what is not](https://github.com/SaquibPM/faun-design-system/blob/main/docs/STATUS.md)

Accessible React components for enterprise software, built on [Radix](https://www.radix-ui.com) primitives and styled with plain CSS on [Faun tokens](https://github.com/SaquibPM/faun-design-system/tree/main/packages/tokens). 60+ components: actions, forms, overlays, navigation (including the app shell with the moss side navigation), feedback, display and layout.

Part of [Faun](https://github.com/SaquibPM/faun-design-system), an open design system for agentic enterprise software.

## Install

```bash
npm install @faun-ds/react @faun-ds/tokens @faun-ds/icons react react-dom
```

React 18.2 or 19 is required (peer dependencies). Radix, `cmdk` and `react-day-picker` are regular dependencies; you do not install them.

## Load the styles

Import once, at the root of the app. Order matters: tokens first.

```tsx
import "@faun-ds/tokens/css";        // tokens: themes, density, motion modes
import "@faun-ds/tokens/fonts.css";  // IBM Plex via Fontsource (optional, see below)
import "@faun-ds/tokens/css/base";   // element defaults and type classes (optional)
import "@faun-ds/react/styles.css";  // component styles
```

`fonts.css` needs the Fontsource packages: `npm install @fontsource/ibm-plex-sans @fontsource/ibm-plex-serif @fontsource/ibm-plex-mono`. Prefer Google Fonts? Import `@faun-ds/tokens/css/fonts` instead.

Set the theme and density as attributes on `<html>` (no provider needed):

```html
<html data-faun-theme="light" data-faun-density="comfortable">
```

Themes: `light`, `dark`, `light-hc`, `dark-hc`, `print`, `system`. Density: `compact`, `comfortable`, `spacious`.

## Use

```tsx
import { Button, Field, Input, StatusBadge, TooltipProvider } from "@faun-ds/react";

export function App() {
  return (
    <TooltipProvider>
      <StatusBadge domain="run" state="awaiting_approval" />
      <Field label="Name"><Input placeholder="Facility name" /></Field>
      <Button intent="accent" variant="solid">Approve</Button>
    </TooltipProvider>
  );
}
```

`TooltipProvider` is the only provider most apps need. Add `Toaster` if you use toasts.

## Next.js and server rendering

Components carry a `"use client"` directive, so they can be imported from Server Components in the App Router. Pass only serialisable props (no functions) from a Server Component; put interactive trees in a client component. Server rendering is covered by the release smoke test, not only by unit tests.

Component styles live in `@layer faun.components`, so unlayered CSS in your app overrides them without `!important`.

## Documentation

Every component has a docs page with examples, props and accessibility notes: <https://saquibpm.github.io/faun-design-system>. Related packages: [`@faun-ds/data`](https://github.com/SaquibPM/faun-design-system/tree/main/packages/data), [`@faun-ds/ai`](https://github.com/SaquibPM/faun-design-system/tree/main/packages/ai), [`@faun-ds/grid`](https://github.com/SaquibPM/faun-design-system/tree/main/packages/grid).

## License

Apache-2.0
