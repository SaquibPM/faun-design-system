# README images

Every image in the root [README.md](../../README.md) is generated from the built documentation site. Do not edit the PNGs by hand.

```bash
pnpm build                 # packages must be built first
pnpm readme:shots          # builds the docs privately, captures, composes, optimises
pnpm readme:shots -- --only hero,gallery-ai     # a subset (names below)
pnpm readme:shots -- --dist <docs-dist>         # reuse an existing docs build
pnpm readme:shots -- --no-optimise              # skip PNG quantisation
```

The script is [scripts/readme-shots.mjs](../../scripts/readme-shots.mjs).

| Files | What they show | `--only` name |
| --- | --- | --- |
| `hero-{light,dark}.png` | Banner: mark, tagline, assistant home and a bar chart | `hero` |
| `gallery-*-{light,dark}.png` | Eight gallery tiles | `gallery` or the tile name, for example `gallery-ai` |
| `step-*-{light,dark}.png` | The four "build an app" results | `steps` |
| `quickstart-{light,dark}.png` | The README Vite quick start, built from the literal `main.tsx` and `App.tsx` blocks in the README | `quickstart` |

## How it works

1. The docs are built with Vite into `$TMPDIR/faun-docs-readme` and served on a random local port.
2. Playwright (Chromium) captures components and patterns from the docs at 2x, in `light` and `dark`, with reduced motion and fixed `data-faun-theme`, `data-faun-density` and `data-viz-palette` attributes.
3. Tiles and the hero are composed in an HTML page that uses Faun's own tokens, so the banner is in Faun's identity and switches with the theme.
4. The quick start is built as a separate Vite app from the README code and captured, so the picture next to the code is what the code renders. Keep those two README code blocks starting with the same first lines as `scripts/consumer-smoke.mjs` expects.
5. PNGs are palette-quantised with [sharp](https://sharp.pixelplumbing.com) when it can be resolved (`npm i -g sharp`, then `NODE_PATH=$(npm root -g)`). Without it the images are left unoptimised and larger. Keep the folder under 4 MB.

Needs Chromium (`pnpm exec playwright install chromium`, or `PLAYWRIGHT_CHROMIUM=/path/to/chrome`) and network access for the IBM Plex fonts that the docs load from Google Fonts.

## When to regenerate

After a visual change to a component or pattern shown in the README, a change to the themes or palettes, or a change to the README quick start. Commit the PNGs with the change.
