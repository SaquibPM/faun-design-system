import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  esbuild: { jsx: "automatic" },
  resolve: {
    // Test against the live sources of sibling packages, not their last build.
    alias: {
      "@faun-ds/react": src("../react/src/index.ts"),
      "@faun-ds/data": src("../data/src/index.ts"),
    },
    dedupe: ["react", "react-dom"],
  },
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
