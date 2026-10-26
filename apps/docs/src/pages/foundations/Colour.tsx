import { Badge, Button, StatusBadge } from "@faun-ds/react";
import { IconCopy } from "@faun-ds/icons";
import contrastRows from "@faun-ds/tokens/contrast";
import scales from "@faun-ds/tokens/scales";
import statusMap from "@faun-ds/tokens/status-map";
import { Fragment, useState } from "react";
import { vizPalettes } from "@faun-ds/tokens";
import { ReliefChip } from "../../components/PaletteSwitch";
import { H2, Segmented, byCategory, useCopy, type Token } from "./shared";

const STEP_ROLES = ["App bg", "Subtle bg", "Element", "Hover", "Pressed", "Subtle line", "Border", "Strong line", "Solid", "Solid hover", "Text", "High text"];
const SCALE_ORDER = ["gray", "moss", "grass", "blue", "lagoon", "amber", "ember", "plum"];
const SCALE_ROLE: Record<string, string> = { gray: "Neutral", moss: "Brand · accent", grass: "Success", blue: "Info", lagoon: "Running · AI", amber: "Warning", ember: "Danger", plum: "Attention" };
const CAT_NAMES = ["Moss", "Lagoon", "Ochre", "Plum", "Oxblood", "Blue", "Grass", "Warm grey"];
type Ap = "light" | "dark" | "light-hc" | "dark-hc";

