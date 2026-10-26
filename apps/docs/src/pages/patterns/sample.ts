/** Sample enterprise ESG data for the pattern pages. Local to the docs: @faun-ds/ai fixtures are not exported. */
import type { Actor, ApprovalRequest, Citation, Confidence, ProvenanceNode, Run } from "@faun-ds/ai";

export const NOW = Date.parse("2026-10-21T09:18:00Z");

export const actors = {
  orchestrator: { id: "agent-csrd", name: "CSRD Filing Orchestrator", kind: "agent", role: "Agent" },
  collector: { id: "sub-collect", name: "Data Collection Sub-agent", kind: "sub-agent", role: "Sub-agent · Activity data" },
  scope3: { id: "sub-s3", name: "Scope 3 Sub-agent", kind: "sub-agent", role: "Sub-agent · Value chain" },
  narrative: { id: "sub-narr", name: "E1 Narrative Sub-agent", kind: "sub-agent", role: "Sub-agent · Disclosure drafting" },
  calc: { id: "tool-calc", name: "emissions.calculate_scope3", kind: "tool", role: "Tool" },
  priya: { id: "u-priya", name: "Priya Raman", kind: "human", role: "Sustainability lead" },
} satisfies Record<string, Actor>;

export const run: Run = {
  id: "run-8841",
  title: "CSRD ESRS E1 disclosure, FY2025",
  state: "awaiting_approval",
  agent: actors.orchestrator,
  startedBy: actors.priya,
  startedAt: "2026-10-21T09:00:00Z",
  steps: [
    {
      id: "s1", title: "Collect activity data", state: "done", actor: actors.collector, summary: "12,480 ledger rows read from 6 entities.",
      startedAt: "2026-10-21T09:00:04Z", endedAt: "2026-10-21T09:04:16Z",
      toolCalls: [{ id: "t1", tool: "ledger.read_rows", title: "Read general ledger", state: "done", startedAt: "2026-10-21T09:00:05Z", endedAt: "2026-10-21T09:02:40Z", input: { period: "FY2025", entities: ["DE01", "IN04", "NL02"] }, output: { rows: 12480, skipped: 0 } }],
    },
    {
      id: "s2", title: "Calculate Scope 3 category 1", state: "in_progress", actor: actors.scope3, summary: "Matching purchased goods to emission factors.",
      startedAt: "2026-10-21T09:04:20Z", progress: { done: 212, total: 340, unit: "suppliers" },
      toolCalls: [
        { id: "t2", tool: "emissions.calculate_scope3", title: "Calculate by supplier", state: "in_progress", startedAt: "2026-10-21T09:04:22Z", input: { category: 1, method: "spend-based", currency: "EUR" } },
        { id: "t3", tool: "factors.lookup", title: "Look up emission factor", state: "failed", startedAt: "2026-10-21T09:11:02Z", endedAt: "2026-10-21T09:11:03Z", error: "No DEFRA 2025 factor for “Aluminium castings, secondary” in kg. Falling back to the spend-based factor." },
      ],
    },
    { id: "s3", title: "Draft ESRS E1-6 narrative", state: "awaiting_human", actor: actors.narrative, summary: "Draft ready. Waiting for approval from the sustainability lead.", startedAt: "2026-10-21T09:12:00Z" },
    { id: "s4", title: "Publish to the disclosure workspace", state: "pending" },
  ],
};

export const approval: ApprovalRequest = {
  id: "ap-311",
  title: "Approve the ESRS E1-6 draft for FY2025",
  summary: "The draft reports 41,820 tCO₂e of Scope 3 category 1 emissions, covering 148 of 163 suppliers by spend. 15 suppliers are estimated from spend-based factors.",
  requestedBy: actors.narrative,
  requestedAt: "2026-10-21T09:12:00Z",
  dueAt: "2026-10-24T17:00:00Z",
  onApprove: "Drafting continues with ESRS E1-7 and S1. The E1-6 text is locked for audit.",
  onReject: "The draft returns to the E1 Narrative Sub-agent with your reason. The filing stays at 62% complete.",
  state: "pending",
};

export const citations: Citation[] = [
  { index: 1, source: { id: "src-survey", title: "Supplier survey 2026", publisher: "Supplier engagement", kind: "dataset", locator: "Sheet 2!C14", excerpt: "Total spend on purchased goods and services: EUR 412.6m across 148 suppliers.", retrievedAt: "2026-10-18T10:00:00Z" } },
  { index: 2, source: { id: "src-defra", title: "Greenhouse gas reporting: conversion factors 2025", publisher: "UK government", kind: "factor", locator: "Material use", excerpt: "Factors apply to cradle-to-gate material use, reported per kilogram." } },
  { index: 3, source: { id: "src-inv", title: "Invoice INV-20931", publisher: "Accounts payable, Pune plant", kind: "document", locator: "p. 2", excerpt: "Electricity consumed: 112.4 MWh, 1 Mar to 31 Mar 2026." } },
];

export const confidence: Confidence = { level: "medium", score: 0.78, reason: "15 of 163 suppliers are estimated from spend." };

export const provenance: ProvenanceNode[] = [
  { id: "p1", kind: "source", title: "Supplier survey 2026, 148 responses", detail: "Spend and activity data per supplier." },
  { id: "p2", kind: "extraction", title: "Spend read from the survey", value: "EUR 412.6m", actor: actors.collector, at: "2026-10-18T10:20:00Z" },
  { id: "p3", kind: "review", title: "Currency and supplier matching checked", actor: actors.priya, at: "2026-10-19T14:05:00Z" },
  { id: "p4", kind: "factor", title: "Spend-based factor, purchased goods", value: "0.101 tCO₂e/EUR k", source: { id: "f1", title: "DEFRA conversion factors 2025", kind: "factor" } },
  { id: "p5", kind: "calculation", title: "Spend × factor, summed over suppliers", value: "41,820 tCO₂e", actor: actors.calc, at: "2026-10-21T09:06:00Z" },
  { id: "p6", kind: "datapoint", title: "ESRS E1-6: Scope 3, category 1", value: "41,820 tCO₂e", at: "2026-10-21T09:12:00Z" },
];

