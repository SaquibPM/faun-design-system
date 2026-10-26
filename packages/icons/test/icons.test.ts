// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { createElement } from "react";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { IconScope1, IconSearch, IconStatusRunning, opticalStroke } from "../src/index.ts";
import { DynamicIcon, icons, isIconName } from "../src/registry.ts";

const require = createRequire(import.meta.url);
const statusMap = require("@faun-ds/tokens/status-map");

describe("Icon component", () => {
  it("is decorative by default: hidden from assistive tech", () => {
    const { container } = render(createElement(IconSearch));
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.getAttribute("role")).toBeNull();
    expect(svg.getAttribute("focusable")).toBe("false");
  });

  it("becomes an image with an accessible name when labelled", () => {
    const { getByRole } = render(createElement(IconScope1, { label: "Scope 1 emissions" }));
    expect(getByRole("img", { name: "Scope 1 emissions" })).toBeTruthy();
  });

  it("maps token sizes to pixels and scales stroke optically", () => {
    const { container } = render(createElement("div", null, createElement(IconSearch, { size: "xs" }), createElement(IconSearch, { size: "xl" }), createElement(IconSearch, { size: 32 })));
    const [xs, lg, xl] = Array.from(container.querySelectorAll("svg"));
    expect(xs!.getAttribute("width")).toBe("12");
    expect(lg!.getAttribute("width")).toBe("24");
    expect(xs!.getAttribute("stroke-width")).toBe("2");
    expect(lg!.getAttribute("stroke-width")).toBe("1.75");
    expect(xl!.getAttribute("stroke-width")).toBe("1.5");
    expect(opticalStroke(16)).toBeGreaterThan(opticalStroke(32));
  });

  it("exposes a stable data hook and forwards className", () => {
    const { container } = render(createElement(IconStatusRunning, { className: "spin" }));
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("data-faun-icon")).toBe("status-running");
    expect(svg.getAttribute("class")).toBe("faun-icon spin");
  });
});

describe("registry", () => {
  it("resolves every icon named in the token status map", () => {
    const names: string[] = [
      ...Object.values<any>(statusMap.tones).map((t) => t.icon),
      ...Object.values<any>(statusMap.domains).flatMap((d) => Object.entries<any>(d).filter(([k]) => !k.startsWith("$")).map(([, v]) => v.icon)),
    ];
    const missing = [...new Set(names)].filter((n) => !isIconName(n));
    expect(missing).toEqual([]);
  });

  it("falls back to status-unknown for unknown names", () => {
    const { container } = render(createElement(DynamicIcon, { name: "does-not-exist" }));
    expect(container.querySelector("svg")!.getAttribute("data-faun-icon")).toBe("status-unknown");
  });

  it("ships a manifest with category and provenance for every icon", () => {
    const manifest = JSON.parse(readFileSync(resolve(import.meta.dirname, "../src/generated/manifest.json"), "utf8"));
    expect(manifest.count).toBe(Object.keys(icons).length);
    for (const i of manifest.icons) {
      expect(i.category).toBeTruthy();
      expect(i.source).toMatch(/^(faun|lucide:)/);
    }
  });

  it("contains no emoji-like or duplicate meanings in custom glyph names", () => {
    expect(Object.keys(icons)).toContain("approval-gate");
    expect(Object.keys(icons).filter((n) => n.startsWith("scope-"))).toEqual(["scope-1", "scope-2", "scope-3"]);
  });
});
