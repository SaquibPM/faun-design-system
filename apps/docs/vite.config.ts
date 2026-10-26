import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import remarkGfm from "remark-gfm";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const pkg = (p: string) => resolve(import.meta.dirname, "../../packages", p);

export default defineConfig({
  base: "./",
  plugins: [
    { enforce: "pre", ...mdx({ remarkPlugins: [remarkGfm], providerImportSource: "@mdx-js/react" }) },
    react({ include: /\.(jsx|tsx|mdx)$/ }),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [
      { find: /^@mdx-js\/react$/, replacement: resolve(import.meta.dirname, "node_modules/@mdx-js/react/index.js") },
      { find: /^@faun-ds\/react$/, replacement: pkg("react/src/index.ts") },
      { find: /^@faun-ds\/data$/, replacement: pkg("data/src/index.ts") },
      { find: /^@faun-ds\/ai$/, replacement: pkg("ai/src/index.ts") },
    ],
  },
  server: { fs: { allow: [resolve(import.meta.dirname, "../..")] } },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 4000,
    rollupOptions: { output: { manualChunks: { react: ["react", "react-dom", "react-router"], shiki: ["shiki/core", "shiki/engine/javascript"] } } },
  },
});
