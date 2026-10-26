import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts", css: "src/css.ts" },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  external: ["react", "react-dom", "clsx"],
  esbuildOptions(o) { o.jsx = "automatic"; },
});
