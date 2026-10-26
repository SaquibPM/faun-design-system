import { Inline, Stack } from "../Layout/Layout";
import { Link } from "./Link";

export function Thumbnail() {
  return <Link href="#evidence">Evidence register</Link>;
}

export function Overview() {
  return (
    <p style={{ margin: 0, maxInlineSize: "var(--faun-layout-reading-max)" }}>
      Scope 2 location-based emissions use the 2026 grid factors. <Link href="#factors">See the factor library</Link> or read the{" "}
      <Link href="https://www.efrag.org" external>ESRS E1 disclosure requirements</Link>{"\u00a0"}for the wording.
    </p>
  );
}

export function Tones() {
  return (
    <Stack gap="3">
      <Link href="#run">Default: Run 418 log</Link>
      <span style={{ color: "var(--faun-fg-muted)" }}>Prepared by CSRD Narrative Agent · <Link href="#run" tone="muted">View run</Link></span>
    </Stack>
  );
}

export function Underline() {
  return (
    <Inline gap="6">
      <Link href="#all">Always underlined</Link>
      <Link href="#all" underline="hover">Underlined on hover</Link>
    </Inline>
  );
}

export function External() {
  return <Link href="https://ghgprotocol.org" external>GHG Protocol Scope 3 standard</Link>;
}

export function DoDescriptive() {
  return <Link href="#report">Download the FY2026 Scope 1 and 2 report</Link>;
}

export function DontClickHere() {
  return <span>To get the FY2026 Scope 1 and 2 report, <Link href="#report">click here</Link>.</span>;
}
