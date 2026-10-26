import { createAccent } from "@faun-ds/tokens/theme";

export type ThemePref = "system" | "light" | "dark" | "light-hc" | "dark-hc";
export type DensityPref = "compact" | "comfortable" | "spacious";
export type PalettePref = "default" | "meadow" | "dawn" | "harbour";
export type Prefs = { theme: ThemePref; density: DensityPref; accent: string | null; vizPalette: PalettePref };

const KEY = "faun-docs-prefs";
const DEFAULTS: Prefs = { theme: "system", density: "comfortable", accent: null, vizPalette: "default" };
let current: Prefs = DEFAULTS;
const listeners = new Set<(p: Prefs) => void>();

function read(): Prefs {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") }; } catch { return DEFAULTS; }
}
function apply(p: Prefs) {
  const html = document.documentElement;
  html.setAttribute("data-faun-theme", p.theme);
  html.setAttribute("data-faun-density", p.density);
  // Chart palette (ADR 0007): data-viz-palette on the root recolours every chart beneath it. Default removes the attribute.
  if (p.vizPalette && p.vizPalette !== "default") html.setAttribute("data-viz-palette", p.vizPalette); else html.removeAttribute("data-viz-palette");
  let tag = document.getElementById("faun-accent") as HTMLStyleElement | null;
  if (p.accent) {
    if (!tag) { tag = document.createElement("style"); tag.id = "faun-accent"; document.head.appendChild(tag); }
    try { tag.textContent = createAccent(p.accent).css; } catch { tag.textContent = ""; }
  } else if (tag) tag.remove();
}
export function initPreferences() { current = read(); apply(current); }
export function getPrefs() { return current; }
export function setPrefs(patch: Partial<Prefs>) {
  current = { ...current, ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(current)); } catch {}
  apply(current);
  listeners.forEach((l) => l(current));
}
export function subscribe(fn: (p: Prefs) => void) { listeners.add(fn); return () => listeners.delete(fn); }
