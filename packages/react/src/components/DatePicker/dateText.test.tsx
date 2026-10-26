import { describe, expect, it } from "vitest";
import { formatDateText, hintOf, isDateDisabled, maskDateText, parseDateFormat, parseDateText, validateDateText } from "./dateText.js";

const f = parseDateFormat("dd/MM/yyyy");
const us = parseDateFormat("MM/dd/yyyy");
const iso = parseDateFormat("yyyy-MM-dd");

describe("parseDateFormat", () => {
  it("reads the three supported shapes and falls back for anything else", () => {
    expect(f.lens).toEqual([2, 2, 4]);
    expect(iso.parts).toEqual(["y", "M", "d"]);
    expect(iso.sep).toBe("-");
    expect(parseDateFormat("d MMM yyyy").pattern).toBe("dd/MM/yyyy");
    expect(hintOf(f)).toBe("dd/mm/yyyy");
  });
});

describe("maskDateText", () => {
  it("fills parts from digits and adds a separator only when more input follows", () => {
    expect(maskDateText("1", f)).toBe("1");
    expect(maskDateText("12", f)).toBe("12");
    expect(maskDateText("123", f)).toBe("12/3");
    expect(maskDateText("12032026", f)).toBe("12/03/2026");
    expect(maskDateText("120320261234", f)).toBe("12/03/2026");
  });
  it("accepts typed separators, pads one-digit parts, and ignores letters", () => {
    expect(maskDateText("1/", f)).toBe("01/");
    expect(maskDateText("1/2/2026", f)).toBe("01/02/2026");
    expect(maskDateText("12/", f)).toBe("12/");
    expect(maskDateText("ab12cd", f)).toBe("12");
    expect(maskDateText("2026-03-05", iso)).toBe("2026-03-05");
    expect(maskDateText("3/5/2026", us)).toBe("03/05/2026");
  });
  it("lets Backspace remove a trailing separator", () => {
    expect(maskDateText("12/", f)).toBe("12/");
    expect(maskDateText("12", f)).toBe("12");
  });
});

describe("parseDateText", () => {
  it("parses real dates and rejects dates that do not exist", () => {
    expect(parseDateText("05/03/2026", f)).toEqual({ status: "valid", date: new Date(2026, 2, 5) });
    expect(parseDateText("03/05/2026", us).date).toEqual(new Date(2026, 2, 5));
    expect(parseDateText("31/02/2026", f).status).toBe("invalid");
    expect(parseDateText("29/02/2028", f).status).toBe("valid");
    expect(parseDateText("29/02/2026", f).status).toBe("invalid");
    expect(parseDateText("32/01/2026", f).status).toBe("invalid");
    expect(parseDateText("01/13/2026", f).status).toBe("invalid");
    expect(parseDateText("", f).status).toBe("empty");
    expect(parseDateText("05/03", f).status).toBe("incomplete");
  });
  it("round-trips through formatDateText", () => {
    expect(formatDateText(new Date(2026, 0, 7), f)).toBe("07/01/2026");
    expect(formatDateText(new Date(2026, 0, 7), iso)).toBe("2026-01-07");
  });
});

describe("validateDateText", () => {
  const o = { min: new Date(2026, 0, 1), max: new Date(2026, 11, 31), disabled: [{ dayOfWeek: [0, 6] }], label: "reporting date" };
  it("names the problem in words", () => {
    expect(validateDateText("31/02/2026", f, o).message).toBe("Enter a real reporting date as dd/mm/yyyy.");
    expect(validateDateText("31/12/2025", f, o)).toMatchObject({ status: "before-min", message: "Enter a reporting date on or after 01/01/2026." });
    expect(validateDateText("01/01/2027", f, o)).toMatchObject({ status: "after-max" });
    expect(validateDateText("04/10/2026", f, o)).toMatchObject({ status: "disabled" }); // a Sunday
    expect(validateDateText("05/10/2026", f, o)).toMatchObject({ status: "valid" });
    expect(validateDateText("05/1", f, o).status).toBe("incomplete");
  });
});

describe("isDateDisabled", () => {
  it("handles dates, ranges, functions and weekdays", () => {
    const d = new Date(2026, 5, 10);
    expect(isDateDisabled(d, new Date(2026, 5, 10))).toBe(true);
    expect(isDateDisabled(d, { from: new Date(2026, 5, 1), to: new Date(2026, 5, 15) })).toBe(true);
    expect(isDateDisabled(d, { before: new Date(2026, 5, 11) })).toBe(true);
    expect(isDateDisabled(d, (x) => x.getDate() === 10)).toBe(true);
    expect(isDateDisabled(d, [{ dayOfWeek: [1] }])).toBe(false);
    expect(isDateDisabled(d, undefined)).toBe(false);
  });
});
