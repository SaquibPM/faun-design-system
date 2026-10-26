import { useRef } from "react";
import { useParams } from "react-router";
import { SectionTabBar, resolveTab, useSectionTabs } from "../components/SectionTabs";
import { foundationPages } from "./foundations";
import { NotFound } from "./NotFound";

export function FoundationPage() {
  const { slug, tab: tabParam } = useParams();
  const p = foundationPages.find((f) => f.slug === slug);
  const article = useRef<HTMLDivElement>(null);
  const active = resolveTab(p?.tabs, tabParam);
  const toc = useSectionTabs(article, p?.tabs, active, slug ?? "");
  if (!p) return <NotFound />;
  const i = foundationPages.indexOf(p);
  const prev = foundationPages[i - 1];
  const next = foundationPages[i + 1];
  return (
    <div className="docs-page docs-page-with-toc">
      <article className="docs-article docs-article-wide" ref={article}>
        <header className="docs-page-head">
          <p className="docs-eyebrow">Foundations</p>
          <h1 className="docs-h1">{p.title}</h1>
          <p className="docs-lede">{p.description}</p>
        </header>
        {p.tabs ? <SectionTabBar base={`/foundations/${p.slug}`} tabs={p.tabs} active={active} label={`${p.title} documentation`} /> : null}
        <p.Component />
        <nav className="docs-pager" aria-label="Foundations pages">
          {prev ? <a href={`#/foundations/${prev.slug}`} className="docs-pager-link"><span>Previous</span><b>{prev.title}</b></a> : <span />}
          {next ? <a href={`#/foundations/${next.slug}`} className="docs-pager-link" data-next><span>Next</span><b>{next.title}</b></a> : <span />}
        </nav>
      </article>
      <nav className="docs-toc" aria-label="On this page">
        {toc.length ? <p className="docs-toc-title">On this page</p> : null}
        <ul>{toc.map((t) => <li key={t.id} data-level={2}><a href={`#${t.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(t.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{t.text}</a></li>)}</ul>
      </nav>
    </div>
  );
}
