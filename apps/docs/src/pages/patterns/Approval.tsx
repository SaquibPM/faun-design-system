import { Banner, Button, Card, CardHeader, StatusBadge, Timeline } from "@faun-ds/react";
import { IconStatusAttention } from "@faun-ds/icons";
import { H2 } from "../foundations/shared";

export function ApprovalPattern() {
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="example" lede="When an agent reaches a decision that belongs to a person, work pauses, the page says so in plain words, and the person sees what the agent wants, why, and what happens next before they choose.">Example</H2>
        <Banner tone="warning" variant="inline" title="CSRD filing is paused for your review" icon={<IconStatusAttention />} actions={<a href="#/patterns/approval-flow">Review</a>}>
          The Materiality agent proposes dropping 3 of 11 topics from the double materiality assessment.
        </Banner>
        <div className="pt-stack">
          <Card>
            <CardHeader title="Approve materiality outcome" description="Requested by Materiality agent · 4 min ago" actions={<StatusBadge domain="approval" state="pending" />} />
            <div className="pt-body">
              <p>Three topics fall below the 2.5 impact threshold after the stakeholder survey: <b>Water and marine resources</b>, <b>Biodiversity</b> and <b>Affected communities</b>. Dropping them removes 38 datapoints from the E3, E4 and S3 standards.</p>
              <dl className="pt-facts"><div><dt>If approved</dt><dd>Drafting E1 and S1 continues. 38 datapoints are marked not material.</dd></div><div><dt>If rejected</dt><dd>The agent keeps all 11 topics and requests more survey data.</dd></div></dl>
            </div>
            <div className="pt-actions"><Button variant="ghost">Request changes</Button><Button variant="outline" intent="danger">Reject</Button><Button variant="solid" intent="accent">Approve</Button></div>
          </Card>
          <Card variant="muted">
            <CardHeader title="Audit trail" />
            <Timeline density="dense" items={[
              { id: "1", actor: { name: "Materiality agent", kind: "agent" }, action: "proposed dropping 3 topics", time: "2026-10-21T09:10:00+05:30", timeLabel: "4 min ago", status: { domain: "approval", state: "pending" } },
              { id: "2", actor: { name: "Survey agent", kind: "agent" }, action: "closed the stakeholder survey (212 responses)", time: "2026-10-21T08:40:00+05:30", timeLabel: "34 min ago" },
            ]} />
          </Card>
        </div>
      </section>
      <section className="fd-section">
        <H2 id="rules">Rules</H2>
        <ul className="fd-rules">
          <li>Say what the agent wants and why in one or two sentences, then the consequence of each choice.</li>
          <li>One primary action. Reject is outlined and oxblood; it never sits where Approve would.</li>
          <li>The paused state appears in the page, not only in a notification. Use plum for the human, never lagoon.</li>
          <li>Record who decided, when and with what comment in the audit trail.</li>
        </ul>
      </section>
    </div>
  );
}
