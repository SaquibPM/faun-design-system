import { useRef } from "react";
import { Navigate, useParams } from "react-router";
import { SectionTabBar, resolveTab, useSectionTabs } from "../components/SectionTabs";
import { patternPages } from "./patterns";
import { NotFound } from "./NotFound";

export function PatternPage() {
  const { slug, tab: tabParam } = useParams();
  const p = patternPages.find((f) => f.slug === slug);
  const moved = p ? undefined : patternPages.find((f) => f.aliases?.includes(slug ?? ""));
  const article = useRef<HTMLDivElement>(null);
  const active = resolveTab(p?.tabs, tabParam);
  const toc = useSectionTabs(article, p?.tabs, active, slug ?? "");
  if (moved) return <Navigate replace to={`/patterns/${moved.slug}${tabParam ? `/${tabParam}` : ""}`} />;
  if (!p) return <NotFound />;
  return (
    <div className={p.wide ? "docs-page" : "docs-page docs-page-with-toc"}>
      <article className="docs-article docs-article-wide" ref={article}>
        <header className="docs-page-head">
          <p className="docs-eyebrow">Patterns</p>
          <h1 className="docs-h1">{p.title}</h1>
          <p className="docs-lede">{p.description}</p>
        </header>
        {p.tabs ? <SectionTabBar base={`/patterns/${p.slug}`} tabs={p.tabs} active={active} label={`${p.title} documentation`} /> : null}
        <p.Component />
      </article>
      {p.wide ? null : <nav className="docs-toc" aria-label="On this page">
        {toc.length ? <p className="docs-toc-title">On this page</p> : null}
        <ul>{toc.map((t) => <li key={t.id} data-level={2}><a href={`#${t.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(t.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{t.text}</a></li>)}</ul>
      </nav>}
    </div>
  );
}
