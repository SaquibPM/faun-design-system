import { Card, CardHeader, Stat, StatGroup, StatusBadge } from "@faun-ds/react";
import { H2 } from "../foundations/shared";

export function OverviewPattern() {
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="example" lede="A reporting overview leads with the few numbers a sustainability lead needs, shows how they changed and how well they're evidenced, and links to the work behind them.">Example</H2>
        <StatGroup>
          <Stat size="md" label="Gross Scope 1+2" value="8,412" unit="tCO₂e" delta={{ value: "4.2%", direction: "down", sentiment: "good", label: "vs base year 2022" }} />
          <Stat size="md" label="Scope 3" value="41,906" unit="tCO₂e" delta={{ value: "1.1%", direction: "up", sentiment: "bad", label: "vs 2025" }} />
          <Stat size="md" label="Datapoints evidenced" value="86" unit="%" delta={{ value: "6 pts", direction: "up", sentiment: "good", label: "vs last month" }} />
          <Stat size="md" label="Open approvals" value="3" footnote="Oldest waiting 2 days" />
        </StatGroup>
        <div className="pt-grid">
          <Card><CardHeader title="Scope 2 electricity" description="Market-based, 14 facilities" actions={<StatusBadge domain="data-quality" state="evidenced" />} /></Card>
          <Card><CardHeader title="Scope 3 category 1" description="Purchased goods and services" actions={<StatusBadge domain="data-quality" state="estimated" />} /></Card>
        </div>
      </section>
      <section className="fd-section">
        <H2 id="rules">Rules</H2>
        <ul className="fd-rules">
          <li>Four KPIs at most per row. Good and bad are set by sentiment, not by direction: emissions down is good.</li>
          <li>Pair every figure with its basis (base year, prior period) and its data-quality state.</li>
          <li>Format numbers before passing them in: locale, decimals and unit.</li>
        </ul>
      </section>
    </div>
  );
}
