import { IconClose, IconSearch } from "@faun-ds/icons";
import { forwardRef, useRef, type InputHTMLAttributes, type KeyboardEvent } from "react";
import { cx } from "../../utils/cx.js";
import { useComposedRefs } from "../../utils/compose-refs.js";
import type { Size } from "../../utils/types.js";
import { useControllableState } from "../../utils/use-controllable-state.js";
import { useFieldControl, type ControlStateProps } from "../Field/Field.js";
import { Spinner } from "../Spinner/Spinner.js";

export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size" | "type">, ControlStateProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called on Enter. Use for search that runs on submit rather than as you type. */
  onSearch?: (value: string) => void;
  /** Keyboard hint shown while empty, e.g. "/" or "⌘K". Display only: wire the shortcut yourself. */
  shortcut?: string;
  /** Show a spinner while results load. */
  loading?: boolean;
  size?: Size;
  wrapperClassName?: string;
}

/** Filters a list or searches a collection. Escape clears; the clear button returns focus to the field. */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { value, defaultValue = "", onValueChange, onSearch, shortcut, loading, size = "md", warn, skeleton, readOnly, className, wrapperClassName, onKeyDown, placeholder = "Search", ...rest },
  forwarded,
) {
  const inner = useRef<HTMLInputElement>(null);
  const ref = useComposedRefs(forwarded, inner);
  const { invalid: _invalid, state, ...props } = useFieldControl({ ...rest, "aria-invalid": rest["aria-invalid"] === true || rest["aria-invalid"] === "true" || undefined }, { warn, readOnly, skeleton });
  const [q, setQ] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const clear = () => { setQ(""); inner.current?.focus(); };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === "Escape" && q && !state.readOnly) { e.preventDefault(); e.stopPropagation(); setQ(""); }
    if (e.key === "Enter") onSearch?.(q);
  };
  return (
    <div className={cx("faun-input", "faun-search-field", wrapperClassName)} data-size={size} {...state.attrs} data-disabled={props.disabled && !state.skeleton ? "" : undefined}>
      <span className="faun-input-affix" data-side="prefix" aria-hidden="true">{loading ? <Spinner size="sm" label={null} /> : <IconSearch />}</span>
      <input
        aria-label={props["aria-label"] ?? (props.id ? undefined : placeholder)}
        {...props}
        ref={ref}
        readOnly={state.readOnly}
        type="search"
        placeholder={placeholder}
        className={cx("faun-input-control", className)}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={onKey}
      />
      {q && !props.disabled && !state.readOnly ? (
        <button type="button" className="faun-search-field-clear" aria-label="Clear search" onClick={clear}><IconClose /></button>
      ) : shortcut ? (
        <kbd className="faun-search-field-kbd" aria-hidden="true">{shortcut}</kbd>
      ) : null}
    </div>
  );
});
