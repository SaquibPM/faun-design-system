import { IconCheck, IconClose, IconUserRound } from "@faun-ds/icons";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";

export type StepState = "complete" | "current" | "upcoming" | "error" | "awaiting-human";

export interface StepItem {
  label: string;
  description?: ReactNode;
  /** Overrides the state derived from `current`. Use `error` or `awaiting-human` to flag a step. */
  state?: StepState;
  /** Makes the step a button, e.g. to return to a completed step. */
  onSelect?: () => void;
  /** The step cannot be opened (a later step that needs earlier work). Needs `onSelect` to matter; the text status reads "Unavailable". */
  disabled?: boolean;
}

export interface StepperProps extends Omit<HTMLAttributes<HTMLOListElement>, "children"> {
  steps: StepItem[];
  /** Zero-based index of the current step. Earlier steps are complete, later ones upcoming. */
  current: number;
  orientation?: "horizontal" | "vertical";
  /** Name of the list for screen readers. */
  "aria-label"?: string;
  /** Writes each step's state under its label ("Completed", "Current step", "Needs attention"). Always spoken to screen readers; this makes it visible too. */
  showStatus?: boolean;
}

const STATE_TEXT: Record<StepState, string> = {
  complete: "Completed",
  current: "Current step",
  upcoming: "Not started",
  error: "Needs attention",
  "awaiting-human": "Waiting for a person",
};
const UNAVAILABLE = "Unavailable";

/** Shows progress through an ordered process, such as a filing or an import. */
export const Stepper = forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  { steps, current, orientation = "horizontal", showStatus, className, "aria-label": ariaLabel = "Progress", ...props },
  ref,
) {
  return (
    <ol ref={ref} aria-label={ariaLabel} className={cx("faun-stepper", className)} data-orientation={orientation} {...props}>
      {steps.map((step, i) => {
        const state: StepState = step.state ?? (i < current ? "complete" : i === current ? "current" : "upcoming");
        const marker =
          state === "complete" ? <IconCheck size="sm" /> : state === "error" ? <IconClose size="sm" /> : state === "awaiting-human" ? <IconUserRound size="sm" /> : <span>{i + 1}</span>;
        const body = (
          <>
            <span className="faun-step-marker" aria-hidden="true">{marker}</span>
            <span className="faun-step-text">
              <span className="faun-step-label">{step.label}</span>
              {step.description ? <span className="faun-step-description">{step.description}</span> : null}
              <span className="faun-step-status" data-visible={showStatus ? "" : undefined}>{step.disabled ? UNAVAILABLE : STATE_TEXT[state]}</span>
            </span>
          </>
        );
        return (
          <li key={`${i}-${step.label}`} className="faun-step" data-state={state} data-disabled={step.disabled ? "" : undefined} aria-current={state === "current" ? "step" : undefined} data-last={i === steps.length - 1 || undefined}>
            {step.onSelect ? (
              <button type="button" className="faun-step-content" disabled={step.disabled} onClick={step.onSelect}>{body}</button>
            ) : (
              <div className="faun-step-content">{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
});
