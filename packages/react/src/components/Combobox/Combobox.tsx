import * as RP from "@radix-ui/react-popover";
import { IconChevronDown, IconClose, IconAdd } from "@faun-ds/icons";
import { forwardRef, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import type { Size } from "../../utils/types.js";
import { useControllableState } from "../../utils/use-controllable-state.js";
import { useFieldControl, type ControlStateProps } from "../Field/Field.js";
import { groupOptions, OptionContent, type ListOption } from "../Listbox/listbox.js";
import { Spinner } from "../Spinner/Spinner.js";
import { VisuallyHidden } from "../../utils/visually-hidden.js";

export type ComboboxOption = ListOption;

export interface ComboboxProps extends ControlStateProps {
  options: ComboboxOption[];
  /** Selected option value. With `allowCustomValue` it can also be text that is not in `options`. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  /** @deprecated The field itself is now the search input, so there is no separate search box. Accepted so existing code keeps compiling; ignored. */
  searchPlaceholder?: string;
  /** Shown when nothing matches. Say what to do next. */
  emptyMessage?: ReactNode;
  /** Shows a spinner in the list, e.g. while `onSearchChange` fetches. */
  loading?: boolean;
  /** Called as the user types (and with "" when the list closes). Pair with `filter={false}` for server-side search. */
  onSearchChange?: (search: string) => void;
  /** Filter options locally as people type (default true). Turn off when the server filters. */
  filter?: boolean;
  /** Show a clear button when there is a value or text. */
  clearable?: boolean;
  /**
   * Lets people commit text that is not in `options`: on Enter, on blur, or by choosing the "Use ..." row. `onValueChange` then receives the typed text.
   * Off by default, so the value is always one of the options. Typed text that matches no option is discarded on blur.
   */
  allowCustomValue?: boolean;
  /** Label of the row that commits typed text when `allowCustomValue` is on. Default: Use "text". */
  customValueLabel?: (text: string) => string;
  size?: Size;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  icon?: ReactNode;
  "aria-label"?: string;
  "aria-describedby"?: string;
  className?: string;
  contentClassName?: string;
}

const norm = (s: string) => s.toLocaleLowerCase();

/**
 * A text field with a list of suggestions: type to filter, arrow keys to move, Enter to choose. Picks one value from a long list (factors, suppliers, entities, agents),
 * and with `allowCustomValue` accepts a value that is not in the list.
 */
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  {
    options, value, defaultValue = null, onValueChange, placeholder = "Select", emptyMessage = "No matches", loading, onSearchChange, filter = true, clearable,
    allowCustomValue, customValueLabel = (t) => `Use “${t}”`, size = "md", invalid, warn, skeleton, readOnly, disabled, required, id, icon, className, contentClassName,
    searchPlaceholder: _unused, ...aria
  },
  ref,
) {
  const listId = useId();
  const { invalid: isInvalid, state, ...control } = useFieldControl({ id, disabled, required, "aria-invalid": invalid || undefined, ...aria }, { warn, readOnly, skeleton });
  const [selected, setSelected] = useControllableState<string | null>({ value, defaultValue, onChange: onValueChange });
  const [open, setOpen] = useState(false);
  /** Text the person has typed since the field was focused; null while the field just shows the selection. */
  const [draft, setDraft] = useState<string | null>(null);
  const [active, setActive] = useState(-1);
  const [navigated, setNavigated] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement | null>(null);
  const setRefs = (el: HTMLInputElement | null) => {
    input.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) (ref as { current: HTMLInputElement | null }).current = el;
  };
  const inert = !!control.disabled || state.readOnly;

  const current = options.find((o) => o.value === selected);
  const selectedText = current?.label ?? (allowCustomValue && selected ? selected : "");
  const text = draft ?? selectedText;
  const query = draft ?? "";

  const visible = useMemo(() => {
    const q = norm(query.trim());
    if (!filter || !q) return options;
    return options.filter((o) => [o.label, o.description ?? "", ...(o.keywords ?? [])].some((s) => norm(s).includes(q)));
  }, [options, filter, query]);
  const exact = options.find((o) => norm(o.label) === norm(query.trim()));
  const showCustom = !!allowCustomValue && query.trim() !== "" && !exact;
  const rows = useMemo(() => {
    const list: { key: string; option?: ComboboxOption; custom?: true }[] = visible.map((o) => ({ key: o.value, option: o }));
    if (showCustom) list.push({ key: "__custom", custom: true });
    return list;
  }, [visible, showCustom]);
  const optionId = (i: number) => `${listId}-opt-${i}`;
  const firstEnabled = (from = 0, dir = 1) => {
    for (let i = from; i >= 0 && i < rows.length; i += dir) if (!rows[i]!.option?.disabled) return i;
    return -1;
  };
  const activeRow = rows[active];

  // Keep the highlighted row valid as the list changes, and in view.
  useEffect(() => {
    if (!open) return;
    setActive((a) => {
      if (a >= 0 && a < rows.length && !rows[a]!.option?.disabled) return a;
      const sel = draft === null ? rows.findIndex((r) => r.option?.value === selected) : -1;
      return sel >= 0 ? sel : firstEnabled();
    });
  }, [open, rows]);
  useEffect(() => {
    if (open && active >= 0) document.getElementById(optionId(active))?.scrollIntoView?.({ block: "nearest" });
  }, [open, active]);

  const close = () => { setOpen(false); setNavigated(false); };
  const openList = () => { if (!inert && !open) { setOpen(true); } };
  const type = (s: string) => { setDraft(s); setNavigated(false); setOpen(true); onSearchChange?.(s); };
  const choose = (o: ComboboxOption) => { setSelected(o.value); setDraft(null); close(); onSearchChange?.(""); };
  const commitCustom = (s: string) => { setSelected(s); setDraft(null); close(); onSearchChange?.(""); };
  const clear = () => { setSelected(null); setDraft(null); close(); onSearchChange?.(""); input.current?.focus(); };

  /** Resolve typed text when the field is left or Enter is pressed with nothing highlighted. */
  const settle = () => {
    if (draft === null) return;
    const t = draft.trim();
    if (t === "") { if (selected !== null) setSelected(null); setDraft(null); }
    else if (exact) { setSelected(exact.value); setDraft(null); }
    else if (allowCustomValue) { setSelected(t); setDraft(null); }
    else setDraft(null); // discard: the field shows the selection again
    onSearchChange?.("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (inert) return;
    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        if (!open) { setOpen(true); return; }
        setNavigated(true);
        setActive((a) => { const n = firstEnabled(a + 1, 1); return n === -1 ? firstEnabled() : n; });
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        if (!open) { setOpen(true); return; }
        setNavigated(true);
        setActive((a) => { const n = firstEnabled(a - 1, -1); return n === -1 ? firstEnabled(rows.length - 1, -1) : n; });
        break;
      }
      case "Home": if (open && navigated) { e.preventDefault(); setActive(firstEnabled()); } break;
      case "End": if (open && navigated) { e.preventDefault(); setActive(firstEnabled(rows.length - 1, -1)); } break;
      case "Enter": {
        if (!open) return;
        e.preventDefault();
        // With custom values on, typed text wins until the person has moved to a row on purpose.
        const useRow = activeRow && (navigated || !allowCustomValue || activeRow.custom);
        if (useRow && activeRow.option) choose(activeRow.option);
        else if (useRow && activeRow.custom) commitCustom(query.trim());
        else { settle(); close(); }
        break;
      }
      case "Escape":
        if (open) { e.preventDefault(); e.stopPropagation(); close(); setDraft(null); onSearchChange?.(""); }
        else if (draft !== null) { e.preventDefault(); setDraft(null); }
        break;
      case "Tab": if (open) close(); break;
    }
  };

  const hasValue = !!selectedText || (draft ?? "") !== "";
  const showClear = !!clearable && hasValue && !inert;
  const count = rows.filter((r) => r.option).length;

  return (
    <RP.Root open={open && !inert} onOpenChange={(o) => { if (!o) close(); }}>
      <RP.Anchor asChild>
        <div
          ref={anchor}
          className={cx("faun-input", "faun-combobox", className)}
          data-size={size}
          data-open={open ? "" : undefined}
          data-disabled={control.disabled && !state.skeleton ? "" : undefined}
          {...state.attrs}
        >
          {icon || current?.icon ? <span className="faun-input-affix" aria-hidden="true">{current?.icon ?? icon}</span> : null}
          <input
            ref={setRefs}
            id={control.id}
            type="text"
            role="combobox"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="faun-input-control"
            aria-expanded={open && !inert}
            aria-controls={open && !inert ? listId : undefined}
            aria-haspopup="listbox"
            aria-autocomplete={filter ? "list" : "none"}
            aria-activedescendant={open && !inert && active >= 0 ? optionId(active) : undefined}
            aria-label={aria["aria-label"]}
            aria-describedby={control["aria-describedby"]}
            aria-invalid={isInvalid || undefined}
            aria-required={"aria-required" in control ? control["aria-required"] : required || undefined}
            aria-busy={loading || state.skeleton || undefined}
            disabled={control.disabled}
            readOnly={state.readOnly}
            aria-readonly={state.readOnly || undefined}
            placeholder={placeholder}
            value={text}
            onChange={(e) => type(e.target.value)}
            onKeyDown={onKeyDown}
            onClick={openList}
            onBlur={() => { settle(); close(); }}
          />
          {showClear ? (
            <button type="button" className="faun-combobox-button" aria-label={current ? `Clear ${current.label}` : "Clear"} onMouseDown={(e) => e.preventDefault()} onClick={clear}><IconClose /></button>
          ) : null}
          <button
            type="button"
            className="faun-combobox-button"
            tabIndex={-1}
            aria-label={open ? "Hide options" : "Show options"}
            aria-expanded={open && !inert}
            aria-controls={open && !inert ? listId : undefined}
            disabled={control.disabled}
            data-readonly-hide={state.readOnly ? "" : undefined}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { if (inert) return; input.current?.focus(); setOpen((o) => !o); }}
          >
            <IconChevronDown />
          </button>
        </div>
      </RP.Anchor>
      <RP.Portal>
        <RP.Content
          className={cx("faun-listbox-panel", "faun-combobox-panel", contentClassName)}
          role="presentation"
          align="start"
          sideOffset={6}
          collisionPadding={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => { if (anchor.current?.contains(e.target as Node)) e.preventDefault(); }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div id={listId} role="listbox" aria-label={aria["aria-label"] ?? placeholder} className="faun-listbox-list">
            {loading ? <div className="faun-listbox-loading" role="presentation"><Spinner size="sm" label={null} />Loading</div> : null}
            {!loading && rows.length === 0 ? <div className="faun-listbox-empty" role="presentation">{emptyMessage}</div> : null}
            {groupOptions(visible).map(([group, list]) => {
              const items = list.map((o) => {
                const i = rows.findIndex((r) => r.option === o);
                return (
                  <div
                    key={o.value}
                    id={optionId(i)}
                    role="option"
                    aria-selected={o.value === selected}
                    aria-disabled={o.disabled || undefined}
                    className="faun-listbox-option"
                    data-highlighted={i === active ? "" : undefined}
                    data-checked={o.value === selected || undefined}
                    onMouseMove={() => { if (!o.disabled && i !== active) setActive(i); }}
                    onClick={() => { if (!o.disabled) choose(o); }}
                  >
                    <OptionContent option={o} selected={o.value === selected} />
                  </div>
                );
              });
              return group ? (
                <div key={group} role="group" aria-label={group} className="faun-combobox-group">
                  <div className="faun-listbox-group-label" aria-hidden="true">{group}</div>
                  {items}
                </div>
              ) : <div key="_" role="presentation">{items}</div>;
            })}
            {showCustom ? (
              <div
                id={optionId(rows.length - 1)}
                role="option"
                aria-selected={false}
                className="faun-listbox-option faun-combobox-custom"
                data-highlighted={rows.length - 1 === active ? "" : undefined}
                onMouseMove={() => setActive(rows.length - 1)}
                onClick={() => commitCustom(query.trim())}
              >
                <span className="faun-listbox-option-icon" aria-hidden="true"><IconAdd /></span>
                <span className="faun-listbox-option-text"><span className="faun-listbox-option-label">{customValueLabel(query.trim())}</span></span>
              </div>
            ) : null}
          </div>
        </RP.Content>
      </RP.Portal>
      <VisuallyHidden role="status" aria-live="polite">{open && !loading ? (count === 0 && !showCustom ? "No matches" : `${count} ${count === 1 ? "option" : "options"} available`) : ""}</VisuallyHidden>
    </RP.Root>
  );
});
