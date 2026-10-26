// Faun lints itself with its own plugin. Docs demo files that must show raw
// colours (tenant accent seeds, the colour reference) are allow-listed below.
import tsParser from "@typescript-eslint/parser";
import faun from "./packages/eslint-plugin/dist/index.js";

export default [
  { ignores: [".artifact-dist/**", "**/dist/**", "**/node_modules/**", "**/generated/**", "e2e/**", "scripts/**", "apps/docs/scripts/**", "packages/*/scripts/**", "packages/*/test/**", "packages/*/vitest.config.ts", "packages/*/tsup.config.ts", "packages/eslint-plugin/**", "packages/mcp/**"] },
  {
    ...faun.configs.recommended,
    files: ["packages/*/src/**/*.{ts,tsx}", "apps/docs/src/**/*.{ts,tsx}", "examples/**/*.{ts,tsx}"],
    languageOptions: { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true } } },
  },
  {
    files: ["**/*.test.{ts,tsx}", "apps/docs/src/pages/foundations/Colour.tsx", "apps/docs/src/pages/foundations/Theming.tsx", "apps/docs/src/components/ThemeControls.tsx"],
    languageOptions: { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true } } },
    rules: { "@faun-ds/no-hex-colors": "off" },
  },
];
