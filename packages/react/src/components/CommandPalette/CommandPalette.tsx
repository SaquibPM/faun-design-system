import * as RD from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { IconSearch } from "@faun-ds/icons";
import { forwardRef, useEffect, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { Kbd } from "../Kbd/Kbd.js";
import { groupOptions, OptionContent, type ListOption } from "../Listbox/listbox.js";

export interface CommandPaletteItem extends ListOption {
  /** Called when the person picks the command, by Enter or click. The palette closes afterwards. */
  onSelect?: () => void;
  /** Shortcut shown at the end of the row, e.g. ["⌘", "N"]. Display only: bind the key yourself. */
  shortcut?: string | string[];
}

export interface CommandPaletteProps {
  /** Commands and destinations. Use `group` to section them ("Navigate", "Actions", "Recent runs"). */
  items: CommandPaletteItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Open and close with ⌘K or Ctrl+K from anywhere in the page. Default true. */
  hotkey?: boolean;
  /** Accessible name of the dialog. Default "Command palette". */
  label?: string;
  placeholder?: string;
  /** Shown when nothing matches. Say what to do next. */
  emptyMessage?: ReactNode;
  /** Filter locally (default true). Turn off when you search on the server. */
  filter?: boolean;
  /** Called as the person types. */
  onSearchChange?: (search: string) => void;
  /** Footer hint row. Pass `null` to remove it. */
  footer?: ReactNode;
  className?: string;
}

/** Search-first launcher for pages, agents, runs and actions. Opens with ⌘K, filters as you type, runs the highlighted command on Enter. */
export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(function CommandPalette(
  { items, open, onOpenChange, hotkey = true, label = "Command palette", placeholder = "Search pages, agents and actions", emptyMessage = "Nothing matches. Try an agent name or a filing.", filter = true, onSearchChange, footer, className },
  ref,
) {
  useEffect(() => {
    if (!hotkey || !onOpenChange) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [hotkey, onOpenChange, open]);

  return (
    <RD.Root open={open} onOpenChange={onOpenChange}>
      <RD.Portal>
        <RD.Overlay className="faun-dialog-scrim" />
        <RD.Content ref={ref} className={cx("faun-command-palette", className)} aria-describedby={undefined}>
          <RD.Title className="faun-visually-hidden">{label}</RD.Title>
          <Command shouldFilter={filter} loop label={label}>
            <div className="faun-listbox-search faun-command-palette-search">
              <IconSearch />
              <Command.Input placeholder={placeholder} onValueChange={onSearchChange} />
              <Kbd keys="Esc" size="sm" />
            </div>
            <Command.List className="faun-listbox-list faun-command-palette-list">
              <Command.Empty className="faun-listbox-empty">{emptyMessage}</Command.Empty>
              {groupOptions(items).map(([group, list]) => (
                <Command.Group key={group ?? "_"} heading={group} className="faun-command-palette-group">
                  {list.map((o) => (
                    <Command.Item
                      key={o.value}
                      value={o.value}
                      keywords={[o.label, ...(o.keywords ?? []), o.description ?? ""]}
                      disabled={o.disabled}
                      className="faun-listbox-option"
                      onSelect={() => { o.onSelect?.(); onOpenChange?.(false); }}
                    >
                      <OptionContent option={o} />
                      {o.shortcut ? <span className="faun-command-palette-shortcut"><Kbd keys={o.shortcut} size="sm" /></span> : null}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
            {footer !== null ? (
              <div className="faun-listbox-footer">
                {footer ?? (<><span>Navigate with the arrow keys</span><span className="faun-command-palette-hint">Run with <Kbd keys="↵" size="sm" /></span></>)}
              </div>
            ) : null}
          </Command>
        </RD.Content>
      </RD.Portal>
    </RD.Root>
  );
});
