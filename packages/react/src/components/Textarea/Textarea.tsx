import { useId, forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState, type TextareaHTMLAttributes } from "react";
import { cx } from "../../utils/cx.js";
import { useComposedRefs } from "../../utils/compose-refs.js";
import { useFieldControl, type ControlStateProps } from "../Field/Field.js";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, ControlStateProps {
  /** Grow with the content between `minRows` and `maxRows`. */
  autoGrow?: boolean;
  minRows?: number;
  maxRows?: number;
  /** Who can resize: `vertical` (default) or `none`. Auto-grow sets `none`. */
  resize?: "vertical" | "none";
  /** Show "120 / 500" under the box. Requires `maxLength` to show the limit. */
  showCount?: boolean;
  invalid?: boolean;
  /** Class for the outer wrapper. */
  wrapperClassName?: string;
}

/** Multi-line text: narratives, notes for the audit trail, prompts. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { autoGrow, minRows = 3, maxRows = 12, resize = "vertical", showCount, invalid, warn, skeleton, readOnly, className, wrapperClassName, onChange, value, defaultValue, maxLength, rows, ...rest },
  forwarded,
) {
  const inner = useRef<HTMLTextAreaElement>(null);
  const ref = useComposedRefs(forwarded, inner);
  const { invalid: _invalid, state, ...props } = useFieldControl({ ...rest, "aria-invalid": invalid || undefined }, { warn, readOnly, skeleton });
  const [count, setCount] = useState(() => String(value ?? defaultValue ?? "").length);
  const autoId = useId();
  const countId = showCount ? `${props.id ?? autoId}-count` : undefined;
  const near = !!maxLength && count >= maxLength * 0.9;

  const fit = useCallback(() => {
    const el = inner.current;
    if (!el || !autoGrow) return;
    const cs = getComputedStyle(el);
    const line = parseFloat(cs.lineHeight) || 22;
    const pad = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
    el.style.height = "auto";
    const min = minRows * line + pad;
    const max = maxRows * line + pad;
    const next = Math.min(max, Math.max(min, el.scrollHeight));
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [autoGrow, minRows, maxRows]);

  useIsoLayoutEffect(() => { fit(); }, [fit, value]);
  useEffect(() => { if (value !== undefined) setCount(String(value).length); }, [value]);

  return (
    <div className={cx("faun-textarea", wrapperClassName)} {...state.attrs} data-disabled={props.disabled && !state.skeleton ? "" : undefined}>
      <textarea
        {...props}
        readOnly={state.readOnly}
        ref={ref}
        className={cx("faun-textarea-control", className)}
        rows={autoGrow ? minRows : (rows ?? minRows)}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        data-resize={autoGrow ? "none" : resize}
        aria-describedby={[props["aria-describedby"], countId].filter(Boolean).join(" ") || undefined}
        onChange={(e) => { setCount(e.target.value.length); fit(); onChange?.(e); }}
      />
      {showCount ? (
        <div className="faun-textarea-count" data-over={maxLength && count >= maxLength ? "" : undefined}>
          <span id={countId}>{maxLength ? `${count.toLocaleString()} / ${maxLength.toLocaleString()}` : count.toLocaleString()}<span className="faun-visually-hidden"> characters</span></span>
          <span className="faun-visually-hidden" aria-live="polite">{near && maxLength ? `${Math.max(0, maxLength - count)} characters left` : ""}</span>
        </div>
      ) : null}
    </div>
  );
});
