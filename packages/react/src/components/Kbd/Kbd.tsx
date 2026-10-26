import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx.js";

export interface KbdProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** One key ("Esc") or a combination: an array (["⌘", "K"]) or a "+"-joined string ("Ctrl+Shift+P"). */
  keys: string | string[];
  size?: "sm" | "md";
}

const NAMES: Record<string, string> = { "⌘": "Command", "⌥": "Option", "⇧": "Shift", "⌃": "Control", "↵": "Enter", "⌫": "Backspace", "↑": "Up arrow", "↓": "Down arrow", "←": "Left arrow", "→": "Right arrow", Esc: "Escape" };

/** A keyboard key or shortcut, e.g. in tooltips, menus and help text. */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd({ keys, size = "md", className, ...props }, ref) {
  const list = Array.isArray(keys) ? keys : keys.length > 1 && keys.includes("+") ? keys.split("+").map((k) => k.trim()) : [keys];
  const spoken = list.map((k) => NAMES[k] ?? k).join(" ");
  return (
    <kbd ref={ref} className={cx("faun-kbd-group", className)} data-size={size} role={list.length > 1 || NAMES[list[0]!] ? "group" : undefined} aria-label={list.length > 1 || NAMES[list[0]!] ? spoken : undefined} {...props}>
      {list.map((k, i) => <kbd key={i} className="faun-kbd" aria-hidden={list.length > 1 || NAMES[k] ? true : undefined}>{k}</kbd>)}
    </kbd>
  );
});
