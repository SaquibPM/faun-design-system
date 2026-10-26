import * as RS from "@radix-ui/react-slider";
import { forwardRef, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { useControllableState } from "../../utils/use-controllable-state.js";
import { useField, useFieldControl, type ControlStateProps } from "../Field/Field.js";

export interface SliderMark {
  value: number;
  label?: ReactNode;
}

export interface SliderProps extends ControlStateProps {
  /** One value for a single thumb, two for a range. */
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  /** Fires once when the user releases the thumb. Use for expensive updates. */
  onValueCommit?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Minimum distance between range thumbs, in steps. */
  minStepsBetweenThumbs?: number;
  /** Ticks under the track, optionally labelled. Pass `true` for a tick at every step. */
  marks?: SliderMark[] | true;
  /** Show the current value. "always" floats it above each thumb; "inline" puts it beside the label row. Default "inline". */
  showValue?: "inline" | "always" | "none";
  /** Formats values for labels and screen readers, e.g. (v) => `${v}%`. */
  formatValue?: (value: number) => string;
  /** Accessible names for each thumb in a range, e.g. ["Minimum", "Maximum"]. */
  thumbLabels?: string[];
  disabled?: boolean;
  invalid?: boolean;
  orientation?: "horizontal" | "vertical";
  name?: string;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  className?: string;
}

/** Chooses a value or a range on a continuous scale: a threshold, a confidence cut-off, a year span. */
export const Slider = forwardRef<HTMLSpanElement, SliderProps>(function Slider(
  { value, defaultValue, onValueChange, onValueCommit, min = 0, max = 100, step = 1, minStepsBetweenThumbs = 0, marks, showValue = "inline", formatValue = String, thumbLabels, disabled, invalid, warn, readOnly, skeleton, orientation = "horizontal", name, id, className, ...aria },
  ref,
) {
  const field = useField();
  const { invalid: _invalid, state, ...control } = useFieldControl({ id, disabled, "aria-invalid": invalid || undefined, "aria-describedby": aria["aria-describedby"] }, { warn, readOnly, skeleton });
  const [current, setCurrent] = useControllableState<number[]>({ value, defaultValue: defaultValue ?? [min], onChange: onValueChange });
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const ticks: SliderMark[] = marks === true
    ? Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => ({ value: min + i * step }))
    : marks ?? [];
  const text = current.map(formatValue).join(" – ");
  return (
    <div className={cx("faun-slider", className)} data-orientation={orientation} data-show-value={showValue} data-disabled={control.disabled && !state.skeleton ? "" : undefined} {...state.attrs} data-has-labels={ticks.some((t) => t.label != null) ? "" : undefined}>
      {showValue === "inline" ? <output className="faun-slider-output" htmlFor={control.id} aria-live="off">{text}</output> : null}
      <RS.Root
        ref={ref}
        className="faun-slider-root"
        value={current}
        onValueChange={(v) => { if (!state.readOnly) setCurrent(v); }}
        onValueCommit={(v) => { if (!state.readOnly) onValueCommit?.(v); }}
        min={min}
        max={max}
        step={step}
        minStepsBetweenThumbs={minStepsBetweenThumbs}
        disabled={control.disabled}
        orientation={orientation}
        name={name}
      >
        <RS.Track className="faun-slider-track">
          <RS.Range className="faun-slider-range" />
        </RS.Track>
        {current.map((v, i) => (
          <RS.Thumb
            key={i}
            id={i === 0 ? control.id : undefined}
            className="faun-slider-thumb"
            aria-label={thumbLabels?.[i] ?? (current.length > 1 ? (i === 0 ? "Minimum" : "Maximum") : aria["aria-label"])}
            aria-labelledby={!aria["aria-label"] && current.length === 1 && field ? field.labelId : undefined}
            aria-describedby={control["aria-describedby"]}
            aria-invalid={control["aria-invalid"]}
            aria-readonly={state.readOnly || undefined}
            aria-valuetext={formatValue(v)}
          >
            {showValue === "always" ? <span className="faun-slider-bubble" aria-hidden="true">{formatValue(v)}</span> : null}
          </RS.Thumb>
        ))}
      </RS.Root>
      {ticks.length ? (
        <div className="faun-slider-marks" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t.value} className="faun-slider-mark" style={{ [orientation === "vertical" ? "insetBlockEnd" : "insetInlineStart"]: `${pct(t.value)}%` }} data-active={current.length > 1 ? (t.value >= current[0]! && t.value <= current[current.length - 1]!) || undefined : t.value <= current[0]! || undefined}>
              {t.label != null ? <span className="faun-slider-mark-label">{t.label}</span> : null}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
});
