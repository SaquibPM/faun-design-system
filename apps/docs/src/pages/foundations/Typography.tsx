import { H2, TOKENS } from "./shared";

const SAMPLES: Record<string, string> = {
  "figure-xl": "12,480", "figure-lg": "7,159", "figure-md": "91%",
  "display-lg": "Every filing, one place", "display-md": "Emissions overview",
  "heading-xl": "CSRD sustainability statement", "heading-lg": "Approve the materiality matrix", "heading-md": "Emissions by scope", "heading-sm": "Sub-agents in execution order",
  "body-lg": "Category 1 purchased goods rose 6% after the supplier mix shifted toward steel. The narrative below was drafted by the CSRD Narrative Agent and is waiting for your review.",
  "body-md": "Discovers applicable ESRS requirements, inventories data sources and produces a gap analysis showing missing datapoints.",
  "body-sm": "Last run 2 h ago by the CSRD Filing Orchestrator · 9 steps · 4 min 12 s",
  "label-lg": "Approve and continue", "label-md": "Run workflow", "label-sm": "Awaiting approval",
  caption: "Factor DEFRA 2025 · natural gas · kgCO₂e per kWh", micro: "⌘K",
  "code-md": '{ "esrs": "E1-6", "value": 3212.6, "unit": "tCO2e" }', "code-sm": "csrd-discovery-agent",
};

export function TypographyPage() {
  const roles = TOKENS.filter((t) => t.type === "typography");
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="families" lede="IBM Plex carries everything: Plex Sans for the interface, Plex Serif for display moments, Plex Mono for identifiers and numbers.">Typefaces</H2>
        <div className="fd-families">
          <figure className="fd-family">
            <span className="fd-family-sample" style={{ fontFamily: "var(--faun-font-family-sans)" }}>Aa</span>
            <figcaption><b>IBM Plex Sans</b><span>Interface and reading text. An engineered grotesque with a generous x-height that stays clear at 12px in dense tables. Weights 400, 500 and 600.</span></figcaption>
          </figure>
          <figure className="fd-family">
            <span className="fd-family-sample" style={{ fontFamily: "var(--faun-font-family-serif)" }}>12,480</span>
            <figcaption><b>IBM Plex Serif</b><span>Display only: page titles, headline figures and section openers. Weight 400 for figures. Never body text, never in dense UI.</span></figcaption>
          </figure>
          <figure className="fd-family">
            <span className="fd-family-sample fd-family-mono" style={{ fontFamily: "var(--faun-font-family-mono)" }}>E1-6</span>
            <figcaption><b>IBM Plex Mono</b><span>Codes and identifiers: ESRS references, slugs, IDs, schemas and JSON. Slashed zero separates 0 from O. Weights 400 and 500. All three families are open source (SIL OFL).</span></figcaption>
          </figure>
        </div>
      </section>

      <section className="fd-section">
        <H2 id="weights" lede="Three weights are enough. 400 for reading, 500 for labels, 600 for headings. Plex ships static weights, so there is no variable axis to tune.">Weights</H2>
        <div className="fd-weights">
          <div style={{ fontFamily: "var(--faun-font-family-sans)" }}><b style={{ fontWeight: 400 }}>Regular 400</b><span>Body, table cells, helper text</span></div>
          <div style={{ fontFamily: "var(--faun-font-family-sans)" }}><b style={{ fontWeight: 500 }}>Medium 500</b><span>Buttons, labels, tabs, table headers</span></div>
          <div style={{ fontFamily: "var(--faun-font-family-sans)" }}><b style={{ fontWeight: 600 }}>Semibold 600</b><span>Headings and the current nav item</span></div>
          <div style={{ fontFamily: "var(--faun-font-family-serif)" }}><b style={{ fontWeight: 400 }}>Serif 400</b><span>Figures and display titles</span></div>
        </div>
        <ul className="fd-rules">
          <li>Plex has no optical-size axis, so Faun sets no <code>font-variation-settings</code>. Display sizes are tuned with size, line height and tracking instead.</li>
          <li>Plex is slightly wider than a typical grotesque, so tracking on headings is tighter by only a few hundredths of an em and body text is untracked. Line heights sit at 1.4 to 1.6 for reading text and 1.1 to 1.25 for figures.</li>
        </ul>
      </section>

      <section className="fd-section">
        <H2 id="roles" lede="Nineteen roles replace ad-hoc sizes. Pick by job, not by look: a card title is heading-md wherever it appears.">Type roles</H2>
        <div className="fd-type-list">
          {roles.map((r) => {
            const key = r.name.replace("type.", "");
            const v = r.value as { fontSize: string; lineHeight: string; fontWeight: number; letterSpacing: string; fontFamily: string[] };
            return (
              <div className="fd-type-row" key={key}>
                <div className="fd-type-meta">
                  <code>{key}</code>
                  <span>{v.fontFamily[0]} · {v.fontSize}/{v.lineHeight} · {v.fontWeight}{v.letterSpacing !== "0em" ? ` · ${v.letterSpacing}` : ""}</span>
                  <span className="docs-muted">{r.description}</span>
                </div>
                <div className={`faun-type-${key} fd-type-sample`}>{SAMPLES[key]}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="fd-section">
        <H2 id="numbers" lede="Numbers are the product. Every figure that lines up with another uses tabular lining numerals so columns align and totals don't jitter as values stream in.">Numerals</H2>
        <div className="fd-numerals">
          <div><span className="fd-label">Proportional</span><span style={{ fontFeatureSettings: "normal" }}>1,111.1<br />8,888.8<br />4,701.9</span></div>
          <div><span className="fd-label">Tabular (default for data)</span><span className="faun-numeric">1,111.1<br />8,888.8<br />4,701.9</span></div>
        </div>
        <ul className="fd-rules">
          <li>Right-align numbers in tables; keep units in the header or as a muted suffix, never repeated in every cell.</li>
          <li>Use the narrow no-break space or a thin unit gap: <code>12,480 tCO₂e</code>. Write subscripts as real characters: CO₂, not CO2.</li>
          <li>Show the precision the data supports. Emissions totals: whole tonnes. Factors: up to four significant figures. Percentages: one decimal.</li>
        </ul>
      </section>

      <section className="fd-section">
        <H2 id="rules" lede="A few rules keep text consistent across dozens of screens.">Rules</H2>
        <ul className="fd-rules">
          <li>Sentence case for everything: titles, buttons, tabs, menu items, column headers. No all-caps labels.</li>
          <li>Keep reading text under 72 characters per line. Long-form content uses body-lg.</li>
          <li>Hierarchy comes from size and weight, not colour. The quietest readable text is <code>fg.muted</code>.</li>
          <li>Truncate with an ellipsis only where the full value is available on hover or in a detail view.</li>
          <li>The smallest running text is 12px. 11px is reserved for counters and keyboard hints.</li>
        </ul>
      </section>
    </div>
  );
}
