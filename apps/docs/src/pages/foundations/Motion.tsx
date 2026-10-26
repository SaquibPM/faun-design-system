import { Button } from "@faun-ds/react";
import { IconPlay } from "@faun-ds/icons";
import { useState } from "react";
import { H2, byCategory } from "./shared";

export function MotionPage() {
  const [run, setRun] = useState(0);
  const durations = byCategory("motion").filter((t) => t.name.startsWith("motion.duration"));
  const curves = [
    ["standard", "var(--faun-motion-easing-standard)", "var(--faun-motion-duration-deliberate)", "Movement within the page."],
    ["enter", "var(--faun-motion-easing-enter)", "var(--faun-motion-duration-deliberate)", "Elements arriving."],
    ["exit", "var(--faun-motion-easing-exit)", "var(--faun-motion-duration-deliberate)", "Elements leaving."],
    ["emphasized", "var(--faun-motion-easing-emphasized)", "var(--faun-motion-duration-deliberate)", "Approval gates and completion."],
    ["spring snappy", "var(--faun-motion-spring-snappy)", "450ms", "Popovers, menus, toggles."],
    ["spring gentle", "var(--faun-motion-spring-gentle)", "700ms", "Sheets, panels, layout changes."],
  ];
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="principles" lede="Motion explains what changed. It is quick, follows the user's action, and never decorates.">Principles</H2>
        <div className="fd-principles">
          <div><h3>Responsive</h3><p>Hover and press feedback lands in 120ms. Nothing makes people wait for an animation to finish before they can act.</p></div>
          <div><h3>Directional</h3><p>Things enter with deceleration and leave with acceleration, from the edge or element they relate to.</p></div>
          <div><h3>Calm by default</h3><p>Live indicators pulse slowly. Calm mode stops them entirely; reduced motion removes movement and keeps fades.</p></div>
        </div>
      </section>
      <section className="fd-section">
        <H2 id="curves" lede="Press play to compare. Springs are expressed as CSS linear() curves, so they need no JavaScript.">Easing and springs</H2>
        <Button leadingIcon={<IconPlay />} onClick={() => setRun((r) => r + 1)}>Play</Button>
        <div className="fd-curves" data-run={run % 2 ? "a" : "b"}>
          {curves.map(([name, ease, dur, use]) => (
            <div key={name} className="fd-curve">
              <div className="fd-curve-meta"><code>{name}</code><span className="docs-muted">{use}</span></div>
              <div className="fd-curve-track"><span className="fd-curve-dot" style={{ transitionTimingFunction: ease, transitionDuration: dur }} /></div>
            </div>
          ))}
        </div>
      </section>
      <section className="fd-section">
        <H2 id="durations">Durations</H2>
        <div className="docs-table-wrap">
          <table className="docs-table">
            <thead><tr><th>Token</th><th>Value</th><th>Use</th></tr></thead>
            <tbody>{durations.map((d) => <tr key={d.name}><td><code>{d.cssVar}</code></td><td className="fd-num">{String(d.value)}</td><td className="docs-muted">{d.description}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className="fd-section">
        <H2 id="accessibility" lede="Faun honours prefers-reduced-motion automatically: durations collapse to zero and looping animations stop after one pass. Products can also force it with data-faun-motion=&quot;reduced&quot;, and data-faun-calm stops spinners and pulses for long focus sessions.">Reduced motion</H2>
      </section>
    </div>
  );
}
