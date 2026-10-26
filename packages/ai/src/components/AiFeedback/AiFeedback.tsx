import { IconCheck, IconCopy, IconRefresh, IconThumbsDown, IconThumbsUp } from "@faun-ds/icons";
import { FilterChip, IconButton, VisuallyHidden, cx, useControllableState } from "@faun-ds/react";
import { forwardRef, useEffect, useRef, useState, type HTMLAttributes } from "react";

export type FeedbackValue = "helpful" | "not-helpful" | null;

export interface AIFeedbackProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "onCopy"> {
  /** The rating the person gave. Controlled. */
  value?: FeedbackValue;
  defaultValue?: FeedbackValue;
  onValueChange?: (value: FeedbackValue) => void;
  /** Text copied by the Copy button. Without it the button is not shown unless `onCopy` is set. */
  text?: string;
  /** Called after the text is copied, or instead of copying when `text` is not given. */
  onCopy?: (text?: string) => void;
  /** Shows a Regenerate button and calls this when pressed. */
  onRegenerate?: () => void;
  /** A new response is being generated. Disables Regenerate and says so. */
  regenerating?: boolean;
  /** Reasons offered after "Not helpful": "Inaccurate", "Missing sources". Press one to send it. */
  reasons?: string[];
  onReason?: (reason: string) => void;
  /** Hide the controls the product does not support. */
  hide?: Partial<Record<"rating" | "copy" | "regenerate", boolean>>;
}

/**
 * What a person can do with an AI response: rate it helpful or not, copy it, regenerate it.
 * The ratings are toggle buttons with a pressed state; copying and sending a rating are confirmed in words, not just by a change of icon.
 */
export const AIFeedback = forwardRef<HTMLDivElement, AIFeedbackProps>(function AIFeedback(
  { value, defaultValue = null, onValueChange, text, onCopy, onRegenerate, regenerating = false, reasons, onReason, hide, className, ...props },
  ref,
) {
  const [rating, setRating] = useControllableState<FeedbackValue>({ value, defaultValue, onChange: onValueChange });
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const rate = (next: Exclude<FeedbackValue, null>) => {
    const v = rating === next ? null : next;
    setRating(v);
    setReason(null);
    setMessage(v === "helpful" ? "Marked as helpful." : v === "not-helpful" ? "Marked as not helpful." : "Rating removed.");
  };
  const copy = async () => {
    try {
      if (text !== undefined) await navigator.clipboard?.writeText(text);
    } catch { /* clipboard blocked: still report through onCopy */ }
    onCopy?.(text);
    setCopied(true);
    setMessage("Copied to the clipboard.");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };
  const showCopy = !hide?.copy && (text !== undefined || !!onCopy);
  const showRegenerate = !hide?.regenerate && !!onRegenerate;
  const showRating = !hide?.rating;

  return (
    <div ref={ref} className={cx("faun-ai-feedback", className)} {...props}>
      <div role="group" aria-label="Response actions" className="faun-ai-feedback-bar">
        {showRating ? (
          <>
            <IconButton size="sm" icon={<IconThumbsUp />} label="Helpful" aria-pressed={rating === "helpful"} data-pressed={rating === "helpful" ? "" : undefined} onClick={() => rate("helpful")} />
            <IconButton size="sm" icon={<IconThumbsDown />} label="Not helpful" aria-pressed={rating === "not-helpful"} data-pressed={rating === "not-helpful" ? "" : undefined} onClick={() => rate("not-helpful")} />
          </>
        ) : null}
        {showCopy ? <IconButton size="sm" icon={copied ? <IconCheck /> : <IconCopy />} label={copied ? "Copied" : "Copy"} onClick={copy} /> : null}
        {showRegenerate ? <IconButton size="sm" icon={<IconRefresh />} label={regenerating ? "Regenerating" : "Regenerate"} disabled={regenerating} onClick={onRegenerate} /> : null}
      </div>
      {rating === "not-helpful" && reasons?.length ? (
        <div role="group" aria-label="What was wrong?" className="faun-ai-feedback-reasons">
          <span className="faun-ai-feedback-prompt">What was wrong?</span>
          {reasons.map((r) => (
            <FilterChip key={r} size="sm" selected={reason === r} onSelectedChange={(on) => { setReason(on ? r : null); if (on) { onReason?.(r); setMessage(`Thanks. Sent: ${r}.`); } }}>{r}</FilterChip>
          ))}
        </div>
      ) : null}
      <VisuallyHidden role="status">{message}</VisuallyHidden>
    </div>
  );
});
