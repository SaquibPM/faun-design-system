import { useEffect, useState } from "react";
import { Stack } from "../Layout/Layout";
import { Meter, ProgressBar, ProgressCircle } from "./Progress";

export function Thumbnail() {
  return (
    <Stack gap="3" style={{ inlineSize: 200 }}>
      <ProgressBar aria-label="Coverage" value={78} />
      <ProgressBar aria-label="Datapoints" max={1034} segments={[{ value: 742, tone: "accent", label: "Evidenced" }, { value: 70, tone: "warning", label: "Estimated" }]} legend={false} />
    </Stack>
  );
}

export function Overview() {
  return (
    <Stack gap="5" style={{ inlineSize: "min(100%, 420px)" }}>
      <ProgressBar label="Datapoints covered" valueLabel="812 of 1,034" value={812} max={1034} />
      <Meter label="Evidence coverage" valueLabel="91%" value={91} low={70} high={90} />
    </Stack>
  );
}

export function Determinate() {
  const [v, setV] = useState(20);
  useEffect(() => { const t = setInterval(() => setV((x) => (x >= 100 ? 0 : x + 10)), 900); return () => clearInterval(t); }, []);
  return (
    <Stack gap="4" style={{ inlineSize: "min(100%, 420px)" }}>
      <ProgressBar label="Drafting disclosures" showValue value={v} />
      <ProgressBar label="Importing ledger" value={null} />
    </Stack>
  );
}

export function Sizes() {
  return (
    <Stack gap="4" style={{ inlineSize: "min(100%, 420px)" }}>
      <ProgressBar aria-label="Small" size="sm" value={40} />
      <ProgressBar aria-label="Medium" size="md" value={60} />
      <ProgressBar aria-label="Large" size="lg" value={80} />
    </Stack>
  );
}

export function Tones() {
  return (
    <Stack gap="4" style={{ inlineSize: "min(100%, 420px)" }}>
      {(["accent", "success", "warning", "danger", "running", "neutral"] as const).map((t) => <ProgressBar key={t} label={t} tone={t} value={65} />)}
    </Stack>
  );
}

export function Segmented() {
  return (
    <ProgressBar
      style={{ inlineSize: "min(100%, 420px)" }}
      label="Datapoint quality"
      max={1034}
      segments={[
        { value: 742, tone: "success", label: "Evidenced" },
        { value: 70, tone: "warning", label: "Estimated" },
        { value: 149, tone: "danger", label: "Gaps" },
      ]}
    />
  );
}

export function Circles() {
  return (
    <div style={{ display: "flex", gap: "var(--faun-space-6)", alignItems: "center" }}>
      <ProgressCircle aria-label="Coverage" value={91} size="lg" tone="success" />
      <ProgressCircle aria-label="Drafted" value={45} size="md" />
      <ProgressCircle aria-label="Importing" value={null} size="sm" />
    </div>
  );
}

export function Meters() {
  return (
    <Stack gap="4" style={{ inlineSize: "min(100%, 420px)" }}>
      <Meter label="Evidence coverage" valueLabel="91%" value={91} low={70} high={90} />
      <Meter label="Data quality" valueLabel="64%" value={64} low={70} high={90} />
      <Meter label="Intensity vs target" valueLabel="18.4 tCO₂e/€m" value={18.4} max={30} low={15} high={20} higherIsBetter={false} target={20} />
    </Stack>
  );
}

export function DoShowTotal() {
  return <ProgressBar style={{ inlineSize: 300 }} label="Datapoints covered" valueLabel="812 of 1,034" value={812} max={1034} />;
}

export function DontBareBar() {
  return <ProgressBar style={{ inlineSize: 300 }} aria-label="Progress" value={78} />;
}

export function Statuses() {
  return (
    <Stack gap="5" style={{ inlineSize: "min(100%, 420px)" }}>
      <ProgressBar label="Importing ledger" value={45} statusText="Reading row 4,500 of 10,000" />
      <ProgressBar label="Importing ledger" value={100} status="finished" statusText="10,000 rows imported" />
      <ProgressBar label="Importing ledger" value={62} status="error" statusText="Import stopped at 62%. Check the file and try again." />
    </Stack>
  );
}

export function Announcements() {
  const [v, setV] = useState<number | null>(null);
  const [status, setStatus] = useState<"active" | "finished" | "error">("active");
  const reset = () => { setStatus("active"); setV(10); };
  return (
    <Stack gap="3" style={{ inlineSize: "min(100%, 420px)" }}>
      <ProgressBar label="Evidence upload" value={status === "finished" ? 100 : v} status={status} statusText={status === "error" ? "Upload stopped. Retry." : undefined} />
      <div style={{ display: "flex", gap: "var(--faun-space-2)", flexWrap: "wrap" }}>
        <button type="button" onClick={reset}>Start</button>
        <button type="button" onClick={() => setV((x) => Math.min(95, (x ?? 0) + 15))}>Advance 15%</button>
        <button type="button" onClick={() => setV(null)}>Unknown total</button>
        <button type="button" onClick={() => setStatus("finished")}>Finish</button>
        <button type="button" onClick={() => setStatus("error")}>Fail</button>
      </div>
    </Stack>
  );
}
