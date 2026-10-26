#!/usr/bin/env node
// Replaces the placeholder GitHub owner with the real one, everywhere, in one command.
// DRY RUN by default: nothing is written without --write.
//
//   node scripts/set-owner.mjs <github-username>                 # preview
//   node scripts/set-owner.mjs <github-username> --write         # apply
//   --to-repo <name>      also rename the repository (default: keep the current name)
//   --codeowner <handle>  CODEOWNERS handle if it differs from the username, e.g. @my-org/maintainers
//   --force               apply on a dirty git tree;  --dir <path>  another checkout
//
// What it rewrites (only files that are, or would be, tracked; never node_modules, dist or ignored files):
//   .github/CODEOWNERS         @OWNER_PLACEHOLDER -> @<username> (and the old owner handle, if one was set before)
//   manifests                  repository, bugs and homepage in every package.json
//   README badges and links    shields.io URLs, github.com/<owner>/<repo>, <owner>.github.io/<repo>
//   docs links                 docs, guides, issue templates, SITE and REPO in scripts/lib/faun-docs.mjs
//   release guard              the repository the Release workflow may publish from comes from the manifests
//                              (scripts/release-guard.mjs), so rewriting them is what moves the guard; it is checked
//                              at the end and the RELEASE_REPO override is left alone
// It does NOT touch the npm scope (@faun-ds/...): the scope is its own name on npmjs.com. Use scripts/rename-scope.mjs
// when the scope has to change too.
//
// After --write: pnpm build (regenerates llms.txt and the MCP data with the new links), then pnpm preflight.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { candidateFiles, commitCount, defaultRoot, hasGit, parseRepoSlug, readManifests, readText, tryRun } from "./lib/publish-lib.mjs";

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => (flag(n) ? args[args.indexOf(`--${n}`) + 1] : undefined);
const valueOpts = new Set(["dir", "to-repo", "codeowner"]);
const positional = args.filter((a, i) => !a.startsWith("--") && !valueOpts.has((args[i - 1] ?? "").replace(/^--/, "")));
const die = (m) => { console.error(`set-owner: ${m}`); process.exit(2); };
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const root = resolve(opt("dir") ?? defaultRoot);
const owner = positional[0];
if (!owner) die("usage: node scripts/set-owner.mjs <github-username> [--to-repo <name>] [--codeowner <handle>] [--write]");
const OWNER_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const REPO_RE = /^[A-Za-z0-9._-]{1,100}$/;
if (!OWNER_RE.test(owner) || owner.includes("--")) die(`"${owner}" is not a valid GitHub username (letters, digits and single hyphens, up to 39 characters, no leading or trailing hyphen)`);
if (/placeholder/i.test(owner)) die("that is the placeholder, not a username");

const manifests = readManifests(root);
const slug = parseRepoSlug(manifests[0].json.repository?.url);
if (!slug) die("cannot read the current repository from the root package.json (repository.url)");
const [curOwner, curRepo] = slug.split("/");
const toRepo = opt("to-repo") ?? curRepo;
if (!REPO_RE.test(toRepo) || toRepo === "." || toRepo === ".." || toRepo.endsWith(".git")) die(`invalid repository name "${toRepo}"`);
const handle = (opt("codeowner") ?? `@${owner}`);
if (!/^@[A-Za-z0-9][A-Za-z0-9-]*(?:\/[A-Za-z0-9._-]+)?$/.test(handle)) die(`invalid CODEOWNERS handle "${handle}" (use @username or @org/team)`);

const write = flag("write");
// A fresh `git init` with no commit yet (the clean export) is all "untracked": nothing to lose, so no check there.
if (write && hasGit(root) && commitCount(root) > 0 && !flag("force") && tryRun("git", ["status", "--porcelain"], { cwd: root })) die("the git working tree is not clean; commit first or pass --force");

const rules = [];
const rule = (name, re, to, only) => rules.push({ name, re, to, only });
const isCodeowners = (f) => /(^|\/)CODEOWNERS$/.test(f);
const notCodeowners = (f) => !isCodeowners(f);

