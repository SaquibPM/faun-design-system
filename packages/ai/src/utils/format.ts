/** Formatting helpers shared by agentic components. Locale defaults to the browser's. */

/** "4 min 12 s", "1 h 3 min", "850 ms". */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return s % 60 ? `${m} min ${s % 60} s` : `${m} min`;
  const h = Math.floor(m / 60);
  return m % 60 ? `${h} h ${m % 60} min` : `${h} h`;
}

/** Duration between two ISO timestamps, or from start until now. */
export function durationBetween(start?: string, end?: string, now: number = Date.now()): number | undefined {
  if (!start) return undefined;
  const a = Date.parse(start);
  const b = end ? Date.parse(end) : now;
  return Number.isFinite(a) && Number.isFinite(b) ? Math.max(0, b - a) : undefined;
}

/** "just now", "5 min ago", "2 h ago", "3 days ago", then a date. */
export function formatRelative(iso?: string, now: number = Date.now(), locale?: string): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const diff = Math.round((now - t) / 1000);
  if (diff < 45) return "just now";
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "short" });
  if (diff < 3600) return rtf.format(-Math.round(diff / 60), "minute");
  if (diff < 86400) return rtf.format(-Math.round(diff / 3600), "hour");
  if (diff < 86400 * 7) return rtf.format(-Math.round(diff / 86400), "day");
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(t);
}

/** True for actors whose work renders as machine activity (lagoon). */
export const isMachine = (kind: string) => kind !== "human";
