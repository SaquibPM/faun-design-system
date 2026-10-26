#!/usr/bin/env node
// Pre-publish checks. Run before the first push and again before every publish:
//
//   pnpm preflight [--dir <path>] [--offline] [--no-history] [--no-pack] [--strict] [--json]
//
// Exit code 1 when any check FAILS. Items that only a person can do are printed as HUMAN in a banner at the end and
// make the run fail with --strict (use --strict immediately before publishing).
//
//   --dir <path>    check another checkout (for example the clean export, see docs/PUBLISH-FROM-CLEAN-HISTORY.md)
//   --offline       skip every network check (npm registry, GitHub API)
//   --no-history    skip the scan of the whole git history
//   --no-pack       skip the scan of the files npm would publish
//   --strict        unresolved HUMAN items count as failures
//   --json          machine-readable output
import { spawn } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createInterface } from "node:readline";
import { join, resolve } from "node:path";
import {
  ADOPTION_DIR_RE, candidateFiles, commitCount, forbiddenPatterns, hasGit, packageScope, parsePagesSlug, parseRepoSlug, readJson, readManifests,
  readText, scanText, tryRun,
} from "./lib/publish-lib.mjs";

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => (flag(n) ? args[args.indexOf(`--${n}`) + 1] : undefined);
const root = resolve(opt("dir") ?? resolve(import.meta.dirname, ".."));
const offline = flag("offline");
const results = [];
const add = (status, title, detail = "", human = "") => results.push({ status, title, detail, human });
const pass = (t, d) => add("PASS", t, d);
const fail = (t, d, h) => add("FAIL", t, d, h);
const warn = (t, d, h) => add("WARN", t, d, h);
const human = (t, h) => add("HUMAN", t, "", h);

const manifests = readManifests(root);
const publishable = manifests.filter((m) => m.dir !== "." && !m.json.private);
const rootPkg = manifests[0].json;
const scope = packageScope(manifests);

// 1. Package names and the npm scope ----------------------------------------------------------------------------
async function checkNpm() {
  if (offline) { warn("npm names and scope", "skipped (--offline)"); human("npm scope", scopeInstructions()); return; }
  const taken = [];
  const free = [];
  const unknown = [];
  for (const m of publishable) {
    const out = tryRun("npm", ["view", m.json.name, "name", "version", "dist-tags", "--json"], { withError: true });
    if (out && !out.error) {
      let info = {};
      try { info = JSON.parse(out); } catch { /* ignore */ }
      taken.push(`${m.json.name}@${info.version ?? "?"}`);
    } else {
      const text = `${out?.error?.stderr ?? ""}${out?.error?.stdout ?? ""}`;
      if (/E404|404 Not Found|is not in this registry/i.test(text)) free.push(m.json.name);
      else unknown.push(m.json.name);
    }
  }
  if (unknown.length) warn("npm registry reachable", `could not query: ${unknown.join(", ")} (network or proxy problem). Re-run online.`);
  if (taken.length) {
    fail("package names are unpublished", `already on the registry: ${taken.join(", ")}`,
      "If you own them, ignore this for later releases. For a first release, someone else owns these names: rename the scope with `node scripts/rename-scope.mjs`.");
  } else if (free.length) {
    pass("package names are unpublished", `${free.length} of ${publishable.length} names return 404`);
  }
  // Packages already published under the scope by someone else is a strong signal that the scope is taken.
  if (scope) {
    const q = tryRun("npm", ["search", `scope:${scope.slice(1)}`, "--json", "--searchlimit=5"], { withError: true });
    let found = [];
    if (q && !q.error) { try { found = JSON.parse(q).map((r) => r.name); } catch { /* ignore */ } }
    // npm search is fuzzy: only names that really sit under the scope count.
    const foreign = found.filter((n) => n.startsWith(`${scope}/`) && !publishable.some((m) => m.json.name === n));
    if (foreign.length) fail(`scope ${scope} has packages that are not ours`, foreign.join(", "), `Someone owns the ${scope} scope. Pick another with scripts/rename-scope.mjs.`);
  }
  const who = tryRun("npm", ["whoami"]);
  if (who && scope) {
    const org = tryRun("npm", ["org", "ls", scope.slice(1)], { withError: true });
    if (org && !org.error) pass(`npm user ${who} is a member of ${scope}`, "`npm org ls` succeeded");
    else warn(`npm user ${who} could not list ${scope}`, "not a member, or the organisation does not exist yet", "");
  }
  // A 404 for a package does not prove that the scope is free, so this is always a person's job.
  human("npm scope", scopeInstructions());
}
const scopeInstructions = () =>
  `A 404 from \`npm view\` does NOT prove the ${scope ?? "scope"} scope is free or yours: npm answers 404 for an unclaimed scope and for an unpublished package alike.\n` +
  `       1. Open https://www.npmjs.com/org/create (signed in) and create the organisation "${scope?.slice(1) ?? "<scope>"}". If the name is taken, the page says so: stop and run scripts/rename-scope.mjs.\n` +
  `       2. Confirm it is yours: https://www.npmjs.com/settings/${scope?.slice(1) ?? "<scope>"}/members shows you as owner. A user account with the same name also blocks the scope.\n` +
  `       3. Turn on two-factor authentication for every owner. Then run \`npm org ls ${scope?.slice(1) ?? "<scope>"}\` while logged in.`;

