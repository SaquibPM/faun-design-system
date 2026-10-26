import { createElement, forwardRef, type ForwardRefExoticComponent, type RefAttributes, type SVGProps } from "react";

export type IconNode = [tag: string, attrs: Record<string, string | number>][];
export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | number;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children" | "ref"> {
  /** Token size (xs 12, sm 14, md 16, lg 20, xl 24, 2xl 32) or pixels. Default "md". */
  size?: IconSize;
  /**
   * Accessible name. Omit for decorative icons (hidden from assistive tech).
   * Provide it when the icon is the only content of a control or conveys meaning on its own.
   */
  label?: string;
  /** Override the optical stroke weight. Leave unset in product code. */
  strokeWidth?: number;
}

export type FaunIcon = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>> & { iconName: string };

/** Matches @faun-ds/tokens size.icon.*. */
const PX: Record<Exclude<IconSize, number>, number> = { xs: 12, sm: 14, md: 16, lg: 20, xl: 24, "2xl": 32 };

/**
 * Optical stroke: thin strokes vanish at 12–16px and look heavy at 32px, so weight scales inversely.
 * Values are in the 24-unit viewBox. 16px → 2 (renders 1.33px), 24px → 1.75, 32px → 1.5.
 */
export function opticalStroke(px: number): number {
  if (px <= 16) return 2;
  if (px <= 24) return 1.75;
  return 1.5;
}

export function createIcon(name: string, node: IconNode): FaunIcon {
  const Icon = forwardRef<SVGSVGElement, IconProps>(function FaunIconImpl({ size = "md", label, strokeWidth, className, ...rest }, ref) {
    const px = typeof size === "number" ? size : PX[size];
    const a11y = label
      ? { role: "img", "aria-label": label, focusable: "false" as const }
      : { "aria-hidden": true as const, focusable: "false" as const };
    return createElement(
      "svg",
      {
        ref,
        xmlns: "http://www.w3.org/2000/svg",
        width: px,
        height: px,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: strokeWidth ?? opticalStroke(px),
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "data-faun-icon": name,
        className: className ? `faun-icon ${className}` : "faun-icon",
        ...a11y,
        ...rest,
      },
      node.map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs })),
    );
  }) as FaunIcon;
  Icon.displayName = `Icon(${name})`;
  Icon.iconName = name;
  return Icon;
}
