import { IconAdd } from "@faun-ds/icons";
import { Button } from "../Button/Button";
import { Card } from "../Card/Card";
import { EmptyState } from "./EmptyState";

export function Thumbnail() {
  return <EmptyState size="sm" kind="no-results" title="No matches" />;
}

export function Overview() {
  return (
    <EmptyState
      title="No filings yet"
      description="Start a CSRD, CDP or GRI filing and the assistant will plan the work and ask for approval at each gate."
      action={<Button variant="solid" intent="accent" leadingIcon={<IconAdd />}>New filing</Button>}
      secondaryAction={<Button variant="ghost">Browse templates</Button>}
    />
  );
}

export function Kinds() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--faun-space-4)", inlineSize: "100%" }}>
      <Card><EmptyState size="sm" kind="first-use" title="No evidence yet" description="Upload utility bills or connect a source." action={<Button size="sm" variant="outline">Add source</Button>} /></Card>
      <Card><EmptyState size="sm" kind="no-results" title="No datapoints match" description="Try a different standard or clear filters." action={<Button size="sm" variant="ghost">Clear filters</Button>} /></Card>
      <Card><EmptyState size="sm" kind="error" title="Couldn't load datapoints" description="The ledger service didn't respond." action={<Button size="sm" variant="outline">Try again</Button>} /></Card>
      <Card><EmptyState size="sm" kind="no-permission" title="You can't view approvals" description="Ask a workspace admin for the Approver role." action={<Button size="sm" variant="ghost">Request access</Button>} /></Card>
    </div>
  );
}

export function Sizes() {
  return (
    <div style={{ display: "flex", gap: "var(--faun-space-6)", flexWrap: "wrap", alignItems: "flex-start" }}>
      <EmptyState size="sm" kind="no-results" title="No results" />
      <EmptyState size="md" kind="no-results" title="No results" description="Nothing matches your search." />
    </div>
  );
}

export function DoNextStep() {
  return <EmptyState size="sm" title="No Sub-agents yet" description="Sub-agents handle one ESRS topic each." action={<Button size="sm" variant="solid" intent="accent">Create Sub-agent</Button>} />;
}

export function DontDeadEnd() {
  return <EmptyState size="sm" title="Nothing here" />;
}
