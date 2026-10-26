import { Badge, StatusBadge } from "@faun-ds/react";
import { Link } from "react-router";
import { IconAiSparkle, IconStatusAttention, IconStatusRunning } from "@faun-ds/icons";
import statusMap from "@faun-ds/tokens/status-map";
import { H2 } from "./shared";

const AI_COMPONENTS = [
  { slug: "actor-chip", title: "Actor chip", text: "Names who did something: an agent in lagoon, a person in plum." },
  { slug: "run-trail", title: "Run trail", text: "The steps of a run, who ran them, tool calls and failures." },
  { slug: "approval-card", title: "Approval card", text: "The decision waiting on a person, with the consequence of each choice." },
  { slug: "citation", title: "Citation and source list", text: "Numbered references that open the source and the quoted passage." },
  { slug: "confidence-badge", title: "Confidence badge", text: "High, medium or low confidence in words, with the reason." },
  { slug: "provenance-trail", title: "Provenance trail", text: "Lineage from a source document to the reported value." },
  { slug: "streaming-text", title: "Streaming text", text: "Generated text arriving live, readable and stoppable." },
  { slug: "prompt-composer", title: "Prompt composer", text: "Where a person steers a run in words." },
];

const DOMAINS = ["run", "task", "approval", "data-quality"] as const;

export function AgentsPage() {
  const domains = (statusMap as { domains: Record<string, Record<string, unknown>> }).domains;
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="principles" lede="Agentic products ask people to trust work they did not watch happen. These foundations make who did what, how sure it is and what needs a person unmistakable at a glance.">Principles</H2>
        <div className="fd-principles">
          <div><h3>Machines and people look different</h3><p>Machine activity is lagoon. A person's attention or decision is plum. The two never trade places, so a glance tells you whether the system is working or waiting on you.</p></div>
          <div><h3>Say who and from what</h3><p>Every generated statement names the agent that produced it and the sources it used. Unaccepted AI output is labelled in words, not only by an icon.</p></div>
          <div><h3>Calm by default</h3><p>Live work animates slowly and can be stopped. Progress is also stated in text, so it can be read without watching a bar.</p></div>
        </div>
      </section>

      <section className="fd-section">
        <H2 id="machine-human" lede="Two colours carry the whole distinction.">Machine and human</H2>
        <div className="fd-agents-pair">
          <div className="fd-agents-card" data-kind="machine">
            <span className="fd-agents-icon"><IconStatusRunning /></span>
            <div><b>Machine</b><p>An agent, sub-agent or tool is working now, or produced this content.</p><StatusBadge domain="run" state="running" /></div>
          </div>
          <div className="fd-agents-card" data-kind="human">
            <span className="fd-agents-icon"><IconStatusAttention /></span>
            <div><b>Human</b><p>A person must review, decide or approve before work continues.</p><StatusBadge domain="run" state="awaiting_approval" /></div>
          </div>
        </div>
      </section>

      <section className="fd-section">
        <H2 id="attribution" lede="Generated content stays visibly generated until a person accepts it, and then records who did.">Attribution</H2>
        <div className="fd-attrib">
          <div className="fd-attrib-draft">
            <p className="fd-attrib-head"><IconAiSparkle size="sm" /> <b>Draft</b> · CSRD Narrative Agent · 12 sources · 2 min ago</p>
            <p>Gross Scope 1 emissions were 3,212.6 tCO₂e in FY2026, a 4% decrease on the base year, driven by fuel switching at two facilities.</p>
          </div>
          <div className="fd-attrib-accepted">
            <p className="fd-attrib-head"><b>Accepted</b> by Priya Raman, Sustainability lead · 18 Oct 2026</p>
            <p>Gross Scope 1 emissions were 3,212.6 tCO₂e in FY2026, a 4% decrease on the base year, driven by fuel switching at two facilities.</p>
          </div>
        </div>
      </section>

      <section className="fd-section">
        <H2 id="confidence" lede="State confidence in words, with the reason. Colour supports the word; it never replaces it.">Confidence</H2>
        <div className="fd-confidence">
          <div><Badge tone="success">High confidence</Badge><span>All five suppliers reported with evidence.</span></div>
          <div><Badge tone="warning">Medium confidence</Badge><span>Two suppliers estimated from spend.</span></div>
          <div><Badge tone="danger">Low confidence</Badge><span>No activity data. Factor applied to industry average.</span></div>
        </div>
      </section>

      <section className="fd-section">
        <H2 id="states" lede="Every domain state maps to one of seven tones, with a fixed icon and label, through a single status map.">Status vocabulary</H2>
        <div className="fd-status-domains">
          {DOMAINS.map((d) => (
            <div key={d}>
              <p className="fd-label">{d}</p>
              <div className="fd-status-list">
                {Object.keys(domains[d] ?? {}).filter((k) => !k.startsWith("$")).map((s) => <StatusBadge key={s} domain={d} state={s} />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="fd-section">
        <H2 id="components" lede="The principles on the Overview tab are built into the AI and agents components. Use them before writing your own.">Components</H2>
        <div className="fd-agents-links">
          {AI_COMPONENTS.map((c) => (
            <Link key={c.slug} to={`/components/${c.slug}`} className="fd-agents-link"><b>{c.title}</b><span>{c.text}</span></Link>
          ))}
        </div>
        <p className="fd-note">See them together in the <Link className="fd-link" to="/patterns/agent-run-viewer">Agent run viewer</Link> pattern, and in the <Link className="fd-link" to="/patterns/filing-workspace">filing workspace</Link> template.</p>
      </section>
    </div>
  );
}
