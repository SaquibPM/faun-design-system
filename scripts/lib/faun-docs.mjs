// Shared readers for Faun's machine-readable outputs (llms.txt, the MCP data file).
// Pure helpers are exported separately from the filesystem readers so they can be tested.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SITE = "https://saquibpm.github.io/faun-design-system";
export const REPO = "https://github.com/SaquibPM/faun-design-system";
export const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export const CATEGORY_ORDER = ["Actions", "Forms", "Selection", "Overlays", "Navigation", "Feedback", "Display", "Layout", "Data", "Charts", "AI and agents"];

export const slugify = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase();

/** Index of the matching closer for the opener at `start`, skipping strings. -1 if unbalanced. */
export function matchBalanced(src, start) {
  const open = src[start];
  const close = { "{": "}", "[": "]", "(": ")" }[open];
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (c === '"' || c === "'" || c === "`") {
      const q = c;
      for (i++; i < src.length && src[i] !== q; i++) if (src[i] === "\\") i++;
      continue;
    }
    if (c === open) depth++;
    else if (c === close && --depth === 0) return i;
  }
  return -1;
}

/** Evaluates a trusted, literal JS expression (object, array, string) from repository source. */
export function evalLiteral(expr) {
  return new Function(`"use strict"; return (${expr});`)();
}

/** Reads `export const meta = {...}` from an MDX source. Returns { meta, rest }. */
export function splitMeta(source) {
  const m = source.match(/export const meta\s*=\s*/);
  if (!m) return { meta: {}, rest: source };
  const start = m.index + m[0].length;
  const end = matchBalanced(source, start);
  if (end < 0) return { meta: {}, rest: source };
  let tail = end + 1;
  if (source[tail] === ";") tail++;
  return { meta: evalLiteral(source.slice(start, end + 1)), rest: source.slice(0, m.index) + source.slice(tail) };
}

/** Scans a JSX tag starting at `<`. Returns { name, closing, attrs, selfClosing, end } or null. */
export function scanTag(src, i) {
  const m = /^<(\/?)([A-Za-z][\w.]*)/.exec(src.slice(i, i + 80));
  if (!m) return null;
  let p = i + m[0].length;
  const attrs = {};
  for (;;) {
    while (/\s/.test(src[p] ?? "")) p++;
    if (p >= src.length) return null;
    if (src[p] === ">") return { name: m[2], closing: !!m[1], attrs, selfClosing: false, end: p + 1 };
    if (src[p] === "/" && src[p + 1] === ">") return { name: m[2], closing: !!m[1], attrs, selfClosing: true, end: p + 2 };
    const a = /^([A-Za-z_][\w-]*)/.exec(src.slice(p, p + 60));
    if (!a) return null;
    p += a[0].length;
    if (src[p] !== "=") { attrs[a[1]] = true; continue; }
    p++;
    if (src[p] === '"' || src[p] === "'") {
      const q = src[p];
      const e = src.indexOf(q, p + 1);
      if (e < 0) return null;
      attrs[a[1]] = src.slice(p + 1, e);
      p = e + 1;
    } else if (src[p] === "{") {
      const e = matchBalanced(src, p);
      if (e < 0) return null;
      try { attrs[a[1]] = evalLiteral(src.slice(p + 1, e)); } catch { attrs[a[1]] = undefined; }
      p = e + 1;
    } else return null;
  }
}

