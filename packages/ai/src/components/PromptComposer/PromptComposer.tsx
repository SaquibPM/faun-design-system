import { IconArrowRight, IconStop } from "@faun-ds/icons";
import { IconButton, Textarea, cx, useControllableState } from "@faun-ds/react";
import { forwardRef, useId, type FormHTMLAttributes, type KeyboardEvent, type ReactNode } from "react";

export interface PromptComposerProps extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "children" | "defaultValue"> {
  /** Controlled text. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called with the trimmed text when the person sends. Uncontrolled composers clear themselves afterwards. */
  onSend?: (value: string) => void;
  /** Called when the person presses Stop while `running`. */
  onStop?: () => void;
  /** An agent is answering. Replaces Send with Stop and keeps the text the person is typing next. */
  running?: boolean;
  /** Accessible name of the text box. Default "Message". */
  label?: string;
  placeholder?: string;
  /** Files and context already added, shown above the text: tags, file rows, evidence chips. */
  attachments?: ReactNode;
  /** Controls at the start of the toolbar, e.g. an attach button or a model picker. */
  actions?: ReactNode;
  /** Small text under the box, e.g. what the agent can see. */
  hint?: ReactNode;
  /** `enter` (default): Enter sends, Shift+Enter adds a line. `mod-enter`: Ctrl or Cmd+Enter sends and Enter adds a line. */
  submitKey?: "enter" | "mod-enter";
  /** Allow sending with no text, for example when attachments alone are the message. */
  allowEmpty?: boolean;
  maxLength?: number;
  disabled?: boolean;
}

/**
 * Where a person tells an agent what to do: an auto-growing text box, a slot for attachments and tools,
 * and Send that becomes Stop while the agent answers.
 */
export const PromptComposer = forwardRef<HTMLFormElement, PromptComposerProps>(function PromptComposer(
  { value, defaultValue = "", onValueChange, onSend, onStop, running = false, label = "Message", placeholder, attachments, actions, hint, submitKey = "enter", allowEmpty = false, maxLength, disabled = false, className, ...props },
  ref,
) {
  const [text, setText] = useControllableState<string>({ value, defaultValue, onChange: onValueChange });
  const hintId = useId();
  const trimmed = text.trim();
  const canSend = !disabled && !running && (allowEmpty || trimmed.length > 0);

  const send = () => {
    if (!canSend) return;
    onSend?.(trimmed);
    if (value === undefined) setText("");
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
    const wants = submitKey === "enter" ? !e.shiftKey && !e.altKey : e.metaKey || e.ctrlKey;
    if (!wants) return;
    e.preventDefault();
    send();
  };
  const shortcut = submitKey === "enter" ? "Enter" : "Ctrl+Enter";

  return (
    <form ref={ref} className={cx("faun-composer", className)} data-running={running || undefined} data-disabled={disabled || undefined} onSubmit={(e) => { e.preventDefault(); send(); }} {...props}>
      {attachments ? <div className="faun-composer-attachments">{attachments}</div> : null}
      <Textarea
        wrapperClassName="faun-composer-field"
        aria-label={label}
        aria-describedby={hint ? hintId : undefined}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        autoGrow
        minRows={1}
        maxRows={8}
        maxLength={maxLength}
        disabled={disabled}
      />
      <div className="faun-composer-bar">
        <div className="faun-composer-actions">{actions}</div>
        {running ? (
          <IconButton variant="solid" intent="neutral" icon={<IconStop />} label="Stop" onClick={onStop} />
        ) : (
          <IconButton type="submit" variant="solid" intent="accent" icon={<IconArrowRight />} label="Send" shortcut={shortcut} disabled={!canSend} />
        )}
      </div>
      {hint ? <p id={hintId} className="faun-composer-hint">{hint}</p> : null}
    </form>
  );
});
