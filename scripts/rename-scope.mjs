#!/usr/bin/env node
// Renames the npm scope and the GitHub owner / repository name across the repository, so a scope or name that turns
// out to be taken costs one command. DRY RUN by default: nothing is written without --write.
//
//   node scripts/rename-scope.mjs --all acme-ui                       # npm scope @acme-ui AND GitHub owner acme-ui
//   node scripts/rename-scope.mjs --to-scope @acme-ui --to-owner acme  # different scope and owner
//   node scripts/rename-scope.mjs --to-repo design-system              # repository (and Pages path) name only
//   add --write to apply, --force to apply on a dirty git tree, --dir <path> for another checkout
//
// What it changes (only files that are, or would be, tracked; never node_modules, dist or ignored files):
//   scope context   @old/pkg -> @new/pkg        manifests, dependencies, imports, ESLint plugin name, docs, lockfile
//   owner context   github.com/old/..., old.github.io/..., old/repo, CODEOWNERS and workflow team handles
//   repo name       github.com/o/OLD -> github.com/o/NEW, <owner>.github.io/OLD, "cd OLD"
// It does NOT rename the product itself (CSS prefix --faun-*, faun-* classes, data-faun-* attributes, the word
// Faun in prose); that is a much larger change. See docs/OWNERSHIP-AND-NAMING.md.
//
// After --write: pnpm install (refreshes node_modules and the lockfile), pnpm build, pnpm preflight.
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { candidateFiles, commitCount, defaultRoot, hasGit, packageScope, parseRepoSlug, readManifests, readText, tryRun } from "./lib/publish-lib.mjs";

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => (flag(n) ? args[args.indexOf(`--${n}`) + 1] : undefined);
const root = resolve(opt("dir") ?? defaultRoot);
const die = (m) => { console.error(`rename-scope: ${m}`); process.exit(2); };
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const manifests = readManifests(root);
const curScope = (opt("from-scope") ?? packageScope(manifests) ?? "").replace(/^@/, "");
const curSlug = parseRepoSlug(manifests[0].json.repository?.url);
const [curOwner, curRepo] = [opt("from-owner") ?? curSlug?.split("/")[0], opt("from-repo") ?? curSlug?.split("/")[1]];
if (!curScope || !curOwner || !curRepo) die("cannot detect the current scope, owner and repository from the manifests; pass --from-scope/--from-owner/--from-repo");

const all = opt("all")?.replace(/^@/, "");
const toScope = (opt("to-scope") ?? all ?? curScope).replace(/^@/, "");
const toOwner = opt("to-owner") ?? all ?? curOwner;
const toRepo = opt("to-repo") ?? curRepo;

const SCOPE_RE = /^[a-z0-9][a-z0-9-]{0,213}$/;
const OWNER_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const REPO_RE = /^[A-Za-z0-9._-]{1,100}$/;
if (!SCOPE_RE.test(toScope)) die(`invalid npm scope "${toScope}" (lowercase letters, digits and hyphens)`);
if (!OWNER_RE.test(toOwner) || toOwner.includes("--")) die(`invalid GitHub owner "${toOwner}"`);
if (!REPO_RE.test(toRepo) || toRepo === "." || toRepo === ".." || toRepo.endsWith(".git")) die(`invalid repository name "${toRepo}"`);
if (toScope === curScope && toOwner === curOwner && toRepo === curRepo) die("nothing to do: the requested names equal the current ones");

const write = flag("write");
if (write && hasGit(root) && !flag("force") && tryRun("git", ["status", "--porcelain"], { cwd: root })) die("the git working tree is not clean; commit first or pass --force");

const sameNames = toOwner === toScope && curOwner === curScope;
const rules = [];
const rule = (name, re, to, only) => rules.push({ name, re, to, only });
const notCodeowners = (f) => !/(^|\/)CODEOWNERS$/.test(f);
const isCodeowners = (f) => /(^|\/)CODEOWNERS$/.test(f);

