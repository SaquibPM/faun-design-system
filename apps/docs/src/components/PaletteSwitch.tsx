import { useEffect, useState, type CSSProperties } from "react";
import { getPrefs, setPrefs, subscribe, type PalettePref } from "../prefs";

export const PALETTE_OPTIONS: { id: PalettePref; label: string; hint: string }[] = [
  { id: "default", label: "Default", hint: "Moss, lagoon, ochre, plum, oxblood, blue, grass" },
  { id: "meadow", label: "Meadow", hint: "Sage, butter, sky, blush, lilac" },
  { id: "dawn", label: "Dawn", hint: "Peach, lilac, butter, teal, rose" },
  { id: "harbour", label: "Harbour", hint: "Sky, sand, lavender, mint, periwinkle" },
];

/** A small relief block in one categorical slot, drawn from the same tokens a chart mark uses (face, outline, side, wave). Slot colours come from the palette in scope. */
export function ReliefChip({ slot, wave = slot }: { slot: number; wave?: number }) {
  const c = `--faun-dataviz-cat-${slot}`;
  const style = {
    "--_face": `var(${c}-face, color-mix(in srgb, var(${c}) var(--faun-dataviz-relief-face-mix), var(--faun-dataviz-surface)))`,
    "--_line": `var(${c}-line)`, "--_shade": `var(${c}-shade)`, "--_tex": `var(${c}-tex)`,
    "--_wave": `var(--faun-dataviz-relief-wave-${wave})`, "--_wave-size": `var(--faun-dataviz-relief-wave-${wave}-size)`,
  } as CSSProperties;
  return <i className="fd-relief" style={style} />;
}

/** Slots 1 to `n` of the palette in scope, as relief chips. */
export function ReliefChips({ n = 5 }: { n?: number }) {
  return <span className="docs-palette-chips">{Array.from({ length: n }, (_, i) => <ReliefChip key={i} slot={i + 1} />)}</span>;
}

/** Palette switcher for the docs. Sets data-viz-palette on the root (the same state as the Appearance panel), so every chart on the page follows. */
export function PaletteSwitch({ label = "Chart palette" }: { label?: string }) {
  const [p, set] = useState(getPrefs());
  useEffect(() => { const off = subscribe(set); return () => { off(); }; }, []);
  return (
    <div className="docs-palette-switch" role="group" aria-label={label}>
      <span className="docs-palette-label">{label}</span>
      <div className="docs-palette-options">
        {PALETTE_OPTIONS.map((o) => (
          <button key={o.id} type="button" className="docs-palette-opt" aria-pressed={p.vizPalette === o.id} title={o.hint} onClick={() => setPrefs({ vizPalette: o.id })}>
            <span data-viz-palette={o.id}><ReliefChips n={4} /></span>
            <span>{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
