import { IconAiSparkle, IconUndo } from "@faun-ds/icons";
import { Button, Popover, PopoverContent, PopoverTrigger, cx } from "@faun-ds/react";
import { forwardRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import type { Actor, Citation, Confidence, Source } from "../../utils/types.js";
import { ActorChip } from "../ActorChip/ActorChip.js";
import { SourceList } from "../Citation/Citation.js";
import { ConfidenceBadge } from "../ConfidenceBadge/ConfidenceBadge.js";

export interface AILabelProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** `label` shows the sparkle and the words (default). `icon` is the sparkle alone, for dense cells and field corners. */
  kind?: "label" | "icon";
  size?: "sm" | "md";
  /** Visible words with `kind="label"`. Default "AI generated". Use "AI suggested" for content a person has not accepted. */
  text?: string;
  /** The agent that produced the content. Named in the explanation. */
  agent?: Actor;
  /** The model behind the agent, as a version string: "narrative-drafter 2026-09". */
  model?: string;
  /** One or two sentences on how the content was produced. */
  summary?: ReactNode;
  confidence?: Confidence;
  /** What the content is grounded in. */
  sources?: Source[];
  /** The person changed the content after it was generated. Controls whether Revert is available. Default true when `onRevert` is set. */
  modified?: boolean;
  /** Puts the original AI content back. Adds a revert action to the explanation. */
  onRevert?: () => void;
  revertLabel?: string;
  /** Extra actions in the explanation footer, e.g. a link to the method. */
  actions?: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * The marker for AI-generated content, and the way to ask why. It names the content as AI generated and opens an explanation:
 * which agent and model, how confident, what it is grounded in, and, if the person has edited it, how to go back to the original.
 */
export const AILabel = forwardRef<HTMLButtonElement, AILabelProps>(function AILabel(
  { kind = "label", size = "md", text = "AI generated", agent, model, summary, confidence, sources, modified, onRevert, revertLabel = "Revert to original", actions, side = "bottom", align = "start", open, defaultOpen, onOpenChange, className, ...props },
  ref,
) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen ?? false);
  const isOpen = open ?? uncontrolled;
  const setOpen = (v: boolean) => { if (open === undefined) setUncontrolled(v); onOpenChange?.(v); };
  const canRevert = !!onRevert;
  const unchanged = modified === false;
  const citations: Citation[] = (sources ?? []).map((source, i) => ({ index: i + 1, source }));
  const name = kind === "icon" ? `${text}. Show details` : undefined;
  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          className={cx("faun-ai-label", className)}
          data-kind={kind}
          data-size={size}
          aria-label={name}
          {...props}
        >
          <IconAiSparkle size={size === "sm" ? "xs" : "sm"} aria-hidden="true" />
          {kind === "label" ? <span className="faun-ai-label-text">{text}</span> : null}
        </button>
      </PopoverTrigger>
      <PopoverContent size="md" side={side} align={align} className="faun-ai-label-card" aria-label={`About this AI content`}>
        <div className="faun-ai-label-head">
          <IconAiSparkle size="sm" aria-hidden="true" />
          <p className="faun-ai-label-title">{text}</p>
        </div>
        {summary ? <p className="faun-ai-label-summary">{summary}</p> : null}
        {agent || model || confidence ? (
          <dl className="faun-ai-label-facts">
            {agent ? <><dt>Agent</dt><dd><ActorChip actor={agent} size="sm" /></dd></> : null}
            {model ? <><dt>Model</dt><dd><code className="faun-ai-label-model">{model}</code></dd></> : null}
            {confidence ? <><dt>Confidence</dt><dd><ConfidenceBadge confidence={confidence} showScore size="sm" /></dd></> : null}
          </dl>
        ) : null}
        {confidence?.reason ? <p className="faun-ai-label-reason">{confidence.reason}</p> : null}
        {citations.length ? (
          <section className="faun-ai-label-sources" aria-label="Sources">
            <h3 className="faun-ai-label-subtitle">{citations.length === 1 ? "1 source" : `${citations.length} sources`}</h3>
            <SourceList citations={citations} idPrefix="ai-label-source" />
          </section>
        ) : null}
        {canRevert || actions ? (
          <div className="faun-ai-label-actions">
            {canRevert ? (
              <Button size="sm" variant="outline" leadingIcon={<IconUndo />} disabled={unchanged} onClick={() => { onRevert?.(); setOpen(false); }}>
                {revertLabel}
              </Button>
            ) : null}
            {canRevert && unchanged ? <span className="faun-ai-label-note">Matches the original.</span> : null}
            {actions}
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
});
