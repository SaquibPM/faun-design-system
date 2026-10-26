import * as RP from "@radix-ui/react-progress";
import { IconStatusDanger, IconStatusSuccess } from "@faun-ds/icons";
import { forwardRef, useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";

export type ProgressTone = "accent" | "success" | "warning" | "danger" | "running" | "neutral";

export interface ProgressSegment {
  value: number;
  tone?: ProgressTone;
  /** Legend label, e.g. "Covered" or "Estimated". */
  label: string;
}

export type ProgressStatus = "active" | "finished" | "error";

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Current value. `null` shows an indeterminate bar. */
  value?: number | null;
  max?: number;
  /** Visible label above the bar. Also the accessible name. */
  label?: ReactNode;
  /** Accessible name when no visible label is shown. */
  "aria-label"?: string;
  /** Text on the end of the label row, e.g. "212 of 340". Defaults to a percentage when `showValue`. */
  valueLabel?: ReactNode;
  showValue?: boolean;
  tone?: ProgressTone;
  size?: "sm" | "md" | "lg";
  /** Several stacked parts, e.g. covered (accent) and estimated (warning). Overrides `value`. */
  segments?: ProgressSegment[];
  /** Show a legend for segments. Default true when segments are given. */
  legend?: boolean;
  /**
   * `active` (default) is work in progress. `finished` fills the bar, turns it green and shows a check with "Finished". `error` turns it red and shows a cross with
   * "Failed" or your `statusText`. The state is always written out, never colour alone.
   */
  status?: ProgressStatus;
  /** Helper text under the bar. Replaces the default "Finished" and "Failed"; on `error` say what went wrong and what to do ("Upload stopped at 62%. Check the file and retry."). */
  statusText?: ReactNode;
  /**
   * What is announced to screen readers, after mount only: `auto` (default) says "in progress" when a bar becomes indeterminate, the new value each time it crosses
   * 25, 50 and 75 percent, "finished" politely, and "failed" as an alert. `false` is silent: use it for many bars on one page, such as a table of runs.
   */
  announce?: "auto" | false;
}

const pct = (v: number, max: number) => Math.max(0, Math.min(100, (v / max) * 100));

/**
 * What a progress bar says out loud. Nothing on first render; afterwards: "in progress" when it turns indeterminate, the value at each 25 percent
 * milestone crossed upward, "finished" and "failed" on those status changes. Returns the message and whether it is urgent.
 */
function useAnnouncement(o: { enabled: boolean; name: string; value?: number | null; max: number; status: ProgressStatus; text?: string }) {
  const [note, setNote] = useState<{ text: string; alert: boolean }>({ text: "", alert: false });
  const prev = useRef<{ status: ProgressStatus; indeterminate: boolean; step: number } | null>(null);
  const indeterminate = o.value === null;
  const step = o.value == null ? 0 : Math.min(4, Math.floor((Math.max(0, o.value) / o.max) * 4));
  useEffect(() => {
    const before = prev.current;
    prev.current = { status: o.status, indeterminate, step };
    if (!o.enabled || !before) return;
    if (o.status !== before.status) {
      if (o.status === "finished") setNote({ text: `${o.name}: finished`, alert: false });
      else if (o.status === "error") setNote({ text: `${o.name}: failed${o.text ? `. ${o.text}` : ""}`, alert: true });
      return;
    }
    if (o.status !== "active") return;
    if (indeterminate && !before.indeterminate) setNote({ text: `${o.name}: in progress`, alert: false });
    else if (!indeterminate && step > before.step && step < 4) setNote({ text: `${o.name}: ${step * 25}%`, alert: false });
  }, [o.status, indeterminate, step]);
  return note;
}

