import { H2 } from "./shared";

const PAIRS: [string, string, string][] = [
  ["Buttons", "Approve materiality", "Submit"],
  ["Toast after the action", "Materiality approved", "Success!"],
  ["Error", "Enter a year between 2015 and 2030.", "Invalid input."],
  ["Empty state", "No disclosures yet. Run the CSRD Filing Orchestrator to draft them.", "Nothing to see here."],
  ["Destructive confirm", "Delete 3 tools? Workflows that use them will stop at that step.", "Are you sure?"],
  ["AI attribution", "Drafted by CSRD Narrative Agent from 12 sources", "AI magic ✨"],
  ["Status", "Awaiting approval", "Pending (user)"],
  ["Numbers", "12,480 tCO₂e", "12480 tons CO2"],
];

export function ContentPage() {
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="voice" lede="Faun products speak like a capable colleague: precise, calm and brief. People using them file regulatory disclosures; the words must be exact.">Voice</H2>
        <div className="fd-principles">
          <div><h3>Specific</h3><p>Name the thing and the number. “3 datapoints are missing evidence” beats “Some data needs attention”.</p></div>
          <div><h3>Plain</h3><p>Use the words the user uses. A sustainability lead manages <em>suppliers</em>, not <em>counterparty entities</em>.</p></div>
          <div><h3>Honest about machines</h3><p>Say what an agent did, with what, and how sure it is. Never present AI output as fact before a person accepts it.</p></div>
        </div>
      </section>
      <section className="fd-section">
        <H2 id="examples">Write this, not that</H2>
        <div className="docs-table-wrap">
          <table className="docs-table">
            <thead><tr><th>Context</th><th>Write</th><th>Avoid</th></tr></thead>
            <tbody>{PAIRS.map(([c, d, n]) => <tr key={c}><td>{c}</td><td className="fd-do">{d}</td><td className="fd-dont">{n}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className="fd-section">
        <H2 id="mechanics">Mechanics</H2>
        <ul className="fd-rules">
          <li><b>Sentence case</b> for every title, button, label, tab and column header. Proper nouns and standard names keep their case: CSRD, ESRS E1-6, GHG Protocol.</li>
          <li><b>Actions keep their names.</b> The button, the toast, the audit log entry and the help text all use the same verb.</li>
          <li><b>Numbers:</b> thousands separators, units after the value, tabular figures in tables. Use the reporting locale for decimals.</li>
          <li><b>Dates:</b> “18 Oct 2026” in the interface, ISO 8601 in exports and APIs. Reporting periods as “FY2026” or “Jan–Dec 2026”.</li>
          <li><b>Errors</b> say what happened and how to fix it, without apology or blame. Put them next to the field, not only in a toast.</li>
          <li><b>Status labels</b> come from the status map so the same state reads the same everywhere.</li>
          <li>No exclamation marks, no emoji, no “please” on buttons.</li>
        </ul>
      </section>
      <section className="fd-section">
        <H2 id="ai" lede="Agents write a lot of the content people read in Faun products. These rules keep it trustworthy.">Writing about AI</H2>
        <ul className="fd-rules">
          <li>Attribute generated content to the agent that produced it, by name.</li>
          <li>Cite sources inline, numbered, linked to the evidence.</li>
          <li>State confidence in words when it matters (“Low confidence: 2 of 5 suppliers reported”).</li>
          <li>Use “Draft”, “Suggested” or “Proposed” until a person accepts it; then drop the label and record who accepted it.</li>
          <li>When an agent needs a decision, say exactly what it needs and what happens next: “Approve the materiality matrix to continue drafting E1 and S1.”</li>
        </ul>
      </section>
    </div>
  );
}
