import { IconChevronDown, IconChevronUp } from "@faun-ds/icons";
import { forwardRef, useCallback, useEffect, useId, useState, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { useComposedRefs } from "../../utils/compose-refs.js";
import { useControllableState } from "../../utils/use-controllable-state.js";

export interface ShowMoreProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children: ReactNode;
  /** Lines shown while collapsed. Default 3. */
  lines?: number;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Button text while collapsed. Name what is hidden when you can: "Show all 12 sources". Default "Show more". */
  moreLabel?: string;
  /** Button text while expanded. Default "Show less". */
  lessLabel?: string;
}

/** Collapses long content to a few lines with a toggle. The toggle only appears when the content is actually cut. The full content stays in the page for screen readers. */
export const ShowMore = forwardRef<HTMLDivElement, ShowMoreProps>(function ShowMore(
  { children, lines = 3, expanded, defaultExpanded = false, onExpandedChange, moreLabel = "Show more", lessLabel = "Show less", className, ...props },
  forwarded,
) {
  const id = useId();
  const [open, setOpen] = useControllableState<boolean>({ value: expanded, defaultValue: defaultExpanded, onChange: onExpandedChange });
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwarded, setEl as (n: HTMLDivElement | null) => void);
  const [cut, setCut] = useState(false);
  const measure = useCallback(() => {
    if (el && !open) setCut(el.scrollHeight > el.clientHeight + 1);
  }, [el, open]);
  useEffect(() => {
    measure();
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [el, measure, children]);
  const showToggle = open || cut;
  return (
    <div className={cx("faun-show-more", className)} data-expanded={open ? "" : undefined} {...props}>
      <div ref={ref} id={id} className="faun-show-more-content" style={open ? undefined : ({ "--_lines": lines } as React.CSSProperties)}>{children}</div>
      {showToggle ? (
        <button type="button" className="faun-show-more-toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
          {open ? lessLabel : moreLabel}
          {open ? <IconChevronUp size="sm" aria-hidden="true" /> : <IconChevronDown size="sm" aria-hidden="true" />}
        </button>
      ) : null}
    </div>
  );
});
