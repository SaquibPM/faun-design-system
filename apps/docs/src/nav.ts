import { CATEGORY_ORDER, components } from "./content/registry";
import { foundationPages } from "./pages/foundations";
import { guidePages } from "./pages/guides";
import { patternPages } from "./pages/patterns";

export type NavItem = { label: string; to: string; badge?: string };
export type NavSection = { title: string; items: NavItem[] };

export function navSections(): NavSection[] {
  const byCat = new Map<string, NavItem[]>();
  for (const c of components) {
    const list = byCat.get(c.meta.category) ?? [];
    list.push({ label: c.meta.title, to: `/components/${c.slug}`, badge: c.meta.status === "new" ? "New" : c.meta.status === "beta" ? "Beta" : undefined });
    byCat.set(c.meta.category, list);
  }
  const cats = [...byCat.keys()].sort((a, b) => (CATEGORY_ORDER.indexOf(a) + 1 || 99) - (CATEGORY_ORDER.indexOf(b) + 1 || 99));
  return [
    { title: "Get started", items: [{ label: "Overview", to: "/" }, ...guidePages.map((g) => ({ label: g.title, to: `/guides/${g.slug}` }))] },
    { title: "Foundations", items: foundationPages.map((f) => ({ label: f.title, to: `/foundations/${f.slug}` })) },
    ...cats.map((c) => ({ title: c, items: byCat.get(c)! })),
    {
      title: "Patterns",
      items: [
        { label: "All patterns", to: "/patterns" },
        ...patternPages.map((p) => ({ label: p.title, to: `/patterns/${p.slug}`, badge: p.featured ? "New" : undefined })),
      ],
    },
  ];
}
