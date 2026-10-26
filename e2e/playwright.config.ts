import { defineConfig } from "@playwright/test";

/**
 * FAUN_DOCS_DIST serves a specific docs build instead of apps/docs/dist (for example the Artifact build: `vite build --base ./ --outDir /tmp/x`).
 * FAUN_CHROMIUM points at a Chromium binary when the Playwright download is not available.
 */
const dist = process.env.FAUN_DOCS_DIST;
export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure", launchOptions: process.env.FAUN_CHROMIUM ? { executablePath: process.env.FAUN_CHROMIUM } : {} },
  webServer: {
    command: `pnpm --filter @faun-ds/docs preview --host 127.0.0.1 --port 4173${dist ? ` --outDir ${dist}` : ""}`,
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
});
