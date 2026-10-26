import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  external: ["react", "react-dom", /^@radix-ui\//, "@faun-ds/icons", "@faun-ds/tokens", "clsx", "cmdk", "react-day-picker", "date-fns"],
  esbuildOptions(o) { o.jsx = "automatic"; },
});
