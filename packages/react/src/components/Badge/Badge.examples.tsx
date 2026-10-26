import { IconLeaf } from "@faun-ds/icons";
import { Inline, Stack } from "../Layout/Layout";
import { Badge, StatusBadge } from "./Badge";

export function Thumbnail() {
  return <StatusBadge domain="run" state="awaiting_approval" />;
}

export function Overview() {
  return (
    <Stack gap="4">
      <Inline gap="2"><StatusBadge domain="run" state="running" /><StatusBadge domain="run" state="awaiting_approval" /><StatusBadge domain="run" state="completed" /><StatusBadge domain="run" state="failed" /></Inline>
      <Inline gap="2"><StatusBadge domain="data-quality" state="evidenced" /><StatusBadge domain="data-quality" state="estimated" /><StatusBadge domain="data-quality" state="gap" /></Inline>
    </Stack>
  );
}

export function Tones() {
  return (
    <Inline gap="2">
      <Badge tone="neutral">Draft</Badge>
      <Badge tone="info">Scope 2</Badge>
      <Badge tone="success">Verified</Badge>
      <Badge tone="warning">Estimated</Badge>
      <Badge tone="danger">Overdue</Badge>
      <Badge tone="running">Drafting</Badge>
      <Badge tone="attention">Needs you</Badge>
      <Badge tone="accent">New</Badge>
    </Inline>
  );
}

export function Variants() {
  return (
    <Inline gap="2">
      <Badge tone="success" variant="soft">Soft</Badge>
      <Badge tone="success" variant="solid">Solid</Badge>
      <Badge tone="success" variant="outline">Outline</Badge>
      <Badge tone="attention" variant="solid">3</Badge>
    </Inline>
  );
}

export function Sizes() {
  return (
    <Inline gap="2">
      <Badge size="sm" tone="info">Small</Badge>
      <Badge size="md" tone="info">Medium</Badge>
    </Inline>
  );
}

export function WithIconAndDot() {
  return (
    <Inline gap="3">
      <Badge tone="success" icon={<IconLeaf />}>Low carbon</Badge>
      <Badge tone="running" dot>Live</Badge>
      <Badge tone="danger" dot>Offline</Badge>
    </Inline>
  );
}

export function DoWordAndIcon() {
  return <StatusBadge domain="data-quality" state="estimated" />;
}

export function DontColourOnly() {
  return <Badge tone="warning" dot aria-label="">{null}</Badge>;
}