/* ---- Datapoints for the list, workspace and dashboard templates ---- */

export type DatapointState = "actual" | "evidenced" | "estimated" | "partial" | "missing" | "gap";
export type Datapoint = { id: string; code: string; name: string; topic: string; value: number | null; unit: string; state: DatapointState; source: string; owner: string; updated: string };

export const datapoints: Datapoint[] = [
  { id: "dp1", code: "E1-6 §44(a)", name: "Gross Scope 1 GHG emissions", topic: "E1 Climate", value: 18240, unit: "tCO₂e", state: "evidenced", source: "Emissions ledger · 418 rows", owner: "Priya Raman", updated: "20 Oct 2026" },
  { id: "dp2", code: "E1-6 §49(a)", name: "Gross Scope 2, location-based", topic: "E1 Climate", value: 9310, unit: "tCO₂e", state: "evidenced", source: "Utility invoices · 14 sites", owner: "Priya Raman", updated: "20 Oct 2026" },
  { id: "dp3", code: "E1-6 §49(b)", name: "Gross Scope 2, market-based", topic: "E1 Climate", value: 7420, unit: "tCO₂e", state: "partial", source: "Supplier certificates · 9 of 14", owner: "Priya Raman", updated: "19 Oct 2026" },
  { id: "dp4", code: "E1-6 §51", name: "Scope 3 category 1, purchased goods", topic: "E1 Climate", value: 41820, unit: "tCO₂e", state: "estimated", source: "Supplier survey · 148 of 163", owner: "Scope 3 Sub-agent", updated: "21 Oct 2026" },
  { id: "dp5", code: "E1-5 §37", name: "Total energy consumption", topic: "E1 Climate", value: 212400, unit: "MWh", state: "evidenced", source: "Utility invoices · 14 sites", owner: "Arjun Mehta", updated: "18 Oct 2026" },
  { id: "dp6", code: "E1-5 §37(c)", name: "Share of renewable energy", topic: "E1 Climate", value: 38, unit: "%", state: "actual", source: "Metered, Pune and Chennai", owner: "Arjun Mehta", updated: "18 Oct 2026" },
  { id: "dp7", code: "E2-4 §28", name: "Emissions of NOx to air", topic: "E2 Pollution", value: null, unit: "t", state: "missing", source: "No source connected", owner: "Unassigned", updated: "Never" },
  { id: "dp8", code: "E3-4 §28", name: "Total water consumption", topic: "E3 Water", value: 1240, unit: "ML", state: "estimated", source: "Site survey · 6 of 14", owner: "Arjun Mehta", updated: "12 Oct 2026" },
  { id: "dp9", code: "S1-6 §50(a)", name: "Number of employees (headcount)", topic: "S1 Workforce", value: 6420, unit: "people", state: "actual", source: "HRIS export", owner: "Priya Raman", updated: "15 Oct 2026" },
  { id: "dp10", code: "S1-14 §88(b)", name: "Recordable work-related injuries", topic: "S1 Workforce", value: 17, unit: "cases", state: "evidenced", source: "EHS register", owner: "Arjun Mehta", updated: "16 Oct 2026" },
  { id: "dp11", code: "E5-5 §37", name: "Total waste generated", topic: "E5 Circular economy", value: null, unit: "t", state: "gap", source: "Awaiting Austin lab", owner: "Unassigned", updated: "Never" },
  { id: "dp12", code: "G1-4 §24", name: "Confirmed incidents of corruption", topic: "G1 Conduct", value: 0, unit: "cases", state: "actual", source: "Compliance register", owner: "Priya Raman", updated: "14 Oct 2026" },
];

export const FILTER_FIELDS = [
  { id: "topic", label: "Topic", options: ["E1 Climate", "E2 Pollution", "E3 Water", "E5 Circular economy", "S1 Workforce", "G1 Conduct"].map((t) => ({ value: t, label: t })) },
  { id: "state", label: "Data quality", options: [{ value: "evidenced", label: "Evidenced" }, { value: "estimated", label: "Estimated" }, { value: "partial", label: "Partial" }, { value: "missing", label: "Missing" }, { value: "gap", label: "Gap" }, { value: "actual", label: "Actual" }] },
];

export const fmt = (n: number | null) => (n === null ? "" : new Intl.NumberFormat("en-IN").format(n));

export const years = ["2022", "2023", "2024", "2025", "2026"];
export const scopeSeries = [
  { id: "scope-1", label: "Scope 1", values: [21400, 20300, 19600, 18900, 18240] },
  { id: "scope-2", label: "Scope 2", values: [11200, 10400, 9900, 9540, 9310] },
  { id: "scope-3", label: "Scope 3", values: [152300, 148100, 145900, 143800, 142880] },
];
export const sites = ["Pune plant", "Chennai plant", "Rotterdam DC", "Leeds office", "Austin lab"];
export const siteSeries = [{ id: "s1", label: "Scope 1", values: [8200, 5400, 2100, 900, 1640] }];
export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const monthlySeries = [{ id: "loc", label: "Location-based", values: [980, 940, 910, 870, 860, 905, 940, 930, 880, 850, 820, 810] }];
