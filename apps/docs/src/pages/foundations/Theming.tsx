import { Badge, Button, StatusBadge, TextField } from "@faun-ds/react";
import { createAccent } from "@faun-ds/tokens/theme";
import themes from "../../../../../packages/tokens/src/themes.json";
import { useMemo, useState, type CSSProperties } from "react";
import { CodeBlock } from "../../components/CodeBlock";
import { H2 } from "./shared";

const APS = ["light", "dark", "light-hc", "dark-hc"] as const;
const PRESETS: [string, string][] = [["#3e4c3a", "Moss"], ["#0057B8", "Cobalt"], ["#6E44FF", "Violet"], ["#C2185B", "Raspberry"], ["#B45309", "Copper"], ["#0F766E", "Teal"], ["#111111", "Graphite"]];

function MiniCard() {
  return (
    <div className="fd-mini">
      <div className="fd-mini-head"><b>Scope 3, category 1</b><StatusBadge domain="approval" state="pending" size="sm" /></div>
      <p>Spend-based estimate using EXIOBASE factors. Review before it enters the ledger.</p>
      <div className="fd-mini-actions"><Button size="sm" variant="ghost">Edit</Button><Button size="sm" variant="solid" intent="accent">Approve</Button></div>
    </div>
  );
}

export function ThemingPage() {
  const [seed, setSeed] = useState("#0057B8");
  const accent = useMemo(() => { try { return createAccent(seed); } catch { return null; } }, [seed]);
  const scoped = (ap: "light" | "dark"): CSSProperties => {
    if (!accent) return {};
    const s: Record<string, string> = {};
    for (const [k, v] of Object.entries(accent.scale[ap])) s[`--faun-accent-${k}`] = v;
    return s as CSSProperties;
  };
  const meta = themes as Record<string, { label?: string; description?: string }>;
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="themes" lede="Five themes ship with Faun, plus system, which follows the operating system. Set data-faun-theme on any element; themes nest, so a dark inspector can sit inside a light page.">Themes</H2>
        <div className="fd-themes">
          {["light", "dark", "light-hc", "dark-hc", "print"].map((t) => (
            <figure key={t} className="fd-theme" data-faun-theme={t}>
              <MiniCard />
              <figcaption><b>{meta[t]?.label}</b><span>{meta[t]?.description}</span></figcaption>
            </figure>
          ))}
        </div>
        <CodeBlock code={`<html data-faun-theme="system" data-faun-density="comfortable">\n  …\n  <aside data-faun-theme="dark">Nested dark panel</aside>\n</html>`} lang="tsx" />
      </section>

      <section className="fd-section">
        <H2 id="tenant" lede="Enterprise customers want their brand, not ours. createAccent() turns one brand colour into a full accent scale for every theme, checks it against the contrast contract, and returns CSS. Every accent role (primary buttons, focus, selection, links, brand marks) follows; status colours stay fixed so meaning never changes.">Tenant accent</H2>
        <div className="fd-builder">
          <div className="fd-builder-controls">
            <div className="fd-presets" role="radiogroup" aria-label="Preset accents">
              {PRESETS.map(([hex, name]) => (
                <button key={hex} type="button" role="radio" aria-checked={seed.toLowerCase() === hex.toLowerCase()} className="docs-swatch" style={{ background: hex }} title={name} aria-label={name} onClick={() => setSeed(hex)} />
              ))}
            </div>
            <div className="fd-seed">
              <input type="color" value={/^#[0-9a-f]{6}$/i.test(seed) ? seed : "#000000"} onChange={(e) => setSeed(e.target.value)} aria-label="Pick brand colour" />
              <TextField label="Brand colour" value={seed} onChange={(e) => setSeed(e.target.value)} description="Any CSS colour: hex, rgb() or oklch()." />
            </div>
            {accent ? (
              <div className="fd-report">
                <p className="fd-label">Contrast checks <Badge tone={accent.ok ? "success" : "danger"} size="sm">{accent.ok ? "All pass" : "Needs attention"}</Badge></p>
                <table className="fd-report-table">
                  <thead><tr><th>Pair</th>{APS.map((a) => <th key={a}>{a.replace("-hc", " HC")}</th>)}</tr></thead>
                  <tbody>
                    {[...new Set(accent.report.map((r) => r.pair))].map((pair) => (
                      <tr key={pair}>
                        <td>{pair.replace(/ \(\d+\)/g, "")}</td>
                        {APS.map((a) => { const r = accent.report.find((x) => x.pair === pair && x.appearance === a); return <td key={a} className="fd-num" data-pass={r?.pass || undefined} title={r ? `min ${r.min}` : undefined}>{r ? r.ratio.toFixed(1) : "–"}</td>; })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="docs-muted">Enter a valid colour.</p>}
          </div>
          <div className="fd-builder-preview">
            {(["light", "dark"] as const).map((ap) => (
              <div key={ap} className="fd-builder-pane" data-faun-theme={ap} style={scoped(ap)}>
                <div className="fd-builder-scale">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ background: `var(--faun-accent-${i + 1})` }} title={`accent-${i + 1}`} />)}</div>
                <MiniCard />
                <div className="fd-builder-row"><Button variant="soft" intent="accent" size="sm">Soft</Button><Button variant="outline" intent="accent" size="sm">Outline</Button><a href="#tenant" className="fd-link">Inline link</a><Badge tone="accent" size="sm">Accent</Badge></div>
              </div>
            ))}
          </div>
        </div>
        {accent ? <CodeBlock title="Generated CSS (load after faun.css)" code={accent.css.split("\n").slice(0, 18).join("\n") + "\n/* … */"} lang="css" /> : null}
        <CodeBlock code={`import { createAccent } from "@faun-ds/tokens/theme";\n\nconst acme = createAccent("${seed}");\nif (!acme.ok) console.warn(acme.report.filter((r) => !r.pass));\ndocument.head.insertAdjacentHTML("beforeend", \`<style>\${acme.css}</style>\`);`} />
      </section>

      <section className="fd-section">
        <H2 id="modes" lede="Modes are orthogonal to themes and can be combined.">Modes</H2>
        <div className="docs-table-wrap">
          <table className="docs-table">
            <thead><tr><th>Attribute</th><th>Values</th><th>Effect</th></tr></thead>
            <tbody>
              <tr><td><code>data-faun-density</code></td><td>compact · comfortable · spacious</td><td>Control heights, table rows, cell and panel padding.</td></tr>
              <tr><td><code>data-faun-motion</code></td><td>reduced</td><td>Collapses durations to zero, as the OS setting does.</td></tr>
              <tr><td><code>data-faun-calm</code></td><td>present</td><td>Stops spinners and pulsing live indicators; running states show a static icon.</td></tr>
              <tr><td><code>data-faun-print</code></td><td>off</td><td>Disables the automatic print theme for <code>@media print</code>.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
