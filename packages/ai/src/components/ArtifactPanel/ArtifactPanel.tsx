import { IconCheck, IconClose, IconCollapse, IconCopy, IconDownload, IconMaximize } from "@faun-ds/icons";
import { IconButton, Select, Tabs, TabsContent, TabsList, TabsTrigger, VisuallyHidden, cx, useControllableState } from "@faun-ds/react";
import { forwardRef, useEffect, useId, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { useChatLayout } from "../ChatLayout/ChatLayout.js";

export interface ArtifactVersion {
  id: string;
  /** What the person picks from: "v3, 10:42". */
  label: string;
}

export interface ArtifactPanelProps extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
  /** Name of the artifact: "ESRS E1-6 disclosure draft". It names the panel. */
  title: string;
  /** What kind of thing it is, shown above the title: "Document", "Table", "Chart". */
  kind?: string;
  /** The rendered artifact, shown on the Preview tab. */
  preview: ReactNode;
  /** The source, shown on the Code tab. A string is shown as preformatted text and is what Copy and Download use. Leave out to hide the tabs. */
  code?: ReactNode;
  /** Text that Copy and Download use. Defaults to `code` when that is a string. */
  copyText?: string;
  /** File name for Download. Default is the title with a .txt extension. */
  filename?: string;
  /** Replaces the built-in Download. Pass it to export something other than text. */
  onDownload?: () => void;
  /** Called after Copy succeeds. */
  onCopy?: () => void;
  /** Versions, newest first. A picker appears when there are two or more. */
  versions?: ArtifactVersion[];
  version?: string;
  defaultVersion?: string;
  onVersionChange?: (id: string) => void;
  tab?: "preview" | "code";
  defaultTab?: "preview" | "code";
  onTabChange?: (tab: "preview" | "code") => void;
  /** Close button and Escape while focus is inside. Required: a panel that cannot be closed traps people. */
  onClose: () => void;
  /** Width in pixels when standalone. Inside a ChatLayout the layout owns the width. */
  width?: number;
  defaultWidth?: number;
  onWidthChange?: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  /** Fill the layout. Inside a ChatLayout it covers the thread; standalone it fills the nearest positioned ancestor. */
  maximized?: boolean;
  defaultMaximized?: boolean;
  onMaximizedChange?: (maximized: boolean) => void;
  /** Move focus to the panel when it mounts, and give it back when it unmounts. Default true. */
  autoFocus?: boolean;
  /** Content between the title and the actions, e.g. a status badge. */
  meta?: ReactNode;
  /** Heading level of the title. Default 2. */
  headingLevel?: 2 | 3 | 4;
}

const STEP = 16;
const BIG_STEP = 64;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "artifact";

/**
 * A panel beside the conversation that shows what the agent made: a document, table or chart on a Preview tab and its
 * source on a Code tab, with a version picker, copy, download, maximise and close. Resizable by pointer and keyboard.
 * Escape closes it, or first restores a maximised panel. Under 768 px inside a ChatLayout it is a full-screen sheet.
 */