// 2. Git remote, repository slug, GitHub owner -----------------------------------------------------------------
async function checkRepoIdentity() {
  const slugs = new Map();
  const note = (where, slug) => { if (slug) slugs.set(where, slug); };
  for (const m of manifests) {
    note(`${m.file} repository`, parseRepoSlug(typeof m.json.repository === "string" ? m.json.repository : m.json.repository?.url));
    note(`${m.file} bugs`, parseRepoSlug(m.json.bugs?.url ?? (typeof m.json.bugs === "string" ? m.json.bugs : "")));
    note(`${m.file} homepage`, parsePagesSlug(m.json.homepage) ?? parseRepoSlug(m.json.homepage));
  }
  const unique = [...new Set([...slugs.values()].map((s) => s.toLowerCase()))];
  const expected = parseRepoSlug(rootPkg.repository?.url);
  if (unique.length > 1) {
    fail("manifests agree on one repository", [...slugs].map(([k, v]) => `${k}: ${v}`).join("\n       "), "Run scripts/rename-scope.mjs or fix the manifests by hand.");
  } else pass("manifests agree on one repository", expected ?? "(none)");

  if (hasGit(root)) {
    const remote = tryRun("git", ["remote", "get-url", "origin"], { cwd: root });
    if (!remote) warn("git remote", "no remote named origin yet", `Add it after creating the repository: git remote add origin https://github.com/${expected}.git`);
    else if (parseRepoSlug(remote)?.toLowerCase() !== expected?.toLowerCase()) fail("git remote matches the manifests", `origin is ${remote}, manifests say ${expected}`, "Fix the remote or run scripts/rename-scope.mjs --to-repo.");
    else pass("git remote matches the manifests", remote);
  } else warn("git remote", "no .git directory (normal before the clean `git init`)");

  if (expected && !offline) {
    const [owner, name] = expected.split("/");
    const code = (url) => tryRun("curl", ["-sS", "-m", "15", "-o", "/dev/null", "-w", "%{http_code}", "-H", "User-Agent: faun-preflight", url]);
    const o = code(`https://api.github.com/users/${owner}`);
    if (o === "404") human(`GitHub owner "${owner}" does not exist`, `Create the organisation (https://github.com/organizations/plan) or use your username, then create the public repository "${name}". If you cannot get "${owner}", run scripts/rename-scope.mjs.`);
    else if (o === "200") {
      const r = code(`https://api.github.com/repos/${expected}`);
      if (r === "200") human(`GitHub repository ${expected} already exists`, "Confirm you own it and that it is empty (or the intended target). If it belongs to someone else, rename with scripts/rename-scope.mjs.");
      else if (r === "404") human(`GitHub owner "${owner}" exists`, `Confirm it is YOUR account or organisation (not someone else's), then create the public repository "${name}" there.`);
    } else warn("GitHub API", `could not check owner (HTTP ${o ?? "no answer"})`);
  }
}

