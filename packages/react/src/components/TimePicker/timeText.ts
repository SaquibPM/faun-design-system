export type TimePeriod = "AM" | "PM";

/** Formats minutes since midnight as "HH:mm" (24 hour). */
export const to24 = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

/** Reads "HH:mm" into minutes since midnight, or null. */
export function from24(v: string | null | undefined): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(v ?? "");
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  return h > 23 || mi > 59 ? null : h * 60 + mi;
}

/** Splits minutes into the text and period a 12 or 24 hour field shows. */
export function toText(mins: number, h12: boolean): { text: string; period: TimePeriod } {
  const h = Math.floor(mins / 60);
  const mi = String(mins % 60).padStart(2, "0");
  const period: TimePeriod = h >= 12 ? "PM" : "AM";
  const hh = h12 ? String(h % 12 === 0 ? 12 : h % 12).padStart(2, "0") : String(h).padStart(2, "0");
  return { text: `${hh}:${mi}`, period };
}

/** Display form used in messages: "09:15" or "9:15 AM". */
export const display = (mins: number, h12: boolean) => {
  const { text, period } = toText(mins, h12);
  return h12 ? `${text} ${period}` : text;
};

/**
 * Masks typed time text. Digits fill hours then minutes, a first digit that cannot start an hour (3 to 9 on 24 hour, 2 to 9 on 12 hour) is padded
 * with a zero, and a typed colon pads a one-digit hour. The colon appears once minutes start or when the person types it.
 */
export function maskTime(raw: string, h12: boolean): string {
  let h = "";
  let m = "";
  let sep = false;
  let explicit = false;
  for (const ch of raw) {
    if (/\d/.test(ch)) {
      explicit = false;
      if (!sep) {
        if (h.length === 0 && Number(ch) > (h12 ? 1 : 2)) { h = `0${ch}`; sep = true; }
        else { h += ch; if (h.length === 2) sep = true; }
      } else if (m.length < 2) m += ch;
    } else if (/[:.\s,]/.test(ch) && h) {
      if (!sep) h = h.padStart(2, "0");
      sep = true;
      explicit = !m;
    }
  }
  return m || explicit ? `${h}:${m}` : h;
}

export type TimeStatus = "empty" | "incomplete" | "valid" | "invalid" | "before-min" | "after-max" | "off-step";

export interface TimeCheck { status: TimeStatus; minutes?: number; message?: string }

/** Parses and checks time text. `period` matters on a 12 hour field. */
export function checkTime(text: string, period: TimePeriod, o: { h12: boolean; step: number; min?: number | null; max?: number | null }): TimeCheck {
  if (!text) return { status: "empty" };
  const m = /^(\d{2}):(\d{2})$/.exec(text);
  if (!m) return { status: /^\d{0,2}:?\d?$/.test(text) ? "incomplete" : "invalid" };
  const h = Number(m[1]);
  const mi = Number(m[2]);
  const hint = o.h12 ? "hh:mm" : "hh:mm";
  if (mi > 59 || (o.h12 ? h < 1 || h > 12 : h > 23)) return { status: "invalid", message: `Enter a real time as ${hint}${o.h12 ? " and choose AM or PM" : ""}.` };
  const mins = (o.h12 ? (h % 12) + (period === "PM" ? 12 : 0) : h) * 60 + mi;
  if (o.min != null && mins < o.min) return { status: "before-min", minutes: mins, message: `Enter a time at or after ${display(o.min, o.h12)}.` };
  if (o.max != null && mins > o.max) return { status: "after-max", minutes: mins, message: `Enter a time at or before ${display(o.max, o.h12)}.` };
  if (o.step > 1 && (mins - (o.min ?? 0)) % o.step !== 0) {
    const base = o.min ?? 0;
    const down = base + Math.floor((mins - base) / o.step) * o.step;
    return { status: "off-step", minutes: mins, message: `Use ${o.step} minute steps, for example ${display(down, o.h12)}.` };
  }
  return { status: "valid", minutes: mins };
}
