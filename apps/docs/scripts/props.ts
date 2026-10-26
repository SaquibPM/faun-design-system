/** Extracts component props from TypeScript sources into src/generated/props.json for the docs Code tab. */
import { readdirSync, writeFileSync, existsSync, mkdirSync, renameSync } from "node:fs";
import { resolve } from "node:path";
import { withCustomConfig } from "react-docgen-typescript";

const root = resolve(import.meta.dirname, "../../..");
const files: string[] = [];
for (const pkg of ["react", "data", "ai"]) {
  const dir = resolve(root, "packages", pkg, "src/components");
  if (!existsSync(dir)) continue;
  for (const d of readdirSync(dir)) {
    for (const f of readdirSync(resolve(dir, d))) {
      if (/\.tsx$/.test(f) && !/\.(test|examples|stories)\.tsx$/.test(f)) files.push(resolve(dir, d, f));
    }
  }
}
const parser = withCustomConfig(resolve(root, "packages/react/tsconfig.json"), {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  propFilter: (prop) => !prop.parent || !/node_modules/.test(prop.parent.fileName) || /react-dialog|react-popover|react-select|react-tabs|react-tooltip/.test(prop.parent.fileName) && false,
});
const out: Record<string, unknown> = {};
for (const doc of parser.parse(files)) {
  out[doc.displayName] = {
    description: doc.description,
    file: doc.filePath.replace(root + "/", ""),
    props: Object.values(doc.props)
      .map((p) => ({ name: p.name, type: p.type.name === "enum" ? ((p.type as any).value ?? []).map((v: any) => v.value).join(" | ") : ((p.type as any).raw ?? p.type.name), required: p.required, default: p.defaultValue?.value ?? null, description: p.description }))
      .sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name)),
  };
}
mkdirSync(resolve(import.meta.dirname, "../src/generated"), { recursive: true });
const target = resolve(import.meta.dirname, "../src/generated/props.json");
const tmp = `${target}.${process.pid}.tmp`;
writeFileSync(tmp, JSON.stringify(out, null, 2));
renameSync(tmp, target);
console.log(`props: ${Object.keys(out).length} components from ${files.length} files`);
