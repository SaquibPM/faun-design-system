import { Stack } from "../Layout/Layout";
import { Truncate } from "./Truncate";

const box = { inlineSize: "min(100%, 220px)" } as const;
const path = "s3://acme-esg-evidence/2026/scope-2/utility-bills/uk-north-sites-q3-consolidated.pdf";

export function Thumbnail() {
  return <div style={{ inlineSize: "9rem" }}><Truncate>Gross location-based Scope 2 emissions</Truncate></div>;
}

export function Overview() {
  return <div style={box}><Truncate>Gross location-based Scope 2 emissions, all UK sites</Truncate></div>;
}

export function Modes() {
  return (
    <Stack gap="3" style={box}>
      <Truncate mode="end">{path}</Truncate>
      <Truncate mode="middle">{path}</Truncate>
      <Truncate mode="start">{path}</Truncate>
    </Stack>
  );
}

export function MultiLine() {
  return (
    <div style={box}>
      <Truncate lines={2}>Emissions from purchased electricity at all operational-control sites, using supplier-specific factors where available and grid averages otherwise.</Truncate>
    </div>
  );
}

export function DoMiddleForIds() {
  return <div style={box}><Truncate mode="middle">run_01HZX8Q4N7B2K9T3VWE5F6Y1AD</Truncate></div>;
}

export function DontEndForIds() {
  return <div style={box}><Truncate mode="end">run_01HZX8Q4N7B2K9T3VWE5F6Y1AD</Truncate></div>;
}
