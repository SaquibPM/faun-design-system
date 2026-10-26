import * as RC from "@radix-ui/react-collapsible";
import { IconChevronRight, IconTool } from "@faun-ds/icons";
import { ProgressBar, StatusBadge, cx } from "@faun-ds/react";
import { forwardRef, useId, useState, type HTMLAttributes } from "react";
import { durationBetween, formatDuration, formatRelative } from "../../utils/format.js";
import type { Run, RunState, RunStep, StepState, ToolCall } from "../../utils/types.js";
import { ActorChip } from "../ActorChip/ActorChip.js";

type Expand = "active" | "all" | "none";

export interface RunTrailProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** The run to show: header, overall progress and nested steps. */
  run: Run;
  /** Which steps start open. `active` (default) opens steps that are running, waiting, blocked or failed; `all`; `none`. */
  defaultExpanded?: Expand;
  /** Hide the run header and show the steps alone, e.g. inside a panel that already names the run. */
  hideHeader?: boolean;
  /** Heading level of the run title. Default 3. */
  headingLevel?: 2 | 3 | 4;
  /** Reference time (ms since epoch) for durations of unfinished work and relative times. Defaults to the time of the first render. */
  now?: number;
}

const OPEN_STATES: StepState[] = ["in_progress", "awaiting_human", "blocked", "failed"];

const needsAttention = (s: RunStep): boolean => OPEN_STATES.includes(s.state) || !!s.children?.some(needsAttention) || !!s.toolCalls?.some((t) => t.state === "failed");

function countSteps(steps: RunStep[]): { done: number; total: number } {
  return steps.reduce((acc, s) => {
    const c = s.children ? countSteps(s.children) : { done: 0, total: 0 };
    return { done: acc.done + c.done + (s.state === "done" ? 1 : 0), total: acc.total + c.total + 1 };
  }, { done: 0, total: 0 });
}

const RUN_TONE: Record<RunState, "running" | "success" | "danger" | "accent" | "warning"> = {
  pending: "accent", running: "running", awaiting_approval: "accent", blocked: "warning", completed: "success", failed: "danger", cancelled: "accent",
};

function pretty(v: unknown): string {
  if (typeof v === "string") return v;
  try { return JSON.stringify(v, null, 2) ?? String(v); } catch { return String(v); }
}

function Duration({ start, end, now }: { start?: string; end?: string; now: number }) {
  const d = durationBetween(start, end, now);
  if (d === undefined) return null;
  return <span className="faun-run-duration">{formatDuration(d)}</span>;
}

function ToolCallRow({ call, open, now }: { call: ToolCall; open: boolean; now: number }) {
  const hasBody = call.input !== undefined || call.output !== undefined || !!call.error;
  const head = (
    <>
      <IconTool size="sm" className="faun-run-tool-icon" aria-hidden="true" />
      <span className="faun-run-tool-name">{call.title ?? call.tool}</span>
      {call.title ? <code className="faun-run-tool-id">{call.tool}</code> : null}
    </>
  );
  return (
    <li className="faun-run-tool" data-state={call.state}>
      <RC.Root defaultOpen={open && hasBody} className="faun-run-tool-root">
        <div className="faun-run-tool-head">
          {hasBody ? (
            <RC.Trigger className="faun-run-toggle" aria-label={`${call.title ?? call.tool}, input and output`}>
              <IconChevronRight size="sm" className="faun-run-chevron" aria-hidden="true" />
              {head}
            </RC.Trigger>
          ) : <span className="faun-run-toggle" data-static="">{head}</span>}
          <span className="faun-run-meta">
            <Duration start={call.startedAt} end={call.endedAt} now={now} />
            <StatusBadge size="sm" domain="task" state={call.state} />
          </span>
        </div>
        {hasBody ? (
          <RC.Content className="faun-run-tool-body">
            {call.error ? <p className="faun-run-error" role="alert">{call.error}</p> : null}
            {call.input !== undefined ? (
              <div className="faun-run-io"><p className="faun-run-io-label">Input</p><pre className="faun-run-pre" tabIndex={0}><code>{pretty(call.input)}</code></pre></div>
            ) : null}
            {call.output !== undefined ? (
              <div className="faun-run-io"><p className="faun-run-io-label">Output</p><pre className="faun-run-pre" tabIndex={0}><code>{pretty(call.output)}</code></pre></div>
            ) : null}
          </RC.Content>
        ) : null}
      </RC.Root>
    </li>
  );
}

