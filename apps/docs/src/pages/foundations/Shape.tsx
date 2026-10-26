import { H2, byCategory } from "./shared";

const RADIUS_USE: Record<string, string> = { xs: "Checkboxes, inline code", sm: "Menu items, tooltips, small controls", md: "Buttons, inputs, selects", lg: "Cards, panels, popovers", xl: "Dialogs, sheets", full: "Badges, avatars, pills" };

export function ShapePage() {
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="radius" lede="Radius follows the role of the element. Nested corners shrink by the padding between them, so a 14px card with 8px padding holds 6px items.">Radius</H2>
        <div className="fd-radius">
          {["xs", "sm", "md", "lg", "xl", "full"].map((r) => (
            <figure key={r} className="fd-radius-item">
              <span style={{ borderRadius: `var(--faun-radius-${r})` }} />
              <figcaption><code>{r}</code><span className="docs-muted">{RADIUS_USE[r]}</span></figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="fd-section">
        <H2 id="elevation" lede="Five levels of depth. Light themes use soft, warm-tinted shadows; dark themes lift surfaces with lighter fills and a hairline highlight on the top edge; high contrast and print drop shadows and rely on borders.">Elevation</H2>
        <div className="fd-elev">
          {byCategory("elevation").filter((e) => e.name !== "elevation.0").map((e) => (
            <figure key={e.name} className="fd-elev-item" style={{ boxShadow: `var(${e.cssVar})` }}>
              <code>{e.name.replace("elevation.", "Level ")}</code>
              <figcaption className="docs-muted">{e.description}</figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="fd-section">
        <H2 id="relief" lede="Charts are drawn as shallow blocks: a pastel tint face with a faint wave, a thin outline and a darker extruded side (3 to 6px, bottom right). Buttons, data tables, text and cards stay flat (ADR 0008). Set appearance=&quot;flat&quot; on a chart, or data-appearance=&quot;flat&quot; on any ancestor, for the classic look; high contrast, print and forced colours are flat automatically, with a clear hatch instead of the faint wave.">Relief</H2>
        <p className="docs-muted">Depth, bevel, outline width and texture strength are the <code>--faun-dataviz-relief-*</code> tokens.</p>
      </section>
      <section className="fd-section">
        <H2 id="borders" lede="Borders separate; shadows lift. A raised surface gets both: a subtle border keeps its edge crisp on any background, including high contrast where shadows disappear.">Borders</H2>
        <div className="fd-borders">
          {["subtle", "default", "strong", "control", "brand"].map((b) => (
            <div key={b} className="fd-border-item" style={{ borderColor: `var(--faun-border-${b})` }}><code>border.{b}</code></div>
          ))}
        </div>
      </section>
    </div>
  );
}
