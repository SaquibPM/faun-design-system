import { IconAttach } from "@faun-ds/icons";
import { ActorChip, ApprovalCard, CitationMarker, ConfidenceBadge, ProvenanceTrail, PromptComposer, RunTrail, SourceList } from "@faun-ds/ai";
import type { ApprovalRequest } from "@faun-ds/ai";
import { Card, CardHeader, IconButton, StatusBadge, Tag } from "@faun-ds/react";
import { useState } from "react";
import { H2 } from "../foundations/shared";
import { NOW, actors, approval, citations, confidence, provenance, run } from "./sample";

const DECIDED_AT = new Date(NOW).toISOString();

export function AgentRunPattern() {
  const [request, setRequest] = useState<ApprovalRequest>(approval);
  const [active, setActive] = useState<number | undefined>();
  const [asked, setAsked] = useState<string | null>(null);
  const decide = (state: "approved" | "rejected", comment?: string) => setRequest({ ...request, state, comment, decidedBy: actors.priya, decidedAt: DECIDED_AT });
  const [c1, c2, c3] = citations;

  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="example" lede="One screen for a run in progress: what the agents have done, what they drafted and from what, how sure they are, and the one decision waiting for a person. Try Approve, open a citation, or send a message.">Example</H2>
        <div className="pt-run">
          <header className="pt-run-head">
            <div className="pt-run-title">
              <h3>CSRD ESRS E1 disclosure, FY2025</h3>
              <StatusBadge domain="run" state={request.state === "pending" ? "awaiting_approval" : "running"} />
            </div>
            <div className="pt-run-meta">
              <ActorChip actor={actors.orchestrator} showKind />
              <span>Started by</span>
              <ActorChip actor={actors.priya} />
              <Tag variant="framework">ESRS E1</Tag>
            </div>
          </header>

          <div className="pt-run-grid">
            <div className="pt-run-col">
              <RunTrail hideHeader run={run} now={NOW} headingLevel={3} defaultExpanded="active" />
              <ApprovalCard
                request={request}
                now={NOW}
                headingLevel={3}
                onApprove={() => decide("approved")}
                onReject={(_r, comment) => decide("rejected", comment)}
                onRequestChanges={(_r, comment) => setAsked(comment)}
              />
              {asked ? <p className="fd-note" role="status">Changes sent to the E1 Narrative Sub-agent: “{asked}”</p> : null}
            </div>

            <div className="pt-run-col">
              <Card>
                <CardHeader title="ESRS E1-6 draft" description="Scope 3 category 1, FY2025" actions={<ConfidenceBadge confidence={confidence} showScore />} />
                <div className="pt-body">
                  <p className="pt-attrib">
                    <span>Drafted by</span> <ActorChip actor={actors.narrative} size="sm" /> <span>Not yet accepted</span>
                  </p>
                  <div className="pt-draft">
                    <p>
                      Scope 3 category 1 emissions were 41,820 tCO₂e in FY2025, covering 148 of 163 suppliers by spend<CitationMarker citation={c1!} onOpen={(c) => setActive(c.index)} />.
                      Emissions were calculated with spend-based factors for material use<CitationMarker citation={c2!} onOpen={(c) => setActive(c.index)} />. Electricity at the Pune plant is reported separately under Scope 2<CitationMarker citation={c3!} onOpen={(c) => setActive(c.index)} />.
                    </p>
                  </div>
                  <SourceList citations={citations} activeIndex={active} aria-label="Sources for the E1-6 draft" />
                </div>
              </Card>
              <Card variant="muted">
                <CardHeader title="Where the figure comes from" description="ESRS E1-6, Scope 3 category 1" />
                <div className="pt-body">
                  <ProvenanceTrail nodes={provenance} now={NOW} aria-label="Lineage of the Scope 3 category 1 figure" />
                </div>
              </Card>
            </div>
          </div>

          <div className="pt-run-composer">
            <PromptComposer
              label="Message to the CSRD Filing Orchestrator"
              placeholder="Ask about this run, a factor or a supplier"
              hint="The agent can see this filing and its evidence. Shift+Enter adds a line."
              actions={<IconButton icon={<IconAttach />} label="Attach a file" />}
              onSend={(text) => setAsked(text)}
            />
          </div>
        </div>
      </section>

      <section className="fd-section">
        <H2 id="anatomy" lede="Seven components, each doing one job. The screen is the composition.">What each part does</H2>
        <ul className="fd-rules">
          <li><b>Run trail</b> shows the steps, who ran them and what failed. It is the only place machine progress is told in full.</li>
          <li><b>Approval card</b> holds the one decision waiting on a person, with the consequence of each choice.</li>
          <li><b>Actor chip</b> names who did something: lagoon for an agent, plum for a person.</li>
          <li><b>Confidence badge</b> and <b>citations</b> say how sure the draft is and what it rests on. The source list sits beside the text it supports.</li>
          <li><b>Provenance trail</b> answers "where does this number come from" from the source document to the reported value.</li>
          <li><b>Prompt composer</b> lets a person steer the run in words, at the foot of the screen.</li>
        </ul>
      </section>

      <section className="fd-section">
        <H2 id="rules">Rules</H2>
        <ul className="fd-rules">
          <li>Lead with the decision. If a person is needed, the approval card is visible without scrolling the trail.</li>
          <li>Generated text stays labelled as a draft, with the agent that wrote it, until a person accepts it.</li>
          <li>Every figure in a draft carries a citation. A claim without a source is not shown as fact.</li>
          <li>State confidence in words with the reason. Never use colour alone.</li>
          <li>Use plum for the person and lagoon for the machine. Do not use them for success or information.</li>
          <li>On narrow screens the two columns stack in reading order: trail, decision, draft, lineage, composer.</li>
        </ul>
      </section>
    </div>
  );
}
