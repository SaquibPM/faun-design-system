import { NOW, run } from "../../utils/fixtures";
import { RunTrail } from "./RunTrail";

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "min(100%, 280px)" }}>
      <RunTrail run={{ ...run, steps: run.steps.slice(0, 3).map((s) => ({ ...s, children: undefined, toolCalls: undefined, summary: undefined })) }} now={NOW} defaultExpanded="none" hideHeader />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "min(100%, 720px)" }}>
      <RunTrail run={run} now={NOW} />
    </div>
  );
}

export function AllOpen() {
  return (
    <div style={{ inlineSize: "min(100%, 720px)" }}>
      <RunTrail run={run} now={NOW} defaultExpanded="all" />
    </div>
  );
}

export function StepsOnly() {
  return (
    <div style={{ inlineSize: "min(100%, 520px)" }}>
      <RunTrail run={run} now={NOW} hideHeader defaultExpanded="none" />
    </div>
  );
}

export function Failed() {
  return (
    <div style={{ inlineSize: "min(100%, 640px)" }}>
      <RunTrail
        now={NOW}
        run={{
          ...run, id: "run-8842", title: "Scope 2 recalculation, India", state: "failed", endedAt: "2026-10-21T09:07:30Z",
          steps: [{ id: "f1", title: "Read utility bills", state: "failed", summary: "The utility portal rejected the session.", startedAt: "2026-10-21T09:00:04Z", endedAt: "2026-10-21T09:07:30Z",
            toolCalls: [{ id: "ft1", tool: "utility.fetch_bills", title: "Fetch bills", state: "failed", input: { plant: "IN04", year: 2025 }, error: "401: the portal session expired. Reconnect the utility account and run again." }] }],
        }}
      />
    </div>
  );
}

export function DoOneLineSummary() {
  return (
    <div style={{ inlineSize: "min(100%, 420px)" }}>
      <RunTrail hideHeader now={NOW} defaultExpanded="none" run={{ ...run, steps: [{ id: "a", title: "Match suppliers", state: "done", summary: "148 of 163 suppliers matched by VAT number.", actor: run.steps[0]!.actor }] }} />
    </div>
  );
}

export function DontLogDump() {
  return (
    <div style={{ inlineSize: "min(100%, 420px)" }}>
      <RunTrail hideHeader now={NOW} defaultExpanded="none" run={{ ...run, steps: [{ id: "a", title: "step_17 exec ok", state: "done", summary: "INFO 09:04:16 matcher.run rc=0 n=148 skipped=15 elapsed=252.1s" }] }} />
    </div>
  );
}
