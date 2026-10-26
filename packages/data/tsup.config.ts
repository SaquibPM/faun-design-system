import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  external: ["@faun-ds/react", "react", "react-dom", "@faun-ds/icons", "@faun-ds/tokens"],
  esbuildOptions(o) { o.jsx = "automatic"; },
});
