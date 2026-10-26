import type { ComponentType } from "react";

type Mdx = { default: ComponentType; meta: { title: string; description: string; order?: number } };
const mods = import.meta.glob<Mdx>("../../content/guides/*.mdx", { eager: true });
export const guidePages = Object.entries(mods)
  .map(([p, m]) => ({ slug: p.split("/").pop()!.replace(".mdx", ""), title: m.meta.title, description: m.meta.description, order: m.meta.order ?? 99, Content: m.default }))
  .sort((a, b) => a.order - b.order);
