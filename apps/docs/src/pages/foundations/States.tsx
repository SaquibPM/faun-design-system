import { Button } from "@faun-ds/react";
import { H2 } from "./shared";

const ROWS: { name: string; rest: string; hover: string; active: string; use: string }[] = [
  { name: "Primary action", rest: "accent-solid-bg", hover: "accent-solid-bg-hover", active: "accent-solid-bg-hover", use: "One per view. Moss in the default theme, tenant accent when set." },
  { name: "Secondary action", rest: "neutral-soft-bg", hover: "neutral-soft-bg-hover", active: "neutral-soft-bg-active", use: "Supporting actions beside a primary." },
  { name: "Ghost / row", rest: "bg-surface", hover: "bg-hover", active: "bg-active", use: "Menu items, table rows, list entries." },
  { name: "Selected", rest: "bg-selected", hover: "bg-selected-hover", active: "bg-selected-hover", use: "Chosen row, current nav item, checked option." },
  { name: "Destructive", rest: "danger-solid-bg", hover: "danger-solid-bg-hover", active: "danger-solid-bg-hover", use: "Oxblood. Always behind a confirmation." },
];

export function StatesPage() {
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="matrix" lede="Every interactive surface moves through the same six states. Hover and pressed shift tone by one step; selected is a tint, never a border alone; disabled drops contrast on purpose and is never the only way a state is communicated.">State matrix</H2>
        <div className="docs-table-wrap">
          <table className="docs-table">
            <thead><tr><th>Role</th><th>Rest</th><th>Hover</th><th>Pressed</th><th>Use</th></tr></thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.name}>
                  <td>{r.name}</td>
                  {[r.rest, r.hover, r.active].map((v, i) => (
                    <td key={i}><span className="fd-state-sw" style={{ background: `var(--faun-${v})` }} /><code>{v}</code></td>
                  ))}
                  <td className="docs-muted">{r.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="fd-section">
        <H2 id="focus" lede="Focus is always visible for keyboard users: a 2px solid ring with a 2px offset, at least 3:1 against both canvas and surface. Never remove it; never replace it with a colour change alone.">Focus</H2>
        <div className="fd-states-demo">
          <Button variant="solid" intent="accent">Rest</Button>
          <Button variant="solid" intent="accent" className="fd-force-focus">Focus</Button>
          <Button variant="solid" intent="accent" disabled>Disabled</Button>
          <Button variant="outline" intent="neutral">Rest</Button>
          <Button variant="outline" intent="neutral" className="fd-force-focus">Focus</Button>
          <Button variant="outline" intent="neutral" disabled>Disabled</Button>
        </div>
        <p className="fd-note">Tokens: <code>--faun-focus-ring</code> for the ring, <code>--faun-focus-halo</code> for the soft outer halo used on inputs.</p>
      </section>

      <section className="fd-section">
        <H2 id="disabled" lede="Disabled controls stay in the layout, drop to the disabled tokens, and explain themselves. If an action is unavailable for a reason the user can fix, say so in a tooltip or helper text instead of silently greying it.">Disabled and read-only</H2>
        <div className="docs-table-wrap">
          <table className="docs-table">
            <thead><tr><th>Token</th><th>Role</th></tr></thead>
            <tbody>
              <tr><td><code>--faun-bg-disabled</code></td><td>Fill of disabled controls.</td></tr>
              <tr><td><code>--faun-fg-disabled</code></td><td>Label of disabled controls. Exempt from contrast, so never carry meaning only here.</td></tr>
              <tr><td><code>--faun-border-disabled</code></td><td>Outline of disabled controls.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