function StepItem({ step, expand, now }: { step: RunStep; expand: Expand; now: number }) {
  const expandable = !!(step.children?.length || step.toolCalls?.length);
  const open = expand === "all" || (expand === "active" && needsAttention(step));
  const progress = step.progress;
  return (
    <li className="faun-run-step" data-state={step.state}>
      <span className="faun-run-marker" aria-hidden="true" />
      <RC.Root defaultOpen={open} disabled={!expandable} className="faun-run-step-root">
        <div className="faun-run-step-head">
          {expandable ? (
            <RC.Trigger className="faun-run-toggle">
              <IconChevronRight size="sm" className="faun-run-chevron" aria-hidden="true" />
              <span className="faun-run-step-title">{step.title}</span>
            </RC.Trigger>
          ) : <span className="faun-run-toggle" data-static=""><span className="faun-run-step-title">{step.title}</span></span>}
          <span className="faun-run-meta">
            <Duration start={step.startedAt} end={step.endedAt} now={now} />
            <StatusBadge size="sm" domain="task" state={step.state} />
          </span>
        </div>
        {step.actor || step.summary || progress ? (
          <div className="faun-run-step-info">
            {step.actor ? <ActorChip actor={step.actor} size="sm" /> : null}
            {step.summary ? <p className="faun-run-summary">{step.summary}</p> : null}
            {progress ? (
              <ProgressBar
                size="sm"
                value={progress.done}
                max={Math.max(progress.total, 1)}
                tone={step.state === "failed" ? "danger" : step.state === "done" ? "success" : "running"}
                aria-label={`${step.title} progress`}
                valueLabel={`${progress.done.toLocaleString()} of ${progress.total.toLocaleString()}${progress.unit ? ` ${progress.unit}` : ""}`}
              />
            ) : null}
          </div>
        ) : null}
        {expandable ? (
          <RC.Content className="faun-run-step-body">
            {step.toolCalls?.length ? (
              <ul className="faun-run-tools" aria-label={`Tool calls in ${step.title}`}>
                {step.toolCalls.map((t) => <ToolCallRow key={t.id} call={t} open={expand === "all" || (expand === "active" && t.state === "failed")} now={now} />)}
              </ul>
            ) : null}
            {step.children?.length ? <StepList steps={step.children} expand={expand} now={now} label={`Steps in ${step.title}`} /> : null}
          </RC.Content>
        ) : null}
      </RC.Root>
    </li>
  );
}

function StepList({ steps, expand, now, label }: { steps: RunStep[]; expand: Expand; now: number; label: string }) {
  return (
    <ol className="faun-run-steps" aria-label={label}>
      {steps.map((s) => <StepItem key={s.id} step={s} expand={expand} now={now} />)}
    </ol>
  );
}

/**
 * What an agent did, step by step: nested steps with who did them, progress, duration and the tool calls
 * behind each one, with inputs and outputs a reviewer can open.
 */
export const RunTrail = forwardRef<HTMLElement, RunTrailProps>(function RunTrail(
  { run, defaultExpanded = "active", hideHeader = false, headingLevel = 3, now: nowProp, className, ...props },
  ref,
) {
  const titleId = useId();
  const [mounted] = useState(() => Date.now());
  const now = nowProp ?? mounted;
  const H = `h${headingLevel}` as "h3";
  const { done, total } = countSteps(run.steps);
  const runDuration = durationBetween(run.startedAt, run.endedAt, now);
  return (
    <section ref={ref} className={cx("faun-run-trail", className)} aria-labelledby={hideHeader ? undefined : titleId} data-state={run.state} {...props}>
      {hideHeader ? null : (
        <header className="faun-run-header">
          <div className="faun-run-title-row">
            <H id={titleId} className="faun-run-title">{run.title}</H>
            <StatusBadge domain="run" state={run.state} />
          </div>
          <div className="faun-run-header-meta">
            <ActorChip actor={run.agent} showKind />
            {run.startedBy ? <span className="faun-run-started-by">Started by <ActorChip actor={run.startedBy} /></span> : null}
            {run.startedAt ? <time dateTime={run.startedAt}>Started {formatRelative(run.startedAt, now)}</time> : null}
            {runDuration !== undefined ? <span>{formatDuration(runDuration)} {run.endedAt ? "total" : "elapsed"}</span> : null}
          </div>
          {total > 0 ? <ProgressBar size="sm" value={done} max={total} tone={RUN_TONE[run.state]} aria-label="Run progress" valueLabel={`${done} of ${total} steps done`} /> : null}
        </header>
      )}
      <StepList steps={run.steps} expand={defaultExpanded} now={now} label={hideHeader ? run.title : "Steps"} />
    </section>
  );
});
