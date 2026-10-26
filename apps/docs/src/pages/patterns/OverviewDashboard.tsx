import { IconDownload } from "@faun-ds/icons";
import { Banner, Button, Card, CardBody, CardHeader, PageHeader, SegmentedControl, Stat, StatGroup, StatusBadge } from "@faun-ds/react";
import { BarChart, LineChart, StackedBarChart } from "@faun-ds/data";
import { useState } from "react";
import { H2 } from "../foundations/shared";
import { AppScreen } from "./app-screen";
import { monthlySeries, months, siteSeries, sites, scopeSeries, years } from "./sample";

export function OverviewDashboardScreen() {
  const [basis, setBasis] = useState("location");
  return (
    <AppScreen tall current="home" crumbs={[{ label: "Home" }]}>
      <PageHeader
        title="Emissions overview"
        description="Acme Industrial, FY2026. Figures are tCO₂e unless stated."
        actions={<><Button variant="outline" leadingIcon={<IconDownload />}>Download</Button><Button variant="solid" intent="accent">Open CSRD filing</Button></>}
      />
      <StatGroup aria-label="Headline figures" minItemWidth="11rem">
        <Stat label="Gross Scope 1+2" value="27,550" unit="tCO₂e" delta={{ value: "4.2%", direction: "down", sentiment: "good", label: "vs base year 2022" }} />
        <Stat label="Scope 3" value="142,880" unit="tCO₂e" delta={{ value: "0.6%", direction: "down", sentiment: "good", label: "vs 2025" }} />
        <Stat label="Datapoints evidenced" value="86" unit="%" delta={{ value: "6 pts", direction: "up", sentiment: "good", label: "vs last month" }} />
        <Stat label="Waiting on you" value="2" unit="approvals" footnote="Oldest waiting 2 days" />
      </StatGroup>
      <div className="pt-gap">
        <Banner tone="info" variant="inline" title="Market-based Scope 2 is partial">Supplier certificates are confirmed for 9 of 14 sites. Totals update as the rest arrive.</Banner>
      </div>
      <div className="pt-dash">
        <Card className="pt-dash-wide">
          <CardHeader title="Gross emissions by scope" description="Scope 3 is about 83% of the inventory in every year" actions={<StatusBadge domain="data-quality" state="evidenced" />} />
          <CardBody><StackedBarChart title="Gross emissions by scope, 2022 to 2026" hideTitle unit="tCO₂e" categories={years} series={scopeSeries} showTotals height={260} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Scope 1 by site" description="Pune and Chennai are three quarters of direct emissions" />
          <CardBody><BarChart title="Scope 1 emissions by site, FY2026" hideTitle unit="tCO₂e" categories={sites} series={siteSeries} showValues height={240} /></CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Scope 2 by month"
            description="2025, location-based"
            actions={<SegmentedControl aria-label="Scope 2 basis" size="sm" value={basis} onValueChange={setBasis} options={[{ value: "location", label: "Location" }, { value: "market", label: "Market" }]} />}
          />
          <CardBody>
            <LineChart
              title="Scope 2 emissions by month, 2025" hideTitle unit="tCO₂e" categories={months} height={240}
              series={basis === "location" ? monthlySeries : [{ id: "mkt", label: "Market-based", values: [820, 790, 770, 730, 700, 760, 790, 780, 740, null, null, null] }]}
            />
          </CardBody>
        </Card>
      </div>
    </AppScreen>
  );
}

export function OverviewDashboardPattern() {
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="example" lede="The landing view for a sustainability lead: four headline figures, anything that changes how to read them, and three charts that answer the usual first questions. Switch the Scope 2 basis to see the gap in the market-based series.">Example</H2>
        <OverviewDashboardScreen />
      </section>
      <section className="fd-section">
        <H2 id="rules">Rules</H2>
        <ul className="fd-rules">
          <li>Four stats at most. Set sentiment from the meaning: emissions down is good, whatever the arrow direction.</li>
          <li>Every chart has a title and a one-line takeaway in the card header. Charts do not decorate.</li>
          <li>GHG scopes always use the Scope 1, 2 and 3 colours. Other series take the categorical colours in order.</li>
          <li>A value not yet reported is a gap in the line, never a zero. Say why in a banner above the charts.</li>
          <li>Pair a chart with its data-quality state when the basis is partial or estimated.</li>
          <li>One wide chart, then two narrower ones. On small screens the cards stack in the same order.</li>
          <li>Use a table, not a chart, when people need to read exact values or act on rows.</li>
        </ul>
      </section>
    </div>
  );
}
