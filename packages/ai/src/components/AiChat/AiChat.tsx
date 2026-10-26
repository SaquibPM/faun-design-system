import { Button, cx } from "@faun-ds/react";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import type { Actor, Citation, Confidence } from "../../utils/types.js";
import { ActorChip } from "../ActorChip/ActorChip.js";
import { AIFeedback, type AIFeedbackProps } from "../AiFeedback/AiFeedback.js";
import { AILabel, type AILabelProps } from "../AiLabel/AiLabel.js";
import { SourceList } from "../Citation/Citation.js";
import { StreamingText } from "../StreamingText/StreamingText.js";

export interface AIChatMessageProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** `assistant` is an agent's reply, marked as AI generated. `user` is the person's own message. */
  role: "assistant" | "user";
  /** Who is speaking. Always named: an assistant message shows the agent, a user message "You" or the person. */
  author: Actor;
  /** The message text. For an assistant message that is still arriving, pass the text so far and `state="streaming"`. */
  text?: string;
  /** Rich content in place of `text`: paragraphs with citation markers, a table, a card. */
  children?: ReactNode;
  /** `streaming` while the agent writes, `stopped` when a person stopped it, `complete` otherwise. Assistant messages only. */
  state?: "streaming" | "complete" | "stopped";
  onStop?: () => void;
  /** When it was sent, in words: "09:42". */
  time?: string;
  /** Sources the reply is grounded in, listed under it. */
  citations?: Citation[];
  confidence?: Confidence;
  /** Passed to the AI label's explanation: model, summary, actions. */
  explain?: Pick<AILabelProps, "model" | "summary" | "actions">;
  /** Rating, copy and regenerate controls under a completed assistant message. Pass `false` to omit them. */
  feedback?: Omit<AIFeedbackProps, "text"> | false;
}

/**
 * One message in a conversation with an agent. Replies carry the agent's name and the AI label with its explanation, stream calmly,
 * list their sources, and offer rating, copy and regenerate once complete. The person's own messages are plain and right-aligned.
 */
export const AIChatMessage = forwardRef<HTMLElement, AIChatMessageProps>(function AIChatMessage(
  { role, author, text, children, state = "complete", onStop, time, citations, confidence, explain, feedback, className, ...props },
  ref,
) {
  if (role === "user") {
    return (
      <article ref={ref} className={cx("faun-ai-message", className)} data-role="user" aria-label={`${author.name}${time ? `, ${time}` : ""}`} {...props}>
        <div className="faun-ai-message-bubble">{children ?? text}</div>
      </article>
    );
  }
  const done = state !== "streaming";
  return (
    <article ref={ref} className={cx("faun-ai-message", className)} data-role="assistant" data-state={state} aria-label={`${author.name}${time ? `, ${time}` : ""}`} {...props}>
      <header className="faun-ai-message-head">
        <ActorChip actor={author} size="sm" />
        <AILabel size="sm" kind="label" agent={author} confidence={confidence} sources={citations?.map((c) => c.source)} {...explain} />
        {time ? <span className="faun-ai-message-time">{time}</span> : null}
      </header>
      <div className="faun-ai-message-body">
        {children ?? <StreamingText text={text ?? ""} state={state} appearance="plain" onStop={onStop} />}
      </div>
      {citations?.length && done ? (
        <section className="faun-ai-message-sources" aria-label="Sources">
          <SourceList citations={citations} idPrefix={`${props.id ?? "message"}-source`} />
        </section>
      ) : null}
      {done && feedback !== false ? <AIFeedback text={text} {...feedback} /> : null}
    </article>
  );
});

export interface AIChatListProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Accessible name. Default "Conversation". */
  label?: string;
  children: ReactNode;
}

/**
 * The scrolling list of messages. It is a named log region that does not announce text as it arrives: each streaming reply
 * announces "Generating" and "Response complete" itself, so screen readers are not read every word.
 */
export const AIChatList = forwardRef<HTMLDivElement, AIChatListProps>(function AIChatList({ label = "Conversation", className, children, ...props }, ref) {
  return <div ref={ref} role="log" aria-live="off" aria-label={label} className={cx("faun-ai-chat-list", className)} {...props}>{children}</div>;
});

export interface AIPromptSuggestionsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Suggested prompts, short enough to read at a glance: "Summarise open approvals". */
  suggestions: string[];
  /** Called with the prompt when one is pressed. Put it in the composer, or send it. */
  onSelect: (prompt: string) => void;
  /** Accessible name of the group. Default "Suggested prompts". */
  label?: string;
}

/** A row of suggested prompts above or beside the composer. Pressing one hands the text back so you can fill the composer or send it. */
export const AIPromptSuggestions = forwardRef<HTMLDivElement, AIPromptSuggestionsProps>(function AIPromptSuggestions({ suggestions, onSelect, label = "Suggested prompts", className, ...props }, ref) {
  return (
    <div ref={ref} role="group" aria-label={label} className={cx("faun-ai-suggestions", className)} {...props}>
      {suggestions.map((s) => <Button key={s} size="sm" variant="outline" onClick={() => onSelect(s)}>{s}</Button>)}
    </div>
  );
});
