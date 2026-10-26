import { closest, distance, squash } from "./text.js";
import type { FaunData, ComponentData, ExampleInfo, IconData, PropInfo, Result, StatusState, TokenData } from "./types.js";

// Pure functions over the dataset. The MCP server only adapts these to tool calls.

// ------------------------------------------------------------------ list_components

export interface ComponentSummary {
  name: string;
  slug: string;
  package: string;
  category: string;
  status: string;
  description: string;
  exports: string[];
}

export function listComponents(data: FaunData, filter: { category?: string; package?: string } = {}): ComponentSummary[] {
  const cat = filter.category ? squash(filter.category) : null;
  const pkg = filter.package ? squash(filter.package.replace(/^@faun-ds\//, "")) : null;
  return data.components
    .filter((c) => (!cat || squash(c.category) === cat) && (!pkg || squash(c.package.replace(/^@faun-ds\//, "")) === pkg))
    .map((c) => ({ name: c.name, slug: c.slug, package: c.package, category: c.category, status: c.status, description: c.description, exports: c.exports }));
}

// ------------------------------------------------------------------ get_component

export interface ComponentDetail {
  name: string;
  package: string;
  category: string;
  status: string;
  description: string;
  import: string;
  related: string[];
  props: Record<string, { description: string; props: PropInfo[] }>;
  tokens: string[];
  componentTokens: string[];
  examples: ExampleInfo[];
  docs: string;
}

export function findComponent(data: FaunData, name: string): ComponentData | undefined {
  const q = squash(name);
  if (!q) return undefined;
  return (
    data.components.find((c) => squash(c.folder) === q || squash(c.name) === q || squash(c.slug) === q) ??
    data.components.find((c) => c.exports.some((e) => squash(e) === q))
  );
}

export function getComponent(data: FaunData, name: string, opts: { exampleCode?: "overview" | "all" | "none"; docs?: boolean } = {}): Result<{ component: ComponentDetail }> {
  const c = findComponent(data, name);
  if (!c) {
    const names = data.components.flatMap((x) => [x.name, ...x.exports]);
    return { ok: false, error: `No component named "${name}". Use list_components to see every component.`, suggestions: [...new Set(closest(name, names, 5))] };
  }
  const mode = opts.exampleCode ?? "overview";
  const examples = c.examples.map((e) => {
    const keep = mode === "all" || (mode === "overview" && !!e.ref?.endsWith("/Overview"));
    return { ...e, code: keep ? e.code : "" };
  });
  return {
    ok: true,
    component: {
      name: c.name,
      package: c.package,
      category: c.category,
      status: c.status,
      description: c.description,
      import: `import { ${c.exports.join(", ")} } from "${c.package}";`,
      related: c.related,
      props: c.props,
      tokens: c.tokens,
      componentTokens: c.componentTokens,
      examples,
      docs: opts.docs === false ? "" : c.docs,
    },
  };
}

// ------------------------------------------------------------------ search_tokens

export interface TokenHit {
  name: string;
  cssVar: string | null;
  category: string;
  type: string;
  description: string | null;
  values?: Record<string, string>;
  value?: TokenData["value"];
  score: number;
}

const tokenValues = (t: TokenData): string[] => (t.values ? Object.values(t.values) : t.value ? [typeof t.value === "string" ? t.value : JSON.stringify(t.value)] : []);

export function searchTokens(data: FaunData, query: string, opts: { category?: string; limit?: number } = {}): { total: number; tokens: TokenHit[] } {
  const terms = query.toLowerCase().split(/[\s,]+/).filter(Boolean);
  const cat = opts.category?.toLowerCase();
  const limit = Math.max(1, Math.min(opts.limit ?? 20, 100));
  const hits: TokenHit[] = [];
  for (const t of data.tokens) {
    if (cat && t.category.toLowerCase() !== cat) continue;
    const name = t.name.toLowerCase();
    const css = (t.cssVar ?? "").toLowerCase();
    const desc = (t.description ?? "").toLowerCase();
    const vals = tokenValues(t).join(" ").toLowerCase();
    let score = 0;
    let all = true;
    for (const term of terms) {
      let s = 0;
      if (name === term || (css && (css === term || css === `--${data.prefix}-${term}`))) s = 100;
      else if (name.split(/[.\-]/).includes(term)) s = 20;
      else if (name.includes(term)) s = 12;
      else if (css && css.includes(term)) s = 8;
      else if (t.category.toLowerCase() === term) s = 5;
      else if (desc.includes(term)) s = 3;
      else if (vals.includes(term)) s = 2;
      if (!s) { all = false; break; }
      score += s;
    }
    if (!all && terms.length) continue;
    hits.push({ name: t.name, cssVar: t.cssVar, category: t.category, type: t.type, description: t.description, ...(t.values ? { values: t.values } : { value: t.value }), score });
  }
  hits.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return { total: hits.length, tokens: hits.slice(0, limit) };
}

// ------------------------------------------------------------------ get_status_map

export interface StatusMapResult {
  domain?: string;
  description?: string;
  states?: Array<StatusState & { state: string; usage: string }>;
  tones: Record<string, { icon: string; meaning: string }>;
  domains?: Array<{ domain: string; description: string; states: string[] }>;
}

const isState = (v: unknown): v is StatusState => typeof v === "object" && v !== null && "tone" in v;

export function getStatusMap(data: FaunData, domain?: string): Result<{ map: StatusMapResult }> {
  const { domains, tones } = data.statusMap;
  if (!domain) {
    return {
      ok: true,
      map: {
        tones,
        domains: Object.entries(domains).map(([d, states]) => ({
          domain: d,
          description: typeof states.$description === "string" ? states.$description : "",
          states: Object.keys(states).filter((k) => !k.startsWith("$")),
        })),
      },
    };
  }
  const key = Object.keys(domains).find((d) => squash(d) === squash(domain));
  if (!key) return { ok: false, error: `No status domain "${domain}".`, suggestions: Object.keys(domains) };
  const entries = Object.entries(domains[key]!).filter((e): e is [string, StatusState] => isState(e[1]));
  const states = entries.map(([state, s]) => ({ state, ...s, usage: `<StatusBadge domain="${key}" state="${state}" />` }));
  const used = new Set(states.map((s) => s.tone));
  return {
    ok: true,
    map: {
      domain: key,
      description: typeof domains[key]!.$description === "string" ? (domains[key]!.$description as string) : "",
      states,
      tones: Object.fromEntries(Object.entries(tones).filter(([t]) => used.has(t))),
    },
  };
}

// ------------------------------------------------------------------ resolve_icon

export interface IconMatch extends IconData {
  import: string;
  usage: string;
}

const withUsage = (i: IconData): IconMatch => ({ ...i, import: `import { ${i.component} } from "@faun-ds/icons";`, usage: `<${i.component} />` });
const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase();

export function resolveIcon(data: FaunData, name: string): Result<{ match: "exact" | "keyword" | "partial" | "similar"; icon: IconMatch; alternatives: IconMatch[] }> {
  const q = squash(name);
  const bare = squash(name.replace(/^Icon(?=[A-Z])/, ""));
  const fail = (): Result<never> => ({ ok: false, error: `No icon matches "${name}".`, suggestions: closest(name, data.icons.map((i) => i.name), 5) });
  if (!q) return fail();

  const exact = data.icons.find((i) => squash(i.component) === q || squash(i.name) === bare || kebab(i.name) === kebab(name));
  if (exact) return { ok: true, match: "exact", icon: withUsage(exact), alternatives: [] };

  const scored = data.icons
    .map((i) => {
      const n = squash(i.name);
      const kws = i.keywords.map(squash);
      let s = 0;
      if (kws.includes(bare)) s = 50;
      else if (n.startsWith(bare) || n.endsWith(bare)) s = 40;
      else if (n.includes(bare)) s = 30;
      else if (kws.some((k) => k.startsWith(bare) || (bare.length > 3 && bare.startsWith(k) && k.length > 3))) s = 25;
      else if (kws.some((k) => k.includes(bare) && bare.length > 2)) s = 15;
      return { i, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.i.name.localeCompare(b.i.name));
  if (scored.length) {
    const [best, ...rest] = scored;
    return { ok: true, match: best!.s >= 50 || best!.s < 30 ? "keyword" : "partial", icon: withUsage(best!.i), alternatives: rest.slice(0, 4).map((x) => withUsage(x.i)) };
  }
  // Typo tolerance only: one edit for short names, two for longer ones. Anything looser guesses the wrong icon.
  const limit = bare.length <= 5 ? 1 : 2;
  const near = data.icons.filter((i) => distance(bare, squash(i.name), limit) <= limit).sort((a, b) => a.name.localeCompare(b.name));
  const [first, ...others] = near;
  if (first) return { ok: true, match: "similar", icon: withUsage(first), alternatives: others.map(withUsage) };
  return fail();
}
