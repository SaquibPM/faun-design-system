import { Sparkline } from "./Sparkline";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const scope2 = [980, 940, 910, 870, 860, 905, 940, 930, 880, 850, 820, 810];

export function Thumbnail() {
  return <Sparkline title="Scope 2 by month" values={scope2} labels={months} variant="area" width={140} height={44} />;
}

export function Overview() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--faun-space-6)", alignItems: "center" }}>
      <Sparkline title="Scope 2 by month" values={scope2} labels={months} unit="tCO₂e" />
      <Sparkline title="Scope 2 by month, filled" values={scope2} labels={months} unit="tCO₂e" variant="area" />
      <Sparkline title="Scope 2 by month, bars" values={scope2} labels={months} unit="tCO₂e" variant="bar" />
    </div>
  );
}

export function InTable() {
  const rows = [
    { site: "Pune plant", values: [820, 790, 770, 730, 700, 760, 790, 780], total: "6,140" },
    { site: "Chennai plant", values: [540, 520, 500, 480, 470, 500, 520, 510], total: "4,040" },
    { site: "Leeds office", values: [90, 88, 85, 80, 78, 82, 86, 84], total: "673" },
  ];
  return (
    <table style={{ borderCollapse: "collapse", inlineSize: "100%" }}>
      <caption style={{ textAlign: "start", paddingBlockEnd: "var(--faun-space-2)" }}>Scope 1 by site, January to August</caption>
      <thead><tr><th scope="col" style={{ textAlign: "start" }}>Site</th><th scope="col" style={{ textAlign: "start" }}>Trend</th><th scope="col" style={{ textAlign: "end" }}>Total (tCO₂e)</th></tr></thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.site}>
            <th scope="row" style={{ textAlign: "start", fontWeight: "var(--faun-font-weight-regular)" }}>{r.site}</th>
            <td><Sparkline title={`${r.site} Scope 1 trend`} values={r.values} labels={months.slice(0, 8)} unit="tCO₂e" /></td>
            <td style={{ textAlign: "end" }}>{r.total}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function WithGap() {
  return <Sparkline title="Metered water use" values={[120, 118, 125, null, null, 140, 136]} labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]} unit="kL" variant="area" width={160} />;
}

export function Loading() {
  return <Sparkline title="Scope 2 by month" loading values={[]} />;
}

export function Empty() {
  return <Sparkline title="Scope 2 by month" values={[]} />;
}

export function DoTitleIt() {
  return <Sparkline title="Scope 2 emissions by month, tCO₂e" values={scope2} labels={months} unit="tCO₂e" />;
}

export function DontStandAlone() {
  return <Sparkline title="Trend" values={scope2} labels={months} width={60} />;
}
