import { Banner, Button, Card, CardHeader, Toaster, toast } from "@faun-ds/react";
import { H2 } from "../foundations/shared";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const CHANNELS: [string, string, string][] = [
  ["Toast", "The result of something the person just did, which needs no further decision.", "Materiality approved"],
  ["Inline banner", "A condition on this page that stays true until someone fixes it.", "3 datapoints have no source"],
  ["Notification centre", "Something that happened while the person was away, or that waits on them.", "Approval requested by the Materiality agent"],
  ["Dialog", "A decision that must be made before anything else can happen.", "Submit filing?"],
];

export function NotificationsPattern() {
  return (
    <>
    <div className="fd">
      <section className="fd-section">
        <H2 id="example" lede="Pick the quietest channel that still gets the message to the right person. Trigger each toast below; they stack at the bottom right of the window.">Example</H2>
        <Card>
          <CardHeader title="Toasts" description="Short, past tense, one optional action." />
          <div className="pt-body">
            <div className="pt-buttons">
              <Button onClick={() => toast.success({ title: "Materiality approved", description: "12 topics are now in scope for FY2026.", action: { label: "Undo", onClick: () => toast("Approval withdrawn") } })}>Success with undo</Button>
              <Button onClick={() => toast.warning({ title: "3 rows skipped", description: "Missing period. They stay in the import queue." })}>Warning</Button>
              <Button onClick={() => toast.error({ title: "Export failed", description: "The XBRL validator rejected 2 tags. Open the report to fix them.", action: { label: "Open report", onClick: () => {} } })}>Error</Button>
              <Button onClick={() => { void toast.promise(sleep(1800).then(() => 15), { loading: "Calculating Scope 3…", success: (n) => `${n} categories calculated`, error: "Calculation failed" }); }}>In progress, then done</Button>
            </div>
          </div>
        </Card>
        <Banner tone="warning" variant="inline" title="Scope 2 market-based is partial" actions={<a href="#/patterns/notifications-and-toasts">Add certificates</a>}>
          5 of 14 sites have no supplier certificate. The figure stays marked partial until they are added.
        </Banner>
        <div className="docs-table-wrap">
          <table className="docs-table">
            <thead><tr><th>Channel</th><th>Use it for</th><th>Example</th></tr></thead>
            <tbody>{CHANNELS.map(([c, u, e]) => <tr key={c}><td><b>{c}</b></td><td>{u}</td><td>{e}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className="fd-section">
        <H2 id="rules">Rules</H2>
        <ul className="fd-rules">
          <li>A toast never carries the only copy of something important. Errors that block work also appear in the page.</li>
          <li>Titles are short outcomes in past tense. The description says what to do next, never repeats the title.</li>
          <li>At most one action, and it must be safe to miss: toasts dismiss themselves. Undo is the common one.</li>
          <li>Errors stay longer than successes. A loading toast updates in place rather than stacking a second one.</li>
          <li>Tone, icon and words carry meaning together. Never rely on colour alone.</li>
          <li>Anything waiting on a person belongs in the notification centre with plum attention styling, not in a toast.</li>
          <li>Do not toast on page load or for events the person did not cause.</li>
        </ul>
      </section>
    </div>
    <Toaster />
    </>
  );
}
