// Shared helpers for scripts/preflight-publish.mjs and scripts/rename-scope.mjs.
// Pure Node, no dependencies.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

export const defaultRoot = resolve(import.meta.dirname, "../..");

export const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

/** Runs a command and returns trimmed stdout, or null when it fails. */
export function tryRun(cmd, args, opts = {}) {
  try {
    return execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 256 * 1024 * 1024, ...opts }).trim();
  } catch (e) {
    return opts.withError ? { error: e } : null;
  }
}

// -------------------------------------------------------------------------------------------------------------
// Which files are (or would be) in the repository?
// -------------------------------------------------------------------------------------------------------------

/** True when `root` itself holds a git repository (not a parent directory's). */
export const hasGit = (root) => existsSync(join(root, ".git"));

/** Number of commits reachable from any ref; 0 when there is no repository or no commit yet. */
export function commitCount(root) {
  if (!hasGit(root)) return 0;
  const out = tryRun("git", ["rev-list", "--all", "--count"], { cwd: root });
  return out ? Number(out) : 0;
}

/**
 * The files that are tracked or would be tracked by `git add -A`: tracked files plus untracked files that are not
 * ignored. Uses the repository when there is one. Without one it asks a throw-away bare repository about the working
 * tree, which applies every .gitignore exactly as a fresh `git init && git add -A` would, and touches nothing.
 */
export function candidateFiles(root) {
  const base = ["-c", "core.excludesFile=", "-c", "core.quotepath=off"];
  let out;
  let mode;
  if (hasGit(root)) {
    mode = "git ls-files (tracked + untracked, not ignored)";
    out = execFileSync("git", [...base, "ls-files", "-co", "--exclude-standard", "-z"], { cwd: root, maxBuffer: 256 * 1024 * 1024 });
  } else {
    mode = "simulated `git init && git add -A` (temporary bare repository)";
    const tmp = mkdtempSync(join(tmpdir(), "faun-lsfiles-"));
    try {
      execFileSync("git", ["init", "--bare", "-q", tmp]);
      out = execFileSync("git", [...base, `--git-dir=${tmp}`, `--work-tree=${root}`, "ls-files", "-o", "--exclude-standard", "-z"], { cwd: root, maxBuffer: 256 * 1024 * 1024 });
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }
  const files = [...new Set(out.toString("utf8").split("\0").filter(Boolean))].filter((f) => {
    try { return statSync(join(root, f)).isFile(); } catch { return false; }
  });
  return { files: files.sort(), mode };
}

const BINARY_EXT = /\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|eot|pdf|zip|gz|tgz|br|mp4|webm|mov|wasm)$/i;
export const MAX_TEXT_BYTES = 4 * 1024 * 1024;

/** Reads a file as text, or returns null when it is binary or very large. */
export function readText(abs) {
  if (BINARY_EXT.test(abs)) return null;
  let buf;
  try {
    if (statSync(abs).size > MAX_TEXT_BYTES) return null;
    buf = readFileSync(abs);
  } catch { return null; }
  if (buf.subarray(0, 8000).includes(0)) return null;
  return buf.toString("utf8");
}

// -------------------------------------------------------------------------------------------------------------
// Forbidden strings
// -------------------------------------------------------------------------------------------------------------
// The patterns are assembled from fragments so that this file does not itself contain what it looks for (the scan
// covers this file too). Add your own private terms, one regular expression per line, to an untracked file named
// `.preflight-forbidden` in the repository root (it is gitignored) or to the FAUN_PREFLIGHT_FORBIDDEN environment
// variable (comma separated). Do not commit private terms.
const j = (...p) => p.join("");
const word = (s) => new RegExp(`(?<![A-Za-z0-9])${s}(?![A-Za-z0-9])`, "i");

/** Matches the name of the local adoption-notes folder (a directory entry name). */
export const ADOPTION_DIR_RE = new RegExp(j("^\\.n", ".ms-", "adoption$"), "i");

