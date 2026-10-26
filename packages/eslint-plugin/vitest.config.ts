import { defineConfig } from "vitest/config";

export default defineConfig({ test: {
    // axe + jsdom renders are slow on loaded CI runners and older Node; 5s default flakes (seen on Node 20).
    testTimeout: 30_000, environment: "node", include: ["test/**/*.test.ts"], setupFiles: [] } });
