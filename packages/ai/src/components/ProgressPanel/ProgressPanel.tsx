import * as RC from "@radix-ui/react-collapsible";
import { IconChevronRight, IconClose } from "@faun-ds/icons";
import { IconButton, ProgressBar, StatusBadge, VisuallyHidden, cx, useControllableState } from "@faun-ds/react";
import { forwardRef, useEffect, useId, useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { formatDuration } from "../../utils/format.js";
import type { RunState, StepState } from "../../utils/types.js";

/** One step in a task. Keep titles short and in the present tense: "Apply emission factors". */
export interface ProgressStep {
  id: string;
  title: string;
  state: StepState;
  /** One line under the title: what is happening or why it stopped. */
  detail?: string;
  /** Time spent on the step, in milliseconds, for finished and running steps. */
  elapsedMs?: number;
}

export interface ProgressPanelProps extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
  /** What the agent is doing, as a short phrase: "Drafting the ESRS E1 disclosure". */
  title: ReactNode;
  steps: ProgressStep[];
  /** `inline` sits in the conversation as a card under the message that started the task. `docked` fills a side column. Default inline. */
  variant?: "inline" | "docked";
  /** Overall state. Derived from the steps when omitted: failed, awaiting approval, completed, otherwise running. */
  state?: RunState;
  /** Time since the task started, in milliseconds. The panel shows it as given; update it from your own timer. */
  elapsedMs?: number;
  /** Let the person fold the steps away. The current step and progress bar stay visible. Default true for inline, false for docked. */
  collapsible?: boolean;
  /** Controlled open state of the step list. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Shows a Close button in a docked panel, and closes on Escape while focus is inside. */
  onClose?: () => void;
  /** Controls at the end of the header, e.g. a Stop button. */
  actions?: ReactNode;
  /** Heading level of the title. Default 3 inline, 2 docked. */
  headingLevel?: 2 | 3 | 4;
  /** Move focus to the panel when it mounts, and give it back when it unmounts. Default true for docked, false for inline. */
  autoFocus?: boolean;
}

const WORD: Record<StepState, string> = {
  pending: "waiting", in_progress: "in progress", awaiting_human: "waiting for you", blocked: "blocked", done: "done", failed: "failed", skipped: "skipped",
};
const CURRENT: StepState[] = ["in_progress", "awaiting_human", "blocked", "failed"];

function deriveState(steps: ProgressStep[]): RunState {
  if (steps.some((s) => s.state === "failed")) return "failed";
  if (steps.some((s) => s.state === "blocked")) return "blocked";
  if (steps.some((s) => s.state === "awaiting_human")) return "awaiting_approval";
  if (steps.length > 0 && steps.every((s) => s.state === "done" || s.state === "skipped")) return "completed";
  if (steps.every((s) => s.state === "pending")) return "pending";
  return "running";
}

const RUN_TONE: Record<RunState, "running" | "success" | "danger" | "accent" | "warning"> = {
  pending: "accent", running: "running", awaiting_approval: "accent", blocked: "warning", completed: "success", failed: "danger", cancelled: "accent",
};

/**
 * Where an agent is in a task: the steps with a status each, the current one named, time elapsed and overall progress.
 * Inline in a conversation or docked beside it. Folds to a one-line summary, and announces step changes politely.
 */