// 3. Licence holder -----------------------------------------------------------------------------------------------
function checkLicense() {
  const holders = new Map();
  const grab = (file, text) => {
    const m = text.match(/^\s*Copyright\s+(?:\(c\)\s*)?(?:\d{4}(?:\s*[-,]\s*\d{4})*)\s+(.+?)\s*$/im);
    if (m && !m[1].startsWith("[")) holders.set(file, m[1].trim());
  };
  for (const f of ["LICENSE", "NOTICE", "packages/icons/NOTICE"]) {
    const p = join(root, f);
    if (existsSync(p)) grab(f, readFileSync(p, "utf8")); else if (f !== "packages/icons/NOTICE") fail(`${f} exists`, "missing");
  }
  for (const m of publishable) if (m.json.author) holders.set(`${m.file} author`, String(typeof m.json.author === "string" ? m.json.author : m.json.author.name).replace(/\s*<.*>$/, "").trim());
  const distinct = [...new Set([...holders.values()].map((h) => h.toLowerCase()))];
  if (distinct.length > 1) fail("copyright holder is the same everywhere", [...holders].map(([k, v]) => `${k}: ${v}`).join("\n       "), "Pick one holder and change every file.");
  else if (distinct.length === 1) pass("copyright holder is the same everywhere", [...holders.values()][0]);
  else fail("copyright holder found", "no holder in NOTICE or package authors");
  const lic = existsSync(join(root, "LICENSE")) ? readFileSync(join(root, "LICENSE"), "utf8") : "";
  if (!/Apache License\s+Version 2\.0/.test(lic)) fail("LICENSE is Apache-2.0", "text not recognised");
  const bad = manifests.filter((m) => m.json.license !== "Apache-2.0");
  if (bad.length) fail("every manifest says Apache-2.0", bad.map((m) => m.file).join(", "));
  else pass("every manifest says Apache-2.0");
  human("copyright holder and employment IP", "Confirm the holder named above is right and that you are free to license this work under Apache-2.0. See docs/OWNERSHIP-AND-NAMING.md (a checklist of things to verify, not legal advice).");
}

// 4. CODEOWNERS ------------------------------------------------------------------------------------------------------
function checkCodeowners() {
  const f = join(root, ".github/CODEOWNERS");
  if (!existsSync(f)) { warn("CODEOWNERS", "no .github/CODEOWNERS"); return; }
  const text = readFileSync(f, "utf8");
  const handles = [...new Set([...text.split("\n").filter((l) => !l.trim().startsWith("#")).join("\n").matchAll(/@[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)?/g)].map((m) => m[0]))];
  if (handles.some((h) => /OWNER_PLACEHOLDER/i.test(h))) {
    fail("CODEOWNERS has a real owner", "`* @OWNER_PLACEHOLDER` in .github/CODEOWNERS is not a GitHub account", "Run `node scripts/set-owner.mjs <your-github-username> --write` (drop --write to preview). It replaces the placeholder in CODEOWNERS and the owner in the manifests, README badges, docs links and issue templates; add `--codeowner @org/team` to name a team instead. Then `pnpm build` and re-run preflight. Do NOT enable \"Require review from Code Owners\" until the owner exists (see docs/LAUNCH-CHECKLIST.md).");
    return;
  }
  const teams = handles.filter((h) => h.includes("/"));
  if (teams.length) human("CODEOWNERS teams exist", `Teams referenced: ${teams.join(", ")}. Each must exist in the organisation with write access, or GitHub ignores the rule. Do not enable \"Require review from Code Owners\" before they do.`);
  pass("CODEOWNERS has no placeholder", handles.join(", "));
}

// 5. Working tree, adoption folder, forbidden strings -----------------------------------------------------------------
function checkTree() {
  if (hasGit(root)) {
    const st = tryRun("git", ["status", "--porcelain"], { cwd: root });
    if (st) fail("working tree is clean", `${st.split("\n").length} uncommitted change(s), first: ${st.split("\n")[0]}`, "Commit or stash before publishing.");
    else pass("working tree is clean");
  } else warn("working tree is clean", "no git repository; check skipped (expected before `git init`)");

  const adoption = readdirSync(root).filter((n) => ADOPTION_DIR_RE.test(n));
  if (adoption.length) fail("no adoption-notes folder in the repository directory", `found ./${adoption.join(", ./")}`,
    "Move it out of this directory (mv to a folder OUTSIDE the repo). It is gitignored, but it must not sit next to the code you push from.");
  else pass("no adoption-notes folder in the repository directory");

  const patterns = forbiddenPatterns(root);
  const { files, mode } = candidateFiles(root);
  const hits = [];
  for (const rel of files) {
    for (const p of patterns) if (p.re.test(rel)) hits.push(`${rel}: file NAME matches ${p.id}`);
    const text = readText(join(root, rel));
    if (text === null) continue;
    for (const h of scanText(text, patterns)) hits.push(`${rel}:${h.line} [${h.id}] ${h.text}`);
  }
  if (hits.length) fail(`no forbidden strings in the ${files.length} files that would be tracked`, hits.slice(0, 25).join("\n       ") + (hits.length > 25 ? `\n       ... and ${hits.length - 25} more` : ""), "Remove or rewrite them. Add private terms to .preflight-forbidden (untracked).");
  else pass(`no forbidden strings in the ${files.length} files that would be tracked`, `file set from ${mode}`);
  return files;
}

