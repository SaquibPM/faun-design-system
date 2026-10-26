#!/usr/bin/env node
// Exports the files that belong in the public repository into a NEW folder with no history, then runs `git init`.
//
//   node scripts/export-clean.mjs <destination> [--commit] [--email <noreply address>]
//
// "Belong" means what `git add -A` would add: tracked files plus untracked files that .gitignore does not exclude.
// So node_modules, dist, generated and ignored files, the local adoption-notes folder, PROGRESS.md and anything in
// .gitignore are left behind, and the old .git directory (and its history) is never copied.
// The destination must be outside this repository and must not exist or must be empty.
// With --commit it also stages everything and makes the single first commit (use a noreply author address).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { ADOPTION_DIR_RE, candidateFiles, defaultRoot } from "./lib/publish-lib.mjs";

const args = process.argv.slice(2);
const opt = (n) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : undefined);
const dest = args.find((a) => !a.startsWith("--") && a !== opt("email"));
const die = (m) => { console.error(`export-clean: ${m}`); process.exit(2); };
if (!dest) die("usage: node scripts/export-clean.mjs <destination> [--commit] [--email <noreply address>]");

const src = defaultRoot;
const out = resolve(dest);
const rel = relative(src, out);
if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))) die(`destination ${out} is the repository or inside it; choose a folder outside it`);
if (existsSync(out) && readdirSync(out).length) die(`destination ${out} is not empty`);

const { files, mode } = candidateFiles(src);
const skipped = files.filter((f) => f.split("/").some((p) => ADOPTION_DIR_RE.test(p)));
const keep = files.filter((f) => !skipped.includes(f));
mkdirSync(out, { recursive: true });
for (const f of keep) {
  mkdirSync(dirname(join(out, f)), { recursive: true });
  copyFileSync(join(src, f), join(out, f));
}
console.log(`exported ${keep.length} file(s) to ${out} (${mode}); no history, no ignored files.`);

const git = (...a) => execFileSync("git", a, { cwd: out, stdio: "inherit" });
git("init", "-b", "main", "-q");
if (args.includes("--commit")) {
  const email = opt("email");
  if (!email || !/noreply/i.test(email)) die("--commit needs --email <id+user@users.noreply.github.com> so a personal address is not published");
  git("add", "-A");
  git("-c", "user.name=Faun", "-c", `user.email=${email}`, "commit", "-q", "-m", "chore: initial public commit");
  console.log("made the first commit.");
}
console.log(`\nNext:\n  cd ${out}\n  git config user.email "<id+username@users.noreply.github.com>"   # before the first commit if you did not pass --commit\n  node scripts/preflight-publish.mjs        # scans the files and the (new) history\n  git remote add origin https://github.com/<owner>/<repo>.git   # only when preflight is clean`);
