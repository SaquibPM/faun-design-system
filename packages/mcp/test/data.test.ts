import { describe, expect, it } from "vitest";
import { parseData } from "../src/data.js";
import { distance, closest, squash } from "../src/text.js";
import { fixture } from "./fixture.js";

describe("parseData", () => {
  it("accepts a well-formed dataset", () => {
    expect(parseData(JSON.stringify(fixture)).components).toHaveLength(4);
  });
  it("rejects invalid JSON and wrong shapes with a rebuild hint", () => {
    expect(() => parseData("{")).toThrow(/not valid JSON/);
    expect(() => parseData("{}")).toThrow(/pnpm --filter @faun-ds\/mcp data/);
    expect(() => parseData(JSON.stringify({ ...fixture, schema: 2 }))).toThrow(/unexpected shape/);
  });
});

describe("text helpers", () => {
  it("squash removes case and punctuation", () => {
    expect(squash("Icon button")).toBe("iconbutton");
    expect(squash("data_quality-X")).toBe("dataqualityx");
  });
  it("distance counts edits and caps early", () => {
    expect(distance("kitten", "sitting", 5)).toBe(3);
    expect(distance("abc", "abc")).toBe(0);
    expect(distance("a", "abcdefgh", 2)).toBe(3);
  });
  it("closest orders prefix, substring then edit distance", () => {
    expect(closest("btn", ["Button", "Banner", "Badge"], 2)).toEqual(["Button"]);
    expect(closest("butt", ["Banner", "Button"])).toEqual(["Button"]);
    expect(closest("", ["x"])).toEqual([]);
  });
});