function lum(hex: string) {
  const h = hex.replace("#", "");
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((s) => (s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export function ColourPage() {
  const [ap, setAp] = useState<Ap>("light");
  const [alpha, setAlpha] = useState(false);
  const [copied, copy] = useCopy();
  const S = scales as Record<string, Record<Ap, Record<string, string>>>;
  const surface = ap.startsWith("light") ? "#ffffff" : S.gray[ap]["1"];
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="principles" lede="Colour in Faun carries meaning first and brand second. Every value comes from a twelve-step scale, every role is tested against every surface it sits on, and every theme is designed rather than inverted.">Principles</H2>
        <div className="fd-principles">
          <div><h3>Roles, not hexes</h3><p>Components use semantic roles such as <code>fg.muted</code> or <code>accent.solid-bg</code>. Themes and tenant accents remap the roles; components never change.</p></div>
          <div><h3>Machine and human</h3><p>Lagoon marks machine activity: agents running, AI-drafted content. Plum marks people: approvals and reviews waiting on someone. The two never trade places.</p></div>
          <div><h3>Contract-tested</h3><p>{(contrastRows as unknown[]).length} foreground and background pairs are checked on every build across five themes. A single failure stops the release.</p></div>
        </div>
      </section>

      <section className="fd-section">
        <H2 id="scales" lede="Eight scales, each with twelve steps that have a fixed job. Step 9 is the purest colour; 11 and 12 are text. Alpha twins (a1–a12) composite to the same colour over the app background, for overlays on any surface.">Scales</H2>
        <div className="fd-toolbar">
          <Segmented label="Appearance" value={ap} onChange={setAp} options={[["light", "Light"], ["dark", "Dark"], ["light-hc", "Light HC"], ["dark-hc", "Dark HC"]]} />
          <Segmented label="Variant" value={alpha ? "alpha" : "solid"} onChange={(v) => setAlpha(v === "alpha")} options={[["solid", "Solid"], ["alpha", "Alpha"]]} />
          <span className="fd-hint">{copied ? `Copied ${copied}` : "Select a step to copy its variable"}</span>
        </div>
        <div className="fd-scales" style={{ background: surface }} data-appearance={ap}>
          <div className="fd-scale-row fd-scale-head">
            <span />
            {STEP_ROLES.map((r, i) => <span key={r} className="fd-step-head"><b>{i + 1}</b><span>{r}</span></span>)}
          </div>
          {SCALE_ORDER.map((name) => (
            <div className="fd-scale-row" key={name}>
              <span className="fd-scale-name" style={{ color: ap.startsWith("light") ? "#26241f" : "#ece9e1" }}>
                <b>{name}</b><span>{SCALE_ROLE[name]}</span>
              </span>
              {Array.from({ length: 12 }, (_, i) => {
                const key = alpha ? `a${i + 1}` : String(i + 1);
                const hex = S[name][ap][key];
                const solid = S[name][ap][String(i + 1)];
                const varName = `--faun-${name}-${key}`;
                const dark = lum(solid) < 0.35;
                return (
                  <button key={key} type="button" className="fd-swatch" style={{ background: hex }} title={`${varName}  ${hex}`} aria-label={`${name} ${key}, ${hex}. Copy variable`} onClick={() => copy(varName)}>
                    <span style={{ color: dark ? "rgba(255,255,255,.86)" : "rgba(0,0,0,.66)" }}>{hex.slice(0, 7)}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <section className="fd-section">
        <H2 id="roles" lede="Product code uses these roles. Swatches show the live value in the current theme; switch theme from the settings menu to compare.">Semantic roles</H2>
        <RoleTable title="Backgrounds" tokens={byCategory("bg")} />
        <RoleTable title="Text and icons" tokens={byCategory("fg")} />
        <RoleTable title="Borders and focus" tokens={[...byCategory("border"), ...byCategory("focus")]} />
      </section>

      <section className="fd-section">
        <H2 id="interaction" lede="Three intents times four emphasis levels, each with hover and pressed states. Buttons, toggles, chips and segmented controls all compose from this matrix, so a tenant accent re-brands every one of them.">Interaction matrix</H2>
        <div className="fd-matrix">
          <span />
          {["Solid", "Soft", "Outline", "Ghost"].map((h) => <span key={h} className="fd-matrix-head">{h}</span>)}
          {(["accent", "neutral", "danger"] as const).map((intent) => (
            <MatrixRow key={intent} intent={intent} />
          ))}
        </div>
      </section>

      <section className="fd-section">
        <H2 id="status" lede="Seven tones cover every state in an agentic product. Each ships text, tinted, bordered and solid colours, and always appears with an icon and a word.">Status</H2>
        <div className="docs-table-wrap">
          <table className="docs-table fd-status">
            <thead><tr><th>Tone</th><th>Soft</th><th>Solid</th><th>Outline</th><th>Meaning</th></tr></thead>
            <tbody>
              {Object.entries(statusMap.tones as Record<string, { meaning: string }>).map(([tone, t]) => (
                <tr key={tone}>
                  <td><code>{tone}</code></td>
                  <td><StatusBadge tone={tone as "info"} label={cap(tone)} /></td>
                  <td><StatusBadge tone={tone as "info"} label={cap(tone)} variant="solid" /></td>
                  <td><StatusBadge tone={tone as "info"} label={cap(tone)} variant="outline" /></td>
                  <td className="docs-muted">{t.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="fd-note">Domain states (run, task, lifecycle, approval, progress, data quality) map to these tones in <code>@faun-ds/tokens/status-map</code>. For example <StatusBadge domain="run" state="awaiting_approval" /> and <StatusBadge domain="data-quality" state="estimated" />.</p>
      </section>

      <section className="fd-section">
        <H2 id="data-viz" lede="Charts draw from Faun's own scales, in their own palette so status colours keep their meaning. Series one is the brand moss; the rest are lagoon, ochre, plum, oxblood, blue, grass and warm grey. Neighbours stay apart under protanopia and deuteranopia, and GHG scopes have fixed colours everywhere in the product.">Data visualisation</H2>
        <div className="fd-viz">
          <div>
            <h3 className="docs-h3">Categorical, fixed order</h3>
            <div className="fd-viz-slots">{CAT_NAMES.map((n, i) => <div key={n}><i style={{ background: `var(--faun-dataviz-cat-${i + 1})` }} /><span>{i + 1} {n}</span></div>)}</div>
            <p className="fd-note">Slot 1 is the moss brand solid step, exactly. Every slot is at least 3:1 against the chart surface and the canvas in every theme. Worst adjacent separation ΔE 10.1 (light) and 13.8 (dark) for colour-blind readers; 16.4 and 16.8 for full colour vision. Warm grey is always last, so it reads as “other”. A ninth series folds into “Other”.</p>
          </div>
          <div>
            <h3 className="docs-h3">GHG scopes</h3>
            <div className="fd-viz-slots">{["Scope 1 oxblood", "Scope 2 ochre", "Scope 3 blue", "Outside scopes"].map((s, i) => <div key={s}><i style={{ background: `var(--faun-dataviz-${i < 3 ? `scope-${i + 1}` : "scope-outside"})` }} /><span>{s}</span></div>)}</div>
            <p className="fd-note">Direct emissions, purchased energy and the value chain keep these colours in every chart. Outside the scopes is warm grey.</p>
          </div>
          <div>
            <h3 className="docs-h3">Sequential · moss</h3>
            <div className="fd-ramp">{Array.from({ length: 7 }, (_, i) => <i key={i} style={{ background: `var(--faun-dataviz-seq-${i + 1})` }} />)}</div>
            <p className="fd-note">Seven steps on the moss scale, evenly spaced in lightness, so value can be read without hue. Low is paper in light themes and the surface in dark ones.</p>
          </div>
          <div>
            <h3 className="docs-h3">Sequential · warm grey</h3>
            <div className="fd-ramp">{Array.from({ length: 7 }, (_, i) => <i key={i} style={{ background: `var(--faun-dataviz-seq-neutral-${i + 1})` }} />)}</div>
            <p className="fd-note">For quantity that carries no meaning of its own, or beside the moss ramp.</p>
          </div>
          <div>
            <h3 className="docs-h3">Diverging · moss to oxblood, worse to better</h3>
            <div className="fd-ramp">{["neg-3", "neg-2", "neg-1", "mid", "pos-1", "pos-2", "pos-3"].map((s) => <i key={s} style={{ background: `var(--faun-dataviz-div-${s})` }} />)}</div>
            <p className="fd-note">The default. Oxblood is the worse end, moss the better, warm grey the midpoint. Green and red meet for deuteranopes, so the two sides sit at different lightness and the ends part (ΔE 12.8 light, 15.4 dark). Mirrored steps can look alike to deuteranopes, so label the sign or use the alternative.</p>
          </div>
          <div>
            <h3 className="docs-h3">Diverging · blue to amber, colour-blind safe</h3>
            <div className="fd-ramp">{["neg-3", "neg-2", "neg-1", "mid", "pos-1", "pos-2", "pos-3"].map((s) => <i key={s} style={{ background: `var(--faun-dataviz-div-alt-${s})` }} />)}</div>
            <p className="fd-note">Every mirrored pair stays apart for protan and deutan readers (ΔE 12.5 or more), so sign reads from colour alone. Use it when the audience is not known.</p>
          </div>
        </div>
      </section>

      <section className="fd-section">
        <H2 id="pastel" lede="Three pastel options for charts, with moss still series 1. Set data-viz-palette on any element, or palette on a chart. The pastel is the face of a mark; a deeper colour of the same hue draws the outline, side, wave, lines and points, so 3:1 contrast still holds.">Pastel chart palettes</H2>
        <div className="fd-pal-list">
          {([["default", "Default", "Faun's saturated categorical set. Every slot holds 3:1 on its own."], ...Object.entries(vizPalettes).map(([id, p]) => [id, p.label, p.description])] as [string, string, string][]).map(([id, label, description]) => (
            <div key={id} className="fd-pal">
              <div className="fd-pal-head"><h3 className="docs-h3">{label}</h3><code>{id === "default" ? "data-viz-palette=\"default\"" : `data-viz-palette="${id}"`}</code></div>
              <p className="fd-note">{description}</p>
              <div className="fd-pal-modes">
                {(["light", "dark"] as const).map((mode) => (
                  <div key={mode} className="fd-pal-mode" data-faun-theme={mode} data-viz-palette={id}>
                    <span className="fd-pal-mode-label">{cap(mode)}</span>
                    <div className="fd-pal-slots">
                      {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} className="fd-pal-slot">
                          <ReliefChip slot={i + 1} />
                          <span>{i + 1} {id === "default" ? CAT_NAMES[i] : cap(vizPalettes[id as keyof typeof vizPalettes][mode][i]!.name)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="fd-note">Moss is the brand solid step in every option (<code>#3a492d</code> light, <code>#a0b291</code> dark); its face is a moss tint. Outlines are at least 3:1 on the chart surface (measured 7.3:1 light, 8.2:1 dark), and every deep colour passes the same lightness, 3:1 and colour-blind tests as the default. Pastel faces alone sit close together (adjacent ΔE 5.4 to 9.7 for full colour vision, 2.8 to 10.1 for protan and deutan), so each slot keeps its own wave texture (a faint grain since ADR 0008) and outline hue; outline hue, legend and table carry identity: a chart that must be read by colour alone should use the default palette. High-contrast themes, print and forced colours always use the default. Flat marks use the deep colour. See ADR 0007 and 0008.</p>
      </section>

      <section className="fd-section">
        <H2 id="contrast" lede="Minimums: 4.5:1 for text, 3:1 for control boundaries, focus rings and chart marks, 7:1 for text in the high-contrast themes. Translucent fills are composited before measuring.">Contrast contract</H2>
        <ContrastSummary />
      </section>
    </div>
  );
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

function RoleTable({ title, tokens }: { title: string; tokens: Token[] }) {
  const [copied, copy] = useCopy();
  return (
    <div className="fd-roles">
      <h3 className="docs-h3">{title}</h3>
      <div className="docs-table-wrap">
        <table className="docs-table">
          <thead><tr><th style={{ width: 44 }} /><th>Role</th><th>Variable</th><th>Use</th></tr></thead>
          <tbody>
            {tokens.map((t) => (
              <tr key={t.name}>
                <td><span className="fd-chip" style={{ background: `var(${t.cssVar})` }} /></td>
                <td><code>{t.name}</code></td>
                <td>
                  <button type="button" className="fd-copy" onClick={() => copy(t.cssVar!)} aria-label={`Copy ${t.cssVar}`}>
                    <code>{t.cssVar}</code><IconCopy size="xs" />{copied === t.cssVar ? <span className="fd-copied">Copied</span> : null}
                  </button>
                </td>
                <td className="docs-muted">{t.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MatrixRow({ intent }: { intent: "accent" | "neutral" | "danger" }) {
  const label = intent === "accent" ? "Approve" : intent === "danger" ? "Delete" : "Export";
  return (
    <>
      <span className="fd-matrix-intent"><b>{cap(intent)}</b><span>{intent === "accent" ? "Forward actions" : intent === "danger" ? "Destructive" : "Everyday"}</span></span>
      {(["solid", "soft", "outline", "ghost"] as const).map((v) => <span key={v} className="fd-matrix-cell"><Button intent={intent} variant={v}>{label}</Button></span>)}
    </>
  );
}

function ContrastSummary() {
  const rows = contrastRows as { theme: string; fg: string; bg: string; ratio: number; min: number; pass: boolean }[];
  const themes = [...new Set(rows.map((r) => r.theme))];
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="docs-table-wrap">
      <table className="docs-table">
        <thead><tr><th>Theme</th><th>Pairs</th><th>Result</th><th>Tightest pair</th><th>Ratio</th><th /></tr></thead>
        <tbody>
          {themes.map((t) => {
            const tr = rows.filter((r) => r.theme === t);
            const tight = [...tr].sort((a, b) => a.ratio / a.min - b.ratio / b.min)[0];
            const pass = tr.every((r) => r.pass);
            return (
              <Fragment key={t}>
                <tr>
                  <td><b>{t}</b></td>
                  <td className="fd-num">{tr.length}</td>
                  <td><Badge tone={pass ? "success" : "danger"}>{pass ? "All pass" : "Failures"}</Badge></td>
                  <td><code>{tight.fg}</code> on <code>{tight.bg}</code></td>
                  <td className="fd-num">{tight.ratio.toFixed(2)} : 1 <span className="docs-muted">(min {tight.min})</span></td>
                  <td><Button size="sm" variant="ghost" aria-expanded={open === t} onClick={() => setOpen(open === t ? null : t)}>{open === t ? "Hide pairs" : "Show pairs"}</Button></td>
                </tr>
                {open === t ? (
                  <tr key={`${t}-detail`}>
                    <td colSpan={6} className="fd-pairs-cell">
                      <div className="fd-pairs">
                        {tr.map((r, i) => (
                          <div key={i} className="fd-pair"><code>{r.fg}</code><span className="docs-muted">on</span><code>{r.bg}</code><span className="fd-num">{r.ratio.toFixed(2)}</span></div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
