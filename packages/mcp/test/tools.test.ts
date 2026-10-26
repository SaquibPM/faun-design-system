import { describe, expect, it } from "vitest";
import { findComponent, getComponent, getStatusMap, listComponents, resolveIcon, searchTokens } from "../src/tools.js";
import { fixture as data } from "./fixture.js";

describe("listComponents", () => {
  it("lists everything by default", () => {
    expect(listComponents(data).map((c) => c.name)).toEqual(["Button", "Icon button", "Dialog", "Run trail"]);
  });
  it("filters by category ignoring case and punctuation", () => {
    expect(listComponents(data, { category: "ai and AGENTS" }).map((c) => c.slug)).toEqual(["run-trail"]);
    expect(listComponents(data, { category: "actions" })).toHaveLength(2);
  });
  it("filters by package with or without the scope", () => {
    expect(listComponents(data, { package: "ai" })).toHaveLength(1);
    expect(listComponents(data, { package: "@faun-ds/react" })).toHaveLength(3);
    expect(listComponents(data, { package: "data" })).toEqual([]);
  });
  it("exposes exported part names", () => {
    expect(listComponents(data, { category: "Overlays" })[0]!.exports).toEqual(["Dialog", "DialogContent", "DialogTrigger"]);
  });
});

describe("findComponent", () => {
  it.each(["Button", "button", "BUTTON", "Icon button", "icon-button", "IconButton", "iconbutton"])("finds %s", (n) => {
    expect(findComponent(data, n === "Button" || n.toLowerCase() === "button" ? n : n)?.name).toMatch(/button/i);
  });
  it("finds a component by an exported part", () => {
    expect(findComponent(data, "DialogContent")?.name).toBe("Dialog");
  });
  it("prefers the exact component over a part match", () => {
    expect(findComponent(data, "button")?.name).toBe("Button");
  });
  it("returns undefined for unknown or empty names", () => {
    expect(findComponent(data, "Nope")).toBeUndefined();
    expect(findComponent(data, "  ")).toBeUndefined();
  });
});

describe("getComponent", () => {
  it("returns import line, props and docs", () => {
    const r = getComponent(data, "Dialog");
    expect(r.ok && r.component.import).toBe('import { Dialog, DialogContent, DialogTrigger } from "@faun-ds/react";');
    const b = getComponent(data, "button");
    expect(b.ok && b.component.props.Button!.props[0]!.name).toBe("intent");
    expect(b.ok && b.component.docs).toContain("start an action");
  });
  it("includes only overview example code by default", () => {
    const r = getComponent(data, "Button");
    expect(r.ok && r.component.examples.map((e) => !!e.code)).toEqual([true, false]);
    expect(r.ok && r.component.examples[1]!.title).toBe("Intents");
  });
  it("can include all example code or none", () => {
    const all = getComponent(data, "Button", { exampleCode: "all" });
    expect(all.ok && all.component.examples.every((e) => e.code)).toBe(true);
    const none = getComponent(data, "Button", { exampleCode: "none" });
    expect(none.ok && none.component.examples.some((e) => e.code)).toBe(false);
  });
  it("can omit docs", () => {
    const r = getComponent(data, "Button", { docs: false });
    expect(r.ok && r.component.docs).toBe("");
  });
  it("suggests close names for a miss", () => {
    const r = getComponent(data, "Buton");
    expect(r.ok).toBe(false);
    expect(!r.ok && r.suggestions).toContain("Button");
    const r2 = getComponent(data, "dialo");
    expect(!r2.ok && r2.suggestions).toContain("Dialog");
  });
  it("does not mutate the dataset when stripping example code", () => {
    getComponent(data, "Button", { exampleCode: "none" });
    expect(data.components[0]!.examples[0]!.code).toContain("Overview");
  });
});

describe("searchTokens", () => {
  it("matches every term across name, css variable and description", () => {
    const r = searchTokens(data, "muted text");
    expect(r.tokens[0]!.name).toBe("fg.muted");
    expect(r.total).toBe(1);
  });
  it("ranks an exact name first", () => {
    expect(searchTokens(data, "fg.muted").tokens[0]!.name).toBe("fg.muted");
    expect(searchTokens(data, "--faun-bg-surface").tokens[0]!.name).toBe("bg.surface");
  });
  it("finds a token by its value", () => {
    expect(searchTokens(data, "#1c1b19").tokens.map((t) => t.name)).toEqual(["fg.default"]);
    expect(searchTokens(data, "16px").tokens.map((t) => t.name)).toEqual(["space.4"]);
  });
  it("restricts by category and limits results", () => {
    expect(searchTokens(data, "fg", { category: "FG" }).tokens).toHaveLength(2);
    expect(searchTokens(data, "fg", { limit: 1 }).tokens).toHaveLength(1);
    expect(searchTokens(data, "fg", { limit: 1 }).total).toBe(2);
  });
  it("returns themed values for colours and a single value otherwise", () => {
    const [c] = searchTokens(data, "danger").tokens;
    expect(c!.values).toEqual({ light: "#7a1f1f", dark: "#c46060" });
    const [s] = searchTokens(data, "radius").tokens;
    expect(s!.value).toBe("9px");
  });
  it("returns nothing for unmatched terms", () => {
    expect(searchTokens(data, "zzzz")).toEqual({ total: 0, tokens: [] });
    expect(searchTokens(data, "muted zzzz").total).toBe(0);
  });
  it("handles composite tokens without a CSS variable", () => {
    const withType = { ...data, tokens: [...data.tokens, { name: "type.figure-xl", cssVar: null, type: "typography", category: "type", description: "Hero figure.", value: { fontSize: "56px" } }] };
    const r = searchTokens(withType, "figure");
    expect(r.tokens[0]).toMatchObject({ name: "type.figure-xl", cssVar: null, value: { fontSize: "56px" } });
    expect(searchTokens(withType, "56px").tokens.map((t) => t.name)).toEqual(["type.figure-xl"]);
  });
  it("clamps the limit", () => {
    expect(searchTokens(data, "faun", { limit: 0 }).tokens.length).toBe(1);
  });
});

