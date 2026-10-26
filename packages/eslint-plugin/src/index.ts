import type { ESLint, Linter } from "eslint";
import iconButtonNeedsLabel from "./rules/icon-button-needs-label.js";
import noArbitraryTailwindValues from "./rules/no-arbitrary-tailwind-values.js";
import noHexColors from "./rules/no-hex-colors.js";
import noRawStatusColors from "./rules/no-raw-status-colors.js";

export const rules = {
  "no-hex-colors": noHexColors,
  "no-arbitrary-tailwind-values": noArbitraryTailwindValues,
  "icon-button-needs-label": iconButtonNeedsLabel,
  "no-raw-status-colors": noRawStatusColors,
};

const plugin: ESLint.Plugin = {
  meta: { name: "@faun-ds/eslint-plugin", version: "0.1.0", namespace: "@faun-ds" },
  rules,
  configs: {},
};

const recommended: Linter.Config = {
  name: "@faun-ds/recommended",
  files: ["**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}"],
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  plugins: { "@faun-ds": plugin },
  rules: {
    "@faun-ds/no-hex-colors": "error",
    "@faun-ds/no-arbitrary-tailwind-values": "error",
    "@faun-ds/icon-button-needs-label": "error",
    "@faun-ds/no-raw-status-colors": "error",
  },
};

(plugin.configs as Record<string, Linter.Config>).recommended = recommended;

export const configs: { recommended: Linter.Config } = { recommended };
export default plugin;
