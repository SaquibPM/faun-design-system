#!/usr/bin/env node
// Decides whether the Release workflow may publish, and says so loudly when it may not (no more silent skips).
//
//   node scripts/release-guard.mjs --event push|workflow_dispatch --repository owner/name [--release-repo owner/name]
//
// Rules:
//   1. The repository must be the one named in the package manifests, or the one in the RELEASE_REPO repository
//      variable when that is set (use it for forks, mirrors and renamed repositories).
//   2. A push to main never performs the FIRST publish. While the first package is not on npm yet, only a manual run
//      of the workflow (workflow_dispatch) may publish, so version 0.1.0 can go out under the `next` dist-tag first.
// Writes `enabled=true|false` and `reason=...` to $GITHUB_OUTPUT, annotations to the log and a summary to
// $GITHUB_STEP_SUMMARY. Exit code is always 0 so the workflow can show the reason; the jobs key off `enabled`.
import { appendFileSync } from "node:fs";
import { resolve } from "node:path";
import { defaultRoot, parseRepoSlug, readManifests, tryRun } from "./lib/publish-lib.mjs";

const args = process.argv.slice(2);
const opt = (n) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : undefined);
const event = opt("event") ?? "push";
const repository = (opt("repository") ?? process.env.GITHUB_REPOSITORY ?? "").toLowerCase();
const override = (opt("release-repo") ?? process.env.RELEASE_REPO ?? "").trim().toLowerCase();
const root = resolve(opt("dir") ?? defaultRoot);

const manifests = readManifests(root);
const fromManifest = parseRepoSlug(manifests[0].json.repository?.url)?.toLowerCase() ?? "";
const expected = override || fromManifest;
const first = manifests.find((m) => m.dir !== "." && !m.json.private)?.json.name;

let enabled = true;
let reason = `repository ${repository} matches ${override ? "RELEASE_REPO" : "the package manifests"} (${expected})`;
if (!repository || repository !== expected) {
  enabled = false;
  reason = `repository "${repository}" is not the release repository "${expected}" (${override ? "RELEASE_REPO" : "from package.json"}). Set the repository variable RELEASE_REPO to "${repository}" if this is the repository that should publish, or run scripts/rename-scope.mjs so the manifests name it.`;
} else if (event === "push") {
  const out = tryRun("npm", ["view", first, "version"], { withError: true });
  if (out && !out.error) {
    reason += `; ${first} is on npm (${out}), so later releases may run from a push`;
  } else {
    const text = `${out?.error?.stderr ?? ""}`;
    enabled = false;
    reason = /E404|404 Not Found/i.test(text)
      ? `${first} is not on npm yet. The first publish must be started by hand: Actions, Release, Run workflow, dist-tag "next" (docs/RELEASING.md). Nothing was published.`
      : `could not reach the npm registry to check ${first}; refusing to publish blindly. ${text.split("\n")[0]}`;
  }
}

const level = enabled ? "notice" : "warning";
console.log(`::${level} title=Release ${enabled ? "enabled" : "SKIPPED"}::${reason}`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `enabled=${enabled}\nreason=${reason.replace(/\n/g, " ")}\n`);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Release ${enabled ? "enabled" : "SKIPPED"}\n\n${reason}\n`);
