import { IconChevronRight } from "@faun-ds/icons";
import { forwardRef, useCallback, useMemo, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { useControllableState } from "../../utils/use-controllable-state.js";

export interface TreeNode {
  id: string;
  label: ReactNode;
  /** Plain-text label for type-ahead when `label` is not a string. */
  textValue?: string;
  icon?: ReactNode;
  /** Trailing content: a count, a badge, a value. */
  meta?: ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
}

export interface TreeProps extends Omit<HTMLAttributes<HTMLUListElement>, "onChange"> {
  items: TreeNode[];
  /** Required accessible name, e.g. "Organisational boundary". */
  "aria-label": string;
  /** Expanded node ids (controlled). */
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  /** Selected node id (controlled). `null` for none. */
  selected?: string | null;
  defaultSelected?: string | null;
  onSelectedChange?: (id: string) => void;
  /** Draw indent guides. Default true. */
  guides?: boolean;
}

type Flat = { node: TreeNode; level: number; parent: string | null; pos: number; size: number };

function flatten(items: TreeNode[], open: Set<string>, level = 1, parent: string | null = null, out: Flat[] = []) {
  items.forEach((n, i) => {
    out.push({ node: n, level, parent, pos: i + 1, size: items.length });
    if (n.children?.length && open.has(n.id)) flatten(n.children, open, level + 1, n.id, out);
  });
  return out;
}
const text = (n: TreeNode) => (n.textValue ?? (typeof n.label === "string" ? n.label : "")).toLowerCase();

/** A hierarchy people expand and select from: entity boundaries, ESRS topics, folders. Full WAI-ARIA tree keyboard support. */
export const Tree = forwardRef<HTMLUListElement, TreeProps>(function Tree({ items, expanded, defaultExpanded = [], onExpandedChange, selected, defaultSelected = null, onSelectedChange, guides = true, className, ...props }, ref) {
  const [open, setOpen] = useControllableState<string[]>({ value: expanded, defaultValue: defaultExpanded, onChange: onExpandedChange });
  const [sel, setSel] = useControllableState<string | null>({ value: selected, defaultValue: defaultSelected, onChange: (v) => { if (v) onSelectedChange?.(v); } });
  const openSet = useMemo(() => new Set(open), [open]);
  const flat = useMemo(() => flatten(items, openSet), [items, openSet]);
  const [focusId, setFocusId] = useState<string | null>(null);
  const refs = useRef(new Map<string, HTMLLIElement>());
  const tabStop = focusId && flat.some((f) => f.node.id === focusId) ? focusId : sel && flat.some((f) => f.node.id === sel) ? sel : flat[0]?.node.id;

  const focus = useCallback((id: string) => { setFocusId(id); refs.current.get(id)?.focus(); }, []);
  const toggle = (id: string, to?: boolean) => {
    const isOpen = openSet.has(id);
    const next = to ?? !isOpen;
    if (next === isOpen) return;
    setOpen(next ? [...open, id] : open.filter((x) => x !== id));
  };

  const onKey = (e: KeyboardEvent<HTMLLIElement>, f: Flat) => {
    if (e.target !== e.currentTarget) return;
    const i = flat.findIndex((x) => x.node.id === f.node.id);
    const hasKids = !!f.node.children?.length;
    const isOpen = openSet.has(f.node.id);
    let handled = true;
    switch (e.key) {
      case "ArrowDown": if (flat[i + 1]) focus(flat[i + 1]!.node.id); break;
      case "ArrowUp": if (flat[i - 1]) focus(flat[i - 1]!.node.id); break;
      case "ArrowRight": if (hasKids && !isOpen) toggle(f.node.id, true); else if (hasKids && flat[i + 1]) focus(flat[i + 1]!.node.id); break;
      case "ArrowLeft": if (hasKids && isOpen) toggle(f.node.id, false); else if (f.parent) focus(f.parent); break;
      case "Home": if (flat[0]) focus(flat[0].node.id); break;
      case "End": if (flat.length) focus(flat[flat.length - 1]!.node.id); break;
      case "Enter": case " ": if (!f.node.disabled) setSel(f.node.id); break;
      case "*": setOpen([...new Set([...open, ...flat.filter((x) => x.parent === f.parent && x.node.children?.length).map((x) => x.node.id)])]); break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const k = e.key.toLowerCase();
          const order = [...flat.slice(i + 1), ...flat.slice(0, i + 1)];
          const hit = order.find((x) => text(x.node).startsWith(k));
          if (hit) focus(hit.node.id);
        } else handled = false;
    }
    if (handled) { e.preventDefault(); e.stopPropagation(); }
  };

  const render = (nodes: TreeNode[], level: number, parent: string | null): ReactNode =>
    nodes.map((n, i) => {
      const f: Flat = { node: n, level, parent, pos: i + 1, size: nodes.length };
      const hasKids = !!n.children?.length;
      const isOpen = openSet.has(n.id);
      const isSel = sel === n.id;
      return (
        <li
          key={n.id}
          ref={(el) => { if (el) refs.current.set(n.id, el); else refs.current.delete(n.id); }}
          role="treeitem"
          aria-level={level}
          aria-posinset={i + 1}
          aria-setsize={nodes.length}
          aria-expanded={hasKids ? isOpen : undefined}
          aria-selected={isSel}
          aria-disabled={n.disabled || undefined}
          tabIndex={tabStop === n.id ? 0 : -1}
          className="faun-tree-item"
          onKeyDown={(e) => onKey(e, f)}
          onFocus={(e) => { if (e.target === e.currentTarget) setFocusId(n.id); }}
        >
          <div
            className="faun-tree-row"
            data-selected={isSel ? "" : undefined}
            data-disabled={n.disabled ? "" : undefined}
            style={{ paddingInlineStart: `calc(${level - 1} * var(--_indent) + var(--faun-space-1))` }}
            onClick={() => { if (n.disabled) return; setSel(n.id); setFocusId(n.id); refs.current.get(n.id)?.focus(); }}
          >
            {guides ? Array.from({ length: level - 1 }, (_, g) => <span key={g} className="faun-tree-guide" style={{ insetInlineStart: `calc(${g} * var(--_indent) + var(--_indent) / 2 + var(--faun-space-1))` }} aria-hidden="true" />) : null}
            <span
              className="faun-tree-twisty"
              data-open={isOpen ? "" : undefined}
              aria-hidden="true"
              onClick={(e) => { if (hasKids) { e.stopPropagation(); toggle(n.id); } }}
            >
              {hasKids ? <IconChevronRight size="sm" /> : null}
            </span>
            {n.icon ? <span className="faun-tree-icon" aria-hidden="true">{n.icon}</span> : null}
            <span className="faun-tree-label">{n.label}</span>
            {n.meta ? <span className="faun-tree-meta">{n.meta}</span> : null}
          </div>
          {hasKids && isOpen ? <ul role="group" className="faun-tree-group">{render(n.children!, level + 1, n.id)}</ul> : null}
        </li>
      );
    });

  return (
    <ul ref={ref} role="tree" className={cx("faun-tree", className)} {...props}>
      {render(items, 1, null)}
    </ul>
  );
});
