import { ESLint, Linter } from "eslint";
import { describe, expect, it } from "vitest";
import plugin, { configs, rules } from "../src/index.js";

describe("plugin", () => {
  it("exports the four rules with docs and messages", () => {
    expect(Object.keys(rules).sort()).toEqual(["icon-button-needs-label", "no-arbitrary-tailwind-values", "no-hex-colors", "no-raw-status-colors"]);
    for (const r of Object.values(rules)) {
      expect(r.meta?.docs?.description).toBeTruthy();
      expect(Object.keys(r.meta?.messages ?? {}).length).toBeGreaterThan(0);
    }
  });

  it("recommended config enables every rule as an error and registers the plugin", () => {
    expect(plugin.configs?.recommended).toBe(configs.recommended);
    const enabled = Object.entries(configs.recommended.rules ?? {});
    expect(enabled.map(([k]) => k.replace("@faun-ds/", "")).sort()).toEqual(Object.keys(rules).sort());
    expect(enabled.every(([, v]) => v === "error")).toBe(true);
    expect(configs.recommended.plugins?.["@faun-ds"]).toBe(plugin);
  });

  it("reports through a flat config using the recommended preset", async () => {
    const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: [configs.recommended] });
    const [res] = await eslint.lintText(
      `export const A = () => <div className="text-[11px] text-green-600" style={{ color: "#fff" }}><IconButton icon={null} /></div>;`,
      { filePath: "a.tsx" },
    );
    expect(res!.messages.map((m) => m.ruleId).sort()).toEqual([
      "@faun-ds/icon-button-needs-label",
      "@faun-ds/no-arbitrary-tailwind-values",
      "@faun-ds/no-hex-colors",
      "@faun-ds/no-raw-status-colors",
    ]);
  });

  it("is clean on code that follows the rules", async () => {
    const linter = new Linter();
    const msgs = linter.verify(
      `export const A = () => <div className="bg-surface text-fg-muted rounded-md"><IconButton icon={null} label="Close" /><StatusBadge domain="run" state="failed" /></div>;`,
      [configs.recommended],
      "a.jsx",
    );
    expect(msgs).toEqual([]);
  });
});

describe("with @typescript-eslint/parser", () => {
  it("lints TSX with type annotations", async () => {
    const parser = await import("@typescript-eslint/parser");
    const linter = new Linter();
    const msgs = linter.verify(
      `type P = { tone: "ok" | "bad" };\nexport const A = ({ tone }: P) => <span className={tone === "ok" ? "text-green-700" : "text-fg"} style={{ color: "#c00" }} />;`,
      [{ ...configs.recommended, languageOptions: { parser: parser.default ?? parser } }],
      "a.tsx",
    );
    expect(msgs.map((m) => m.ruleId).sort()).toEqual(["@faun-ds/no-hex-colors", "@faun-ds/no-raw-status-colors"]);
  });
});
