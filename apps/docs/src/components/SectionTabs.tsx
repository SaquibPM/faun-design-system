import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { NavLink } from "react-router";

export type SectionTab = "overview" | "usage" | "code" | "accessibility";
/** Which `h2` ids (section ids) belong to which tab. A page with one tab shows no tab bar. */
export type TabMap = Partial<Record<SectionTab, string[]>>;

const LABEL: Record<SectionTab, string> = { overview: "Overview", usage: "Usage", code: "Code", accessibility: "Accessibility" };
const ORDER: SectionTab[] = ["overview", "usage", "code", "accessibility"];

export function resolveTab(tabs: TabMap | undefined, param: string | undefined): SectionTab {
  const t = param as SectionTab | undefined;
  return t && tabs?.[t]?.length ? t : "overview";
}

/** Tab bar styled like the component page tabs; routes are `<base>` and `<base>/<tab>`. */
export function SectionTabBar({ base, tabs, active, label }: { base: string; tabs: TabMap; active: SectionTab; label: string }) {
  const present = ORDER.filter((t) => tabs[t]?.length);
  if (present.length < 2) return null;
  return (
    <nav className="docs-tabs" aria-label={label}>
      {present.map((t) => (
        <NavLink key={t} to={t === "overview" ? base : `${base}/${t}`} end className="docs-tab" aria-current={active === t ? "page" : undefined}>{LABEL[t]}</NavLink>
      ))}
    </nav>
  );
}

/**
 * Shows only the sections of the active tab (sections are `.fd-section` elements headed by an `h2` with an id)
 * and returns the table of contents for what is visible.
 */
export function useSectionTabs(ref: RefObject<HTMLElement | null>, tabs: TabMap | undefined, active: SectionTab, key: string) {
  const [toc, setToc] = useState<{ id: string; text: string }[]>([]);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !tabs) return;
    const ids = new Set(tabs[active] ?? []);
    el.querySelectorAll<HTMLElement>("section.fd-section").forEach((s) => {
      const id = s.querySelector("h2[id]")?.id;
      s.hidden = !!id && !ids.has(id);
    });
  }, [ref, tabs, active, key]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = window.setTimeout(() => {
      setToc([...el.querySelectorAll<HTMLElement>("h2[id]")].filter((h) => !h.closest("section[hidden]")).map((h) => ({ id: h.id, text: h.textContent ?? "" })));
    }, 30);
    return () => window.clearTimeout(t);
  }, [ref, active, key]);
  return toc;
}
