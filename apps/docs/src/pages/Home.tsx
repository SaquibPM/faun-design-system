import { Button, StatusBadge } from "@faun-ds/react";
import { IconArrowRight } from "@faun-ds/icons";
import manifest from "@faun-ds/icons/manifest.json";
import contrastRows from "@faun-ds/tokens/contrast";
import tokensJson from "@faun-ds/tokens/json";
import { Link } from "react-router";
import { components } from "../content/registry";

function Composition() {
  return (
    <div className="home-comp" aria-hidden="true">
      <div className="home-comp-kpi">
        <span className="home-comp-label">Gross emissions · FY2026</span>
        <span className="home-comp-figure">48,212<small>tCO₂e</small></span>
        <div className="home-comp-bar">
          <i style={{ flex: 3212, background: "var(--faun-dataviz-scope-1)" }} />
          <i style={{ flex: 2090, background: "var(--faun-dataviz-scope-2)" }} />
          <i style={{ flex: 42910, background: "var(--faun-dataviz-scope-3)" }} />
        </div>
        <div className="home-comp-legend"><span><i style={{ background: "var(--faun-dataviz-scope-1)" }} />Scope 1</span><span><i style={{ background: "var(--faun-dataviz-scope-2)" }} />Scope 2</span><span><i style={{ background: "var(--faun-dataviz-scope-3)" }} />Scope 3</span></div>
      </div>
      <div className="home-comp-run">
        <div className="home-comp-row"><b>CSRD Filing Orchestrator</b><StatusBadge domain="run" state="running" size="sm" /></div>
        <span className="home-comp-sub">Drafting ESRS E1 narrative · 212 of 340 datapoints</span>
        <div className="home-comp-progress"><i style={{ inlineSize: "62%" }} /></div>
        <ol className="home-comp-steps">
          <li data-done>Collected activity data from 14 facilities</li>
          <li data-done>Applied DEFRA 2026 and EXIOBASE factors</li>
          <li data-now>Drafting E1-6 gross emissions disclosure</li>
        </ol>
      </div>
      <div className="home-comp-gate">
        <div className="home-comp-row"><b>Approve materiality matrix</b><StatusBadge domain="approval" state="pending" size="sm" /></div>
        <span className="home-comp-sub">11 topics material · 3 changed since FY2025. Drafting E1 and S1 continues after approval.</span>
        <div className="home-comp-actions"><Button size="sm" variant="ghost" tabIndex={-1}>Review changes</Button><Button size="sm" variant="solid" intent="accent" tabIndex={-1}>Approve</Button></div>
      </div>
    </div>
  );
}

const TILES: { label: string; to: string; text: string }[] = [
  { label: "Foundations", to: "/foundations", text: "Colour, type, space, shape, motion, icons, themes, accessibility and content." },
  { label: "Components", to: "/components", text: "Accessible building blocks for forms, navigation, overlays, feedback and layout." },
  { label: "Theming", to: "/foundations/theming", text: "Five themes, density modes and tenant accents generated from one brand colour." },
  { label: "Data visualisation", to: "/foundations/colour#data-viz", text: "Palettes, tables and charts for emissions, targets and materiality." },
  { label: "AI and agents", to: "/guides/ai-agents", text: "Run trails, approval gates, citations and provenance for agentic work." },
  { label: "Assistant and chat", to: "/patterns", text: "Assistant home, and a chat with the left navigation, a progress panel and an artifact panel." },
  { label: "Guides", to: "/guides/getting-started", text: "Install, theme for a tenant, use with Tailwind and adopt Faun in an existing product." },
];

export function Home() {
  const tokenCount = (tokensJson as { tokens: unknown[] }).tokens.length;
  const iconCount = (manifest as { icons: unknown[] }).icons.length;
  const pairs = (contrastRows as unknown[]).length;
  const stats: [string, string][] = [[String(components.length), "components"], [tokenCount.toLocaleString("en-GB"), "tokens"], [String(iconCount), "icons"], [String(pairs), "contrast pairs, all passing"]];
  return (
    <div className="docs-page home">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="docs-eyebrow">Faun Design System</p>
          <h1 className="home-title">Consistent, accessible interfaces for agentic enterprise software.</h1>
          <p className="docs-lede">Tokens, components and patterns for products where agents do the work and people steer, review and sign off. Built for dense data, long-running agent work and regulatory reporting.</p>
          <div className="home-cta">
            <Button asChild variant="solid" intent="accent" size="lg"><Link to="/guides/getting-started">Get started</Link></Button>
            <Button asChild size="lg" variant="outline" trailingIcon={<IconArrowRight />}><Link to="/components">Browse components</Link></Button>
          </div>
        </div>
        <Composition />
      </section>

      <nav className="home-tiles" aria-label="Sections">
        {TILES.map((t) => (
          <Link key={t.label} to={t.to} className="home-tile">
            <span className="home-tile-label">{t.label}</span>
            <span className="home-tile-text">{t.text}</span>
            <IconArrowRight className="home-tile-arrow" />
          </Link>
        ))}
      </nav>

      <dl className="home-stats">
        {stats.map(([n, l]) => <div key={l}><dt>{l}</dt><dd>{n}</dd></div>)}
      </dl>
    </div>
  );
}
