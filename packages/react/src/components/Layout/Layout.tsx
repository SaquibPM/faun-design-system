import { Slot } from "@radix-ui/react-slot";
import * as RS from "@radix-ui/react-separator";
import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";

/** Space scale steps, matching `--faun-space-*`. `"density"` uses the density gap. */
export type SpaceStep = "0" | "0.5" | "1" | "1.5" | "2" | "2.5" | "3" | "3.5" | "4" | "5" | "6" | "7" | "8" | "10" | "12" | "16" | "density";

const gapVar = (g: SpaceStep) => (g === "density" ? "var(--faun-density-gap)" : `var(--faun-space-${g.replace(".", "-")})`);

interface FlowProps extends HTMLAttributes<HTMLDivElement> {
  /** Gap between children, from the space scale. */
  gap?: SpaceStep;
  /** Cross-axis alignment. */
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  /** Main-axis distribution. */
  justify?: "start" | "center" | "end" | "between";
  /** Render the child element instead of a div (e.g. a `ul` or `section`). */
  asChild?: boolean;
}

export interface StackProps extends FlowProps {}

/** Vertical flow with consistent gaps. The default way to space sibling blocks. */
export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack({ gap = "4", align = "stretch", justify = "start", asChild, className, style, ...props }, ref) {
  const Comp = asChild ? Slot : "div";
  return <Comp ref={ref} className={cx("faun-stack", className)} data-align={align} data-justify={justify} style={{ "--_gap": gapVar(gap), ...style } as CSSProperties} {...props} />;
});

export interface InlineProps extends FlowProps {
  /** Wrap onto new lines when space runs out. Default true. */
  wrap?: boolean;
}

/** Horizontal flow for toolbars, button rows, tag lists and meta rows. Wraps by default. */
export const Inline = forwardRef<HTMLDivElement, InlineProps>(function Inline({ gap = "2", align = "center", justify = "start", wrap = true, asChild, className, style, ...props }, ref) {
  const Comp = asChild ? Slot : "div";
  return <Comp ref={ref} className={cx("faun-inline", className)} data-align={align} data-justify={justify} data-wrap={wrap ? "" : undefined} style={{ "--_gap": gapVar(gap), ...style } as CSSProperties} {...props} />;
});

export interface DividerProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  orientation?: "horizontal" | "vertical";
  /** Optional text centred on a horizontal divider, e.g. "or" or a date. */
  label?: ReactNode;
  /** Semantic separator (announced) or purely decorative (default). */
  decorative?: boolean;
  /** `subtle` (default) or `default` border weight. */
  emphasis?: "subtle" | "default";
}

/** A rule between groups of content. */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider({ orientation = "horizontal", label, decorative = true, emphasis = "subtle", className, ...props }, ref) {
  if (label && orientation === "horizontal") {
    return (
      <div ref={ref} className={cx("faun-divider-labelled", className)} data-emphasis={emphasis} role={decorative ? "none" : "separator"} {...props}>
        <span className="faun-divider-label">{label}</span>
      </div>
    );
  }
  return <RS.Root ref={ref} decorative={decorative} orientation={orientation} className={cx("faun-divider", className)} data-emphasis={emphasis} {...props} />;
});

/** Alias of Divider for teams that use Radix naming. */
export const Separator = Divider;
