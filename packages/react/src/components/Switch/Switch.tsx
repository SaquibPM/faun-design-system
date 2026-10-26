import * as RS from "@radix-ui/react-switch";
import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { useFieldControl, type ControlStateProps } from "../Field/Field.js";

export interface SwitchProps extends Omit<ComponentPropsWithoutRef<typeof RS.Root>, "children">, Omit<ControlStateProps, "warn"> {
  /** Visible label. Describe the setting, not the action ("Email me when a run fails", not "Turn on"). */
  label?: ReactNode;
  description?: ReactNode;
  /** Put the switch after the label, for settings lists. Default "start". */
  labelPosition?: "start" | "end";
  size?: "sm" | "md";
}

/** Turns a setting on or off immediately, with no separate save step. */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { label, description, labelPosition = "start", size = "md", readOnly, skeleton, className, id, onClick, ...rest },
  ref,
) {
  const auto = useId();
  const { invalid: _invalid, state, ...props } = useFieldControl({ ...rest, id, "aria-invalid": rest["aria-invalid"] === true || rest["aria-invalid"] === "true" || undefined }, { readOnly, skeleton });
  const controlId = props.id ?? `faun-switch-${auto}`;
  const descId = description ? `${controlId}-desc` : undefined;
  const control = (
    <RS.Root
      ref={ref}
      {...props}
      id={controlId}
      aria-describedby={[props["aria-describedby"], descId].filter(Boolean).join(" ") || undefined}
      className={cx("faun-switch", !label && className)}
      aria-readonly={state.readOnly || undefined}
      data-size={size}
      data-readonly={state.readOnly ? "" : undefined}
      data-skeleton={state.skeleton ? "" : undefined}
      onClick={(e) => { if (state.readOnly) e.preventDefault(); onClick?.(e); }}
    >
      <RS.Thumb className="faun-switch-thumb" />
    </RS.Root>
  );
  if (!label) return control;
  return (
    <div className={cx("faun-switch-row", className)} data-label-position={labelPosition} data-disabled={props.disabled && !state.skeleton ? "" : undefined} data-skeleton={state.skeleton ? "" : undefined}>
      {control}
      <div className="faun-switch-text">
        <label htmlFor={controlId} className="faun-switch-label">{label}</label>
        {description ? <p id={descId} className="faun-switch-description">{description}</p> : null}
      </div>
    </div>
  );
});
