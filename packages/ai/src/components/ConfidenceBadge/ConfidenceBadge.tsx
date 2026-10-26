import { Badge, Tooltip, cx } from "@faun-ds/react";
import { forwardRef, useId, type HTMLAttributes } from "react";
import type { Confidence } from "../../utils/types.js";

const LEVEL = {
  high: { label: "High confidence", tone: "success", bars: 3 },
  medium: { label: "Medium confidence", tone: "neutral", bars: 2 },
  low: { label: "Low confidence", tone: "warning", bars: 1 },
} as const;

export interface ConfidenceBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The level, optional score (0 to 1) and the reason in words. */
  confidence: Confidence;
  /** Append the score as a percentage, e.g. "High confidence · 92%". Needs `confidence.score`. */
  showScore?: boolean;
  /** `sm` for tables and inline use. */
  size?: "sm" | "md";
}

function Bars({ filled }: { filled: number }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" className="faun-confidence-bars" fill="currentColor">
      {[0, 1, 2].map((i) => (
        <rect key={i} x={2 + i * 5} y={10 - i * 3} width="3" height={4 + i * 3} rx="1" opacity={i < filled ? 1 : 0.28} />
      ))}
    </svg>
  );
}

/**
 * How sure the agent is, in words and a three-bar glyph (never colour alone).
 * When there is a reason it is available to everyone: read by screen readers and shown on hover and focus.
 */
export const ConfidenceBadge = forwardRef<HTMLSpanElement, ConfidenceBadgeProps>(function ConfidenceBadge({ confidence, showScore = false, size = "md", className, ...props }, ref) {
  const reasonId = useId();
  const spec = LEVEL[confidence.level];
  const score = showScore && confidence.score != null ? `${Math.round(confidence.score * 100)}%` : null;
  const badge = (
    <Badge
      ref={ref}
      tone={spec.tone}
      size={size}
      icon={<Bars filled={spec.bars} />}
      className={cx("faun-confidence-badge", className)}
      data-level={confidence.level}
      tabIndex={confidence.reason ? 0 : undefined}
      aria-describedby={confidence.reason ? reasonId : undefined}
      {...props}
    >
      {spec.label}
      {score ? <span className="faun-confidence-score"> · {score}</span> : null}
      {confidence.reason ? <span id={reasonId} className="faun-visually-hidden">. {confidence.reason}</span> : null}
    </Badge>
  );
  return confidence.reason ? <Tooltip content={confidence.reason}>{badge}</Tooltip> : badge;
});
