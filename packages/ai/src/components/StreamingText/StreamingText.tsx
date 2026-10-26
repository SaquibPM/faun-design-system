import { IconAiSparkle, IconStop } from "@faun-ds/icons";
import { Button, StatusBadge, cx } from "@faun-ds/react";
import { forwardRef, useRef, type HTMLAttributes } from "react";
import { usePrefersReducedMotion } from "../../utils/use-reduced-motion.js";
import type { Actor } from "../../utils/types.js";
import { ActorChip } from "../ActorChip/ActorChip.js";

/** How many of the newest chunks keep their fade-in element. Older text is merged into one text node. */
const LIVE_CHUNKS = 12;

export interface StreamingTextProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** All the text received so far. Pass the growing string; only the newly added part animates. */
  text: string;
  /** `streaming` while text may still arrive, `complete` when done, `stopped` when a person stopped it. Default `complete`. */
  state?: "streaming" | "complete" | "stopped";
  /** Shows a "Stop generating" button while streaming. Call your abort here and set `state="stopped"`. */
  onStop?: () => void;
  /** The agent that is writing. Named above the text so generated content is never anonymous. */
  agent?: Actor;
  /** `draft` (default) marks the text as generated and not yet accepted; `plain` for transcripts that already attribute each message. */
  appearance?: "draft" | "plain";
}

type Parts = { head: string; tail: { at: number; text: string }[]; seen: string };

function advance(prev: Parts, text: string): Parts {
  if (prev.seen === text) return prev;
  if (!text.startsWith(prev.seen)) return { head: "", tail: [{ at: 0, text }], seen: text };
  const tail = [...prev.tail, { at: prev.seen.length, text: text.slice(prev.seen.length) }];
  const overflow = tail.length - LIVE_CHUNKS;
  if (overflow <= 0) return { head: prev.head, tail, seen: text };
  return { head: prev.head + tail.slice(0, overflow).map((t) => t.text).join(""), tail: tail.slice(overflow), seen: text };
}

/**
 * Text that arrives while an agent writes. Calm by design: new words fade in softly, nothing shifts,
 * screen readers hear "Generating" and "Response complete" instead of every word, and the person can stop it.
 * With reduced motion the text simply appears.
 */
export const StreamingText = forwardRef<HTMLDivElement, StreamingTextProps>(function StreamingText(
  { text, state = "complete", onStop, agent, appearance = "draft", className, ...props },
  ref,
) {
  const reduced = usePrefersReducedMotion();
  const parts = useRef<Parts>({ head: "", tail: [], seen: "" });
  const streamed = useRef(false);
  parts.current = advance(parts.current, text);
  const streaming = state === "streaming";
  if (streaming) streamed.current = true;
  const animate = streaming && !reduced;
  const announce = streaming ? "Generating response" : streamed.current ? (state === "stopped" ? "Generation stopped" : "Response complete") : "";

  return (
    <div ref={ref} className={cx("faun-streaming", className)} data-state={state} data-appearance={appearance} {...props}>
      {agent || streaming ? (
        <div className="faun-streaming-head">
          {agent ? <span className="faun-streaming-by"><IconAiSparkle size="sm" className="faun-streaming-spark" aria-hidden="true" />{appearance === "draft" ? "Drafted by" : "From"} <ActorChip actor={agent} size="sm" /></span> : <span />}
          {streaming ? <StatusBadge size="sm" domain="task" state="in_progress" label="Writing" /> : null}
        </div>
      ) : null}
      <div className="faun-streaming-text" aria-busy={streaming}>
        {animate ? (
          <>
            {parts.current.head}
            {parts.current.tail.map((t) => <span key={t.at} className="faun-streaming-chunk">{t.text}</span>)}
          </>
        ) : text}
        {streaming ? <span className="faun-streaming-caret" aria-hidden="true" /> : null}
      </div>
      <span className="faun-visually-hidden" role="status">{announce}</span>
      {streaming && onStop ? (
        <div className="faun-streaming-actions">
          <Button size="sm" leadingIcon={<IconStop />} onClick={onStop}>Stop generating</Button>
        </div>
      ) : null}
      {state === "stopped" ? (
        <p className="faun-streaming-note">
          <StatusBadge size="sm" domain="run" state="cancelled" label="Stopped" />
          <span>You stopped this response. The text above is incomplete.</span>
        </p>
      ) : null}
    </div>
  );
});