export const mdTable = (head, rows) =>
  [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${r.map((c) => String(c).replace(/\|/g, "\\|").replace(/\n/g, " ")).join(" | ")} |`)].join("\n");

/** One-line text for a token value: strings as-is, composite (typography) values as `key value` pairs. */
export function formatValue(v) {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  return Object.entries(v).map(([k, x]) => `${k} ${Array.isArray(x) ? x.join(", ") : formatValue(x)}`).join("; ");
}

const SECTION_TITLES = { usage: "Usage", style: "Style", code: "Code", accessibility: "Accessibility" };

function renderTag(t, ctx) {
  const a = t.attrs;
  switch (t.name) {
    case "Section":
      return `\n\u0000${SECTION_TITLES[a.tab] ?? a.tab}\u0000\n`;
    case "Example": {
      ctx.examples.push({ ref: a.of, title: a.title ?? null, description: a.description ?? null });
      if (!a.title && !a.description) return "";
      return `\n- Example \`${a.of}\`${a.title ? ` (${a.title})` : ""}${a.description ? `: ${a.description}` : ""}\n`;
    }
    case "Do":
      return `\n- Do${a.of ? ` (\`${a.of}\`)` : ""}: ${a.caption ?? ""}\n`;
    case "Dont":
      return `\n- Don't${a.of ? ` (\`${a.of}\`)` : ""}: ${a.caption ?? ""}\n`;
    case "Keys":
      return `\n${mdTable(["Key", "Behaviour"], a.rows ?? [])}\n`;
    case "UsesTokens":
      ctx.tokens.push(...(a.names ?? []));
      return `\nUses tokens: ${(a.names ?? []).map((n) => `\`${n}\``).join(", ")}\n`;
    case "ComponentTokens":
      ctx.componentTokens.push(a.name);
      return `\nComponent tokens: \`--faun-${a.name}-*\`\n`;
    default:
      return "";
  }
}

/**
 * Converts a component or guide MDX body to plain Markdown.
 * `baseLevel` is the heading level of the page title in the output: `##` headings in the source
 * become `#`.repeat(2 + baseLevel), and each <Section> becomes a heading at baseLevel + 1.
 * Returns { markdown, examples, tokens, componentTokens }.
 */
