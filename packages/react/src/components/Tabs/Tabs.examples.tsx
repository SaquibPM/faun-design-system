import { IconFileText, IconHistory, IconAdd, IconSettings, IconStatusAttention, IconUsers } from "@faun-ds/icons";
import { IconButton } from "../IconButton/IconButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

const Panel = ({ children }: { children: string }) => <p style={{ margin: 0, color: "var(--faun-fg-muted)" }}>{children}</p>;

export function Thumbnail() {
  return (
    <div style={{ inlineSize: 240 }}>
      <Tabs defaultValue="a">
        <TabsList aria-label="Preview">
          <TabsTrigger value="a" tabIndex={-1}>Overview</TabsTrigger>
          <TabsTrigger value="b" tabIndex={-1} count={12}>Issues</TabsTrigger>
          <TabsTrigger value="c" tabIndex={-1}>Runs</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

export function Overview() {
  return (
    <Tabs defaultValue="datapoints" style={{ inlineSize: "100%" }}>
      <TabsList aria-label="Report sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="datapoints" count={1034}>Datapoints</TabsTrigger>
        <TabsTrigger value="gaps" count={12}>Gaps</TabsTrigger>
        <TabsTrigger value="evidence">Evidence</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      <TabsContent value="overview"><Panel>ESRS E1 Climate change · FY2026 · 82% complete</Panel></TabsContent>
      <TabsContent value="datapoints"><Panel>1,034 datapoints across 9 disclosure requirements.</Panel></TabsContent>
      <TabsContent value="gaps"><Panel>12 datapoints are missing evidence or a calculation.</Panel></TabsContent>
      <TabsContent value="evidence"><Panel>418 documents linked.</Panel></TabsContent>
      <TabsContent value="history"><Panel>Last changed 2 hours ago by the Scope 3 agent.</Panel></TabsContent>
    </Tabs>
  );
}

export function WithIcons() {
  return (
    <Tabs defaultValue="details" style={{ inlineSize: "100%" }}>
      <TabsList aria-label="Agent settings">
        <TabsTrigger value="details" icon={<IconFileText />}>Details</TabsTrigger>
        <TabsTrigger value="access" icon={<IconUsers />} count={8}>Access</TabsTrigger>
        <TabsTrigger value="review" icon={<IconStatusAttention />} count={3}>Needs review</TabsTrigger>
        <TabsTrigger value="history" icon={<IconHistory />}>History</TabsTrigger>
        <TabsTrigger value="settings" icon={<IconSettings />}>Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="details"><Panel>Owner, purpose and the frameworks this agent reports to.</Panel></TabsContent>
      <TabsContent value="access"><Panel>8 people can view or edit.</Panel></TabsContent>
      <TabsContent value="review"><Panel>3 outputs are waiting for a human decision.</Panel></TabsContent>
      <TabsContent value="history"><Panel>Every change, with who made it.</Panel></TabsContent>
      <TabsContent value="settings"><Panel>Schedules, limits and notifications.</Panel></TabsContent>
    </Tabs>
  );
}

export function Contained() {
  return (
    <Tabs variant="contained" defaultValue="scope1" style={{ inlineSize: "100%" }}>
      <TabsList aria-label="Emission scopes">
        <TabsTrigger value="scope1">Scope 1</TabsTrigger>
        <TabsTrigger value="scope2">Scope 2</TabsTrigger>
        <TabsTrigger value="scope3" count={15}>Scope 3</TabsTrigger>
      </TabsList>
      <TabsContent value="scope1"><Panel>3,212.6 tCO₂e · stationary and mobile combustion, fugitive.</Panel></TabsContent>
      <TabsContent value="scope2"><Panel>1,840.2 tCO₂e location-based · 1,102.9 tCO₂e market-based.</Panel></TabsContent>
      <TabsContent value="scope3"><Panel>15 categories, 11 calculated.</Panel></TabsContent>
    </Tabs>
  );
}

export function Segmented() {
  return (
    <div style={{ display: "grid", gap: "var(--faun-space-4)" }}>
      <Tabs variant="segmented" defaultValue="table">
        <TabsList aria-label="View">
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
        </TabsList>
        <TabsContent value="table"><Panel>Table view of facility emissions.</Panel></TabsContent>
        <TabsContent value="chart"><Panel>Chart view of facility emissions.</Panel></TabsContent>
        <TabsContent value="map"><Panel>Map view of facility emissions.</Panel></TabsContent>
      </Tabs>
      <Tabs variant="segmented" size="sm" defaultValue="month">
        <TabsList aria-label="Period">
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="quarter">Quarter</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

const STANDARDS = ["E1 Climate", "E2 Pollution", "E3 Water", "E4 Biodiversity", "E5 Resources", "S1 Own workforce", "S2 Value chain workers", "S3 Communities", "S4 Consumers", "G1 Business conduct"];

export function Overflow() {
  return (
    <div style={{ inlineSize: "100%", maxInlineSize: 560 }}>
      <Tabs defaultValue={STANDARDS[0]}>
        <TabsList aria-label="ESRS topical standards" end={<IconButton label="Add standard" icon={<IconAdd />} variant="ghost" size="sm" />}>
          {STANDARDS.map((s) => <TabsTrigger key={s} value={s}>{s}</TabsTrigger>)}
        </TabsList>
        {STANDARDS.map((s) => <TabsContent key={s} value={s}><Panel>{`${s} — disclosure requirements and datapoints.`}</Panel></TabsContent>)}
      </Tabs>
    </div>
  );
}

export function Vertical() {
  return (
    <Tabs orientation="vertical" defaultValue="general" style={{ inlineSize: "100%" }}>
      <TabsList aria-label="Workspace settings">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="members" count={24}>Members</TabsTrigger>
        <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
      </TabsList>
      <TabsContent value="general"><Panel>Workspace name, reporting year and base year.</Panel></TabsContent>
      <TabsContent value="members"><Panel>24 members across 4 entities.</Panel></TabsContent>
      <TabsContent value="frameworks"><Panel>CSRD, ISSB, CDP.</Panel></TabsContent>
      <TabsContent value="integrations"><Panel>Workday, SAP, Snowflake.</Panel></TabsContent>
    </Tabs>
  );
}

export function DoShort() {
  return (
    <Tabs defaultValue="a" style={{ inlineSize: "100%" }}>
      <TabsList aria-label="Example">
        <TabsTrigger value="a">Overview</TabsTrigger>
        <TabsTrigger value="b" count={12}>Gaps</TabsTrigger>
        <TabsTrigger value="c">Evidence</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export function DontSteps() {
  return (
    <Tabs defaultValue="a" style={{ inlineSize: "100%" }}>
      <TabsList aria-label="Example">
        <TabsTrigger value="a">1. Upload</TabsTrigger>
        <TabsTrigger value="b">2. Map columns</TabsTrigger>
        <TabsTrigger value="c">3. Review</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
