import { IconDownload, IconPlay } from "@faun-ds/icons";
import { StatusBadge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import { Card } from "../Card/Card";
import { Tag } from "../Tag/Tag";
import { Divider, Inline, Stack } from "./Layout";

const block = { padding: "var(--faun-space-3)", borderRadius: "var(--faun-radius-md)", background: "var(--faun-bg-surface)", border: "var(--faun-border-width-hairline) solid var(--faun-border-subtle)", fontSize: "var(--faun-type-body-sm-font-size)" } as const;

export function Thumbnail() {
  return (
    <Stack gap="2" style={{ inlineSize: 180 }}>
      <div style={block}>ESRS E1 Climate</div>
      <Inline gap="1.5"><Tag variant="framework">E1-6</Tag><Tag variant="framework">§44</Tag></Inline>
      <Divider />
      <div style={block}>ESRS E3 Water</div>
    </Stack>
  );
}

export function Overview() {
  return (
    <Card style={{ inlineSize: "min(100%, 440px)" }}>
      <Stack gap="3">
        <Inline justify="between">
          <strong>Gross Scope 1 GHG emissions</strong>
          <StatusBadge domain="data-quality" state="evidenced" />
        </Inline>
        <Inline gap="1.5"><Tag variant="framework">ESRS E1-6</Tag><Tag variant="framework">§44(a)</Tag><Tag>Chennai plant</Tag></Inline>
        <Divider />
        <Inline justify="end">
          <Button variant="outline" leadingIcon={<IconDownload />}>Export evidence</Button>
          <Button variant="solid" intent="accent" leadingIcon={<IconPlay />}>Recalculate</Button>
        </Inline>
      </Stack>
    </Card>
  );
}

export function StackGaps() {
  return (
    <Inline gap="8" align="start">
      {(["1", "3", "6"] as const).map((g) => (
        <Stack key={g} gap={g} style={{ inlineSize: 140 }}>
          <span style={{ fontSize: "var(--faun-type-caption-font-size)", color: "var(--faun-fg-muted)" }}>gap {g}</span>
          <div style={block}>Scope 1</div><div style={block}>Scope 2</div><div style={block}>Scope 3</div>
        </Stack>
      ))}
    </Inline>
  );
}

export function InlineWrap() {
  return (
    <Inline gap="1.5" style={{ maxInlineSize: 360 }}>
      {["CSRD", "ESRS E1", "ESRS E2", "ESRS E3", "ESRS S1", "GRI 305", "CDP C6", "ISSB S2", "SB 253"].map((t) => <Tag key={t} variant="framework">{t}</Tag>)}
    </Inline>
  );
}

export function Dividers() {
  return (
    <Stack gap="4" style={{ inlineSize: "min(100%, 420px)" }}>
      <Divider />
      <Divider label="Earlier this week" />
      <Inline gap="3" style={{ blockSize: 24 }}>
        <span>12 sources</span><Divider orientation="vertical" /><span>7 tool calls</span><Divider orientation="vertical" /><span>1 m 48 s</span>
      </Inline>
    </Stack>
  );
}

export function DoUseGap() {
  return (
    <Inline gap="2"><Button variant="outline">Edit scores</Button><Button variant="solid" intent="accent">Approve and continue</Button></Inline>
  );
}

export function DontUseMargins() {
  return (
    <div><Button variant="outline" style={{ marginInlineEnd: 13 }}>Edit scores</Button><Button variant="solid" intent="accent" style={{ marginInlineStart: 2 }}>Approve and continue</Button></div>
  );
}
