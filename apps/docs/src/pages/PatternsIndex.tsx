import { Badge } from "@faun-ds/react";
import { Link } from "react-router";
import { components } from "../content/registry";
import { patternPages } from "./patterns";

const PANEL_COMPONENTS = ["progress-panel", "artifact-panel", "chat-layout"];

export function PatternsIndex() {
  const featured = patternPages.filter((p) => p.featured);
  const rest = patternPages.filter((p) => !p.featured);
  const panels = PANEL_COMPONENTS.map((slug) => components.find((c) => c.slug === slug)).filter((c) => !!c);
  return (
    <div className="docs-page">
      <article className="docs-article docs-article-wide">
        <header className="docs-page-head">
          <p className="docs-eyebrow">Patterns</p>
          <h1 className="docs-h1">Patterns</h1>
          <p className="docs-lede">{patternPages.length} patterns and page templates: how components work together on a whole screen. Each has a live example, rules, code and accessibility notes.</p>
        </header>

        <section className="docs-index-section" aria-labelledby="pat-assistant">
          <h2 className="docs-h2" id="pat-assistant">Assistant and chat</h2>
          <ul className="docs-card-grid">
            {featured.map((p) => (
              <li key={p.slug}>
                <Link to={`/patterns/${p.slug}`} className="docs-card">
                  <div className="docs-card-body"><span className="docs-card-title">{p.title}<Badge size="sm" tone="accent">New</Badge></span><span className="docs-card-desc">{p.description}</span></div>
                </Link>
              </li>
            ))}
            {panels.map((c) => (
              <li key={c.slug}>
                <Link to={`/components/${c.slug}`} className="docs-card">
                  <div className="docs-card-body"><span className="docs-card-title">{c.meta.title}<Badge size="sm" tone="neutral" variant="outline">Component</Badge></span><span className="docs-card-desc">{c.meta.description}</span></div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="docs-index-section" aria-labelledby="pat-all">
          <h2 className="docs-h2" id="pat-all">Patterns and page templates</h2>
          <ul className="docs-card-grid">
            {rest.map((p) => (
              <li key={p.slug}>
                <Link to={`/patterns/${p.slug}`} className="docs-card">
                  <div className="docs-card-body"><span className="docs-card-title">{p.title}</span><span className="docs-card-desc">{p.description}</span></div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </div>
  );
}
