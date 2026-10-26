import { Banner, Button, Card, EmptyState } from "@faun-ds/react";
import { H2 } from "../foundations/shared";

export function EmptyErrorPattern() {
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="kinds" lede="Four situations, four jobs. Each says what happened, why, and the one thing to do next.">Four situations</H2>
        <div className="pt-grid">
          <Card padding="none"><EmptyState kind="first-use" size="sm" title="No facilities yet" description="Facilities group meters and activity data for Scope 1 and 2." action={<Button variant="solid" intent="accent">New facility</Button>} /></Card>
          <Card padding="none"><EmptyState kind="no-results" size="sm" title="No datapoints match" description="Try removing a filter or searching by datapoint ID." action={<Button variant="outline">Clear filters</Button>} /></Card>
          <Card padding="none"><EmptyState kind="error" size="sm" title="Couldn't load emissions" description="The calculation service didn't respond. Your data is safe." action={<Button variant="outline">Retry</Button>} /></Card>
          <Card padding="none"><EmptyState kind="no-permission" size="sm" title="You can't view this filing" description="Ask a workspace admin for Reviewer access." /></Card>
        </div>
      </section>
      <section className="fd-section">
        <H2 id="inline" lede="Failures inside a page use an inline banner that names the cause and offers the fix.">Inline failure</H2>
        <Banner tone="danger" variant="inline" title="3 datapoints failed validation" actions={<a href="#/patterns/empty-and-error">View errors</a>}>Scope 3 category 1 is missing supplier-specific factors for 3 suppliers.</Banner>
      </section>
      <section className="fd-section">
        <H2 id="rules">Rules</H2>
        <ul className="fd-rules">
          <li>Lead with what the user can do, not with what went wrong.</li>
          <li>Never blame the user; never use "oops". State what is safe: data saved, nothing lost.</li>
          <li>Use the small size inside cards and tables, the medium size for a whole page.</li>
        </ul>
      </section>
    </div>
  );
}
