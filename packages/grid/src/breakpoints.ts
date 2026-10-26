/** Breakpoint keys in ascending order. `base` applies below `sm`. Values come from the `breakpoint.*` and `grid.*` tokens. */
export const BREAKPOINTS = ["base", "sm", "md", "lg", "xl", "2xl"] as const;
export type BreakpointKey = (typeof BREAKPOINTS)[number];
/** Maximum span and the largest column count (at lg and above). */
export const MAX_COLUMNS = 12;
