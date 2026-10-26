/** Faun token resolution. Shared by the build and the tests. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const SRC = resolve(import.meta.dirname, "../src");
const read = <T = any>(p: string): T => JSON.parse(readFileSync(resolve(SRC, p), "utf8"));

export const PREFIX = "faun";
export type ThemeName = "light" | "dark" | "light-hc" | "dark-hc" | "print";
export type Appearance = "light" | "dark" | "light-hc" | "dark-hc";
export type ThemeMeta = { appearance: Appearance; extends: ThemeName | null; colorScheme: "light" | "dark"; label: string; description: string };

export const scales = read("scales/scales.json").scales as Record<string, any>;
export const viz = read("scales/viz.json");
export const themes = (() => { const t = read("themes.json"); delete t.$description; return t as Record<ThemeName, ThemeMeta>; })();
export const THEMES = Object.keys(themes) as ThemeName[];
export const semanticSource = read("semantic/color.json");
export const statusMap = read("semantic/status-map.json");
export const foundations = read("foundations/foundations.json");
export const componentTokens = read("components/components.json");
export const SCALE_NAMES = Object.keys(scales);
export const ACCENT_SOURCE = "moss";
export const STEPS = [...Array.from({ length: 12 }, (_, i) => String(i + 1)), ...Array.from({ length: 12 }, (_, i) => `a${i + 1}`)];

export const cssVar = (path: string[]) => `--${PREFIX}-${path.join("-")}`;

/* ------------------------------------------------------------------ colour maths */
export function rgba(hex: string): [number, number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  if (h.length === 6) h += "ff";
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
  return [n(0), n(2), n(4), n(6) / 255];
}
const h2 = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0");
export const toHex = ([r, g, b, a]: [number, number, number, number]) => `#${h2(r)}${h2(g)}${h2(b)}${a >= 0.999 ? "" : h2(a * 255)}`;
export function composite(fg: string, bg: string): string {
  const [r, g, b, a] = rgba(fg); const [R, G, B] = rgba(bg);
  return toHex([r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a), 1]);
}
const ch = (c: number) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
export const luminance = (hex: string) => { const [r, g, b] = rgba(hex); return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b); };
export function contrast(fg: string, bg: string) {
  const f = rgba(fg)[3] < 1 ? composite(fg, bg) : fg;
  const a = luminance(f), b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/* ------------------------------------------------------------------ references */
const baseOf = (ap: Appearance): "light" | "dark" => (ap.startsWith("light") ? "light" : "dark");

/** A parsed colour reference. */
export type Ref =
  | { kind: "scale"; scale: string; step: string; pin?: Appearance }
  | { kind: "const"; value: string }
  | { kind: "viz"; slot: string }
  | { kind: "alpha"; inner: Ref; alpha: number };

export function parseRef(expr: string): Ref {
  const e = expr.trim();
  const a = e.match(/^alpha\((.+),\s*([0-9.]+)\)$/);
  if (a) return { kind: "alpha", inner: parseRef(a[1]!), alpha: Number(a[2]) };
  const hex = e.match(/^\{(#[0-9a-fA-F]{6})\}$/);
  if (hex) return { kind: "const", value: hex[1]!.toLowerCase() };
  if (e === "{white}") return { kind: "const", value: "#ffffff" };
  if (e === "{black}") return { kind: "const", value: "#000000" };
  const m = e.match(/^\{(?:(light|dark|light-hc|dark-hc):)?([a-z]+)\.([a-z0-9-]+)\}$/);
  if (!m) throw new Error(`Bad colour reference "${expr}"`);
  const [, pin, scale, step] = m;
  if (scale === "viz") return { kind: "viz", slot: step! };
  if (scale !== "accent" && !scales[scale!]) throw new Error(`Unknown scale in "${expr}"`);
  if (!STEPS.includes(step!)) throw new Error(`Unknown step in "${expr}"`);
  return { kind: "scale", scale: scale!, step: step!, pin: pin as Appearance | undefined };
}

export function resolveRef(ref: Ref, ap: Appearance): string {
  switch (ref.kind) {
    case "const": return ref.value;
    case "viz": return viz[baseOf(ap)][ref.slot];
    case "scale": {
      const name = ref.scale === "accent" ? ACCENT_SOURCE : ref.scale;
      const v = scales[name][ref.pin ?? ap]?.steps[ref.step];
      if (!v) throw new Error(`Missing ${name}.${ref.step} for ${ref.pin ?? ap}`);
      return v;
    }
    case "alpha": {
      const [r, g, b, a0] = rgba(resolveRef(ref.inner, ap));
      return toHex([r, g, b, a0 * ref.alpha]);
    }
  }
}

/** CSS for a reference: var() for themable scale steps, literals for pinned/viz/const. */
export function cssOfRef(ref: Ref, ap: Appearance): string {
  switch (ref.kind) {
    case "scale": return ref.pin ? resolveRef(ref, ap) : `var(${cssVar([ref.scale, ref.step])})`;
    case "alpha": {
      if (ref.inner.kind === "scale" && !ref.inner.pin) return `color-mix(in srgb, ${cssOfRef(ref.inner, ap)} ${Math.round(ref.alpha * 1000) / 10}%, transparent)`;
      return resolveRef(ref, ap);
    }
    default: return resolveRef(ref, ap);
  }
}

/* ------------------------------------------------------------------ semantic tokens */
export type Semantic = { path: string[]; name: string; cssVar: string; description?: string; expr: Record<ThemeName, string>; value: Record<ThemeName, string>; css: Record<ThemeName, string>; /** Set when this token is an alias of another semantic token. */ aliasOf?: string };

function exprFor(node: any, theme: ThemeName): string {
  if (typeof node[theme] === "string") return node[theme];
  const parent = themes[theme].extends;
  if (parent) return exprFor(node, parent);
  if (typeof node.value === "string") return node.value;
  throw new Error("no value");
}

export function collectSemantic(): Semantic[] {
  const out: Semantic[] = [];
  const aliases: { path: string[]; target: string; description?: string }[] = [];
  const walk = (node: any, path: string[]) => {
    for (const [k, child] of Object.entries<any>(node)) {
      if (k.startsWith("$")) continue;
      const next = [...path, k];
      if (child && typeof child === "object" && typeof child.alias === "string") {
        aliases.push({ path: next, target: child.alias, description: child.$description });
      } else if (child && typeof child === "object" && "value" in child) {
        const expr = {} as Record<ThemeName, string>, value = {} as Record<ThemeName, string>, css = {} as Record<ThemeName, string>;
        for (const t of THEMES) {
          expr[t] = exprFor(child, t);
          const ref = parseRef(expr[t]);
          value[t] = resolveRef(ref, themes[t].appearance);
          css[t] = cssOfRef(ref, themes[t].appearance);
        }
        out.push({ path: next, name: next.join("."), cssVar: cssVar(next), description: child.$description, expr, value, css });
      } else if (child && typeof child === "object") walk(child, next);
    }
  };
  walk(semanticSource, []);
  // Aliases copy the target's resolved values per theme and emit var(target), so a tenant or theme override of the target flows through.
  for (const a of aliases) {
    const target = out.find((s) => s.name === a.target);
    if (!target) throw new Error(`Alias ${a.path.join(".")} points at unknown token ${a.target}`);
    const css = {} as Record<ThemeName, string>;
    for (const t of THEMES) css[t] = `var(${target.cssVar})`;
    out.push({ path: a.path, name: a.path.join("."), cssVar: cssVar(a.path), description: a.description, expr: { ...target.expr }, value: { ...target.value }, css, aliasOf: target.name });
  }
  return out;
}

/* ------------------------------------------------------------------ foundations & component tokens */
export type Dim = { path: string[]; name: string; cssVar: string; type: string; description?: string; css: string; raw: unknown };

function getAt(root: any, path: string[]) { let n = root; for (const k of path) n = n?.[k]; return n; }

/** Foundation refs become var() so density and themes keep working downstream. */
function refToCss(v: unknown): string {
  if (typeof v === "string" && /^\{[^}]+\}$/.test(v)) {
    const path = v.slice(1, -1).split(".");
    return `var(${cssVar(path)})`;
  }
  return String(v);
}
function refToRaw(v: unknown): unknown {
  if (typeof v === "string" && /^\{[^}]+\}$/.test(v)) {
    const path = v.slice(1, -1).split(".");
    if (path[0] === "shadow" || path[0] === "density") return v;
    const t = getAt(foundations, path);
    if (!t || !("$value" in t)) throw new Error(`Unknown foundation ref ${v}`);
    return refToRaw(t.$value);
  }
  return v;
}
function fontFamily(list: string[]) {
  return list.map((f) => (/\s/.test(f) && !/^(ui-|-apple)/.test(f) ? `"${f}"` : f)).join(", ");
}
function shadowCss(raw: any): string {
  if (raw === "none") return "none";
  return (raw as any[]).map((s) => s.inset ? `inset 0 ${s.offsetYInset ?? "1px"} 0 0 ${refToCss(s.color)}` : `${s.offsetX} ${s.offsetY} ${s.blur} ${s.spread} ${refToCss(s.color)}`).join(", ");
}

export function collectFoundations(): Dim[] {
  const out: Dim[] = [];
  const walk = (node: any, path: string[], inherited?: string) => {
    const type = node.$type ?? inherited;
    for (const [k, child] of Object.entries<any>(node)) {
      if (k.startsWith("$")) continue;
      const next = [...path, k];
      if (child && typeof child === "object" && "$value" in child) {
        const t = child.$type ?? type;
        if (t === "typography") {
          const v = child.$value;
          const parts: Record<string, string> = {
            "font-family": refToCss(v.fontFamily), "font-size": v.fontSize, "line-height": v.lineHeight,
            "font-weight": refToCss(v.fontWeight), "letter-spacing": v.letterSpacing,
          };
          for (const [p, css] of Object.entries(parts)) out.push({ path: [...next, p], name: [...next, p].join("."), cssVar: cssVar([...next, p]), type: "typography-part", description: child.$description, css, raw: css });
          out.push({ path: next, name: next.join("."), cssVar: "", type: "typography", description: child.$description, css: "", raw: { fontFamily: (getAt(foundations, String(v.fontFamily).slice(1, -1).split(".")) as any).$value, fontSize: v.fontSize, lineHeight: v.lineHeight, fontWeight: refToRaw(v.fontWeight), letterSpacing: v.letterSpacing } });
        } else {
          const raw = child.$value;
          let css: string;
          if (t === "fontFamily") css = fontFamily(raw);
          else if (t === "cubicBezier") css = `cubic-bezier(${raw.join(", ")})`;
          else if (t === "shadow") css = shadowCss(raw);
          else css = refToCss(raw);
          out.push({ path: next, name: next.join("."), cssVar: cssVar(next), type: t ?? "string", description: child.$description, css, raw: refToRaw(raw) });
        }
      } else if (child && typeof child === "object") walk(child, next, type);
    }
  };
  walk(foundations, []);
  return out;
}

export function collectComponentTokens(): Dim[] {
  const out: Dim[] = [];
  for (const [comp, values] of Object.entries<any>(componentTokens)) {
    if (comp.startsWith("$")) continue;
    for (const [k, v] of Object.entries<string>(values)) {
      const path = [comp, k];
      out.push({ path, name: path.join("."), cssVar: cssVar(path), type: "dimension", css: refToCss(v), raw: refToRaw(v) });
    }
  }
  return out;
}

export const TYPE_ROLES = Object.keys(foundations.type).filter((k) => !k.startsWith("$"));
