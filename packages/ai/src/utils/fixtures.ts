/** Realistic enterprise ESG data for examples and tests. Not exported from the package. */
import type { Actor, ApprovalRequest, Citation, ProvenanceNode, Run } from "./types.js";

export const NOW = Date.parse("2026-10-21T09:18:00Z");

export const actors = {
  orchestrator: { id: "agent-csrd", name: "CSRD Filing Orchestrator", kind: "agent", role: "Agent" },
  collector: { id: "sub-collect", name: "Data Collection Sub-agent", kind: "sub-agent", role: "Sub-agent · Activity data" },
  scope3: { id: "sub-s3", name: "Scope 3 Sub-agent", kind: "sub-agent", role: "Sub-agent · Value chain" },
  narrative: { id: "sub-narr", name: "E1 Narrative Sub-agent", kind: "sub-agent", role: "Sub-agent · Disclosure drafting" },
  calc: { id: "tool-calc", name: "emissions.calculate_scope3", kind: "tool", role: "Tool" },
  model: { id: "model-1", name: "Drafting model", kind: "model", role: "Language model" },
  priya: { id: "u-priya", name: "Priya Raman", kind: "human", role: "Sustainability lead" },
  arjun: { id: "u-arjun", name: "Arjun Mehta", kind: "human", role: "Group controller" },
  scheduler: { id: "sys", name: "Filing scheduler", kind: "system", role: "System" },
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
      toolCalls: [
        { id: "t1", tool: "ledger.read_rows", title: "Read general ledger", state: "done", startedAt: "2026-10-21T09:00:05Z", endedAt: "2026-10-21T09:02:40Z", input: { period: "FY2025", entities: ["DE01", "IN04", "NL02"], accounts: "5xxx-6xxx" }, output: { rows: 12480, skipped: 0 } },
      ],
    },
    {
      id: "s2", title: "Calculate Scope 3 category 1", state: "in_progress", actor: actors.scope3, summary: "Matching purchased goods to emission factors.",
      startedAt: "2026-10-21T09:04:20Z", progress: { done: 212, total: 340, unit: "suppliers" },
      toolCalls: [
        { id: "t2", tool: "emissions.calculate_scope3", title: "Calculate by supplier", state: "in_progress", startedAt: "2026-10-21T09:04:22Z", input: { category: 1, method: "spend-based", currency: "EUR" } },
        { id: "t3", tool: "factors.lookup", title: "Look up emission factor", state: "failed", startedAt: "2026-10-21T09:11:02Z", endedAt: "2026-10-21T09:11:03Z", input: { material: "Aluminium castings, secondary", unit: "kg", library: "DEFRA 2025" }, error: "No DEFRA 2025 factor for “Aluminium castings, secondary” in kg. Falling back to the spend-based factor." },
      ],
      children: [
        { id: "s2a", title: "Classify 340 suppliers by spend category", state: "done", actor: actors.scope3, startedAt: "2026-10-21T09:04:22Z", endedAt: "2026-10-21T09:08:10Z" },
        { id: "s2b", title: "Apply emission factors", state: "in_progress", actor: actors.calc, startedAt: "2026-10-21T09:08:11Z", progress: { done: 212, total: 340, unit: "suppliers" } },
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
  { index: 2, source: { id: "src-defra", title: "Greenhouse gas reporting: conversion factors 2025", publisher: "UK government", kind: "factor", href: "https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting", locator: "Material use", excerpt: "Factors apply to cradle-to-gate material use, reported per kilogram." } },
  { index: 3, source: { id: "src-inv", title: "Invoice INV-20931", publisher: "Accounts payable, Pune plant", kind: "document", locator: "p. 2", excerpt: "Electricity consumed: 112.4 MWh, 1 Mar to 31 Mar 2026." } },
];

export const provenance: ProvenanceNode[] = [
  { id: "p1", kind: "source", title: "Electricity invoices, Pune plant, FY2025", detail: "12 monthly bills from the utility portal.", source: { id: "src-inv", title: "Invoice INV-20931", kind: "document", locator: "p. 2" } },
  { id: "p2", kind: "extraction", title: "Consumption read from the bills", value: "1,284 MWh", actor: actors.collector, at: "2026-10-18T10:20:00Z" },
  { id: "p3", kind: "review", title: "Units and billing periods checked", actor: actors.priya, at: "2026-10-19T14:05:00Z" },
  { id: "p4", kind: "factor", title: "Grid emission factor, India, location-based", value: "0.716 tCO₂e/MWh", source: { id: "f1", title: "CEA CO₂ baseline database", kind: "factor" } },
  { id: "p5", kind: "calculation", title: "1,284 MWh × 0.716 tCO₂e/MWh", value: "919.3 tCO₂e", actor: actors.calc, at: "2026-10-21T09:06:00Z" },
  { id: "p6", kind: "datapoint", title: "ESRS E1-6: Scope 2, location-based, Pune plant", value: "919 tCO₂e", at: "2026-10-21T09:12:00Z" },
];
