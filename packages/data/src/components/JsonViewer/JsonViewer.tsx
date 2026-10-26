import { IconCheck, IconChevronDown, IconChevronRight, IconCopy } from "@faun-ds/icons";
import { Button, cx, IconButton, VisuallyHidden } from "@faun-ds/react";
import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";

export interface JsonViewerProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Any JSON-serialisable value. */
  data: unknown;
  /** Accessible name for the viewer, for example "Agent run payload". Required. */
  label: string;
  /** Depth that starts expanded. 0 collapses the root; 1 (default) shows the first level. */
  defaultExpandedDepth?: number;
  /** Shows the copy, expand all and collapse all controls. Default true. */
  toolbar?: boolean;
  /** Maximum height of the scroll area as a CSS length. */
  maxHeight?: string;
  /** Called after the JSON text is copied. */
  onCopied?: (text: string) => void;
}

type Mode = { depth: number; version: number };
type Node = { path: string; depth: number; mode: Mode; overrides: Record<string, boolean>; toggle: (path: string, open: boolean) => void };

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function Primitive({ value }: { value: unknown }) {
  if (value === null) return <span className="faun-json-null">null</span>;
  if (typeof value === "string") return <span className="faun-json-string">&quot;{value}&quot;</span>;
  if (typeof value === "number") return <span className="faun-json-number">{String(value)}</span>;
  if (typeof value === "boolean") return <span className="faun-json-bool">{String(value)}</span>;
  return <span className="faun-json-null">{String(value)}</span>;
}

function Entry({ name, value, node, last, isIndex }: { name?: string; value: unknown; node: Node; last: boolean; isIndex?: boolean }) {
  const key = name !== undefined ? (
    <>
      <span className={isIndex ? "faun-json-index" : "faun-json-key"}>{isIndex ? name : `"${name}"`}</span>
      <span className="faun-json-punct">: </span>
    </>
  ) : null;
  const comma = last ? null : <span className="faun-json-punct">,</span>;
  const container = Array.isArray(value) || isObj(value);
  if (!container) return <li className="faun-json-line">{key}<Primitive value={value} />{comma}</li>;

  const isArr = Array.isArray(value);
  const entries: [string, unknown][] = isArr ? (value as unknown[]).map((v, i) => [String(i), v]) : Object.entries(value as Record<string, unknown>);
  const [open, close] = isArr ? ["[", "]"] : ["{", "}"];
  const expanded = node.overrides[node.path] ?? node.depth < node.mode.depth;
  const count = `${entries.length} ${isArr ? (entries.length === 1 ? "item" : "items") : entries.length === 1 ? "key" : "keys"}`;
  const labelText = name !== undefined ? (isIndex ? `item ${name}` : name) : "root";
  return (
    <li className="faun-json-line" data-container="">
      <button type="button" className="faun-json-toggle" aria-expanded={expanded} aria-label={`${labelText}, ${count}`} onClick={() => node.toggle(node.path, !expanded)}>
        {expanded ? <IconChevronDown size="sm" /> : <IconChevronRight size="sm" />}
      </button>
      {key}
      <span className="faun-json-punct">{open}</span>
      {expanded && entries.length > 0 ? (
        <>
          <ul className="faun-json-children">
            {entries.map(([k, v], i) => (
              <Entry key={k} name={k} isIndex={isArr} value={v} last={i === entries.length - 1} node={{ ...node, path: `${node.path}/${k}`, depth: node.depth + 1 }} />
            ))}
          </ul>
          <span className="faun-json-punct faun-json-close">{close}</span>
        </>
      ) : (
        <>
          {entries.length > 0 ? <span className="faun-json-summary">{count}</span> : null}
          <span className="faun-json-punct">{close}</span>
        </>
      )}
      {comma}
    </li>
  );
}

/** Shows a JSON value as a collapsible tree in the mono face, with copy, expand all and collapse all. */
export const JsonViewer = forwardRef<HTMLDivElement, JsonViewerProps>(function JsonViewer(
  { data, label, defaultExpandedDepth = 1, toolbar = true, maxHeight, onCopied, className, ...props },
  ref,
) {
  const [mode, setMode] = useState<Mode>({ depth: defaultExpandedDepth, version: 0 });
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const setAll = (depth: number) => { setOverrides({}); setMode((m) => ({ depth, version: m.version + 1 })); };
  const copy = async () => {
    const text = JSON.stringify(data, null, 2) ?? "";
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard unavailable: still report so the caller can fall back */ }
    onCopied?.(text);
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };
  const root: ReactNode = (
    <Entry value={data} last node={{ path: "$", depth: 0, mode, overrides, toggle: (p, o) => setOverrides((s) => ({ ...s, [p]: o })) }} />
  );
  return (
    <div ref={ref} className={cx("faun-json", className)} role="group" aria-label={label} {...props}>
      {toolbar ? (
        <div className="faun-json-toolbar">
          <Button size="sm" variant="ghost" onClick={() => setAll(Infinity)}>Expand all</Button>
          <Button size="sm" variant="ghost" onClick={() => setAll(1)}>Collapse all</Button>
          <IconButton size="sm" label={copied ? "Copied" : "Copy JSON"} icon={copied ? <IconCheck /> : <IconCopy />} onClick={copy} tooltip={false} />
        </div>
      ) : null}
      <div className="faun-json-scroll" tabIndex={0} role="region" aria-label={`${label} contents`} style={maxHeight ? { maxBlockSize: maxHeight } : undefined}>
        <ul className="faun-json-tree">{root}</ul>
      </div>
      <VisuallyHidden role="status">{copied ? "Copied JSON to clipboard" : ""}</VisuallyHidden>
    </div>
  );
});
