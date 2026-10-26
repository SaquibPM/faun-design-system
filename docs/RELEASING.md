# Releasing

Faun publishes eight packages to npm under the `@faun-ds` scope, from GitHub Actions, with [Changesets](https://github.com/changesets/changesets) and npm provenance.

| Package | Notes |
| --- | --- |
| `@faun-ds/tokens`, `@faun-ds/icons` | Linked in `.changeset/config.json`: they always version together |
| `@faun-ds/grid`, `@faun-ds/react`, `@faun-ds/data`, `@faun-ds/ai` | UI packages; `react`, `data` and `ai` depend on each other at exact workspace versions |
| `@faun-ds/eslint-plugin`, `@faun-ds/mcp` | Tooling |

`apps/docs` is private and is deployed to GitHub Pages, not npm.

Every published package declares `engines.node >=20`; CI builds and tests on Node 20, 22 and 24, and `.nvmrc` pins 22 for development.

## One-time setup

See [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md): GitHub repository, npm organisation, Pages, branch protection and the publish credential.

### Publish credential: pick one

**A. Automation token (works today).** Create a granular access token on npmjs.com with read and write access to the `@faun-ds` packages (or a classic Automation token, which bypasses 2FA for CI), and save it as the repository secret `NPM_TOKEN`. `.github/workflows/release.yml` passes it to `changesets/action`. Provenance is on (`publishConfig.provenance` and `NPM_CONFIG_PROVENANCE`) and needs `id-token: write`, which the workflow already grants.

**B. Trusted publishing (no long-lived secret).** After the first release has created the packages, open each package on npmjs.com, Settings, Trusted Publisher, and add GitHub Actions with your repository (`SaquibPM/faun-design-system` unless renamed) and workflow `release.yml`. Then remove `NPM_TOKEN` from the workflow and secrets, and make sure the job uses npm 11.5.1 or newer (`npm install -g npm@latest` before the release step). Trusted publishing cannot create a package that does not exist yet, so the first publish needs option A or a manual publish.

## Cutting 0.1.0

Every package is already at `0.1.0` and there are no pending changesets, so the first release publishes what is in `main` without a version bump. **The first publish is always manual and goes out under the `next` dist-tag**, is checked against the registry, and only then promoted to `latest`. Caveat: a registry may give the very first version of a brand-new package the `latest` tag as well, whatever `--tag` says (rehearsed on a local verdaccio: `npm publish --tag next` of a first version gave `{latest, next}`; later versions published with `--tag next` left `latest` alone, and `npm dist-tag rm ... latest` was undone by the registry). Treat the first publish of 0.1.0 as public. The gate that protects users is therefore everything BEFORE it (step 1, especially the tarball consumer smoke test), and the `next` tag protects every release after the first. The full order of everything around it (scope, organisation, clean history, push, Pages) is in [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md); this is the release part.

A push to `main` never performs the first publish: `scripts/release-guard.mjs` refuses while `@faun-ds/ai` (the first package) is not on npm, and says so in the run summary.

1. **Local checks** (also run by CI on Node 20, 22 and 24):
   ```bash
   pnpm install --frozen-lockfile && pnpm build && pnpm test && pnpm lint && pnpm typecheck
   node scripts/check-icons.mjs
   pnpm check:generated
   pnpm preflight                      # fails on placeholders, forbidden strings, history, unpublished-name conflicts
   node scripts/consumer-smoke.mjs     # packed tarballs into fresh Vite and Next.js apps
   pnpm -r publish --dry-run --no-git-checks --access public --tag next
   ```
2. **Dry run in CI.** Actions, **Release**, Run workflow, leave **dry-run** ticked. It runs the build, the tests, the preflight and `pnpm publish --dry-run`, and publishes nothing.
3. **Publish under `next`.** Run the workflow again with **dry-run** unticked and **dist-tag** `next`. It runs `pnpm changeset publish --tag next` with provenance, then pushes the tags (`@faun-ds/react@0.1.0`, ...). Re-running is safe: `changeset publish` skips versions already on npm.
4. **Registry smoke test.** Run the **Consumer smoke (registry)** workflow with tag `next`, or locally:
   ```bash
   node scripts/consumer-smoke.mjs --registry --tag next
   ```
   It installs `@faun-ds/*@next` from the registry (no tarballs, no overrides) into a fresh Vite and a fresh Next.js app, type-checks, builds and loads both in Chromium. `--registry-url <url>` points it at another registry. The README quick start is taken from the local `README.md`, so run it from the released commit.
5. **Promote.** Needs an npm login that can publish to the scope (two-factor code if the account asks for one):
   ```bash
   VERSION=0.1.0
   for p in tokens icons grid react data ai eslint-plugin mcp; do
     npm dist-tag add "@faun-ds/$p@$VERSION" latest
   done
   npm view @faun-ds/react dist-tags      # latest and next both 0.1.0
   ```
   (For the very first release `latest` may already be set; the loop is then a harmless no-op.)
   If something is wrong, do not promote: publish a fix as `0.1.1` under `next` and repeat from step 4. Moving `latest` back is `npm dist-tag add @faun-ds/<pkg>@<previous> latest`.
6. **GitHub release.** Create release notes from `CHANGELOG.md` for the tags the workflow pushed.
7. **Verify from a clean directory** with no tag: `npm view @faun-ds/react version`, then the README quick start.

If the workflow fails half way, re-run it with the same inputs.

### Workflow reference

| Trigger | What happens |
| --- | --- |
| Push to `main` | Only if the repository matches (see below) **and** the packages are already on npm. Changesets opens or merges the **chore: release** pull request and publishes under `latest`. |
| Run workflow, dry-run ticked (default) | Build, test, preflight, `pnpm publish --dry-run --tag <dist-tag>`. Nothing is published. |
| Run workflow, dry-run unticked | Build, test, preflight, `pnpm changeset publish --tag <dist-tag>`, push tags. |

**Which repository may publish.** Not just `SaquibPM/faun-design-system`: the repository must equal the one named in the packages' `repository` field (so a rename with `scripts/rename-scope.mjs` keeps working), or the value of the repository variable `RELEASE_REPO` (`owner/name`) when that is set. Use `RELEASE_REPO` for a fork or a mirror that should publish. When the check fails, the `guard` job prints a warning annotation and a run summary with the reason; the release job is skipped on purpose and never silently.

### Manual first publish (fallback)

Only if CI cannot publish (for example the token is missing and you need the packages to exist for trusted publishing):

```bash
npm login                      # an account that is a member of the @faun-ds organisation
pnpm build
pnpm -r publish --access public --provenance=false --no-git-checks --tag next
```

Then continue from step 4. Packages published this way have no provenance; prefer CI.

## Every later release

1. In each pull request that changes a published package: `pnpm changeset`, choose the bump, write a user-facing summary.
2. On merge to `main`, `changesets/action` opens or updates a **chore: release** pull request that bumps versions and writes `packages/*/CHANGELOG.md`.
3. Merge that pull request. The action publishes to npm.
4. Pre-1.0: breaking changes are a minor bump. Keep `@faun-ds/tokens` and `@faun-ds/icons` in step (they are linked).

## Documentation site

`.github/workflows/docs.yml` builds `apps/docs` and deploys it to GitHub Pages on every push to `main` that touches the docs or packages, on pull requests (build and smoke test only) and on manual runs. The base path is derived from the repository name (`/<repo>/`, or `/` for a `<owner>.github.io` repository; override with the repository variable `PAGES_BASE`). The workflow:

1. builds with `vite build --base /<repo>/` (the default `./` base stays for local use and the artifact build);
2. runs `scripts/prepare-pages.mjs`: checks every asset URL sits under the base, writes `404.html` (a copy of `index.html` that redirects `/<repo>/foundations/colour` to `/<repo>/#/foundations/colour`) and `.nojekyll`;
3. runs `scripts/pages-smoke.mjs` against the built files served under the subpath: assets return 200, six hash routes render a heading with no console errors or failed requests, the 404 fallback works;
4. deploys, then runs the same smoke test against the live URL (`verify-live`), retrying for up to five minutes while the CDN catches up.

In the repository settings, Pages, set **Source** to **GitHub Actions**. Locally: `pnpm --filter ./apps/docs exec vite build --base /<repo>/ --outDir /tmp/x`, then `node scripts/prepare-pages.mjs --dist /tmp/x --base /<repo>/ && node scripts/pages-smoke.mjs --dist /tmp/x --base /<repo>/`.

## Rolling back

`npm deprecate @faun-ds/react@0.1.1 "Broken release, use 0.1.2"` and publish a fix. Unpublishing is only possible within 72 hours and is discouraged.
