import { Badge } from "@faun-ds/react";
import { Link } from "react-router";
import { CATEGORY_ORDER, components, getExample } from "../content/registry";

export function ComponentsIndex() {
  const cats = [...new Set(components.map((c) => c.meta.category))].sort((a, b) => (CATEGORY_ORDER.indexOf(a) + 1 || 99) - (CATEGORY_ORDER.indexOf(b) + 1 || 99));
  return (
    <div className="docs-page">
      <article className="docs-article docs-article-wide">
        <header className="docs-page-head">
          <p className="docs-eyebrow">Components</p>
          <h1 className="docs-h1">Components</h1>
          <p className="docs-lede">{components.length} components across {cats.length} groups. Every one is keyboard-complete, screen-reader tested and themed by tokens.</p>
        </header>
        {cats.map((cat) => (
          <section key={cat} className="docs-index-section" aria-labelledby={`cat-${cat}`}>
            <h2 className="docs-h2" id={`cat-${cat}`}>{cat}</h2>
            <ul className="docs-card-grid">
              {components.filter((c) => c.meta.category === cat).map((c) => {
                const ex = getExample(`${c.folder}/Thumbnail`) ?? getExample(`${c.folder}/Overview`);
                const T = ex?.Component;
                return (
                  <li key={c.slug}>
                    <Link to={`/components/${c.slug}`} className="docs-card">
                      <div className="docs-card-thumb" aria-hidden="true" inert>{T ? <T /> : null}</div>
                      <div className="docs-card-body">
                        <span className="docs-card-title">{c.meta.title}{c.meta.status === "new" ? <Badge size="sm" tone="accent">New</Badge> : null}</span>
                        <span className="docs-card-desc">{c.meta.description}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </article>
    </div>
  );
}
