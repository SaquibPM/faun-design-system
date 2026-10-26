import { IconFlame } from "@faun-ds/icons";
import { ProgressBar } from "../Progress/Progress";
import { Stat, StatGroup } from "./Stat";

export function Thumbnail() {
  return <Stat size="sm" label="Scope 1" value="18,240" unit="tCO₂e" />;
}

export function Overview() {
  return (
    <Stat size="lg" label="Scope 1 emissions" value="18,240" unit="tCO₂e" icon={<IconFlame />}
      delta={{ value: "4.2%", direction: "down", sentiment: "good", label: "vs base year 2022" }} footnote="Location-based" />
  );
}

export function Group() {
  return (
    <StatGroup aria-label="FY2026 emissions" minItemWidth="9rem" style={{ inlineSize: "min(100%, 640px)" }}>
      <Stat label="Scope 1" value="18,240" unit="tCO₂e" delta={{ value: "4.2%", direction: "down", sentiment: "good" }} />
      <Stat label="Scope 2" value="9,310" unit="tCO₂e" delta={{ value: "1.1%", direction: "up", sentiment: "bad" }} />
      <Stat label="Scope 3" value="142,880" unit="tCO₂e" delta={{ value: "0%", direction: "flat" }} />
    </StatGroup>
  );
}

export function WithVisual() {
  return (
    <Stat label="Evidence coverage" value="91" unit="%" footnote="2,316 of 2,545 items" style={{ inlineSize: "min(100%, 280px)" }}>
      <ProgressBar value={91} aria-label="Evidence coverage" />
    </Stat>
  );
}

export function Sizes() {
  return (
    <StatGroup variant="plain" minItemWidth="8rem">
      <Stat size="sm" label="Small" value="1,240" unit="tCO₂e" />
      <Stat size="md" label="Medium" value="1,240" unit="tCO₂e" />
      <Stat size="lg" label="Large" value="1,240" unit="tCO₂e" />
    </StatGroup>
  );
}

export function DoSentiment() {
  return <Stat label="Scope 1" value="18,240" unit="tCO₂e" delta={{ value: "4.2%", direction: "down", sentiment: "good", label: "vs base year" }} />;
}

export function DontDirectionAsGood() {
  return <Stat label="Scope 1" value="18,240" unit="tCO₂e" delta={{ value: "4.2%", direction: "down", sentiment: "bad", label: "vs base year" }} />;
}
