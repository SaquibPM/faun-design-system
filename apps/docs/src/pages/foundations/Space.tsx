import { Badge, Button, StatusBadge } from "@faun-ds/react";
import { H2, byCategory, tokenNamed } from "./shared";

export function SpacePage() {
  const space = byCategory("space").filter((t) => t.name !== "space.0").sort((a, b) => parseFloat(String(a.value)) - parseFloat(String(b.value)));
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="scale" lede="A 4px grid with half steps at the small end for optical tuning inside controls. Margins, paddings and gaps all come from this scale.">Spacing scale</H2>
        <div className="fd-space">
          {space.map((t) => (
            <div className="fd-space-row" key={t.name}>
              <code>{t.name.replace("space.", "").replace("-", ".")}</code>
              <span className="fd-space-bar" style={{ inlineSize: String(t.value) }} />
              <span className="fd-num docs-muted">{String(t.value)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="fd-section">
        <H2 id="density" lede="Enterprise users live in tables all day; some want more on screen, others need bigger targets. Set data-faun-density on any element and every control, row and panel inside follows.">Density</H2>
        <div className="fd-density">
          {(["compact", "comfortable", "spacious"] as const).map((d) => (
            <div key={d} className="fd-density-col" data-faun-density={d}>
              <p className="fd-label">{d[0].toUpperCase() + d.slice(1)} · {String(tokenNamed(`density.${d}.control-height`)?.value).replace("var(--faun-size-control-", "").replace(")", "")} controls</p>
              <div className="fd-density-panel">
                <div className="fd-density-row"><span>Gross Scope 1</span><span className="fd-num">3,212.6</span><StatusBadge domain="data-quality" state="evidenced" size="sm" /></div>
                <div className="fd-density-row"><span>Scope 3 Cat. 1</span><span className="fd-num">5,941.3</span><StatusBadge domain="data-quality" state="estimated" size="sm" /></div>
                <div className="fd-density-row"><span>Internal carbon price</span><span className="fd-num">—</span><StatusBadge domain="data-quality" state="missing" size="sm" /></div>
                <div className="fd-density-actions"><Button variant="ghost">Cancel</Button><Button variant="solid" intent="accent">Save</Button></div>
              </div>
            </div>
          ))}
        </div>
        <div className="docs-table-wrap">
          <table className="docs-table">
            <thead><tr><th>Token</th><th>Compact</th><th>Comfortable</th><th>Spacious</th></tr></thead>
            <tbody>
              {["control-height", "row-height", "cell-px", "cell-py", "gap", "panel-padding"].map((k) => (
                <tr key={k}><td><code>--faun-density-{k}</code></td>{["compact", "comfortable", "spacious"].map((d) => <td key={d}><code>{String(tokenNamed(`density.${d}.${k}`)?.value).replace(/var\(--faun-(size-control-|space-)?/, "").replace(")", "")}</code></td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="fd-section">
        <H2 id="layout" lede="Layout tokens size the application frame so every product built on Faun shares the same skeleton.">Layout</H2>
        <div className="fd-frame" aria-hidden="true">
          <div className="fd-frame-nav"><span>Navigation</span><code>248px · 60px collapsed</code></div>
          <div className="fd-frame-main">
            <div className="fd-frame-top"><span>Top bar</span><code>52px</code></div>
            <div className="fd-frame-content"><span>Content</span><code>max 1440px · padding 16 / 24 / 32px</code><div className="fd-frame-reading"><span>Reading width</span><code>720px</code></div></div>
          </div>
        </div>
        <div className="docs-table-wrap">
          <table className="docs-table">
            <thead><tr><th>Breakpoint</th><th>Min width</th><th>Layout</th></tr></thead>
            <tbody>
              <tr><td><code>sm</code></td><td className="fd-num">640px</td><td>Single column; navigation off-canvas; dialogs become bottom sheets.</td></tr>
              <tr><td><code>md</code></td><td className="fd-num">768px</td><td>Tables keep columns with horizontal scroll and a sticky first column.</td></tr>
              <tr><td><code>lg</code></td><td className="fd-num">1024px</td><td>Navigation rail collapsed to icons; side panels overlay.</td></tr>
              <tr><td><code>xl</code></td><td className="fd-num">1280px</td><td>Full navigation; side panels sit beside content.</td></tr>
              <tr><td><code>2xl</code></td><td className="fd-num">1536px</td><td>Content caps at 1440px; extra width goes to side panels.</td></tr>
            </tbody>
          </table>
        </div>
        <p className="fd-note">Use <Badge size="sm" variant="outline">Stack</Badge> and <Badge size="sm" variant="outline">Inline</Badge> with gap tokens to lay out siblings; avoid per-element margins.</p>
      </section>
    </div>
  );
}