export const ProgressPanel = forwardRef<HTMLElement, ProgressPanelProps>(function ProgressPanel(
  { title, steps, variant = "inline", state, elapsedMs, collapsible, open, defaultOpen = true, onOpenChange, onClose, actions, headingLevel, autoFocus, className, onKeyDown, ...props },
  ref,
) {
  const docked = variant === "docked";
  const canFold = collapsible ?? !docked;
  const shouldFocus = autoFocus ?? docked;
  const [isOpen, setOpen] = useControllableState<boolean>({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const expanded = canFold ? isOpen : true;
  const titleId = useId();
  const overall = state ?? deriveState(steps);
  const total = steps.length;
  const done = steps.filter((s) => s.state === "done" || s.state === "skipped").length;
  const currentIndex = steps.findIndex((s) => CURRENT.includes(s.state));
  const current = currentIndex >= 0 ? steps[currentIndex] : undefined;
  const H = `h${headingLevel ?? (docked ? 2 : 3)}` as "h2";
  const rootRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Announce a change of current step, never the first render.
  const announceRef = useRef<HTMLSpanElement>(null);
  const lastAnnounced = useRef<string | undefined>(undefined);
  const first = useRef(true);
  const message = current ? `Step ${currentIndex + 1} of ${total}, ${current.title}, ${WORD[current.state]}` : overall === "completed" ? `All ${total} steps done` : "";
  useEffect(() => {
    if (first.current) { first.current = false; lastAnnounced.current = message; return; }
    if (message !== lastAnnounced.current) { lastAnnounced.current = message; if (announceRef.current) announceRef.current.textContent = message; }
  }, [message]);

  // Focus in on mount, back out on unmount.
  useEffect(() => {
    if (!shouldFocus) return;
    const before = document.activeElement as HTMLElement | null;
    headingRef.current?.focus({ preventScroll: true });
    return () => { if (before && before !== document.body && document.contains(before)) before.focus({ preventScroll: true }); };
  }, [shouldFocus]);

  const keyDown = (e: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(e);
    if (e.key !== "Escape" || !onClose || !docked) return;
    if (!e.currentTarget.contains(e.target as Node)) return;
    e.stopPropagation();
    onClose();
  };

  const summary = current
    ? `Step ${currentIndex + 1} of ${total}: ${current.title}`
    : overall === "completed" ? `All ${total} steps done` : `${done} of ${total} steps done`;
  const titleNode = canFold ? (
    <RC.Trigger className="faun-progress-panel-toggle">
      <IconChevronRight size="sm" className="faun-progress-panel-chevron" aria-hidden="true" />
      <span>{title}</span>
    </RC.Trigger>
  ) : title;

  return (
    <RC.Root open={expanded} onOpenChange={canFold ? setOpen : undefined} asChild>
      <section
        ref={(el) => { rootRef.current = el; if (typeof ref === "function") ref(el); else if (ref) ref.current = el; }}
        className={cx("faun-progress-panel", className)}
        data-variant={variant}
        data-run-state={overall}
        aria-labelledby={titleId}
        onKeyDown={keyDown}
        {...props}
      >
        <header className="faun-progress-panel-head">
          <div className="faun-progress-panel-title-row">
            <H id={titleId} ref={headingRef} tabIndex={-1} className="faun-progress-panel-title">{titleNode}</H>
            <div className="faun-progress-panel-end">
              <StatusBadge size="sm" domain="run" state={overall} />
              {actions}
              {onClose && docked ? <IconButton icon={<IconClose />} label="Close progress panel" size="sm" onClick={onClose} /> : null}
            </div>
          </div>
          <p className="faun-progress-panel-summary">
            <span className="faun-progress-panel-current">{summary}</span>
            {elapsedMs !== undefined ? <span className="faun-progress-panel-elapsed"><span aria-hidden="true"> · </span>Elapsed <time dateTime={`PT${Math.round(elapsedMs / 1000)}S`}>{formatDuration(elapsedMs)}</time></span> : null}
          </p>
          {total > 0 ? <ProgressBar size="sm" value={done} max={total} tone={RUN_TONE[overall]} aria-label="Task progress" valueLabel={`${done} of ${total} steps done`} /> : null}
        </header>
        <RC.Content className="faun-progress-panel-body">
          <ol className="faun-progress-panel-steps" aria-label="Steps">
            {steps.map((s, i) => (
              <li key={s.id} className="faun-progress-panel-step" data-state={s.state} aria-current={i === currentIndex ? "step" : undefined}>
                <span className="faun-progress-panel-marker" aria-hidden="true" />
                <div className="faun-progress-panel-step-main">
                  <div className="faun-progress-panel-step-head">
                    <span className="faun-progress-panel-step-title">{s.title}</span>
                    <span className="faun-progress-panel-step-meta">
                      {s.elapsedMs !== undefined ? <span>{formatDuration(s.elapsedMs)}</span> : null}
                      <StatusBadge size="sm" domain="task" state={s.state} />
                    </span>
                  </div>
                  {s.detail ? <p className="faun-progress-panel-detail">{s.detail}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        </RC.Content>
        <VisuallyHidden ref={announceRef} role="status" aria-live="polite" data-announce="" />
      </section>
    </RC.Root>
  );
});
