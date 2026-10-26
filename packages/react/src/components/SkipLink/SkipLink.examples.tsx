import { SkipLink } from "./SkipLink";

export function Thumbnail() {
  return <span className="faun-skip-link" style={{ position: "static", transform: "none" }}>Skip to main content</span>;
}

export function Overview() {
  return (
    <div style={{ position: "relative", inlineSize: "min(100%, 420px)", minBlockSize: "6rem", border: "var(--faun-border-width-hairline) solid var(--faun-border-subtle)", borderRadius: "var(--faun-radius-md)", padding: "var(--faun-space-4)" }}>
      <p style={{ margin: 0, color: "var(--faun-fg-muted)" }}>Press Tab once: the link appears over the top-left corner of the page. Press Enter to jump to the content below.</p>
      <SkipLink href="#skip-demo-main" />
      <nav aria-label="Demo" style={{ marginBlock: "var(--faun-space-3)" }}><a href="#skip-demo-nav">Navigation link</a></nav>
      <div id="skip-demo-main" tabIndex={-1} style={{ outline: "none" }}><strong>Main content</strong></div>
    </div>
  );
}

export function Revealed() {
  return (
    <div style={{ position: "relative", minBlockSize: "5rem" }}>
      <SkipLink href="#x" style={{ transform: "none" }}>Skip to main content</SkipLink>
    </div>
  );
}

export function DoFirst() {
  return <SkipLink href="#x" style={{ transform: "none", position: "static" }}>Skip to main content</SkipLink>;
}

export function DontHidden() {
  return <span style={{ color: "var(--faun-fg-muted)" }}>Hidden with display: none, so it can never be focused</span>;
}
