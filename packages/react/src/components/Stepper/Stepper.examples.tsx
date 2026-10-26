import { Stepper, type StepItem } from "./Stepper";

const FILING: StepItem[] = [
  { label: "Scope", description: "Entities and period" },
  { label: "Collect data", description: "1,034 datapoints" },
  { label: "Review", description: "Awaiting sign-off" },
  { label: "Publish", description: "XBRL package" },
];

export function Thumbnail() {
  return <div style={{ inlineSize: 240 }}><Stepper steps={[{ label: "A" }, { label: "B" }, { label: "C" }]} current={1} aria-label="Preview" /></div>;
}

export function Overview() {
  return <div style={{ inlineSize: "100%" }}><Stepper steps={FILING} current={1} aria-label="Filing progress" /></div>;
}

export function Vertical() {
  return <Stepper orientation="vertical" steps={FILING} current={2} aria-label="Filing progress" />;
}

export function States() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <Stepper
        aria-label="Import progress"
        current={2}
        steps={[
          { label: "Upload", description: "ledger.csv" },
          { label: "Map columns", description: "14 of 14 mapped" },
          { label: "Validate", description: "3 rows need a fix", state: "error" },
          { label: "Approve", description: "Waiting for J. Rivera", state: "awaiting-human" },
          { label: "Import" },
        ]}
      />
    </div>
  );
}

export function Clickable() {
  return <div style={{ inlineSize: "100%" }}><Stepper aria-label="Filing progress" current={2} steps={FILING.map((s, i) => (i < 2 ? { ...s, onSelect: () => {} } : s))} /></div>;
}

export function DoLabels() {
  return <div style={{ inlineSize: "100%" }}><Stepper aria-label="Example" current={1} steps={[{ label: "Upload" }, { label: "Map columns" }, { label: "Review" }]} /></div>;
}

export function DontTwoStep() {
  return <div style={{ inlineSize: "100%" }}><Stepper aria-label="Example" current={0} steps={[{ label: "Step" }, { label: "Another step" }, { label: "Next step" }, { label: "More" }, { label: "Another" }, { label: "Final" }, { label: "Done" }]} /></div>;
}

export function Statuses() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <Stepper
        showStatus
        aria-label="Import progress"
        current={1}
        steps={[
          { label: "Upload", description: "ledger.csv" },
          { label: "Map columns", description: "2 columns need a match", state: "error" },
          { label: "Review", description: "After mapping", onSelect: () => {}, disabled: true },
          { label: "Publish" },
        ]}
      />
    </div>
  );
}
