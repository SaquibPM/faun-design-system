/**
 * Shared data model for @faun-ds/ai. Components accept these shapes so a product
 * can map its own run/trace API once and feed every agentic component.
 * States match the `run` and `task` domains in @faun-ds/tokens/status-map.
 */

/** Who did something. Machines render in lagoon, people in plum. */
export type ActorKind = "agent" | "sub-agent" | "tool" | "model" | "human" | "system";

export interface Actor {
  id: string;
  /** Display name, e.g. "CSRD Filing Orchestrator" or "Priya Raman". */
  name: string;
  kind: ActorKind;
  /** Optional avatar image (people) or icon name from @faun-ds/icons (machines). */
  avatarUrl?: string;
  /** Short role line, e.g. "Sub-agent · Materiality" or "Sustainability lead". */
  role?: string;
}

/** State of a whole run. Mirrors status-map domain `run`. */
export type RunState = "pending" | "running" | "awaiting_approval" | "blocked" | "completed" | "failed" | "cancelled";

/** State of one step or task. Mirrors status-map domain `task`. */
export type StepState = "pending" | "in_progress" | "awaiting_human" | "blocked" | "done" | "failed" | "skipped";

/** A call from an agent to a tool. */
export interface ToolCall {
  id: string;
  /** Tool name as registered, e.g. "emissions.calculate_scope3". */
  tool: string;
  /** Human label, e.g. "Calculate Scope 3 category 1". */
  title?: string;
  state: StepState;
  input?: unknown;
  output?: unknown;
  /** Error message when state is "failed". */
  error?: string;
  startedAt?: string;
  endedAt?: string;
}

/** One step in a run trail. Steps nest: a sub-agent step holds its own steps. */
export interface RunStep {
  id: string;
  title: string;
  state: StepState;
  actor?: Actor;
  /** One-line summary of what happened or is happening. */
  summary?: string;
  startedAt?: string;
  endedAt?: string;
  toolCalls?: ToolCall[];
  children?: RunStep[];
  /** Progress for long steps: done of total, e.g. 212 of 340 datapoints. */
  progress?: { done: number; total: number; unit?: string };
}

export interface Run {
  id: string;
  title: string;
  state: RunState;
  /** The orchestrating agent. */
  agent: Actor;
  /** The person who started the run, when there is one. */
  startedBy?: Actor;
  startedAt?: string;
  endedAt?: string;
  steps: RunStep[];
}

/** An evidence source an AI statement is grounded in. */
export interface Source {
  id: string;
  title: string;
  /** Where it came from, e.g. "Supplier survey 2026", "DEFRA 2026", "Invoice INV-20931". */
  publisher?: string;
  kind?: "document" | "dataset" | "factor" | "web" | "datapoint" | "calculation";
  href?: string;
  /** Short quoted passage or value. */
  excerpt?: string;
  /** Page, cell or row reference, e.g. "p. 14" or "Sheet 2!C14". */
  locator?: string;
  retrievedAt?: string;
}

/** A numbered inline reference to a Source. */
export interface Citation {
  /** 1-based number shown inline. */
  index: number;
  source: Source;
}

/** Confidence as a level with optional numeric score (0–1) and a reason in words. */
export interface Confidence {
  level: "high" | "medium" | "low";
  score?: number;
  reason?: string;
}

/** A step in data lineage: how a reported value was produced. */
export interface ProvenanceNode {
  id: string;
  kind: "source" | "extraction" | "factor" | "calculation" | "estimate" | "review" | "datapoint";
  title: string;
  detail?: string;
  /** Value at this step, pre-formatted, e.g. "1,284 MWh" or "0.207 kgCO₂e/kWh". */
  value?: string;
  actor?: Actor;
  at?: string;
  source?: Source;
}

/** A decision a person must take before an agent continues. */
export interface ApprovalRequest {
  id: string;
  title: string;
  /** What the agent wants and why, in one or two sentences. */
  summary?: string;
  requestedBy: Actor;
  requestedAt?: string;
  /** What happens after approval, e.g. "Drafting E1 and S1 continues." */
  onApprove?: string;
  /** What happens after rejection. */
  onReject?: string;
  dueAt?: string;
  state: "pending" | "approved" | "rejected";
  decidedBy?: Actor;
  decidedAt?: string;
  comment?: string;
}
