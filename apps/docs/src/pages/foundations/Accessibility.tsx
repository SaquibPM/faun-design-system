import { Badge } from "@faun-ds/react";
import contrastRows from "@faun-ds/tokens/contrast";
import { H2 } from "./shared";

const COMMITMENTS: [string, string, string][] = [
  ["Contrast", "1.4.3 · 1.4.6 · 1.4.11", "Text meets 4.5:1 in every theme and 7:1 in the high-contrast themes. Control boundaries, focus rings and chart marks meet 3:1. Enforced by the token build."],
  ["Keyboard", "2.1.1 · 2.4.3 · 2.4.7", "Every component is fully operable by keyboard with a logical order and a visible focus ring. Composite widgets follow the WAI-ARIA Authoring Practices."],
  ["Focus appearance", "2.4.11 · 2.4.13", "A 2px ring with a 2px offset in the accent colour, never removed. Focus is never obscured by sticky headers or toasts."],
  ["Target size", "2.5.8", "Interactive targets are at least 24px in compact density and 32px by default; touch-first surfaces use 40px or more."],
  ["Screen readers", "1.3.1 · 4.1.2", "Native elements first, ARIA where needed. VoiceOver and NVDA passes are required before a component is marked stable. Status, progress and live agent output are announced politely."],
  ["Colour independence", "1.4.1", "Status always carries an icon and a word. Charts pair colour with labels, patterns or a table view."],
  ["Motion", "2.3.3", "Reduced-motion and calm modes stop movement. Nothing flashes."],
  ["Forced colours", "Windows High Contrast", "Controls keep visible boundaries and focus using system colours."],
  ["Reflow and zoom", "1.4.4 · 1.4.10", "Layouts reflow to 320px and survive 200% zoom without horizontal scrolling, except data tables, which scroll within their container."],
  ["Content", "3.1 · 3.3", "Plain language, specific errors that say how to fix the problem, labels on every input."],
];

export function AccessibilityPage() {
  const rows = contrastRows as { pass: boolean }[];
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="commitment" lede="Faun targets WCAG 2.2 AA everywhere and AAA text contrast in the high-contrast themes. Accessibility is a property of the tokens and components, tested on every build, not a checklist at the end.">Our commitment</H2>
        <div className="fd-stats">
          <div><b className="fd-num">{rows.filter((r) => r.pass).length}/{rows.length}</b><span>contrast pairs pass</span></div>
          <div><b>5</b><span>themes, including two high-contrast</span></div>
          <div><b>0</b><span>axe violations allowed per component test</span></div>
        </div>
      </section>
      <section className="fd-section">
        <H2 id="standards">What every component guarantees</H2>
        <div className="docs-table-wrap">
          <table className="docs-table">
            <thead><tr><th>Area</th><th>WCAG</th><th>Guarantee</th></tr></thead>
            <tbody>{COMMITMENTS.map(([a, w, g]) => <tr key={a}><td><b>{a}</b></td><td><Badge size="sm" variant="outline">{w}</Badge></td><td>{g}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className="fd-section">
        <H2 id="agentic" lede="Agentic products add their own accessibility problems. Faun solves them once.">Agentic interfaces</H2>
        <ul className="fd-rules">
          <li>Streaming output is announced in sentences, not tokens, through a polite live region that can be paused.</li>
          <li>AI-generated content is labelled in text (“Drafted by CSRD Materiality Agent”), not only by colour or a sparkle icon.</li>
          <li>Approval gates move focus to the decision when they appear in a flow the user started, and never steal focus otherwise.</li>
          <li>Long-running work reports progress as text (“212 of 340 datapoints drafted”), so it is perceivable without watching a bar.</li>
          <li>Citations are real links with descriptive names, reachable by keyboard from the sentence they support.</li>
        </ul>
      </section>
      <section className="fd-section">
        <H2 id="testing">How we test</H2>
        <ul className="fd-rules">
          <li>Token build: contrast contract across five themes; colour-vision checks on chart palettes.</li>
          <li>Component tests: axe on every rendered state, keyboard paths with Testing Library, ARIA wiring for labels, descriptions and errors.</li>
          <li>Visual regression: every documented example in light, dark and high contrast at desktop and mobile widths.</li>
          <li>Manual: screen-reader passes with VoiceOver (macOS, iOS) and NVDA (Windows) before a component is marked stable.</li>
        </ul>
      </section>
    </div>
  );
}
