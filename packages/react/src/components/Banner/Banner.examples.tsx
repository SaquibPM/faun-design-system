import { useState } from "react";
import { Button } from "../Button/Button";
import { Stack } from "../Layout/Layout";
import { Banner } from "./Banner";

export function Thumbnail() {
  return <Banner tone="attention" title="2 approvals waiting" style={{ inlineSize: 240 }} />;
}

export function Overview() {
  return (
    <Banner tone="attention" title="Approve the materiality matrix" actions={<Button size="sm" variant="solid" intent="accent">Review</Button>} style={{ inlineSize: "min(100%, 560px)" }}>
      Step 3 of 9 is paused until you decide. Drafting continues on other topics.
    </Banner>
  );
}

export function Tones() {
  return (
    <Stack gap="3" style={{ inlineSize: "min(100%, 560px)" }}>
      <Banner tone="info" title="Emission factors updated">DEFRA 2026 factors are available for Scope 1 fuels.</Banner>
      <Banner tone="success" title="Evidence package exported">2,316 items bundled for assurance.</Banner>
      <Banner tone="warning" title="73 figures are still estimated">Add supplier data to raise evidence coverage above 95%.</Banner>
      <Banner tone="danger" title="Ledger import failed">Row 418 has no unit. Fix the file and import again.</Banner>
      <Banner tone="attention" title="Waiting on you">Materiality and Scope 3 Cat. 1 need an approver.</Banner>
    </Stack>
  );
}

export function PageBanner() {
  return (
    <div style={{ inlineSize: "100%", border: "var(--faun-border-width-hairline) solid var(--faun-border-subtle)", borderRadius: "var(--faun-radius-md)", overflow: "hidden" }}>
      <Banner variant="page" tone="warning" title="Filing deadline in 6 days">The CSRD statement for FY2026 is due on 24 October. 2 approvals are still open.</Banner>
    </div>
  );
}

export function Dismissible() {
  const [open, setOpen] = useState(true);
  return open ? (
    <Banner tone="info" title="New: base year restatement" onDismiss={() => setOpen(false)} style={{ inlineSize: "min(100%, 560px)" }}>
      Restate FY2022 when a facility is acquired or divested.
    </Banner>
  ) : (
    <Button variant="outline" onClick={() => setOpen(true)}>Show banner again</Button>
  );
}

export function DoSpecific() {
  return <Banner tone="danger" title="Ledger import failed" style={{ inlineSize: 360 }}>Row 418 has no unit. Fix the file and import again.</Banner>;
}

export function DontVague() {
  return <Banner tone="danger" title="Error" style={{ inlineSize: 360 }}>Something went wrong.</Banner>;
}

export function Contrast() {
  return (
    <Stack gap="3" style={{ inlineSize: "min(100%, 560px)" }}>
      <Banner tone="warning" contrast="low" title="73 figures are still estimated">Add supplier data to raise evidence coverage.</Banner>
      <Banner tone="warning" contrast="high" title="73 figures are still estimated">Add supplier data to raise evidence coverage.</Banner>
      <Banner tone="danger" contrast="high" title="Ledger import failed">Row 418 has no unit. Fix the file and import again.</Banner>
      <Banner tone="success" contrast="high" title="Evidence package exported">2,316 items bundled for assurance.</Banner>
      <Banner tone="info" contrast="high" title="Emission factors updated">DEFRA 2026 factors are available.</Banner>
      <Banner tone="attention" contrast="high" title="Waiting on you">Materiality needs an approver.</Banner>
    </Stack>
  );
}

export function Actionable() {
  const [retries, setRetries] = useState(0);
  return (
    <Stack gap="3" style={{ inlineSize: "min(100%, 560px)" }}>
      <Banner tone="danger" title="Supplier sync failed" timestamp="Today, 09:41" actionLabel={retries ? "Retry again" : "Retry sync"} onAction={() => setRetries((n) => n + 1)} onDismiss={() => {}}>
        {retries ? `Retried ${retries} ${retries === 1 ? "time" : "times"}. 3 of 41 sources still fail.` : "3 of 41 sources did not respond."}
      </Banner>
      <Banner tone="info" contrast="high" title="A restated base year is ready" timestamp="Yesterday, 16:20" actionLabel="Review restatement">The FY2022 base year changed after the acquisition of two plants.</Banner>
    </Stack>
  );
}
