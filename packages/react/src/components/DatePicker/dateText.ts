import { isAfter, isBefore, isSameDay, startOfDay } from "date-fns";
import type { Matcher } from "react-day-picker";

/** A numeric date format such as `dd/MM/yyyy`, split into the parts the mask needs. */
export interface DateTextFormat {
  /** Parts in order: day, month, year. */
  parts: ("d" | "M" | "y")[];
  /** Digits per part. */
  lens: number[];
  /** Separator between parts. */
  sep: string;
  /** The format as written, for example `dd/MM/yyyy`. */
  pattern: string;
  /** Total characters with separators. */
  length: number;
}

const DEFAULT = "dd/MM/yyyy";

/** Reads a pattern made of `dd`, `MM` and `yyyy` joined by `/`, `-` or `.`. Anything else falls back to `dd/MM/yyyy`. */
export function parseDateFormat(pattern: string = DEFAULT): DateTextFormat {
  const m = /^(dd|MM|yyyy)([/.\-])(dd|MM|yyyy)\2(dd|MM|yyyy)$/.exec(pattern);
  const ok = m && new Set([m[1], m[3], m[4]]).size === 3;
  const p = ok ? pattern : DEFAULT;
  const tokens = p.match(/dd|MM|yyyy/g)!;
  const parts = tokens.map((t) => (t === "dd" ? "d" : t === "MM" ? "M" : "y")) as DateTextFormat["parts"];
  const lens = tokens.map((t) => t.length);
  return { parts, lens, sep: /[/.\-]/.exec(p)![0], pattern: p, length: lens.reduce((a, b) => a + b, 0) + 2 };
}

/** `dd/mm/yyyy`: the lower-case hint shown as the placeholder. */
export const hintOf = (f: DateTextFormat) => f.pattern.toLowerCase();

/**
 * Turns whatever was typed or pasted into masked text. Digits fill the parts in order; a separator typed after a one-digit day or month pads it
 * with a zero ("1/" becomes "01/"). The separator is added only when more input follows or when the person types it, so Backspace never fights the mask.
 */
export function maskDateText(raw: string, f: DateTextFormat): string {
  const out: string[] = [];
  let cur = "";
  let trailingSep = false;
  for (const ch of raw) {
    if (out.length === f.parts.length) break;
    if (/\d/.test(ch)) {
      cur += ch;
      trailingSep = false;
      if (cur.length === f.lens[out.length]) { out.push(cur); cur = ""; trailingSep = false; }
    } else if (!/[/.\-\s,]/.test(ch)) {
      continue; // letters and other characters are dropped
    } else if (cur) {
      const len = f.lens[out.length]!;
      out.push(f.parts[out.length] === "y" ? cur : cur.padStart(len, "0"));
      cur = "";
      trailingSep = true;
    } else if (out.length > 0) {
      trailingSep = true;
    }
  }
  let text = out.join(f.sep);
  if (cur) text += (out.length ? f.sep : "") + cur;
  else if (trailingSep && out.length > 0 && out.length < f.parts.length) text += f.sep;
  return text;
}

export type DateTextStatus = "empty" | "incomplete" | "invalid" | "valid";

/** Reads masked text back into a date. A date that does not exist (31/02/2026) is invalid, not rolled over. */
export function parseDateText(text: string, f: DateTextFormat): { status: DateTextStatus; date?: Date } {
  if (!text) return { status: "empty" };
  if (text.length < f.length) return { status: "incomplete" };
  const segs = text.split(f.sep);
  if (segs.length !== 3 || segs.some((s, i) => s.length !== f.lens[i] || !/^\d+$/.test(s))) return { status: "invalid" };
  const get = (k: "d" | "M" | "y") => Number(segs[f.parts.indexOf(k)]);
  const [d, mo, y] = [get("d"), get("M"), get("y")];
  const date = new Date(y, mo - 1, d);
  if (y < 1000 || date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return { status: "invalid" };
  return { status: "valid", date };
}

export function formatDateText(d: Date, f: DateTextFormat): string {
  const p = (n: number, len: number) => String(n).padStart(len, "0");
  return f.parts.map((k, i) => (k === "d" ? p(d.getDate(), f.lens[i]!) : k === "M" ? p(d.getMonth() + 1, f.lens[i]!) : p(d.getFullYear(), f.lens[i]!))).join(f.sep);
}

/** True when any matcher disables the day. Handles the react-day-picker matcher shapes Faun accepts. */
export function isDateDisabled(date: Date, matchers?: Matcher | Matcher[]): boolean {
  if (matchers === undefined) return false;
  const list = Array.isArray(matchers) ? matchers : [matchers];
  return list.some((m) => {
    if (typeof m === "boolean") return m;
    if (m instanceof Date) return isSameDay(m, date);
    if (typeof m === "function") return m(date);
    if (Array.isArray(m)) return m.some((x) => isSameDay(x, date));
    if ("dayOfWeek" in m) return ([] as number[]).concat(m.dayOfWeek).includes(date.getDay());
    if ("from" in m && "to" in m && m.from && m.to) return !isBefore(date, startOfDay(m.from)) && !isAfter(date, startOfDay(m.to));
    const r = m as { before?: Date; after?: Date };
    if (r.before && r.after) return isBefore(date, startOfDay(r.before)) || isAfter(date, startOfDay(r.after));
    if (r.before) return isBefore(date, startOfDay(r.before));
    if (r.after) return isAfter(date, startOfDay(r.after));
    return false;
  });
}

export type DateValidation =
  | { status: "empty" | "incomplete" | "valid"; message?: undefined }
  | { status: "invalid" | "before-min" | "after-max" | "disabled"; message: string };

/** Checks typed text against the format, the limits and the disabled dates, and says what is wrong in words. */
export function validateDateText(text: string, f: DateTextFormat, o: { min?: Date; max?: Date; disabled?: Matcher | Matcher[]; label?: string }): DateValidation & { date?: Date } {
  const r = parseDateText(text, f);
  if (r.status === "empty" || r.status === "incomplete") return { status: r.status };
  const what = o.label ?? "date";
  if (r.status === "invalid" || !r.date) return { status: "invalid", message: `Enter a real ${what} as ${hintOf(f)}.` };
  const d = r.date;
  if (o.min && isBefore(d, startOfDay(o.min))) return { status: "before-min", message: `Enter a ${what} on or after ${formatDateText(o.min, f)}.`, date: d };
  if (o.max && isAfter(d, startOfDay(o.max))) return { status: "after-max", message: `Enter a ${what} on or before ${formatDateText(o.max, f)}.`, date: d };
  if (isDateDisabled(d, o.disabled)) return { status: "disabled", message: `${formatDateText(d, f)} is not available. Pick another ${what}.`, date: d };
  return { status: "valid", date: d };
}
