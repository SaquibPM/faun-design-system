import { IconPanelRight, IconTaskList } from "@faun-ds/icons";
import { IconButton, cx, useControllableState } from "@faun-ds/react";
import { createContext, forwardRef, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Container width below which the side panels become sheets over the conversation. */
const COMPACT_BELOW = 768;
/** The conversation never gets narrower than this when a panel is docked beside it. */
const THREAD_MIN = 360;

interface ChatLayoutContextValue {
  compact: boolean;
  width: number;
  setWidth: (w: number) => void;
  minWidth: number;
  maxWidth: number;
  maximized: boolean;
  setMaximized: (v: boolean) => void;
}
const ChatLayoutContext = createContext<ChatLayoutContextValue | null>(null);

/** Layout state for panels placed in a ChatLayout. Null outside one. */
export function useChatLayout() {
  return useContext(ChatLayoutContext);
}

export interface ChatLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The conversation: usually an `AIChatList` of messages. It scrolls; the header and composer stay put. */
  children: ReactNode;
  /** Above the conversation: the title of the chat and `ChatLayoutControls`. */
  header?: ReactNode;
  /** Below the conversation: usually a `PromptComposer`. */
  composer?: ReactNode;
  /** A docked `ProgressPanel`. Render it to open the panel, leave it out to close it. */
  progress?: ReactNode;
  /** An `ArtifactPanel`. Render it to open the panel, leave it out to close it. */
  artifact?: ReactNode;
  /** Width of the artifact column in pixels. Controlled. */
  artifactWidth?: number;
  defaultArtifactWidth?: number;
  onArtifactWidthChange?: (width: number) => void;
  /** Accessible name of the conversation region. Default "Chat". */
  label?: string;
}

/**
 * The frame of a conversation with an agent: the thread in the middle, a composer under it, and room beside it for a
 * progress panel and an artifact panel. Wide, the panels share one column on the right. Under 768 px wide they become
 * sheets over the thread and the thread goes inert.
 */
export const ChatLayout = forwardRef<HTMLDivElement, ChatLayoutProps>(function ChatLayout(
  { children, header, composer, progress, artifact, artifactWidth, defaultArtifactWidth = 560, onArtifactWidthChange, label = "Chat", className, style, ...props },
  ref,
) {
  const [rawWidth, setWidth] = useControllableState<number>({ value: artifactWidth, defaultValue: defaultArtifactWidth, onChange: onArtifactWidthChange });
  const [maximized, setMaximizedState] = useState(false);
  const [box, setBox] = useState(0);
  const el = useRef<HTMLDivElement | null>(null);

  useIsoLayoutEffect(() => {
    const node = el.current;
    if (!node) return;
    const read = () => setBox(node.getBoundingClientRect().width);
    read();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(read);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const compact = box > 0 && box < COMPACT_BELOW;
  const minWidth = 320;
  const maxWidth = Math.max(minWidth, box > 0 ? Math.floor(box - THREAD_MIN) : 960);
  const width = Math.min(maxWidth, Math.max(minWidth, rawWidth));
  const hasArtifact = !!artifact;
  const hasProgress = !!progress;
  const isMax = hasArtifact && maximized;
  const setMax = useCallback((v: boolean) => setMaximizedState(v), []);
  useEffect(() => { if (!hasArtifact) setMaximizedState(false); }, [hasArtifact]);

  const ctx = useMemo<ChatLayoutContextValue>(
    () => ({ compact, width, setWidth, minWidth, maxWidth, maximized: isMax, setMaximized: setMax }),
    [compact, width, setWidth, maxWidth, isMax, setMax],
  );
  const covered = (hasArtifact || hasProgress) && compact ? true : isMax;

  return (
    <ChatLayoutContext.Provider value={ctx}>
      <div
        ref={(n) => { el.current = n; if (typeof ref === "function") ref(n); else if (ref) ref.current = n; }}
        className={cx("faun-chat-layout", className)}
        data-compact={compact ? "" : undefined}
        data-progress={hasProgress ? "" : undefined}
        data-artifact={hasArtifact ? "" : undefined}
        data-maximized={isMax ? "" : undefined}
        style={{ "--_panel-w": hasArtifact ? `${width}px` : undefined, ...style } as CSSProperties}
        {...props}
      >
        <section className="faun-chat-main" aria-label={label} inert={covered || undefined}>
          {header ? <header className="faun-chat-header">{header}</header> : null}
          <div className="faun-chat-scroll" tabIndex={-1}>
            <div className="faun-chat-thread">{children}</div>
          </div>
          {composer ? <div className="faun-chat-composer">{composer}</div> : null}
        </section>
        {hasProgress || hasArtifact ? (
          <div className="faun-chat-panels">
            {hasProgress ? <div className="faun-chat-slot" data-panel="progress">{progress}</div> : null}
            {hasArtifact ? <div className="faun-chat-slot" data-panel="artifact">{artifact}</div> : null}
          </div>
        ) : null}
      </div>
    </ChatLayoutContext.Provider>
  );
});

export interface ChatLayoutControlsProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange"> {
  progressOpen: boolean;
  onProgressOpenChange: (open: boolean) => void;
  artifactOpen: boolean;
  onArtifactOpenChange: (open: boolean) => void;
  /** Turn a toggle off when there is nothing to show, e.g. no artifact yet. */
  progressDisabled?: boolean;
  artifactDisabled?: boolean;
}

/** Two toggle buttons for the header of a ChatLayout: show or hide the progress panel and the artifact panel. */
export const ChatLayoutControls = forwardRef<HTMLDivElement, ChatLayoutControlsProps>(function ChatLayoutControls(
  { progressOpen, onProgressOpenChange, artifactOpen, onArtifactOpenChange, progressDisabled, artifactDisabled, className, ...props },
  ref,
) {
  return (
    <div ref={ref} role="group" aria-label="Panels" className={cx("faun-chat-controls", className)} {...props}>
      <IconButton icon={<IconTaskList />} label={progressOpen ? "Hide progress panel" : "Show progress panel"} aria-pressed={progressOpen} data-pressed={progressOpen || undefined} disabled={progressDisabled} onClick={() => onProgressOpenChange(!progressOpen)} />
      <IconButton icon={<IconPanelRight />} label={artifactOpen ? "Hide artifact panel" : "Show artifact panel"} aria-pressed={artifactOpen} data-pressed={artifactOpen || undefined} disabled={artifactDisabled} onClick={() => onArtifactOpenChange(!artifactOpen)} />
    </div>
  );
});
