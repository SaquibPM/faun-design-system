import { Inline, Stack } from "../Layout/Layout";
import { Avatar, AvatarGroup } from "./Avatar";

export function Thumbnail() {
  return (
    <Inline gap="2">
      <Avatar name="Alex Morgan" size="lg" />
      <Avatar name="CSRD Materiality Agent" kind="agent" size="lg" status="running" />
      <AvatarGroup size="md" label="Reviewers"><Avatar name="Priya Raman" /><Avatar name="Tomás Ortega" /><Avatar name="Mei Lin" /></AvatarGroup>
    </Inline>
  );
}

export function Overview() {
  return (
    <Inline gap="6">
      <Avatar name="Alex Morgan" />
      <Avatar name="Priya Raman" />
      <Avatar name="CSRD Materiality Agent" kind="agent" />
      <Avatar name="Ledger Resolver" kind="agent" status="running" />
      <Avatar name="Anna Keller" status="attention" />
    </Inline>
  );
}

export function Sizes() {
  return (
    <Inline gap="4" align="end">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => <Avatar key={s} size={s} name="Priya Raman" />)}
      {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => <Avatar key={"a" + s} size={s} name="Scope 3 Sub-agent" kind="agent" />)}
    </Inline>
  );
}

export function Kinds() {
  return (
    <Stack gap="3">
      <Inline gap="3"><Avatar name="Priya Raman" /><span>Person: initials on a hue derived from the name</span></Inline>
      <Inline gap="3"><Avatar name="CDP Climate Responder" kind="agent" /><span>Agent: the Faun mark on the accent</span></Inline>
    </Stack>
  );
}

export function Status() {
  return (
    <Inline gap="6">
      <Inline gap="2"><Avatar name="Disclosure Drafter" kind="agent" status="running" /><span>Working</span></Inline>
      <Inline gap="2"><Avatar name="Anna Keller" status="attention" /><span>Waiting on you</span></Inline>
    </Inline>
  );
}

export function Group() {
  return (
    <Stack gap="3">
      <AvatarGroup label="Reviewers"><Avatar name="Priya Raman" /><Avatar name="Tomás Ortega" /><Avatar name="Mei Lin" /></AvatarGroup>
      <AvatarGroup label="Contributors" max={3} size="sm">
        <Avatar name="Alex Morgan" /><Avatar name="Priya Raman" /><Avatar name="Ledger Resolver" kind="agent" /><Avatar name="Mei Lin" /><Avatar name="Tomás Ortega" /><Avatar name="Anna Keller" />
      </AvatarGroup>
    </Stack>
  );
}

export function DoAgentMark() {
  return <Inline gap="2"><Avatar name="Narrative Drafter" kind="agent" /><span>Narrative Drafter</span></Inline>;
}

export function DontAgentInitials() {
  return <Inline gap="2"><Avatar name="Narrative Drafter" /><span>Narrative Drafter</span></Inline>;
}
