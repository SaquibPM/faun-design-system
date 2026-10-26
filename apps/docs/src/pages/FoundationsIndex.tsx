import { IconArrowRight } from "@faun-ds/icons";
import { Link } from "react-router";
import { foundationPages } from "./foundations";

export function FoundationsIndex() {
  return (
    <div className="docs-page">
      <article className="docs-article docs-article-wide">
        <header className="docs-page-head">
          <p className="docs-eyebrow">Faun Design System</p>
          <h1 className="docs-h1">Foundations</h1>
          <p className="docs-lede">The decisions every component is built on: colour, type, space, shape, motion, icons, themes, accessibility and content. Learn these once and every screen follows.</p>
        </header>
        <nav className="home-tiles" aria-label="Foundations">
          {foundationPages.map((f) => (
            <Link key={f.slug} to={`/foundations/${f.slug}`} className="home-tile">
              <span className="home-tile-label">{f.title}</span>
              <span className="home-tile-text">{f.description}</span>
              <IconArrowRight className="home-tile-arrow" />
            </Link>
          ))}
        </nav>
      </article>
    </div>
  );
}