// 6. Whole git history ---------------------------------------------------------------------------------------------------
async function checkHistory() {
  const n = commitCount(root);
  if (!hasGit(root) || n === 0) { pass("fresh history", hasGit(root) ? "repository has no commits yet" : "no .git directory: a clean `git init` will start with no history"); return; }
  if (flag("no-history")) { warn("history scan", "skipped (--no-history)"); return; }
  const patterns = forbiddenPatterns(root);
  const hits = [];
  await new Promise((done) => {
    const p = spawn("git", ["-c", "core.quotepath=off", "log", "--all", "-p", "--no-color", "--format=@@COMMIT %H%nAuthor: %an <%ae>%nCommitter: %cn <%ce>%n%B"], { cwd: root });
    let commit = "";
    createInterface({ input: p.stdout }).on("line", (line) => {
      if (line.startsWith("@@COMMIT ")) { commit = line.slice(9, 16); return; }
      if (hits.length >= 200) return;
      for (const pat of patterns) if (pat.re.test(line)) hits.push(`${commit} [${pat.id}] ${line.trim().slice(0, 120)}`);
    });
    p.on("close", done);
  });
  if (hits.length) fail(`history of ${n} commit(s) is free of forbidden strings`, hits.slice(0, 15).join("\n       ") + `\n       (${hits.length} hit(s))`,
    "History cannot be cleaned by deleting files. Publish from a fresh `git init` (docs/PUBLISH-FROM-CLEAN-HISTORY.md).");
  else pass(`history of ${n} commit(s) is free of forbidden strings`);
  if (n > 1) human(`this repository already has ${n} commits`, "If any of them ever held internal material, do not push this history. Use docs/PUBLISH-FROM-CLEAN-HISTORY.md.");
}

function checkGitIdentity() {
  if (!hasGit(root)) return;
  const email = tryRun("git", ["config", "user.email"], { cwd: root });
  if (email && /@(gmail|googlemail|yahoo|outlook|hotmail|icloud|proton|protonmail|me|live)\./i.test(email)) {
    warn("git commit email", `user.email is ${email}; every commit publishes it`, "Use the GitHub noreply address (Settings, Emails, \"Keep my email addresses private\") before the first commit: git config user.email ID+USERNAME@users.noreply.github.com");
  }
}

