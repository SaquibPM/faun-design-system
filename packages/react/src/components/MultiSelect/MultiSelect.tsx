import * as RP from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { IconCheck, IconChevronsUpDown, IconClose, IconSearch } from "@faun-ds/icons";
import { forwardRef, useId, useState, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import type { Size } from "../../utils/types.js";
import { useControllableState } from "../../utils/use-controllable-state.js";
import { useFieldControl, type ControlStateProps } from "../Field/Field.js";
import { groupOptions, OptionContent, type ListOption } from "../Listbox/listbox.js";
import { Spinner } from "../Spinner/Spinner.js";

export type MultiSelectOption = ListOption;

export interface MultiSelectProps extends ControlStateProps {
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: ReactNode;
  loading?: boolean;
  onSearchChange?: (search: string) => void;
  filter?: boolean;
  /** Chips shown before collapsing into "+N". Default 3. */
  maxVisible?: number;
  /** Show "Select all" and "Clear" in the panel footer. Default true. */
  bulkActions?: boolean;
  size?: Size;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  className?: string;
  contentClassName?: string;
}

/** Picks several values from a list: frameworks, sites, scopes. Selected values show as removable chips. */
export const MultiSelect = forwardRef<HTMLButtonElement, MultiSelectProps>(function MultiSelect(
  { options, value, defaultValue = [], onValueChange, placeholder = "Select", searchPlaceholder = "Search", emptyMessage = "No matches", loading, onSearchChange, filter = true, maxVisible = 3, bulkActions = true, size = "md", invalid, warn, skeleton, readOnly, disabled, required, id, className, contentClassName, ...aria },
  ref,
) {
  const listId = useId();
  const { invalid: isInvalid, state, ...control } = useFieldControl({ id, disabled, required, "aria-invalid": invalid || undefined, ...aria }, { warn, readOnly, skeleton });
  const [selected, setSelected] = useControllableState<string[]>({ value, defaultValue, onChange: onValueChange });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const chosen = options.filter((o) => selected.includes(o.value));
  const visible = chosen.slice(0, maxVisible);
  const hidden = chosen.length - visible.length;
  const toggle = (v: string) => setSelected(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  const enabled = options.filter((o) => !o.disabled).map((o) => o.value);
  const summary = chosen.length ? `${chosen.length} selected: ${chosen.map((c) => c.label).join(", ")}` : placeholder;
  return (
    <RP.Root open={open && !state.readOnly} onOpenChange={(o) => { if (state.readOnly) return; setOpen(o); if (!o) { setSearch(""); onSearchChange?.(""); } }}>
      <RP.Anchor asChild>
        <div
          className={cx("faun-field-trigger", "faun-multi-select", className)}
          data-size={size}
          {...state.attrs}
          data-disabled={control.disabled && !state.skeleton ? "" : undefined}
          data-state={open ? "open" : "closed"}
        >
          {visible.length ? (
            <ul className="faun-multi-select-chips" aria-label="Selected">
              {visible.map((o) => (
                <li key={o.value} className="faun-multi-select-chip">
                  <span>{o.label}</span>
                  {!control.disabled && !state.readOnly ? (
                    <button type="button" aria-label={`Remove ${o.label}`} onClick={() => toggle(o.value)}><IconClose /></button>
                  ) : null}
                </li>
              ))}
              {hidden > 0 ? <li className="faun-multi-select-more" title={chosen.slice(maxVisible).map((c) => c.label).join(", ")}>+{hidden}</li> : null}
            </ul>
          ) : null}
          <RP.Trigger asChild disabled={control.disabled}>
            <button
              ref={ref}
              type="button"
              role="combobox"
              id={control.id}
              aria-expanded={open && !state.readOnly}
              aria-controls={open ? listId : undefined}
              aria-haspopup="listbox"
              aria-label={aria["aria-label"]}
              aria-describedby={control["aria-describedby"]}
              aria-invalid={isInvalid || undefined}
              aria-readonly={state.readOnly || undefined}
              aria-busy={state.skeleton || undefined}
              aria-required={("aria-required" in control ? control["aria-required"] : required || undefined)}
              disabled={control.disabled}
              className="faun-multi-select-trigger"
            >
              <span className="faun-field-trigger-value" data-placeholder={chosen.length ? undefined : ""}>
                {chosen.length ? <span className="faun-visually-hidden">{summary}</span> : placeholder}
              </span>
              <span className="faun-field-trigger-icon" aria-hidden="true"><IconChevronsUpDown /></span>
            </button>
          </RP.Trigger>
        </div>
      </RP.Anchor>
      <RP.Portal>
        <RP.Content className={cx("faun-listbox-panel", contentClassName)} align="start" sideOffset={6} collisionPadding={8} onOpenAutoFocus={(e) => e.preventDefault()}>
          <Command shouldFilter={filter} loop label={aria["aria-label"] ?? placeholder}>
            <div className="faun-listbox-search">
              <IconSearch />
              <Command.Input autoFocus value={search} onValueChange={(s) => { setSearch(s); onSearchChange?.(s); }} placeholder={searchPlaceholder} />
            </div>
            <Command.List id={listId} className="faun-listbox-list" aria-multiselectable="true">
              {loading ? <Command.Loading><div className="faun-listbox-loading"><Spinner size="sm" label={null} />Loading</div></Command.Loading> : null}
              {!loading ? <Command.Empty className="faun-listbox-empty">{emptyMessage}</Command.Empty> : null}
              {groupOptions(options).map(([group, list]) => (
                <Command.Group key={group ?? "_"} heading={group} className="faun-combobox-group">
                  {list.map((o) => {
                    const on = selected.includes(o.value);
                    return (
                      <Command.Item key={o.value} value={o.value} keywords={[o.label, ...(o.keywords ?? []), o.description ?? ""]} disabled={o.disabled} className="faun-listbox-option" onSelect={() => toggle(o.value)} aria-checked={on} data-checked={on || undefined}>
                        <OptionContent option={o} indicator={<span className="faun-multi-select-box" data-on={on ? "" : undefined} aria-hidden="true">{on ? <IconCheck /> : null}</span>} />
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              ))}
            </Command.List>
            {bulkActions ? (
              <div className="faun-listbox-footer">
                <span>{chosen.length} of {options.length} selected</span>
                <span className="faun-multi-select-actions">
                  <button type="button" onClick={() => setSelected(Array.from(new Set([...selected, ...enabled])))}>Select all</button>
                  <button type="button" onClick={() => setSelected([])} disabled={!chosen.length}>Clear</button>
                </span>
              </div>
            ) : null}
          </Command>
        </RP.Content>
      </RP.Portal>
    </RP.Root>
  );
});
