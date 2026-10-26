import * as RTG from "@radix-ui/react-toggle-group";
import { forwardRef, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import type { Size } from "../../utils/types.js";
import { useControllableState } from "../../utils/use-controllable-state.js";

export interface SegmentedOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  /** Accessible name when the item shows only an icon. */
  "aria-label"?: string;
}

export interface SegmentedControlProps {
  options: SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Accessible name for the group, e.g. "Chart view". */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  size?: Size;
  /** Stretch items to fill the container. */
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

/** Switches between 2–5 views of the same content, e.g. Table · Chart, or Monthly · Quarterly · Annual. One option is always selected. */
export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(function SegmentedControl(
  { options, value, defaultValue, onValueChange, size = "md", fullWidth, disabled, className, ...aria },
  ref,
) {
  const [current, setCurrent] = useControllableState<string>({ value, defaultValue: defaultValue ?? options[0]?.value ?? "", onChange: onValueChange });
  return (
    <RTG.Root
      ref={ref}
      type="single"
      className={cx("faun-segmented", className)}
      data-size={size}
      data-full-width={fullWidth ? "" : undefined}
      value={current}
      onValueChange={(v) => { if (v) setCurrent(v); }}
      disabled={disabled}
      {...aria}
    >
      {options.map((o) => (
        <RTG.Item key={o.value} value={o.value} disabled={o.disabled} className="faun-segmented-item" aria-label={o["aria-label"]}>
          {o.icon ? <span className="faun-segmented-icon" aria-hidden="true">{o.icon}</span> : null}
          {o.label != null && o.label !== "" ? <span className="faun-segmented-label">{o.label}</span> : null}
        </RTG.Item>
      ))}
    </RTG.Root>
  );
});
