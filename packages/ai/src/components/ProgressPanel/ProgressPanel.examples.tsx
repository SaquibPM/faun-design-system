import { useState } from "react";
import { Button } from "@faun-ds/react";
import { taskSteps, useDemoRun } from "../../utils/demo";
import { ProgressPanel } from "./ProgressPanel";

const frame = { inlineSize: "min(100%, 640px)" } as const;
const dock = { inlineSize: "min(100%, 360px)", blockSize: 480, border: "var(--faun-border-width-hairline) solid var(--faun-border-subtle)", borderRadius: "var(--faun-radius-lg)", overflow: "hidden" } as const;

export function Thumbnail() {
  return (
    <div style={{ inlineSize: 300 }}>
      <ProgressPanel title="Drafting ESRS E1" steps={taskSteps.slice(0, 3)} elapsedMs={350_000} defaultOpen={false} />
    </div>
  );
}

export function Overview() {
  const run = useDemoRun();
  return (
    <div style={{ ...frame, display: "grid", gap: "var(--faun-space-3)" }}>
      <ProgressPanel title="Drafting the ESRS E1 disclosure" steps={run.steps} elapsedMs={run.elapsedMs} actions={run.finished ? <Button size="sm" variant="outline" onClick={run.restart}>Run again</Button> : undefined} />
    </div>
  );
}

export function Folded() {
  return (
    <div style={frame}>
      <ProgressPanel title="Drafting the ESRS E1 disclosure" steps={taskSteps} elapsedMs={350_000} defaultOpen={false} />
    </div>
  );
}

export function Docked() {
  const run = useDemoRun();
  const [open, setOpen] = useState(true);
  return (
    <div style={{ ...dock, display: "grid" }}>
      {open ? <ProgressPanel variant="docked" autoFocus={false} title="Drafting the ESRS E1 disclosure" steps={run.steps} elapsedMs={run.elapsedMs} onClose={() => setOpen(false)} /> : (
        <div style={{ display: "grid", placeItems: "center", padding: "var(--faun-space-6)" }}><Button variant="outline" onClick={() => setOpen(true)}>Show progress panel</Button></div>
      )}
    </div>
  );
}

export function Failed() {
  return (
    <div style={frame}>
      <ProgressPanel
        title="Applying emission factors"
        elapsedMs={131_000}
        steps={[
          { id: "a", title: "Read the supplier list", state: "done", elapsedMs: 4000 },
          { id: "b", title: "Look up emission factors", state: "failed", detail: "No DEFRA 2025 factor for “Aluminium castings, secondary” in kg.", elapsedMs: 1000 },
          { id: "c", title: "Calculate Scope 3 category 1", state: "pending" },
        ]}
        actions={<Button size="sm" variant="outline">Retry</Button>}
      />
    </div>
  );
}

export function WaitingForYou() {
  return (
    <div style={frame}>
      <ProgressPanel
        title="Drafting the ESRS E1 disclosure"
        elapsedMs={392_000}
        steps={[
          { id: "a", title: "Collect activity data", state: "done", elapsedMs: 256_000 },
          { id: "b", title: "Draft the E1-6 narrative", state: "done", elapsedMs: 120_000 },
          { id: "c", title: "Ask for approval", state: "awaiting_human", detail: "Waiting for the sustainability lead" },
        ]}
      />
    </div>
  );
}

export function DoNameTheWork() {
  return (
    <div style={{ inlineSize: "min(100%, 420px)" }}>
      <ProgressPanel title="Drafting the ESRS E1 disclosure" steps={taskSteps.slice(0, 3)} defaultOpen={false} />
    </div>
  );
}

export function DontVagueSteps() {
  return (
    <div style={{ inlineSize: "min(100%, 420px)" }}>
      <ProgressPanel title="Working" steps={[{ id: "1", title: "Step 1", state: "done" }, { id: "2", title: "Step 2", state: "in_progress" }, { id: "3", title: "Step 3", state: "pending" }]} defaultOpen={false} />
    </div>
  );
}

