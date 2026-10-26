import { forwardRef, useCallback, useEffect, useState, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx.js";
import { useComposedRefs } from "../../utils/compose-refs.js";
import { Tooltip } from "../Tooltip/Tooltip.js";

export interface TruncateProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The full text. Always kept in the DOM so it can be read, searched and copied. */
  children: string;
  /** Where the ellipsis goes. `end` for names and sentences, `middle` for identifiers and paths whose tail matters, `start` when the end matters most. */
  mode?: "end" | "middle" | "start";
  /** Show up to this many lines before cutting (`end` mode only). Default 1. */
  lines?: number;
  /** Characters kept after the ellipsis in `middle` mode. Default 8. */
  tail?: number;
  /** Show the full text in a tooltip, only while it is actually cut. The text becomes focusable then, so keyboard users can reach it. Default true. */
  tooltip?: boolean;
}

/** Shortens text to the room it has and gives the full text back on hover and focus. Use for table cells, tags, file names and ids. */
export const Truncate = forwardRef<HTMLSpanElement, TruncateProps>(function Truncate(
  { children, mode = "end", lines = 1, tail = 8, tooltip = true, className, ...props },
  forwarded,
) {
  const [el, setEl] = useState<HTMLSpanElement | null>(null);
  const ref = useComposedRefs(forwarded, setEl as (n: HTMLSpanElement | null) => void);
  const [cut, setCut] = useState(false);
  const measure = useCallback(() => {
    if (!el) return;
    const target = (mode === "middle" ? el.querySelector<HTMLElement>(".faun-truncate-head") : el) ?? el;
    setCut(lines > 1 && mode === "end" ? target.scrollHeight > target.clientHeight + 1 : target.scrollWidth > target.clientWidth + 1);
  }, [el, mode, lines]);
  useEffect(() => {
    measure();
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [el, measure, children]);

  const split = mode === "middle" && children.length > tail * 2 ? [children.slice(0, children.length - tail), children.slice(-tail)] : null;
  const node = (
    <span
      ref={ref}
      className={cx("faun-truncate", className)}
      data-mode={split || mode !== "middle" ? mode : "end"}
      data-cut={cut ? "" : undefined}
      style={lines > 1 && mode === "end" ? ({ "--_lines": lines } as React.CSSProperties) : undefined}
      tabIndex={tooltip && cut ? 0 : undefined}
      {...props}
    >
      {split ? (
        <>
          <span className="faun-visually-hidden">{children}</span>
          <span className="faun-truncate-head" aria-hidden="true">{split[0]}</span>
          <span className="faun-truncate-tail" aria-hidden="true">{split[1]}</span>
        </>
      ) : mode === "start" ? <bdi>{children}</bdi> : children}
    </span>
  );
  return tooltip ? <Tooltip content={children} disabled={!cut}>{node}</Tooltip> : node;
});
