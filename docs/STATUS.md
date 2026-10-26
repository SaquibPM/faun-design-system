# Status: what is tested and what is not

Faun is **pre-1.0 (0.1.0)**. APIs can change in minor releases. This page says plainly what has been checked, how, and what has not, so you can decide what to verify yourself before you depend on it.

## Tested

| Area | How | Where it runs |
| --- | --- | --- |
| Colour contrast | Every foreground and background pair in every theme is computed at build time; the build fails if one misses its target | `pnpm build` (tokens), CI |
| Token contracts, colour-vision-safe data palettes | Unit tests | `pnpm test`, CI |
| Component behaviour and accessibility | Unit tests per component, axe checks and keyboard-path tests | `pnpm test`, CI |
| Forced colours (Windows High Contrast) | Tests that check the CSS rules (`forced-colors` media query, system colours). **No real forced-colours browser session** | `pnpm test`, CI |
| Docs site | Playwright smoke tests of routes, themes, relief texture and chart palettes | `pnpm e2e`, CI, **Chromium only** |
| Installability | The packed tarballs are installed into a fresh Vite app and a fresh Next.js App Router app, type-checked, built and loaded in Chromium | `node scripts/consumer-smoke.mjs`, CI |
| Registry install | The same smoke test against the published packages | `node scripts/consumer-smoke.mjs --registry`, run by hand after publishing |
| Generated files | Every generator is re-run and must reproduce its output | `pnpm check:generated`, CI |
| Documentation hosting | The built site is served under the GitHub Pages subpath and loaded in Chromium; the live site is checked after deploy | `node scripts/pages-smoke.mjs`, CI |
| Node versions | Build, lint, typecheck and tests on Node 20, 22 and 24 | CI matrix |

## Not tested, or only partly

- **Browsers.** Chromium only. Firefox and Safari (WebKit) are untested. CSS uses cascade layers and logical properties, so current evergreen browsers are expected to work; that is an expectation, not a result.
- **Screen readers.** No manual pass with NVDA, JAWS, VoiceOver or TalkBack. Automated axe checks and keyboard tests cannot find every problem (reading order, announcements, verbosity).
- **Forced colours** is covered by CSS rule tests only (see above).
- **States nobody has looked at.** The main examples were reviewed in light and dark at 1440px and 390px. Many combinations (error plus disabled plus dense, very long text, right-to-left, the `print` theme in a real print dialog, the high-contrast themes on every component) are covered only by automated contrast and axe checks, not by eye.
- **Package managers.** The consumer test installs with npm. pnpm and yarn are expected to work and are not tested in CI.
- **React.** Peer range is 18.2 or 19. CI runs React 19; React 18.3 was checked once by hand.
- **Performance.** A small app using a table, a chart, the shell and the composer ships about 800 kB of script (240 kB gzipped) and 720 kB of CSS (90 kB gzipped). Component styles ship as one stylesheet per package; per-component CSS is not available yet.

## Constraints you should know about

- **ESM only.** Every package except `@faun-ds/eslint-plugin` is an ES module with no CommonJS build.
- **Pre-1.0.** Expect breaking changes in minor versions; they are listed in the changelog.
- **IBM Plex is not bundled.** Install the optional `@fontsource/ibm-plex-*` packages or load it from Google Fonts.
- **Not affiliated with IBM.** Carbon is referenced as a structural comparison only (see [ROADMAP.md](ROADMAP.md)).
- **Node.** `engines` is `>=20`; CI covers 20, 22 and 24. `.nvmrc` pins 22 for development.

## Reporting a gap

If you find something that this page says is covered but is not, open an issue. If you can run a screen reader, a different browser or a forced-colours session, results are very welcome.