describe("getStatusMap", () => {
  it("lists domains and tones when no domain is given", () => {
    const r = getStatusMap(data);
    expect(r.ok && r.map.domains!.map((d) => d.domain)).toEqual(["run", "data-quality"]);
    expect(r.ok && r.map.domains![0]!.states).toEqual(["pending", "running", "awaiting_approval", "failed"]);
    expect(r.ok && Object.keys(r.map.tones)).toContain("attention");
  });
  it("returns states with tone, icon, label and a StatusBadge usage line", () => {
    const r = getStatusMap(data, "run");
    expect(r.ok && r.map.states![2]).toEqual({
      state: "awaiting_approval", tone: "attention", icon: "status-attention", label: "Awaiting approval",
      usage: '<StatusBadge domain="run" state="awaiting_approval" />',
    });
    expect(r.ok && Object.keys(r.map.tones).sort()).toEqual(["attention", "danger", "neutral", "running"]);
  });
  it("does not treat $description as a state", () => {
    const r = getStatusMap(data, "run");
    expect(r.ok && r.map.states!.some((s) => s.state.startsWith("$"))).toBe(false);
    expect(r.ok && r.map.description).toBe("Agent run states.");
  });
  it("matches domain names loosely", () => {
    for (const d of ["data_quality", "Data Quality", "DATA-QUALITY"]) {
      const r = getStatusMap(data, d);
      expect(r.ok && r.map.domain).toBe("data-quality");
    }
  });
  it("lists available domains for an unknown one", () => {
    const r = getStatusMap(data, "nope");
    expect(r).toEqual({ ok: false, error: 'No status domain "nope".', suggestions: ["run", "data-quality"] });
  });
});

describe("resolveIcon", () => {
  it.each(["home", "Home", "IconHome", "icon-home".replace("icon-", "")])("resolves %s exactly", (n) => {
    const r = resolveIcon(data, n);
    expect(r.ok && r.match).toBe("exact");
    expect(r.ok && r.icon.component).toBe("IconHome");
  });
  it("resolves kebab-case and component names for multi-word icons", () => {
    expect(resolveIcon(data, "chevron-down").ok && (resolveIcon(data, "chevron-down") as any).icon.component).toBe("IconChevronDown");
    expect(resolveIcon(data, "IconChevronDown").ok).toBe(true);
    expect(resolveIcon(data, "chevronDown").ok).toBe(true);
  });
  it("resolves a synonym through keywords", () => {
    const r = resolveIcon(data, "trash");
    expect(r.ok && r.match).toBe("keyword");
    expect(r.ok && r.icon.name).toBe("delete");
  });
  it("gives import and usage lines", () => {
    const r = resolveIcon(data, "download");
    expect(r.ok && r.icon.import).toBe('import { IconDownload } from "@faun-ds/icons";');
    expect(r.ok && r.icon.usage).toBe("<IconDownload />");
  });
  it("finds partial matches and alternatives", () => {
    const r = resolveIcon(data, "chevron");
    expect(r.ok && r.match).toBe("partial");
    expect(r.ok && r.alternatives).toHaveLength(1);
  });
  it("falls back to the nearest spelling", () => {
    const r = resolveIcon(data, "dwnload");
    expect(r.ok && r.match).toBe("similar");
    expect(r.ok && r.icon.name).toBe("download");
  });
  it("does not guess a distant icon for a short unknown word", () => {
    const r = resolveIcon(data, "hash");
    expect(r.ok).toBe(false);
    expect(resolveIcon(data, "").ok).toBe(false);
    const far = resolveIcon(data, "qqqqqqqq");
    expect(far.ok).toBe(false);
  });
  it("suggests close names on failure", () => {
    const r = resolveIcon(data, "downlaod-x");
    expect(r.ok).toBe(false);
    expect(!r.ok && r.suggestions).toContain("download");
  });
});