export function mdxToMarkdown(source, { baseLevel = 1 } = {}) {
  const { rest } = splitMeta(source);
  /** @type {{ examples: { ref: string | undefined; title: string | null; description: string | null }[]; tokens: string[]; componentTokens: string[] }} */
  const ctx = { examples: [], tokens: [], componentTokens: [] };
  const out = [];
  let fence = false;
  let buf = [];
  const flush = () => {
    if (!buf.length) return;
    const text = buf.join("\n");
    let res = "";
    for (let i = 0; i < text.length; ) {
      const lt = text.indexOf("<", i);
      if (lt < 0) { res += text.slice(i); break; }
      res += text.slice(i, lt);
      const tag = /^<\/?[A-Z]/.test(text.slice(lt, lt + 3)) ? scanTag(text, lt) : null;
      if (tag) { res += tag.closing ? "" : renderTag(tag, ctx); i = tag.end; }
      else { res += "<"; i = lt + 1; }
    }
    const shifted = res.split("\n").map((l) => {
      const sec = /^\u0000(.+)\u0000$/.exec(l);
      if (sec) return `${"#".repeat(baseLevel + 1)} ${sec[1]}`;
      const h = /^(#{1,6}) /.exec(l);
      return h ? "#".repeat(Math.min(6, h[1].length + baseLevel)) + l.slice(h[1].length) : l;
    });
    out.push(shifted.join("\n"));
    buf = [];
  };
  for (const line of rest.split("\n")) {
    if (/^\s*```/.test(line)) {
      if (!fence) flush();
      fence = !fence;
      out.push(line);
    } else if (fence) out.push(line);
    else buf.push(line);
  }
  flush();
  const markdown = out.join("\n").replace(/^[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
  return { markdown, examples: ctx.examples, tokens: [...new Set(ctx.tokens)], componentTokens: [...new Set(ctx.componentTokens)] };
}

/** Pulls `export function Name() {...}` out of an examples file, without `export`. */
export function extractExample(src, name) {
  const start = src.search(new RegExp(`export function ${name}\\b`));
  if (start < 0) return "";
  const rest = src.slice(start);
  const next = rest.slice(1).search(/\nexport (function|const) /);
  return (next < 0 ? rest : rest.slice(0, next + 1)).replace(/^export /, "").trim();
}

/** Parses the foundation page registry (slug, title, description) from its index.ts. */
export function parseFoundations(src) {
  return [...src.matchAll(/slug:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*description:\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => ({ slug: m[1], title: m[2], description: m[3].replace(/\\"/g, '"') }));
}

/** An MDX guide: meta plus converted markdown (page title at level 1, so headings start at `###`). */
export function parseGuide(slug, source) {
  const { meta } = splitMeta(source);
  const { markdown } = mdxToMarkdown(source, { baseLevel: 1 });
  return { slug, title: meta.title ?? slug, description: meta.description ?? "", order: meta.order ?? 99, markdown };
}

export function sortComponents(list) {
  const rank = (c) => { const i = CATEGORY_ORDER.indexOf(c.category); return i < 0 ? 99 : i; };
  return [...list].sort((a, b) => rank(a) - rank(b) || a.order - b.order || a.name.localeCompare(b.name));
}

export const componentUrl = (c) => `${SITE}/#/components/${c.slug}`;
export const guideUrl = (g) => `${SITE}/#/guides/${g.slug}`;
export const foundationUrl = (f) => `${SITE}/#/foundations/${f.slug}`;

// ---------------------------------------------------------------- filesystem readers

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const need = (p, hint) => { if (!existsSync(p)) throw new Error(`Missing ${p}. ${hint}`); return readJson(p); };

/**
 * Reads the generated props table, regenerating it first (about 8s) so output never goes stale.
 * Set FAUN_REUSE_PROPS=1 to reuse an existing file.
 */
export function readProps(root = defaultRoot, { refresh = !process.env.FAUN_REUSE_PROPS } = {}) {
  const p = join(root, "apps/docs/src/generated/props.json");
  if (refresh || !existsSync(p)) {
    const r = spawnSync("pnpm", ["--filter", "@faun-ds/docs", "props"], { cwd: root, stdio: "inherit" });
    if (r.status !== 0) console.warn("props.json could not be generated; continuing without prop tables.");
  }
  return existsSync(p) ? readJson(p) : {};
}

export const readTokens = (root = defaultRoot) => need(join(root, "packages/tokens/dist/json/tokens.json"), "Run `pnpm --filter @faun-ds/tokens build` first.");
export const readStatusMap = (root = defaultRoot) => need(join(root, "packages/tokens/dist/json/status-map.json"), "Run `pnpm --filter @faun-ds/tokens build` first.");
export const readIcons = (root = defaultRoot) => need(join(root, "packages/icons/dist/manifest.json"), "Run `pnpm --filter @faun-ds/icons build` first.");

export function readGuides(root = defaultRoot) {
  const dir = join(root, "apps/docs/src/content/guides");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => parseGuide(basename(f, ".mdx"), readFileSync(join(dir, f), "utf8")))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export function readFoundations(root = defaultRoot) {
  const p = join(root, "apps/docs/src/pages/foundations/index.ts");
  return existsSync(p) ? parseFoundations(readFileSync(p, "utf8")) : [];
}

export const readAgents = (root = defaultRoot) => {
  const p = join(root, "AGENTS.md");
  return existsSync(p) ? readFileSync(p, "utf8") : "";
};

/** Reads every `*.docs.mdx` component page across packages, with props and example source. */
export function readComponents(root = defaultRoot, props = readProps(root)) {
  const out = [];
  const pkgsDir = join(root, "packages");
  for (const pkg of readdirSync(pkgsDir).sort()) {
    const dir = join(pkgsDir, pkg, "src/components");
    if (!existsSync(dir)) continue;
    for (const folder of readdirSync(dir).sort()) {
      const docsFile = join(dir, folder, `${folder}.docs.mdx`);
      if (!existsSync(docsFile)) continue;
      const source = readFileSync(docsFile, "utf8");
      const { meta } = splitMeta(source);
      const { markdown, examples, tokens, componentTokens } = mdxToMarkdown(source, { baseLevel: 2 });
      const exFile = join(dir, folder, `${folder}.examples.tsx`);
      const exSrc = existsSync(exFile) ? readFileSync(exFile, "utf8") : "";
      const names = meta.components?.length ? meta.components : [folder];
      out.push({
        name: meta.title ?? folder,
        folder,
        slug: slugify(folder),
        package: `@faun-ds/${pkg}`,
        category: meta.category ?? "Other",
        status: meta.status ?? "stable",
        description: meta.description ?? "",
        related: meta.related ?? [],
        order: meta.order ?? 100,
        exports: names,
        props: Object.fromEntries(names.filter((n) => props[n]).map((n) => [n, { description: props[n].description, props: props[n].props }])),
        tokens,
        componentTokens,
        examples: examples.map((e) => {
          const fn = e.ref?.split("/")[1];
          return { ...e, code: fn ? extractExample(exSrc, fn) : "" };
        }),
        docs: markdown,
      });
    }
  }
  return out;
}
