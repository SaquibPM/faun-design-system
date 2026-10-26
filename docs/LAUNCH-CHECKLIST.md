# Launch checklist

What is left to do by a person. Everything in the repository is ready; these steps need accounts, ownership and decisions. **Do them in this order.** Several steps cannot be undone (a pushed history, a published version, a claimed scope), and the order is what keeps the cheap fixes cheap.

Run `pnpm preflight` at any point. It checks what a script can check and ends with a banner listing every item that only a person can do. Run it with `--strict` right before publishing: open human items then fail the run.

| # | Step | Undoable? |
| --- | --- | --- |
| 1 | [Check the scope and the names](#1-check-the-scope-and-the-names) | yes |
| 2 | [Create the organisation, the repository and the teams](#2-create-the-organisation-the-repository-and-the-teams) | yes |
| 3 | [Fresh `git init` in a clean folder](#3-fresh-git-init-in-a-clean-folder) | yes |
| 4 | [Scan the history](#4-scan-the-history) | yes |
| 5 | [Push](#5-push) | **no**: history is public |
| 6 | [Run the Pages workflow](#6-run-the-pages-workflow) | yes |
| 7 | [Publish 0.1.0 under `next`](#7-publish-010-under-next) | **no**: a version number is used up for ever |
| 8 | [Registry smoke test](#8-registry-smoke-test) | yes |
| 9 | [Promote to `latest`](#9-promote-to-latest) | yes (`dist-tag` can be moved back) |

## 1. Check the scope and the names

- [ ] `pnpm preflight` and read the npm lines. A `404` from `npm view @faun-ds/react` means the **package** is unpublished; it does **not** prove that the `@faun-ds` **scope** is free, because npm answers 404 for an unclaimed scope and for an unpublished package alike. Only creating the organisation (step 2) settles it.
- [ ] Do the name checks in [OWNERSHIP-AND-NAMING.md](OWNERSHIP-AND-NAMING.md): employment and IP, trademark and registry searches, copyright holder.
- [ ] If the scope, owner or repository name is not available or not acceptable, change it now with one command and read the dry run first:
  ```bash
  node scripts/rename-scope.mjs --all <new-name> --to-repo <repo>            # preview
  node scripts/rename-scope.mjs --all <new-name> --to-repo <repo> --write    # apply
  pnpm install && pnpm build && pnpm test && pnpm preflight
  ```
- [ ] Confirm the copyright holder in `LICENSE`, `NOTICE`, `packages/icons/NOTICE` and each package's `author` ("Saquib Jawed and Faun contributors"). Change it everywhere if it should be an organisation. Apache-2.0 everywhere; Lucide artwork (ISC) is attributed in both NOTICE files.

## 2. Create the organisation, the repository and the teams

- [ ] **npm:** create the organisation at <https://www.npmjs.com/org/create> (free for public packages). If the name is taken the page says so: go back to step 1. Turn on two-factor authentication for every owner, then check `npm org ls <scope>`.
- [ ] **GitHub:** create the organisation or use your user, and the **public** repository `faun` (empty: no README, no licence, no `.gitignore`).
- [ ] **CODEOWNERS.** `.github/CODEOWNERS` contains a single rule, `* @OWNER_PLACEHOLDER`, and `pnpm preflight` **fails while the placeholder remains**. Replace it with one command: `node scripts/set-owner.mjs <github-username>` previews, `--write` applies it to CODEOWNERS, the manifests, README badges, docs links and issue templates (add `--codeowner @org/team` for a team), then run `pnpm build` and `pnpm preflight`. A team must exist. Create teams (`maintainers`, `design-systems`, `agentic-ux`) only if you want per-directory rules; then add those rules back and make sure every team has **write** access to the repository, because GitHub ignores owners it cannot resolve.
- [ ] **Do not turn on "Require review from Code Owners" until the owners in CODEOWNERS exist** and can approve. A required review that nobody can give blocks every pull request, including your own, and the release pull request that Changesets opens.
- [ ] Decide on a commit email: use the GitHub noreply address (Settings, Emails, "Keep my email addresses private"). Commits publish it.
- [ ] Move the local adoption-notes folder (hidden, name starts with `.n` and ends with `-adoption`) **out of the repository directory**. It holds notes for one downstream project, is gitignored, and `pnpm preflight` fails while it sits in the folder. `PROGRESS.md` and `scripts/snapshot.sh` are gitignored and stay local.
- [ ] Optional: list your own private terms (employer, project names), one regular expression per line, in an untracked `.preflight-forbidden` file. The built-in list already covers the private project names, employer, personal email domains, absolute paths and the adoption folder.

## 3. Fresh `git init` in a clean folder

Full explanation: [PUBLISH-FROM-CLEAN-HISTORY.md](PUBLISH-FROM-CLEAN-HISTORY.md). Never push the working folder's own history.

- [ ] Export the public file set into a new folder that has never held the adoption notes, with no history, no ignored files and no `node_modules`:
  ```bash
  node scripts/export-clean.mjs ../faun-publish --commit --email ID+username@users.noreply.github.com
  cd ../faun-publish
  ```
  Equivalent without the script (works with or without an existing `.git`):
  ```bash
  SRC="$PWD"; DEST="$HOME/faun-publish"; mkdir -p "$DEST"; GD="$(mktemp -d)"; git init --bare -q "$GD"
  git -c core.excludesFile= --git-dir="$GD" --work-tree="$SRC" ls-files -o --exclude-standard -z | (cd "$SRC" && tar --null -T - -cf -) | tar -xf - -C "$DEST"
  rm -rf "$GD"; cd "$DEST" && git init -b main && git add -A && git commit -m "chore: initial public commit"
  ```

## 4. Scan the history

- [ ] In the clean folder: `pnpm install --frozen-lockfile && pnpm build && node scripts/preflight-publish.mjs`. It scans every file that would be tracked, **every commit** (messages, authors, diffs), and the files npm would publish (generated output such as `dist` and the MCP data ships even though it is gitignored). It must report no FAIL.
- [ ] Second, independent check of the history with your own terms: `git log --all -p | grep -inE 'term1|term2' || echo clean`.
- [ ] Read `git ls-files` once. Look at `git log --format='%an <%ae>'`: only the noreply address should appear.

## 5. Push

- [ ] `git remote add origin https://github.com/<owner>/faun.git && git push -u origin main`.
- [ ] Settings, Actions, General: **Workflow permissions: Read and write**, and tick "Allow GitHub Actions to create and approve pull requests" (the release pull request needs it).
- [ ] Settings, Security: enable private vulnerability reporting (`SECURITY.md` points to it), Dependabot alerts and secret scanning. Enable Discussions (`SUPPORT.md` links to it). Create the labels the templates use (`good first issue`, `component proposal`, ...).
- [ ] Wait for **CI** on `main` to be green on Node 20, 22 and 24, plus `generated-drift`, `consumer` and `e2e`.
- [ ] Branch protection on `main`: require pull requests; require the checks `verify (node 20)`, `verify (node 22)`, `verify (node 24)`, `generated-drift`, `consumer` and `e2e`; require up-to-date branches; block force pushes. **Leave "Require review from Code Owners" off** unless step 2 is done properly.
- [ ] Pushing to `main` does **not** publish anything: the Release workflow refuses the first publish and says so in its run summary.

## 6. Run the Pages workflow

- [ ] Settings, Pages: **Source: GitHub Actions**.
- [ ] Actions, **Deploy documentation**, Run workflow (it also runs on push). It builds with the base path `/<repo>/`, writes the `404.html` fallback, smoke-tests the built site under the subpath in Chromium, deploys, then loads the **live** URL and tests it again (`verify-live`).
- [ ] Open `https://<owner>.github.io/<repo>/` yourself. If the repository is called `<owner>.github.io`, or you use a custom domain, the base is `/`: set the repository variable `PAGES_BASE` if the automatic choice is wrong.

## 7. Publish 0.1.0 under `next`

The detailed procedure, with the exact commands, is in [RELEASING.md](RELEASING.md).

- [ ] Add the publish credential: the `NPM_TOKEN` repository secret (a granular or automation token with publish rights to the scope). Trusted publishing can only be added after the packages exist.
- [ ] Actions, **Release**, Run workflow with **dry-run ticked** (the default). Read the output of `pnpm publish --dry-run`.
- [ ] Run it again with **dry-run unticked** and **dist-tag `next`**. If the workflow is skipped, its run summary says why (repository name mismatch: set the `RELEASE_REPO` variable; or the preflight failed).
- [ ] `npm view @faun-ds/react dist-tags` shows `next: 0.1.0`. For a package's FIRST version the registry may set `latest` as well (a local verdaccio rehearsal did); only later versions published with `--tag next` leave `latest` alone. So do not rely on `next` to keep 0.1.0 private: if `latest` is set, treat 0.1.0 as already released, run step 8 straight away, and if it fails publish `0.1.1` and `npm deprecate` 0.1.0.

## 8. Registry smoke test

- [ ] Actions, **Consumer smoke (registry)**, Run workflow with tag `next`; or locally `node scripts/consumer-smoke.mjs --registry --tag next`. It installs the published packages into a fresh Vite and Next.js app, type-checks, builds and loads both in Chromium.
- [ ] Also follow the README quick start by hand in an empty directory.

## 9. Promote to `latest`

- [ ] For each package: `npm dist-tag add @<scope>/<name>@0.1.0 latest` (loop in [RELEASING.md](RELEASING.md)). Check with `npm view @<scope>/react dist-tags`.
- [ ] Create the GitHub release from `CHANGELOG.md`; the tags `@scope/pkg@0.1.0` were pushed by the workflow.
- [ ] Optional: switch the repository to trusted publishing and delete `NPM_TOKEN` (RELEASING.md). Turn on "Require review from Code Owners" only if step 2 is satisfied.
- [ ] Announce.

## Known limitations

State these honestly in the release notes. The full list of what is and is not tested is [STATUS.md](STATUS.md): Chromium only, forced colours covered by CSS tests rather than a real session, no manual screen-reader pass, many states not looked at, pre-1.0, ESM only, IBM Plex not bundled.
