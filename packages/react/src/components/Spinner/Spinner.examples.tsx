import { Button } from "../Button/Button";
import { Inline, Stack } from "../Layout/Layout";
import { Spinner } from "./Spinner";

export function Thumbnail() {
  return <Spinner size="xl" />;
}

export function Overview() {
  return (
    <Inline gap="3" style={{ color: "var(--faun-fg-muted)" }}>
      <Spinner />
      <span>Matching ledger rows to emission factors…</span>
    </Inline>
  );
}

export function Sizes() {
  return (
    <Inline gap="5">
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </Inline>
  );
}

export function InheritsColour() {
  return (
    <Inline gap="5">
      <span style={{ color: "var(--faun-fg-brand)" }}><Spinner /></span>
      <span style={{ color: "var(--faun-fg-muted)" }}><Spinner /></span>
      <span style={{ color: "var(--faun-status-danger-fg)" }}><Spinner /></span>
    </Inline>
  );
}

export function InButton() {
  return <Button loading variant="solid" intent="accent">Generate narrative</Button>;
}

export function DoNameTheWait() {
  return <Stack gap="1"><Inline gap="2"><Spinner label="Drafting ESRS E1-6" /><span>Drafting ESRS E1-6</span></Inline></Stack>;
}

export function DontLongWait() {
  return <Inline gap="2"><Spinner label="Loading" /><span>Importing 2.3 million ledger rows (about 40 minutes)</span></Inline>;
}
