import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: {
    // axe + jsdom renders are slow on loaded CI runners and older Node; 5s default flakes (seen on Node 20).
    testTimeout: 30_000,
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["src/**/*.test.tsx", "test/**/*.test.ts"],
    css: false,
  },
});