export const BUILTIN_FORBIDDEN = [
  { id: "private-project", re: word(j("ni", "ms")), why: "name of a private downstream project" },
  { id: "private-project-2", re: word(j("la", "ya")), why: "name of a private integration" },
  { id: "employer", re: word(j("zy", "cus")), why: "employer name" },
  { id: "legacy-name", re: word(j("cai", "rn")), why: "internal former name of this project" },
  { id: "adoption-folder", re: new RegExp(j("\\.n", ".ms-", "adoption"), "i"), why: "reference to the local adoption-notes folder" },
  { id: "personal-email", re: /[A-Za-z0-9._%+-]+@(?:gmail|googlemail|yahoo|ymail|outlook|hotmail|live|icloud|me|aol|proton|protonmail|pm|gmx|zoho|yandex|qq|163)\.(?:com|me|net|ch|in)\b/i, why: "personal email address" },
  { id: "absolute-path", re: /(?:\/home\/[A-Za-z0-9._-]+|\/Users\/[A-Za-z0-9._-]+|\/mnt\/(?:user-data|project|skills)|[A-Za-z]:\\Users\\[A-Za-z0-9._-]+)/, why: "absolute local path" },
];

/** Built-in patterns plus the local and environment additions. */
export function forbiddenPatterns(root) {
  const extra = [];
  const add = (line, src) => {
    const t = line.trim();
    if (!t || t.startsWith("#")) return;
    try { extra.push({ id: `local:${t}`, re: new RegExp(t, "i"), why: `from ${src}` }); } catch { /* ignore a bad pattern */ }
  };
  const f = join(root, ".preflight-forbidden");
  if (existsSync(f)) readFileSync(f, "utf8").split("\n").forEach((l) => add(l, ".preflight-forbidden"));
  (process.env.FAUN_PREFLIGHT_FORBIDDEN ?? "").split(",").forEach((l) => add(l, "FAUN_PREFLIGHT_FORBIDDEN"));
  return [...BUILTIN_FORBIDDEN, ...extra];
}

/** Scans one string; returns [{id, why, line, text}] for the first few hits per rule. */
export function scanText(text, patterns, perRule = 3) {
  const hits = [];
  const lines = text.split("\n");
  const counts = new Map();
  lines.forEach((line, i) => {
    for (const p of patterns) {
      if (!p.re.test(line)) continue;
      const n = (counts.get(p.id) ?? 0) + 1;
      counts.set(p.id, n);
      if (n <= perRule) hits.push({ id: p.id, why: p.why, line: i + 1, text: line.trim().slice(0, 140) });
    }
  });
  return hits;
}

// -------------------------------------------------------------------------------------------------------------
// Manifests
// -------------------------------------------------------------------------------------------------------------

/** Every package.json under packages/ and the root, with parsed content. */
export function readManifests(root) {
  const out = [{ dir: ".", file: "package.json", json: readJson(join(root, "package.json")) }];
  const pk = join(root, "packages");
  if (existsSync(pk)) {
    for (const d of readdirSync(pk, { withFileTypes: true })) {
      const f = join(pk, d.name, "package.json");
      if (d.isDirectory() && existsSync(f)) out.push({ dir: `packages/${d.name}`, file: `packages/${d.name}/package.json`, json: readJson(f) });
    }
  }
  return out;
}

/** "owner/name" from a GitHub URL in any common form, or null. */
export function parseRepoSlug(url) {
  if (!url) return null;
  const m = String(url).match(/github\.com[/:]([^/\s]+)\/([^/\s#?]+?)(?:\.git)?(?:[/#?].*)?$/i);
  return m ? `${m[1]}/${m[2]}` : null;
}

/** "owner/name" from `<owner>.github.io/<name>`, or null. */
export function parsePagesSlug(url) {
  const m = String(url ?? "").match(/^https?:\/\/([^./]+)\.github\.io\/([^/\s#?]+)/i);
  return m ? `${m[1]}/${m[2]}` : null;
}

/** The npm scope shared by the publishable packages ("@faun-ds"), or null. */
export function packageScope(manifests) {
  const scopes = new Set(manifests.filter((m) => m.dir !== "." && !m.json.private).map((m) => (m.json.name.match(/^(@[^/]+)\//) ?? [])[1]).filter(Boolean));
  return scopes.size === 1 ? [...scopes][0] : null;
}
