import { MDXProvider } from "@mdx-js/react";
import { useParams } from "react-router";
import { mdxComponents } from "../components/mdx";
import { guidePages } from "./guides";
import { NotFound } from "./NotFound";

export function GuidePage() {
  const { slug } = useParams();
  const g = guidePages.find((x) => x.slug === slug);
  if (!g) return <NotFound />;
  return (
    <div className="docs-page">
      <article className="docs-article">
        <header className="docs-page-head">
          <p className="docs-eyebrow">Guides</p>
          <h1 className="docs-h1">{g.title}</h1>
          <p className="docs-lede">{g.description}</p>
        </header>
        <div className="docs-prose"><MDXProvider components={mdxComponents as never}><g.Content /></MDXProvider></div>
      </article>
    </div>
  );
}
