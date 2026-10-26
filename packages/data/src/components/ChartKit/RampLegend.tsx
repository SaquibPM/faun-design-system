import type { CssVar } from "./scale.js";

/** A continuous-looking colour key: the ramp steps with the values at each end (and the midpoint for diverging scales). */
export function RampLegend({ ramp, from, to, mid, label }: { ramp: CssVar[]; from: string; to: string; mid?: string; label: string }) {
  return (
    <div className="faun-chart-legend-ramp" role="group" aria-label={label}>
      <div className="faun-chart-ramp-steps" aria-hidden="true">{ramp.map((c) => <span key={c} style={{ background: c }} />)}</div>
      <div className="faun-chart-ramp-ends"><span>{from}</span>{mid ? <span>{mid}</span> : null}<span>{to}</span></div>
    </div>
  );
}
