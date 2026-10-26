# Ownership, licence and naming checklist

This is a checklist of things to verify before publishing. It is **not legal advice**; where a box says "ask", ask a qualified person.

## 1. Who owns the work

- [ ] Re-read any employment or contractor agreement, and any invention-assignment or moonlighting clause, that applies to the period in which Faun was written. Note whether it covers work done on your own time and equipment, or work related to your employer's business.
- [ ] Check whether your employer has an open-source contribution or approval policy, and whether an approval or a written waiver is needed. Keep the answer in writing.
- [ ] Check that nothing in the repository came from an employer, a client or a private project: code, copy, data, screenshots, icons, customer or product names. Run `pnpm preflight` (it scans for the terms you configure) and read `git ls-files` yourself once.
- [ ] Check every contributor (including AI-assisted changes you accepted) can license their contribution under Apache-2.0. For outside contributions, decide whether you want a DCO sign-off or a CLA (neither is set up today; see [GOVERNANCE.md](../GOVERNANCE.md)).
- [ ] Decide who the copyright holder is: you, an organisation you control, or "and contributors". `LICENSE`, `NOTICE`, `packages/icons/NOTICE` and every package `author` must say the same thing; `pnpm preflight` checks that they agree, not that the choice is right.

## 2. Third-party material

- [ ] Icons: the Lucide artwork (ISC) is attributed in `NOTICE` and `packages/icons/NOTICE`. Confirm the attribution text is current for the Lucide version in `packages/icons`.
- [ ] Fonts: IBM Plex is licensed under the SIL Open Font License 1.1 and is **not** bundled. Do not bundle it without including the licence.
- [ ] Dependencies: run a licence report (for example `pnpm licenses list --prod`) and read anything that is not MIT, ISC, BSD or Apache-2.0.
- [ ] References to IBM Carbon are comparisons only. Keep the "not affiliated" wording ([STATUS.md](STATUS.md), [ROADMAP.md](ROADMAP.md)) and do not use IBM or Carbon logos or marks.

## 3. Names: search before you commit to them

Names to check: the product name ("Faun"), the npm scope (`@faun-ds`), the GitHub owner and repository (`SaquibPM/faun-design-system`), the domain if you want one.

- [ ] **npm.** Search <https://www.npmjs.com/search?q=faun> and the scope: `npm view @faun-ds/react` (404 is expected, and does not prove the scope is free). Create the organisation at <https://www.npmjs.com/org/create>; if the name is taken the page says so. `pnpm preflight` prints the same steps.
- [ ] **GitHub.** Open `https://github.com/<owner>` and `https://github.com/<owner>/<repo>`. Check that you can create the organisation or repository under that name.
- [ ] **Trademarks.** Search the national and regional trademark databases for the product name in the software, design-tools and SaaS classes that matter to you (for example USPTO TESS or its successor, EUIPO eSearch plus, WIPO Global Brand Database, and the register where you live). "Faun" is an ordinary word (a Roman woodland spirit) and appears in many brand and product names; read what you find before relying on the name.
- [ ] **Web and package registries.** Search the name together with "design system", "UI kit", "React components" on the web, PyPI, crates.io and GitHub, for confusingly similar projects.
- [ ] Record the date and the result of each search in an issue or a private note.

## 4. If a name is taken: the fallback

The npm scope and the GitHub owner and repository names cost **one command** to change, because `scripts/rename-scope.mjs` rewrites manifests, imports, docs, workflows, CODEOWNERS and the lockfile together. It is a dry run unless you add `--write`.

```bash
# Preview (writes nothing): scope @acme-ui, GitHub owner acme-ui, repository design-system
node scripts/rename-scope.mjs --all acme-ui --to-repo design-system

# Apply, then reinstall, rebuild and re-check
node scripts/rename-scope.mjs --all acme-ui --to-repo design-system --write
pnpm install && pnpm build && pnpm test && pnpm preflight
```

Use `--to-scope`, `--to-owner` and `--to-repo` separately when they differ. While the GitHub owner is still the placeholder `faun-ds`, use `node scripts/set-owner.mjs <github-username>` instead: it also replaces `@OWNER_PLACEHOLDER` in `.github/CODEOWNERS` and leaves the npm scope alone. Do this **before the first publish**; a scope cannot be changed afterwards without publishing new packages.

What the script does **not** rename is the product name itself: the CSS variable prefix `--faun-*`, `faun-*` class names, `data-faun-*` attributes, component docs prose and the word "Faun" in the UI. If the product name is the problem, that is a larger change (a prefix migration with a codemod and a major version) and needs its own plan; decide it before 0.1.0, not after.
