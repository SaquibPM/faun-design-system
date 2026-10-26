import { IconLeaf } from "@faun-ds/icons";
import { useState } from "react";
import { Inline, Stack } from "../Layout/Layout";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover/Popover";
import { FilterChip, Tag, TagGroup } from "./Tag";

export function Thumbnail() {
  return <Inline gap="2"><Tag variant="framework" size="sm">CSRD</Tag><Tag variant="framework" size="sm">ESRS E1</Tag></Inline>;
}

export function Overview() {
  return (
    <Inline gap="2">
      <Tag variant="framework">CSRD</Tag>
      <Tag variant="framework">ESRS E1-6</Tag>
      <Tag variant="framework">GRI 305</Tag>
      <Tag icon={<IconLeaf />}>Climate</Tag>
      <Tag variant="brand">Scope 3</Tag>
    </Inline>
  );
}

export function Removable() {
  const [tags, setTags] = useState(["CSRD", "CDP climate", "TCFD"]);
  return (
    <Inline gap="2">
      {tags.map((t) => <Tag key={t} onRemove={() => setTags((x) => x.filter((y) => y !== t))}>{t}</Tag>)}
      {tags.length === 0 ? <span style={{ color: "var(--faun-fg-muted)" }}>No frameworks selected</span> : null}
    </Inline>
  );
}

export function Sizes() {
  return <Inline gap="2"><Tag size="sm">Small</Tag><Tag size="md">Medium</Tag></Inline>;
}

export function FilterChips() {
  const [on, setOn] = useState<Record<string, boolean>>({ me: true });
  const toggle = (k: string) => (v: boolean) => setOn((s) => ({ ...s, [k]: v }));
  return (
    <Stack gap="2">
      <Inline gap="2">
        <FilterChip selected={!!on.me} onSelectedChange={toggle("me")} count={3}>Awaiting you</FilterChip>
        <FilterChip selected={!!on.est} onSelectedChange={toggle("est")} count={73}>Estimated</FilterChip>
        <FilterChip selected={!!on.s3} onSelectedChange={toggle("s3")} icon={<IconLeaf />}>Scope 3</FilterChip>
      </Inline>
    </Stack>
  );
}

export function DoFrameworkTag() {
  return <Tag variant="framework">ESRS E1-6</Tag>;
}

export function DontStatusAsTag() {
  return <Tag variant="brand">Approved</Tag>;
}

export function Selectable() {
  const [on, setOn] = useState<Record<string, boolean>>({ CSRD: true });
  return (
    <Inline gap="2">
      {["CSRD", "CDP climate", "GRI 305", "TCFD"].map((f) => <Tag key={f} selectable selected={!!on[f]} onSelectedChange={(v) => setOn((s) => ({ ...s, [f]: v }))}>{f}</Tag>)}
      <Tag selectable disabled>ISSB S2</Tag>
    </Inline>
  );
}

export function FilterTags() {
  const [filters, setFilters] = useState(["Scope: 3", "Status: Estimated", "Year: FY2026"]);
  return (
    <Inline gap="2">
      {filters.map((f) => <Tag key={f} variant="filter" onRemove={() => setFilters((x) => x.filter((y) => y !== f))}>{f}</Tag>)}
      {filters.length ? <Tag variant="operational" onClick={() => setFilters([])}>Clear all</Tag> : <span style={{ color: "var(--faun-fg-muted)" }}>No filters applied</span>}
    </Inline>
  );
}

export function Operational() {
  return (
    <Inline gap="2">
      <Tag variant="framework">CSRD</Tag>
      <Popover>
        <PopoverTrigger asChild><Tag variant="operational" icon={<IconLeaf />}>Climate topics</Tag></PopoverTrigger>
        <PopoverContent size="sm" aria-label="Climate topics">ESRS E1-1 to E1-9 are mapped to this filing. Press a topic to open its datapoints.</PopoverContent>
      </Popover>
    </Inline>
  );
}

export function Overflow() {
  const frameworks = ["CSRD", "ESRS E1", "ESRS E2", "GRI 305", "CDP climate", "TCFD", "ISSB S2"];
  return (
    <div style={{ inlineSize: 320 }}>
      <TagGroup label="Frameworks" max={3}>
        {frameworks.map((f) => <Tag key={f} variant="framework">{f}</Tag>)}
      </TagGroup>
    </div>
  );
}

export function Large() {
  return <Inline gap="2"><Tag size="sm">Small</Tag><Tag>Medium</Tag><Tag size="lg">Large</Tag></Inline>;
}
