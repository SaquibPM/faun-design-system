import type { ComponentType } from "react";

export type DocMeta = {
  title: string;
  description: string;
  /** Sidebar group, e.g. "Actions", "Forms", "Overlays", "Data", "AI and agents". */
  category: string;
  status?: "stable" | "beta" | "new";
  /** Component names whose props tables appear on the Code tab. */
  components?: string[];
  /** Package the component ships in. */
  package?: string;
  /** Slugs of related pages. */
  related?: string[];
  order?: number;
};

type MdxModule = { default: ComponentType<{ components?: Record<string, unknown> }>; meta: DocMeta };

const componentDocs = import.meta.glob<MdxModule>("../../../../packages/*/src/components/*/*.docs.mdx", { eager: true });
const exampleModules = import.meta.glob<Record<string, ComponentType>>("../../../../packages/*/src/components/*/*.examples.tsx", { eager: true });
const exampleSources = import.meta.glob<string>("../../../../packages/*/src/components/*/*.examples.tsx", { eager: true, query: "?raw", import: "default" });

export const slugify = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase();

export type ComponentDoc = { slug: string; folder: string; pkg: string; meta: DocMeta; Content: MdxModule["default"] };

export const components: ComponentDoc[] = Object.entries(componentDocs)
  .map(([path, mod]) => {
    const m = path.match(/packages\/([^/]+)\/src\/components\/([^/]+)\//)!;
    return { slug: slugify(m[2]!), folder: m[2]!, pkg: m[1]!, meta: mod.meta, Content: mod.default };
  })
  .sort((a, b) => (a.meta.order ?? 100) - (b.meta.order ?? 100) || a.meta.title.localeCompare(b.meta.title));

/** Finds an example component and its source by "Folder/ExportName". */
export function getExample(ref: string): { Component: ComponentType; source: string } | null {
  const [folder, name] = ref.split("/");
  for (const [path, mod] of Object.entries(exampleModules)) {
    if (!path.includes(`/components/${folder}/`)) continue;
    const Component = mod[name!];
    if (!Component) continue;
    const raw = exampleSources[path] ?? "";
    return { Component, source: extractFunction(raw, name!) };
  }
  return null;
}

/** Pulls `export function Name() {...}` out of an examples file, de-indented, without the export keyword. */
function extractFunction(src: string, name: string): string {
  const start = src.search(new RegExp(`export function ${name}\\b`));
  if (start < 0) return "";
  const rest = src.slice(start);
  const next = rest.slice(1).search(/\nexport (function|const) /);
  const body = next < 0 ? rest : rest.slice(0, next + 1);
  return body.replace(/^export /, "").trim();
}

export const CATEGORY_ORDER = ["Actions", "Forms", "Selection", "Overlays", "Navigation", "Feedback", "Display", "Layout", "Data", "Charts", "AI and agents"];