/** Shows how far a task or a coverage measure has progressed. */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(function ProgressBar(
  { value: valueProp = 0, max = 100, label, valueLabel, showValue, tone: toneProp = "accent", size = "md", segments, legend, status = "active", statusText, announce = "auto", className, "aria-label": ariaLabel, ...props },
  ref,
) {
  const id = useId();
  const finished = status === "finished" && !segments;
  const failed = status === "error";
  const value = finished ? max : valueProp;
  const tone: ProgressTone = finished ? "success" : failed ? "danger" : toneProp;
  const text = statusText ?? (finished ? "Finished" : failed ? "Failed" : undefined);
  const name = typeof label === "string" ? label : ariaLabel ?? "Progress";
  const note = useAnnouncement({ enabled: announce === "auto", name, value: segments ? undefined : value, max, status, text: typeof text === "string" ? text : undefined });
  const labelId = label ? `${id}-label` : undefined;
  const indeterminate = value === null && !segments;
  const total = segments ? segments.reduce((s, x) => s + x.value, 0) : (value ?? 0);
  const shownValue = valueLabel ?? (showValue && !indeterminate ? `${Math.round(pct(total, max))}%` : null);
  const valueText = finished ? "Finished" : failed ? `Error${typeof text === "string" ? `: ${text}` : ""}` : segments ? segments.map((s) => `${s.label} ${Math.round(pct(s.value, max))}%`).join(", ") : undefined;
  return (
    <div ref={ref} className={cx("faun-progress", className)} data-size={size} data-status={status !== "active" ? status : undefined} {...props}>
      {label || shownValue ? (
        <div className="faun-progress-head">
          {label ? <span id={labelId} className="faun-progress-label">{label}</span> : <span />}
          {shownValue ? <span className="faun-progress-value">{shownValue}</span> : null}
        </div>
      ) : null}
      {segments ? (
        <div className="faun-progress-track" role="progressbar" aria-labelledby={labelId} aria-label={labelId ? undefined : ariaLabel} aria-valuemin={0} aria-valuemax={max} aria-valuenow={total} aria-valuetext={valueText}>
          {segments.map((s, i) => <span key={i} className="faun-progress-fill" data-tone={s.tone ?? "accent"} style={{ inlineSize: `${pct(s.value, max)}%` }} />)}
        </div>
      ) : (
        <RP.Root className="faun-progress-track" value={indeterminate ? null : value} max={max} aria-labelledby={labelId} aria-label={labelId ? undefined : ariaLabel} aria-valuetext={valueText} data-indeterminate={indeterminate ? "" : undefined}>
          <RP.Indicator className="faun-progress-fill" data-tone={tone} style={indeterminate ? undefined : { inlineSize: `${pct(value ?? 0, max)}%` }} />
        </RP.Root>
      )}
      {text || (status === "active" && statusText) ? (
        <p className="faun-progress-status" data-status={status}>
          {finished ? <IconStatusSuccess aria-hidden="true" /> : failed ? <IconStatusDanger aria-hidden="true" /> : null}
          <span>{text}</span>
        </p>
      ) : null}
      {announce === "auto" ? <span className="faun-visually-hidden" role={note.alert ? "alert" : "status"} aria-live={note.alert ? "assertive" : "polite"}>{note.text}</span> : null}
      {segments && legend !== false ? (
        <ul className="faun-progress-legend">
          {segments.map((s, i) => (
            <li key={i}><span className="faun-progress-key" data-tone={s.tone ?? "accent"} aria-hidden="true" />{s.label}<span className="faun-progress-legend-value">{Math.round(pct(s.value, max))}%</span></li>
          ))}
        </ul>
      ) : null}
    </div>
  );
});

export interface ProgressCircleProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** 0–max. `null` for indeterminate. */
  value?: number | null;
  max?: number;
  size?: "sm" | "md" | "lg";
  tone?: ProgressTone;
  /** Show the percentage inside (md and lg only). */
  showValue?: boolean;
  "aria-label": string;
}

/** Compact circular progress for cards, avatars and table cells. */
export const ProgressCircle = forwardRef<HTMLDivElement, ProgressCircleProps>(function ProgressCircle({ value = 0, max = 100, size = "md", tone = "accent", showValue, className, ...props }, ref) {
  const indeterminate = value === null;
  const p = indeterminate ? 25 : pct(value, max);
  const r = 15.9155; // circumference 100
  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : value}
      className={cx("faun-progress-circle", className)}
      data-size={size}
      data-tone={tone}
      data-indeterminate={indeterminate ? "" : undefined}
      {...props}
    >
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle className="faun-progress-circle-track" cx="18" cy="18" r={r} fill="none" />
        <circle className="faun-progress-circle-fill" cx="18" cy="18" r={r} fill="none" strokeDasharray={`${p} ${100 - p}`} strokeDashoffset="25" />
      </svg>
      {showValue && !indeterminate && size !== "sm" ? <span className="faun-progress-circle-value" aria-hidden="true">{Math.round(p)}</span> : null}
    </div>
  );
});

export interface MeterProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  value: number;
  min?: number;
  max?: number;
  label?: ReactNode;
  "aria-label"?: string;
  /** Text after the label, e.g. "91%" or "18.4 tCO₂e/€m". */
  valueLabel?: ReactNode;
  /** Values below `low` are poor, above `high` are good (or the reverse with `higherIsBetter={false}`). */
  low?: number;
  high?: number;
  higherIsBetter?: boolean;
  /** Draw a target marker at this value. */
  target?: number;
  size?: "sm" | "md";
}

/** A measurement within a known range (coverage, data quality, budget used), coloured by thresholds. */
export const Meter = forwardRef<HTMLDivElement, MeterProps>(function Meter(
  { value, min = 0, max = 100, label, valueLabel, low, high, higherIsBetter = true, target, size = "md", className, "aria-label": ariaLabel, ...props },
  ref,
) {
  const id = useId();
  const span = max - min;
  const p = Math.max(0, Math.min(100, ((value - min) / span) * 100));
  let tone: ProgressTone = "accent";
  if (low !== undefined && high !== undefined) {
    const good = higherIsBetter ? value >= high : value <= low;
    const bad = higherIsBetter ? value < low : value > high;
    tone = good ? "success" : bad ? "danger" : "warning";
  }
  return (
    <div ref={ref} className={cx("faun-progress faun-meter", className)} data-size={size} {...props}>
      {label || valueLabel ? (
        <div className="faun-progress-head">
          {label ? <span id={`${id}-l`} className="faun-progress-label">{label}</span> : <span />}
          {valueLabel ? <span className="faun-progress-value">{valueLabel}</span> : null}
        </div>
      ) : null}
      <div className="faun-progress-track" role="meter" aria-labelledby={label ? `${id}-l` : undefined} aria-label={label ? undefined : ariaLabel} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-valuetext={typeof valueLabel === "string" ? valueLabel : undefined}>
        <span className="faun-progress-fill" data-tone={tone} style={{ inlineSize: `${p}%` }} />
        {target !== undefined ? <span className="faun-meter-target" style={{ insetInlineStart: `${Math.max(0, Math.min(100, ((target - min) / span) * 100))}%` }} aria-hidden="true" /> : null}
      </div>
    </div>
  );
});
