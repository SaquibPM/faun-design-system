export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";
export const toneLabel: Record<StatusTone, string> = { neutral: "Neutral", info: "Info", success: "On track", warning: "At risk", danger: "Off track" };
/** Status colour. Use only when the colour means a status; pair it with the label. */
export const toneVar = (t: StatusTone) => `var(--faun-status-${t}-solid)` as const;
