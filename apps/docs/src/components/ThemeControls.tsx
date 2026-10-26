import { Button, IconButton } from "@faun-ds/react";
import { IconCheck, IconSettings } from "@faun-ds/icons";
import { useEffect, useRef, useState } from "react";
import { getPrefs, setPrefs, subscribe, type DensityPref, type ThemePref } from "../prefs";
import { PALETTE_OPTIONS, ReliefChips } from "./PaletteSwitch";

const THEMES: [ThemePref, string][] = [["system", "System"], ["light", "Light"], ["dark", "Dark"], ["light-hc", "Light high contrast"], ["dark-hc", "Dark high contrast"]];
const DENSITIES: [DensityPref, string][] = [["compact", "Compact"], ["comfortable", "Comfortable"], ["spacious", "Spacious"]];
export const ACCENTS: [string | null, string][] = [[null, "Moss"], ["#0057B8", "Cobalt"], ["#6E44FF", "Violet"], ["#C2185B", "Raspberry"], ["#B45309", "Copper"], ["#0F766E", "Teal"]];

export function usePrefs() {
  const [p, set] = useState(getPrefs());
  useEffect(() => { const off = subscribe(set); return () => { off(); }; }, []);
  return p;
}

/** Appearance, density and tenant accent. The accent uses createAccent() from @faun-ds/tokens/theme. */
export function ThemeControls() {
  const p = usePrefs();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);
  return (
    <div className="docs-prefs" ref={ref}>
      <IconButton icon={<IconSettings />} label="Appearance" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((o) => !o)} />
      {open ? (
        <div className="docs-prefs-panel" role="dialog" aria-label="Appearance">
          <fieldset>
            <legend>Theme</legend>
            {THEMES.map(([v, l]) => (
              <button key={v} type="button" className="docs-prefs-opt" aria-pressed={p.theme === v} onClick={() => setPrefs({ theme: v })}>
                <span>{l}</span>{p.theme === v ? <IconCheck size="sm" /> : null}
              </button>
            ))}
          </fieldset>
          <fieldset>
            <legend>Density</legend>
            <div className="docs-prefs-seg">
              {DENSITIES.map(([v, l]) => (
                <button key={v} type="button" aria-pressed={p.density === v} onClick={() => setPrefs({ density: v })}>{l}</button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Accent <span className="docs-prefs-hint">Tenant theming</span></legend>
            <div className="docs-swatches">
              {ACCENTS.map(([v, l]) => (
                <button key={l} type="button" className="docs-swatch" aria-pressed={p.accent === v} aria-label={l} title={l} style={{ background: v ?? "#1a5e3e" }} onClick={() => setPrefs({ accent: v })} />
              ))}
              <label className="docs-swatch docs-swatch-custom" title="Custom colour">
                <input type="color" aria-label="Custom accent colour" value={p.accent ?? "#1a5e3e"} onChange={(e) => setPrefs({ accent: e.target.value })} />
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend>Chart palette <span className="docs-prefs-hint">Moss stays series 1</span></legend>
            {PALETTE_OPTIONS.map((o) => (
              <button key={o.id} type="button" className="docs-prefs-opt" aria-pressed={p.vizPalette === o.id} onClick={() => setPrefs({ vizPalette: o.id })}>
                <span className="docs-prefs-pal"><span data-viz-palette={o.id}><ReliefChips n={4} /></span>{o.label}</span>{p.vizPalette === o.id ? <IconCheck size="sm" /> : null}
              </button>
            ))}
          </fieldset>
          <Button size="sm" variant="ghost" onClick={() => setPrefs({ theme: "system", density: "comfortable", accent: null, vizPalette: "default" })}>Reset</Button>
        </div>
      ) : null}
    </div>
  );
}
