import { Badge } from "@faun-ds/react";
import { MDXProvider } from "@mdx-js/react";
import { useEffect, useRef, useState } from "react";
import { NavLink, useParams } from "react-router";
import { components } from "../content/registry";
import { TabContext, mdxComponents, type DocTab } from "../components/mdx";
import { CodeBlock } from "../components/CodeBlock";
import { NotFound } from "./NotFound";

const TABS: [DocTab, string][] = [["usage", "Usage"], ["style", "Style"], ["code", "Code"], ["accessibility", "Accessibility"]];

export function ComponentPage() {
  const { slug, tab = "usage" } = useParams();
  const doc = components.find((c) => c.slug === slug);
  const article = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
  useEffect(() => {
    const el = article.current;
    if (!el) return;
    const t = window.setTimeout(() => {
      setToc([...el.querySelectorAll<HTMLElement>("h2[id], h3.docs-example-title")].map((h) => {
        if (!h.id) h.id = (h.textContent ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return { id: h.id, text: h.textContent ?? "", level: h.tagName === "H2" ? 2 : 3 };
      }));
    }, 30);
    return () => window.clearTimeout(t);
  }, [slug, tab]);
  if (!doc) return <NotFound />;
  const { meta, Content } = doc;
  const pkgName = `@faun-ds/${doc.pkg}`;
  const names = meta.components?.length ? meta.components : [doc.folder];
  return (
    <div className="docs-page docs-page-with-toc">
      <article className="docs-article" ref={article}>
        <header className="docs-page-head">
          <p className="docs-eyebrow">{meta.category}</p>
          <h1 className="docs-h1">{meta.title}{meta.status && meta.status !== "stable" ? <Badge tone={meta.status === "new" ? "accent" : "warning"}>{meta.status === "new" ? "New" : "Beta"}</Badge> : null}</h1>
          <p className="docs-lede">{meta.description}</p>
          <div className="docs-page-meta">
            <code>{pkgName}</code>
            <span>Source <code>packages/{doc.pkg}/src/components/{doc.folder}</code></span>
          </div>
        </header>
        <nav className="docs-tabs" aria-label={`${meta.title} documentation`}>
          {TABS.map(([t, label]) => (
            <NavLink key={t} to={`/components/${doc.slug}${t === "usage" ? "" : `/${t}`}`} end className="docs-tab" aria-current={tab === t ? "page" : undefined}>{label}</NavLink>
          ))}
        </nav>
        <div className="docs-prose">
          <TabContext.Provider value={tab as DocTab}>
            <MDXProvider components={mdxComponents as never}>
              {tab === "code" ? (
                <>
                  <h2 className="docs-h2" id="install">Install and import</h2>
                  <CodeBlock lang="bash" code={`pnpm add ${pkgName} @faun-ds/tokens @faun-ds/icons`} />
                  <CodeBlock code={`import "@faun-ds/tokens/css";\nimport "${pkgName}/styles.css";\nimport { ${names.join(", ")} } from "${pkgName}";`} />
                </>
              ) : null}
              <Content />
              {tab === "code" ? (
                <>
                  <h2 className="docs-h2" id="api">API reference</h2>
                  {names.map((n) => <mdxComponents.Props key={n} of={n} />)}
                </>
              ) : null}
            </MDXProvider>
          </TabContext.Provider>
        </div>
      </article>
      <nav className="docs-toc" aria-label="On this page">
        {toc.length ? <p className="docs-toc-title">On this page</p> : null}
        <ul>{toc.map((t) => <li key={t.id} data-level={t.level}><a href={`#${t.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(t.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{t.text}</a></li>)}</ul>
      </nav>
    </div>
  );
}