const ownerChanged = owner.toLowerCase() !== curOwner.toLowerCase();
const repoChanged = toRepo !== curRepo;
if (ownerChanged || repoChanged) {
  rule("pages url", new RegExp(`${esc(curOwner)}\\.github\\.io/${esc(curRepo)}(?![\\w.-])`, "gi"), `${owner.toLowerCase()}.github.io/${toRepo}`, notCodeowners);
  rule("pages host", new RegExp(`(?<![\\w-])${esc(curOwner)}\\.github\\.io`, "gi"), `${owner.toLowerCase()}.github.io`, notCodeowners);
  rule("repo url", new RegExp(`github\\.com([/:])${esc(curOwner)}/${esc(curRepo)}(?![\\w-])`, "gi"), `github.com$1${owner}/${toRepo}`, notCodeowners);
  rule("owner url", new RegExp(`github\\.com([/:])${esc(curOwner)}(?![\\w.-])`, "gi"), `github.com$1${owner}`, notCodeowners);
  // Badges, API URLs and prose: "owner/repo" written bare, never right after @ (an npm scope such as @faun-ds/react).
  rule("owner/repo", new RegExp(`(?<![@\\w.-])${esc(curOwner)}/${esc(curRepo)}(?![\\w-])`, "g"), `${owner}/${toRepo}`, notCodeowners);
}
if (repoChanged) rule("cd repo", new RegExp(`(?<=\\bcd )${esc(curRepo)}(?![\\w-])`, "g"), toRepo, notCodeowners);
// CODEOWNERS: the placeholder, and a handle from an earlier run of this script.
rule("CODEOWNERS owner", /@OWNER_PLACEHOLDER(?![\w-])/g, handle, isCodeowners);
if (ownerChanged) rule("CODEOWNERS previous owner", new RegExp(`@${esc(curOwner)}(?![\\w/-])`, "g"), handle, isCodeowners);
// The placeholder explanation is wrapped in markers so it can be dropped once the owner is real.
rule("CODEOWNERS note", /^# BEGIN PLACEHOLDER NOTE\n[\s\S]*?^# END PLACEHOLDER NOTE\n/m, "", isCodeowners);

const { files } = candidateFiles(root);
const changed = [];
for (const rel of files) {
  if (rel === "docs/adr/0010-rename-to-faun.md") continue; // a record of names; the owner placeholder is not part of it
  const abs = join(root, rel);
  const before = readText(abs);
  if (before === null) continue;
  let text = before;
  const counts = {};
  for (const r of rules) {
    if (r.only && !r.only(rel)) continue;
    text = text.replace(r.re, (...m) => {
      counts[r.name] = (counts[r.name] ?? 0) + 1;
      const groups = m.slice(1, -2).filter((x) => typeof x === "string");
      return r.to.replace(/\$(\d)/g, (_, i) => groups[Number(i) - 1] ?? "");
    });
  }
  if (text !== before) changed.push({ rel, abs, text, counts });
}

// Anything that still mentions the old owner after the rules ran needs a person's eye (the npm scope is expected).
const leftovers = [];
if (ownerChanged) {
  const re = new RegExp(`(?<![\\w@-])${esc(curOwner)}(?![\\w-])`, "i");
  const textOf = new Map(changed.map((c) => [c.rel, c.text]));
  for (const rel of files.filter((f) => f !== "docs/adr/0010-rename-to-faun.md")) {
    const text = textOf.get(rel) ?? readText(join(root, rel));
    if (text === null) continue;
    text.split("\n").forEach((line, i) => { if (re.test(line)) leftovers.push(`${rel}:${i + 1}: ${line.trim().slice(0, 120)}`); });
  }
}

console.log(`\nset-owner ${write ? "(WRITE)" : "(dry run; add --write to apply)"}  in ${root}`);
console.log(`  GitHub      ${curOwner}/${curRepo} -> ${owner}/${toRepo}`);
console.log(`  Pages       https://${curOwner}.github.io/${curRepo} -> https://${owner.toLowerCase()}.github.io/${toRepo}`);
console.log(`  CODEOWNERS  @OWNER_PLACEHOLDER -> ${handle}\n`);
let total = 0;
for (const c of changed) {
  const n = Object.values(c.counts).reduce((a, b) => a + b, 0);
  total += n;
  console.log(`  ${String(n).padStart(4)}  ${c.rel}   (${Object.entries(c.counts).map(([k, v]) => `${k} ${v}`).join(", ")})`);
}
console.log(`\n${total} replacement(s) in ${changed.length} file(s).`);
if (!changed.length) console.log("Nothing to change: the owner, repository and CODEOWNERS already match.");
if (leftovers.length) {
  console.log(`\nREVIEW BY HAND: ${leftovers.length} line(s) still mention "${curOwner}" (expected for the npm scope; check the rest):`);
  leftovers.slice(0, 15).forEach((l) => console.log(`  ${l}`));
  if (leftovers.length > 15) console.log(`  ... and ${leftovers.length - 15} more`);
}
if (hasGit(root) && commitCount(root) > 0) console.log("\nNote: this repository has history; the change is not applied to old commits.");

if (write) {
  for (const c of changed) writeFileSync(c.abs, c.text);
  console.log(`\nWrote ${changed.length} file(s).`);
  // The release guard reads the repository from the manifests: prove it now accepts the new repository.
  const g = spawnSync(process.execPath, [join(root, "scripts/release-guard.mjs"), "--event", "workflow_dispatch", "--repository", `${owner}/${toRepo}`, "--dir", root], { encoding: "utf8", env: { ...process.env, RELEASE_REPO: "", GITHUB_OUTPUT: "", GITHUB_STEP_SUMMARY: "" } });
  const line = `${g.stdout}`.split("\n").find((l) => /repository .* (matches|is not)/i.test(l)) ?? `${g.stdout}`.trim().split("\n")[0];
  console.log(`Release guard: ${line ?? "(no output)"}`);
  console.log("\nNext:\n  pnpm build          # regenerates llms.txt and the MCP data with the new links\n  pnpm preflight");
} else if (changed.length) {
  console.log("\nNothing written. Re-run with --write to apply.");
}
process.exit(0);
