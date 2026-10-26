import { CodeBlock } from "../../components/CodeBlock";
import { H2 } from "./shared";

const COLS = [
  { bp: "sm", min: "640px", cols: 4, gutter: "16px", margin: "16px" },
  { bp: "md", min: "768px", cols: 8, gutter: "16px", margin: "24px" },
  { bp: "lg", min: "1024px", cols: 12, gutter: "24px", margin: "24px" },
  { bp: "xl", min: "1280px", cols: 12, gutter: "24px", margin: "32px" },
  { bp: "2xl", min: "1536px", cols: 12, gutter: "24px", margin: "auto, content max 1440px" },
];

export function GridPage() {
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="columns" lede="Pages sit on a 12-column grid that collapses to 8 and 4. Columns are fluid; gutters and margins come from the space scale so the grid stays on the 4px rhythm.">Columns</H2>
        <div className="fd-grid-demo" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => <span key={i}>{i + 1}</span>)}
        </div>
        <div className="docs-table-wrap">
          <table className="docs-table">
            <thead><tr><th>Breakpoint</th><th>Min width</th><th>Columns</th><th>Gutter</th><th>Margin</th></tr></thead>
            <tbody>
              {COLS.map((c) => <tr key={c.bp}><td><code>{c.bp}</code></td><td className="fd-num">{c.min}</td><td className="fd-num">{c.cols}</td><td className="fd-num">{c.gutter}</td><td>{c.margin}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <section className="fd-section">
        <H2 id="spans" lede="Common spans for product screens. Spans are choices of proportion, not new tokens.">Spans</H2>
        <div className="fd-span-list">
          {[["Full width table or report", 12], ["Main with side panel", 8], ["Side panel", 4], ["Card in a three-up row", 4], ["Reading column", 6]].map(([label, n]) => (
            <div key={String(label)} className="fd-span-row">
              <span className="fd-span-bar" style={{ gridColumn: `span ${n}` }}>{n}</span>
              <span className="docs-muted fd-span-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="fd-section">
        <H2 id="package" lede="The grid ships as @faun-ds/grid: CSS generated from the tokens, with React Grid and Column components.">In code</H2>
        <CodeBlock lang="tsx" code={`import { Grid, Column } from "@faun-ds/grid";

<Grid>
  <Column span={4} md={8} lg={8}>Main</Column>
  <Column span={4} md={8} lg={4}>Side panel</Column>
</Grid>`} />
        <p className="fd-note">Modes: <code>mode="narrow"</code> for reading layouts, <code>mode="condensed"</code> for dense screens, <code>flush</code> to remove the outer margin.</p>
      </section>

      <section className="fd-section">
        <H2 id="rules" lede="A short set of rules keeps screens aligned without a bespoke layout per page.">Rules</H2>
        <ul className="fd-rules">
          <li>Align every edge to a column edge or to the 4px grid inside a column.</li>
          <li>Tables and charts may break out to full width; prose never exceeds 720px.</li>
          <li>Side panels take 4 columns at xl and overlay below lg.</li>
          <li>Use <code>Stack</code> and <code>Inline</code> with gap tokens for siblings; reserve the grid for page structure.</li>
        </ul>
      </section>
    </div>
  );
}