// 7. Files npm would publish ---------------------------------------------------------------------------------------------
function checkPack() {
  if (flag("no-pack")) { warn("published files", "skipped (--no-pack)"); return; }
  const patterns = forbiddenPatterns(root);
  const hits = [];
  let unbuilt = [];
  let total = 0;
  for (const m of publishable) {
    const dir = join(root, m.dir);
    if (!existsSync(join(dir, "dist"))) { unbuilt.push(m.json.name); continue; }
    const out = tryRun("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: dir, withError: true });
    if (!out || out.error) { warn(`npm pack ${m.json.name}`, "dry run failed"); continue; }
    let files = [];
    try { files = JSON.parse(out)[0].files.map((f) => f.path); } catch { continue; }
    total += files.length;
    for (const rel of files) {
      for (const p of patterns) if (p.re.test(rel)) hits.push(`${m.json.name}: ${rel}: file NAME matches ${p.id}`);
      const text = readText(join(dir, rel));
      if (text === null) continue;
      for (const h of scanText(text, patterns, 2)) hits.push(`${m.json.name}/${rel}:${h.line} [${h.id}] ${h.text}`);
    }
  }
  if (unbuilt.length) warn("published files scanned", `not built, skipped: ${unbuilt.join(", ")}`, "Run pnpm build first. Generated files (dist, MCP data) are gitignored but ARE published.");
  if (hits.length) fail("published files are free of forbidden strings", hits.slice(0, 20).join("\n       "), "These come from generated output: fix the source, then pnpm build.");
  else if (total) pass("published files are free of forbidden strings", `${total} files across ${publishable.length - unbuilt.length} packages`);
}

// 8. Node versions -------------------------------------------------------------------------------------------------------------
function checkNode() {
  const want = rootPkg.engines?.node;
  const nvm = existsSync(join(root, ".nvmrc")) ? readFileSync(join(root, ".nvmrc"), "utf8").trim() : null;
  const mismatched = publishable.filter((m) => m.json.engines?.node !== want).map((m) => m.json.name);
  if (mismatched.length) fail("engines.node is the same in every package", `root ${want}; differs: ${mismatched.join(", ")}`);
  else pass("engines.node is the same in every package", want);
  const min = Number((want ?? "").match(/(\d+)/)?.[1]);
  const ci = existsSync(join(root, ".github/workflows/ci.yml")) ? readFileSync(join(root, ".github/workflows/ci.yml"), "utf8") : "";
  const matrix = (ci.match(/node:\s*\[([^\]]*)\]/) ?? [])[1]?.split(",").map((s) => Number(s.trim())) ?? [];
  if (matrix.length && !matrix.includes(min)) fail("CI tests the minimum supported Node", `engines ${want}, CI matrix ${matrix.join(", ")}`);
  else if (matrix.length) pass("CI tests the minimum supported Node", `engines ${want}, .nvmrc ${nvm}, CI matrix ${matrix.join(", ")}`);
  else warn("CI Node matrix", "no `node: [..]` matrix found in ci.yml");
  if (nvm && min && Number(nvm.split(".")[0]) < min) fail(".nvmrc satisfies engines", `${nvm} < ${min}`);
}

function checkPlaceholders() {
  const missing = ["README.md", "SECURITY.md", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md", "docs/STATUS.md"].filter((f) => !existsSync(join(root, f)));
  if (missing.length) fail("required documents exist", missing.join(", "));
  else pass("required documents exist");
  const sec = existsSync(join(root, "SECURITY.md")) ? readFileSync(join(root, "SECURITY.md"), "utf8") : "";
  if (/OWNER_PLACEHOLDER|example\.com|TODO|TBD/i.test(sec)) fail("SECURITY.md has no placeholder", "contains a placeholder or TODO");
}

// ---------------------------------------------------------------------------------------------------------------------------
await checkNpm();
await checkRepoIdentity();
checkLicense();
checkCodeowners();
checkTree();
checkGitIdentity();
await checkHistory();
checkPack();
checkNode();
checkPlaceholders();
human("Pages and npm credentials", "Settings, Pages: Source = GitHub Actions. Add the NPM_TOKEN secret (or configure trusted publishing). Do not enable code-owner review until CODEOWNERS teams exist. See docs/LAUNCH-CHECKLIST.md.");

if (flag("json")) {
  console.log(JSON.stringify(results, null, 2));
} else {
  const icon = { PASS: "PASS ", FAIL: "FAIL ", WARN: "WARN ", HUMAN: "HUMAN", INFO: "INFO " };
  console.log(`\nFaun publish preflight  (${root})\n`);
  for (const r of results.filter((x) => x.status !== "HUMAN")) {
    console.log(`[${icon[r.status]}] ${r.title}`);
    if (r.detail) console.log(`        ${r.detail.replace(/\n/g, "\n    ")}`);
    if (r.human && r.status !== "PASS") console.log(`        -> ${r.human}`);
  }
}
const fails = results.filter((r) => r.status === "FAIL");
const humans = results.filter((r) => r.status === "HUMAN");
if (!flag("json")) {
  const bar = "=".repeat(78);
  console.log(`\n${bar}\nNEEDS A PERSON (${humans.length}). The script cannot check these; do not publish until each is done.\n${bar}`);
  humans.forEach((h, i) => console.log(`\n ${i + 1}. [ ] ${h.title}\n       ${h.human}`));
  console.log(`\n${bar}\n${fails.length ? `${fails.length} CHECK(S) FAILED` : "all automated checks passed"}; ${humans.length} human item(s) open.\n${bar}\n`);
}
process.exit(fails.length || (flag("strict") && humans.length) ? 1 : 0);
