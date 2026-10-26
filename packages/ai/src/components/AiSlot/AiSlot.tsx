import { IconCheck, IconEdit, IconUndo } from "@faun-ds/icons";
import { Button, VisuallyHidden, cx } from "@faun-ds/react";
import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { AILabel, type AILabelProps } from "../AiLabel/AiLabel.js";

export type AISlotState = "suggested" | "accepted" | "edited";

export interface AISlotProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * `suggested`: the AI proposed this and nobody has accepted it. It is tinted and has Accept and Edit.
   * `accepted`: kept as generated. The tint goes; the label stays.
   * `edited`: the person changed the AI content. The label says so and Revert puts the original back.
   */
  state: AISlotState;
  /** What the label says in each state. Defaults: "AI suggested", "AI generated", "AI generated, edited". */
  labels?: Partial<Record<AISlotState, string>>;
  /** Explainability for the AILabel: agent, model, sources, confidence, summary, actions. */
  explain?: Pick<AILabelProps, "agent" | "model" | "summary" | "confidence" | "sources" | "actions">;
  /** The person accepts the suggestion as it is. */
  onAccept?: () => void;
  /** The person wants to change it. Focus moves to the control inside; update `state` to `edited` when its value changes. */
  onEdit?: () => void;
  /** Puts the original AI content back. Update your value and set `state` to `accepted`. */
  onRevert?: () => void;
  acceptLabel?: string;
  editLabel?: string;
  revertLabel?: string;
  /** `field` wraps an input, textarea or select. `block` wraps a tile, card or paragraph and gives it room. */
  kind?: "field" | "block";
  /** The control or content that holds the AI value: a Field with an Input, a Textarea, a Tile, text. */
  children: ReactNode;
}

const DEFAULT_LABELS: Record<AISlotState, string> = { suggested: "AI suggested", accepted: "AI generated", edited: "AI generated, edited" };
const MESSAGES: Record<AISlotState, string> = { suggested: "", accepted: "Suggestion accepted.", edited: "Edited. You can revert to the AI version." };

/**
 * Makes AI-written content in a form or a page visibly different from content a person wrote, and gives the person three ways to respond:
 * accept it, edit it, or revert an edit to the AI original. The tint says "not yet accepted"; the label stays after, so the origin is never lost.
 */
export const AISlot = forwardRef<HTMLDivElement, AISlotProps>(function AISlot(
  { state, labels, explain, onAccept, onEdit, onRevert, acceptLabel = "Accept", editLabel = "Edit", revertLabel = "Revert to AI version", kind = "field", className, children, ...props },
  ref,
) {
  const body = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setMessage(MESSAGES[state]);
  }, [state]);
  const text = { ...DEFAULT_LABELS, ...labels }[state];

  const edit = () => {
    onEdit?.();
    body.current?.querySelector<HTMLElement>("input:not([type=hidden]), textarea, select, [contenteditable=true]")?.focus();
  };

  return (
    <div ref={ref} className={cx("faun-ai-slot", className)} data-state={state} data-kind={kind} {...props}>
      <div className="faun-ai-slot-head">
        <AILabel size="sm" text={text} onRevert={state === "edited" ? onRevert : undefined} revertLabel={revertLabel} modified={state === "edited"} {...explain} />
      </div>
      <div ref={body} className="faun-ai-slot-body">{children}</div>
      {state === "suggested" || state === "edited" ? (
        <div className="faun-ai-slot-actions">
          {state === "suggested" ? (
            <>
              <Button size="sm" variant="solid" intent="accent" leadingIcon={<IconCheck />} onClick={onAccept}>{acceptLabel}</Button>
              <Button size="sm" variant="outline" leadingIcon={<IconEdit />} onClick={edit}>{editLabel}</Button>
            </>
          ) : (
            <Button size="sm" variant="ghost" leadingIcon={<IconUndo />} onClick={onRevert}>{revertLabel}</Button>
          )}
        </div>
      ) : null}
      <VisuallyHidden role="status">{message}</VisuallyHidden>
    </div>
  );
});
