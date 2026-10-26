import { IconCalendar, IconOrchestrator, IconTimer } from "@faun-ds/icons";
import { ApprovalCard } from "@faun-ds/ai";
import type { ApprovalRequest } from "@faun-ds/ai";
import { Banner, Button, Card, CardBody, CardHeader, PageHeader, ProgressBar, Stat, StatGroup, StatusBadge, Stepper, Tabs, TabsContent, TabsList, TabsTrigger } from "@faun-ds/react";
import { DataTable, type DataTableColumn } from "@faun-ds/data";
import { useState } from "react";
import { H2 } from "../foundations/shared";
import { AppScreen } from "./app-screen";
import { NOW, actors, approval } from "./sample";

type Task = { id: string; title: string; standard: string; owner: string; due: string; state: string };
const tasks: Task[] = [
  { id: "t1", title: "Confirm the reporting boundary", standard: "ESRS 1", owner: "Priya Raman", due: "14 Oct", state: "done" },
  { id: "t2", title: "Approve the materiality matrix", standard: "ESRS 2 IRO-1", owner: "Priya Raman", due: "17 Oct", state: "done" },
  { id: "t3", title: "Review the E1-6 Scope 3 draft", standard: "ESRS E1-6", owner: "Priya Raman", due: "24 Oct", state: "awaiting_human" },
  { id: "t4", title: "Collect missing water data for 8 sites", standard: "ESRS E3-4", owner: "Arjun Mehta", due: "28 Oct", state: "in_progress" },
  { id: "t5", title: "Attach evidence for the energy mix", standard: "ESRS E1-5", owner: "Arjun Mehta", due: "30 Oct", state: "blocked" },
  { id: "t6", title: "Request limited assurance fieldwork", standard: "Assurance", owner: "Unassigned", due: "6 Nov", state: "pending" },
];

const columns: DataTableColumn<Task>[] = [
  { id: "title", header: "Task", accessor: "title", rowHeader: true },
  { id: "standard", header: "Disclosure", cell: (r) => <code>{r.standard}</code>, accessor: "standard" },
  { id: "owner", header: "Owner", accessor: "owner" },
  { id: "due", header: "Due", accessor: "due" },
  { id: "state", header: "Status", cell: (r) => <StatusBadge domain="task" state={r.state} />, accessor: "state" },
];

const steps = [
  { label: "Scope" },
  { label: "Topics" },
  { label: "Data" },
  { label: "Draft" },
  { label: "Review" },
  { label: "File" },
];

export function FilingWorkspaceScreen() {
  const [request, setRequest] = useState<ApprovalRequest>(approval);
  const decide = (state: "approved" | "rejected", comment?: string) => setRequest({ ...request, state, comment, decidedBy: actors.priya, decidedAt: new Date(NOW).toISOString() });
  return (
    <AppScreen current="filings" crumbs={[{ label: "Filings", href: "#filings" }, { label: "CSRD FY2026" }]}>
      <PageHeader
        title="CSRD sustainability statement"
        status={<StatusBadge domain="run" state={request.state === "pending" ? "awaiting_approval" : "running"} />}
        meta={[{ icon: <IconOrchestrator />, label: "CSRD Filing Orchestrator" }, { icon: <IconCalendar />, label: "FY2026 · ESRS Set 1" }, { icon: <IconTimer />, label: "Due 30 Nov 2026" }]}
        actions={<><Button variant="outline">Run history</Button><Button variant="solid" intent="accent">Review draft</Button></>}
      />
      <Tabs defaultValue="overview" className="pt-tabs">
          <TabsList aria-label="Filing sections">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="pt-section">
              <Stepper steps={steps} current={2} aria-label="Filing progress" />
              <StatGroup aria-label="Filing summary" minItemWidth="11rem">
                <Stat size="sm" label="Complete" value="62" unit="%" delta={{ value: "9 pts", direction: "up", sentiment: "good", label: "this week" }} />
                <Stat size="sm" label="Datapoints evidenced" value="812" unit="of 1,034" />
                <Stat size="sm" label="Open tasks" value="4" footnote="1 blocked" />
                <Stat size="sm" label="Waiting on you" value="1" unit="approval" footnote="Due 24 Oct" />
              </StatGroup>
              <Banner tone="warning" variant="inline" title="Energy mix evidence is blocked">Two utility bills for the Chennai plant could not be read. Upload clearer copies to continue ESRS E1-5.</Banner>
              <Card>
                <CardHeader title="Coverage by standard" description="Datapoints with a value and evidence" />
                <CardBody className="pt-meters">
                  <ProgressBar label="E1 Climate change" size="sm" value={0.88} max={1} showValue />
                  <ProgressBar label="S1 Own workforce" size="sm" value={0.74} max={1} showValue />
                  <ProgressBar label="E3 Water and marine resources" size="sm" value={0.41} max={1} showValue />
                </CardBody>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="pt-section"><DataTable label="Filing tasks" columns={columns} data={tasks} getRowId={(r) => r.id} getRowLabel={(r) => r.title} /></div>
          </TabsContent>

          <TabsContent value="approvals">
            <div className="pt-section"><ApprovalCard request={request} now={NOW} headingLevel={2} onApprove={() => decide("approved")} onReject={(_r, c) => decide("rejected", c)} /></div>
          </TabsContent>
      </Tabs>
    </AppScreen>
  );
}

export function FilingWorkspacePattern() {
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="example" lede="Where one filing is run. The stepper shows where the filing is, the tabs separate overview, tasks and approvals, and anything waiting on a person is stated at the top of the page. Switch tabs to see each.">Example</H2>
        <FilingWorkspaceScreen />
      </section>
      <section className="fd-section">
        <H2 id="rules">Rules</H2>
        <ul className="fd-rules">
          <li>The header carries the filing's state, owner agent, period and due date. The page title is the filing, not the framework.</li>
          <li>The stepper shows the filing's stages in order. Mark a stage as waiting for a person only when one is.</li>
          <li>Anything blocked or waiting on a person appears as a banner above the detail, not only as a badge in a table.</li>
          <li>Tasks name the disclosure they belong to, an owner and a due date. An unassigned task says so.</li>
          <li>Approvals use the approval card with the consequence of each choice. One primary action per view.</li>
          <li>Keep the tab set to Overview, Tasks and Approvals. Put evidence, history and settings behind the page's secondary actions.</li>
        </ul>
      </section>
    </div>
  );
}