if (toOwner !== curOwner || toRepo !== curRepo) {
  // Pages URL: owner.github.io/repo, then the bare host.
  rule("pages url", new RegExp(`${esc(curOwner)}\\.github\\.io/${esc(curRepo)}(?![\\w.-])`, "gi"), `${toOwner}.github.io/${toRepo}`);
  rule("pages host", new RegExp(`(?<![\\w-])${esc(curOwner)}\\.github\\.io`, "gi"), `${toOwner}.github.io`);
  // Repository URLs, then any other github.com/<owner> link.
  rule("repo url", new RegExp(`github\\.com([/:])${esc(curOwner)}/${esc(curRepo)}(?![\\w-])`, "gi"), `github.com$1${toOwner}/${toRepo}`);
  rule("owner url", new RegExp(`github\\.com([/:])${esc(curOwner)}(?![\\w.-])`, "gi"), `github.com$1${toOwner}`);
  // "owner/repo" written bare (docs, workflow conditions, shields.io and API URLs), never directly after @ (a scoped package).
  rule("owner/repo", new RegExp(`(?<![@\\w-])${esc(curOwner)}/${esc(curRepo)}(?![\\w-])`, "g"), `${toOwner}/${toRepo}`);
}
if (toRepo !== curRepo) rule("cd repo", new RegExp(`(?<=\\bcd )${esc(curRepo)}(?![\\w-])`, "g"), toRepo);
if (toOwner !== curOwner) rule("CODEOWNERS handles", new RegExp(`@${esc(curOwner)}(?=[/\\s]|$)`, "gm"), `@${toOwner}`, isCodeowners);
if (toScope !== curScope) {
  rule("npm scope", new RegExp(`@${esc(curScope)}(?![\\w.-])`, "g"), `@${toScope}`, notCodeowners);
}
if (sameNames) {
  // Owner and scope were one name and stay one name: bare mentions ("organisation `old`") are unambiguous.
  rule("bare name", new RegExp(`(?<![\\w@./:-])${esc(curScope)}(?![\\w/-])`, "g"), toScope);
}

const { files } = candidateFiles(root);
const changed = [];
for (const rel of files) {
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

// Anything that still mentions an old name after the rules ran needs a person's eye.
const leftovers = [];
const stale = [curScope !== toScope && curScope, curOwner !== toOwner && curOwner].filter(Boolean);
if (stale.length) {
  const re = new RegExp(`(?<![\\w-])(?:${[...new Set(stale)].map(esc).join("|")})(?![\\w-])`, "i");
  const textOf = new Map(changed.map((c) => [c.rel, c.text]));
  for (const rel of files) {
    const text = textOf.get(rel) ?? readText(join(root, rel));
    if (text === null) continue;
    text.split("\n").forEach((line, i) => { if (re.test(line)) leftovers.push(`${rel}:${i + 1}: ${line.trim().slice(0, 120)}`); });
  }
}

console.log(`\nrename-scope ${write ? "(WRITE)" : "(dry run; add --write to apply)"}  in ${root}`);
console.log(`  npm scope   @${curScope} -> @${toScope}`);
console.log(`  GitHub      ${curOwner}/${curRepo} -> ${toOwner}/${toRepo}`);
console.log(`  Pages       https://${curOwner}.github.io/${curRepo} -> https://${toOwner}.github.io/${toRepo}\n`);
let total = 0;
for (const c of changed) {
  const n = Object.values(c.counts).reduce((a, b) => a + b, 0);
  total += n;
  console.log(`  ${String(n).padStart(4)}  ${c.rel}   (${Object.entries(c.counts).map(([k, v]) => `${k} ${v}`).join(", ")})`);
}
console.log(`\n${total} replacement(s) in ${changed.length} file(s).`);
if (leftovers.length) {
  console.log(`\nREVIEW BY HAND: ${leftovers.length} line(s) still mention an old name (shown after the replacements above):`);
  leftovers.slice(0, 40).forEach((l) => console.log(`  ${l}`));
  if (leftovers.length > 40) console.log(`  ... and ${leftovers.length - 40} more`);
}
if (hasGit(root) && commitCount(root) > 0) console.log("\nNote: this repository has history; renaming does not rewrite old commits.");

if (write) {
  for (const c of changed) writeFileSync(c.abs, c.text);
  console.log(`\nWrote ${changed.length} file(s). Next:\n  pnpm install        # refresh node_modules and the lockfile links\n  pnpm build && pnpm test\n  pnpm preflight`);
} else if (changed.length) {
  console.log("\nNothing written. Re-run with --write to apply.");
}
process.exit(0);