export const ArtifactPanel = forwardRef<HTMLElement, ArtifactPanelProps>(function ArtifactPanel(
  {
    title, kind, preview, code, copyText, filename, onDownload, onCopy, versions, version, defaultVersion, onVersionChange, tab, defaultTab = "preview", onTabChange, onClose,
    width: widthProp, defaultWidth = 560, onWidthChange, minWidth: minProp = 320, maxWidth: maxProp = 960, maximized: maxProp2, defaultMaximized = false, onMaximizedChange,
    autoFocus = true, meta, headingLevel = 2, className, style, onKeyDown, ...props
  },
  ref,
) {
  const layout = useChatLayout();
  const [ownWidth, setOwnWidth] = useControllableState<number>({ value: widthProp, defaultValue: defaultWidth, onChange: onWidthChange });
  const [ownMax, setOwnMax] = useControllableState<boolean>({ value: maxProp2, defaultValue: defaultMaximized, onChange: onMaximizedChange });
  const minWidth = layout?.minWidth ?? minProp;
  const maxWidth = layout?.maxWidth ?? maxProp;
  const width = clamp(layout ? layout.width : ownWidth, minWidth, maxWidth);
  const setWidth = (w: number) => (layout ? layout.setWidth(clamp(w, minWidth, maxWidth)) : setOwnWidth(clamp(w, minWidth, maxWidth)));
  const maximized = layout ? layout.maximized : ownMax;
  const setMaximized = (v: boolean) => { if (layout) layout.setMaximized(v); setOwnMax(v); };
  const compact = layout?.compact ?? false;
  const sheet = compact;

  const [currentTab, setTab] = useControllableState<"preview" | "code">({ value: tab, defaultValue: defaultTab, onChange: onTabChange });
  const [currentVersion, setVersion] = useControllableState<string>({ value: version, defaultValue: defaultVersion ?? versions?.[0]?.id ?? "", onChange: onVersionChange });
  const titleId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const H = `h${headingLevel}` as "h2";
  const text = copyText ?? (typeof code === "string" ? code : undefined);
  const hasCode = code !== undefined && code !== null && code !== false;

  // Focus in on mount, back to where it came from on unmount.
  useEffect(() => {
    if (!autoFocus) return;
    const before = document.activeElement as HTMLElement | null;
    headingRef.current?.focus({ preventScroll: true });
    return () => { if (before && before !== document.body && document.contains(before)) before.focus({ preventScroll: true }); };
  }, [autoFocus]);

  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<number>(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = async () => {
    if (text === undefined) return;
    let ok = true;
    try { await navigator.clipboard.writeText(text); } catch { ok = false; }
    setCopied(ok ? "copied" : "failed");
    if (ok) onCopy?.();
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied("idle"), 2000);
  };
  const download = () => {
    if (onDownload) return onDownload();
    if (text === undefined) return;
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename ?? `${slug(title)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const keyDown = (e: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(e);
    if (e.key !== "Escape") return;
    // Escape inside a menu or select popup belongs to that popup: its content is portalled outside this panel's DOM.
    if (!e.currentTarget.contains(e.target as Node)) return;
    e.stopPropagation();
    if (maximized && !sheet) setMaximized(false);
    else onClose();
  };

  // Resize: drag the handle on the panel's leading edge, or use the arrow keys.
  const drag = useRef<{ x: number; w: number; dir: 1 | -1 } | null>(null);
  const dirOf = (el: HTMLElement): 1 | -1 => (getComputedStyle(el).direction === "rtl" ? -1 : 1);
  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, w: width, dir: dirOf(e.currentTarget) };
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d) setWidth(d.w + (d.x - e.clientX) * d.dir);
  };
  const up = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const grow = dirOf(e.currentTarget) === 1 ? "ArrowLeft" : "ArrowRight";
    const shrink = grow === "ArrowLeft" ? "ArrowRight" : "ArrowLeft";
    const step = e.shiftKey ? BIG_STEP : STEP;
    let next: number | undefined;
    if (e.key === grow) next = width + step;
    else if (e.key === shrink) next = width - step;
    else if (e.key === "Home") next = minWidth;
    else if (e.key === "End") next = maxWidth;
    if (next === undefined) return;
    e.preventDefault();
    setWidth(next);
  };

  const showVersions = !!versions && versions.length > 1;
  const body = (
    <>
      <TabsContent value="preview" className="faun-artifact-pane">
        <div className="faun-artifact-preview" tabIndex={0} role="region" aria-label={`Preview of ${title}`}>{preview}</div>
      </TabsContent>
      {hasCode ? (
        <TabsContent value="code" className="faun-artifact-pane">
          {typeof code === "string" ? <pre className="faun-artifact-code" tabIndex={0} aria-label={`Code of ${title}`}><code>{code}</code></pre> : <div className="faun-artifact-preview" tabIndex={0} role="region" aria-label={`Code of ${title}`}>{code}</div>}
        </TabsContent>
      ) : null}
    </>
  );

  return (
    <section
      ref={ref}
      className={cx("faun-artifact-panel", className)}
      data-maximized={maximized ? "" : undefined}
      data-sheet={sheet ? "" : undefined}
      data-in-layout={layout ? "" : undefined}
      aria-labelledby={titleId}
      style={{ "--_w": `${width}px`, ...style } as CSSProperties}
      onKeyDown={keyDown}
      {...props}
    >
      {!sheet && !maximized ? (
        <div
          className="faun-artifact-resize"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize artifact panel"
          aria-valuenow={Math.round(width)}
          aria-valuemin={minWidth}
          aria-valuemax={maxWidth}
          tabIndex={0}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onKeyDown={handleKey}
        />
      ) : null}
      <header className="faun-artifact-head">
        <div className="faun-artifact-titles">
          {kind ? <p className="faun-artifact-kind">{kind}</p> : null}
          <H id={titleId} ref={headingRef} tabIndex={-1} className="faun-artifact-title">{title}</H>
        </div>
        {meta ? <div className="faun-artifact-meta">{meta}</div> : null}
        <div className="faun-artifact-actions" role="group" aria-label="Artifact actions">
          {showVersions ? (
            <Select size="sm" aria-label="Version" value={currentVersion} onValueChange={setVersion} options={versions.map((v) => ({ value: v.id, label: v.label }))} className="faun-artifact-version" />
          ) : null}
          {text !== undefined ? <IconButton size="sm" icon={copied === "copied" ? <IconCheck /> : <IconCopy />} label="Copy" onClick={copy} /> : null}
          {text !== undefined || onDownload ? <IconButton size="sm" icon={<IconDownload />} label="Download" onClick={download} /> : null}
          {!sheet ? <IconButton size="sm" icon={maximized ? <IconCollapse /> : <IconMaximize />} label={maximized ? "Restore panel size" : "Maximise panel"} aria-pressed={maximized} onClick={() => setMaximized(!maximized)} /> : null}
          <IconButton size="sm" icon={<IconClose />} label="Close artifact panel" onClick={onClose} />
        </div>
        <VisuallyHidden role="status" aria-live="polite">{copied === "copied" ? "Copied to the clipboard" : copied === "failed" ? "Copy failed" : ""}</VisuallyHidden>
      </header>
      {hasCode ? (
        <Tabs size="sm" className="faun-artifact-tabs" value={currentTab} onValueChange={(v) => setTab(v as "preview" | "code")}>
          <TabsList aria-label="View">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          {body}
        </Tabs>
      ) : (
        <div className="faun-artifact-tabs">
          <div className="faun-artifact-pane"><div className="faun-artifact-preview" tabIndex={0} role="region" aria-label={`Preview of ${title}`}>{preview}</div></div>
        </div>
      )}
    </section>
  );
});
