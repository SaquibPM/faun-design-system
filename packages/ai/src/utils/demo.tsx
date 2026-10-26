/** Sample data and a simulated run for examples and tests. Not exported from the package. */
import { useEffect, useState, type CSSProperties } from "react";
import type { ProgressStep } from "../components/ProgressPanel/ProgressPanel.js";

export const taskSteps: ProgressStep[] = [
  { id: "collect", title: "Collect activity data", state: "done", detail: "12,480 ledger rows from 6 entities", elapsedMs: 256_000 },
  { id: "factors", title: "Apply emission factors", state: "in_progress", detail: "212 of 340 suppliers matched", elapsedMs: 94_000 },
  { id: "draft", title: "Draft the E1-6 narrative", state: "pending" },
  { id: "check", title: "Check against ESRS E1 datapoints", state: "pending" },
  { id: "approve", title: "Ask for approval", state: "pending" },
];

export const draftCode = `## E1-6 Gross Scope 1, 2 and 3 GHG emissions

| Scope | FY2025 (tCO2e) | Change |
| --- | ---: | ---: |
| Scope 1 | 3,212 | -4.1% |
| Scope 2, market-based | 2,090 | -11.6% |
| Scope 3 | 42,910 | +8.2% |
| Total | 48,212 | +6.3% |

Scope 3 category 1 covers 148 of 163 suppliers by spend.
The remaining 15 suppliers are estimated from spend-based factors.`;

const cell: CSSProperties = { padding: "var(--faun-space-2) var(--faun-space-3)", borderBlockEnd: "var(--faun-border-width-hairline) solid var(--faun-border-subtle)", textAlign: "end", fontFeatureSettings: "var(--faun-font-feature-numeric)" };
const head: CSSProperties = { ...cell, color: "var(--faun-fg-muted)", fontWeight: "var(--faun-font-weight-medium)" as unknown as number };
const left: CSSProperties = { textAlign: "start" };

/** A rendered disclosure draft, as it would appear on the Preview tab. */
export function DraftPreview() {
  const rows: [string, string, string][] = [["Scope 1", "3,212", "-4.1%"], ["Scope 2, market-based", "2,090", "-11.6%"], ["Scope 3", "42,910", "+8.2%"], ["Total", "48,212", "+6.3%"]];
  return (
    <div style={{ display: "grid", gap: "var(--faun-space-3)" }}>
      <h3 style={{ margin: 0, fontFamily: "var(--faun-type-heading-sm-font-family)", fontSize: "var(--faun-type-heading-sm-font-size)" }}>E1-6 Gross Scope 1, 2 and 3 GHG emissions</h3>
      <table style={{ borderCollapse: "collapse", inlineSize: "100%" }}>
        <caption style={{ captionSide: "top", textAlign: "start", color: "var(--faun-fg-muted)", paddingBlockEnd: "var(--faun-space-1)" }}>FY2025, tCO₂e</caption>
        <thead><tr><th scope="col" style={{ ...head, ...left }}>Scope</th><th scope="col" style={head}>Emissions</th><th scope="col" style={head}>Change</th></tr></thead>
        <tbody>{rows.map(([a, b, c]) => <tr key={a}><th scope="row" style={{ ...cell, ...left, fontWeight: "var(--faun-font-weight-regular)" as unknown as number }}>{a}</th><td style={cell}>{b}</td><td style={cell}>{c}</td></tr>)}</tbody>
      </table>
      <p style={{ margin: 0 }}>Scope 3 category 1 covers 148 of 163 suppliers by spend. The remaining 15 suppliers are estimated from spend-based factors.</p>
    </div>
  );
}

/**
 * A simulated task: one tick a second moves it from "applying factors" through drafting and checking to waiting for approval.
 * `playing` false freezes it at the start.
 */
export function useDemoRun(playing = true) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!playing || t >= 18) return;
    const id = window.setTimeout(() => setT((x) => x + 1), 1000);
    return () => window.clearTimeout(id);
  }, [playing, t]);
  const at = (n: number) => t >= n;
  const steps: ProgressStep[] = [
    taskSteps[0]!,
    at(6) ? { ...taskSteps[1]!, state: "done", detail: "340 of 340 suppliers matched", elapsedMs: 100_000 } : { ...taskSteps[1]!, detail: `${Math.min(340, 212 + t * 21)} of 340 suppliers matched`, elapsedMs: 94_000 + t * 1000 },
    at(12) ? { ...taskSteps[2]!, state: "done", detail: "Draft v1 ready", elapsedMs: 6000 } : at(6) ? { ...taskSteps[2]!, state: "in_progress", detail: "Writing from 340 evidenced figures", elapsedMs: (t - 6) * 1000 } : taskSteps[2]!,
    at(16) ? { ...taskSteps[3]!, state: "done", detail: "41 of 41 datapoints covered", elapsedMs: 4000 } : at(12) ? { ...taskSteps[3]!, state: "in_progress", elapsedMs: (t - 12) * 1000 } : taskSteps[3]!,
    at(18) ? { ...taskSteps[4]!, state: "awaiting_human", detail: "Waiting for the sustainability lead" } : taskSteps[4]!,
  ];
  return { steps, elapsedMs: 350_000 + t * 1000, restart: () => setT(0), finished: t >= 18 };
}
