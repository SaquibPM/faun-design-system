import { IconBuilding, IconFactory, IconFolder } from "@faun-ds/icons";
import { useState } from "react";
import { Badge } from "../Badge/Badge";
import { Stack } from "../Layout/Layout";
import { Tree, type TreeNode } from "./Tree";

const boundary: TreeNode[] = [
  { id: "group", label: "Acme Group", icon: <IconBuilding />, meta: <Badge size="sm" tone="info">3 entities</Badge>, children: [
    { id: "uk", label: "Acme UK", icon: <IconBuilding />, children: [
      { id: "leeds", label: "Leeds plant", icon: <IconFactory /> },
      { id: "bristol", label: "Bristol depot", icon: <IconFactory /> },
    ] },
    { id: "de", label: "Acme Deutschland", icon: <IconBuilding />, children: [{ id: "hamburg", label: "Hamburg warehouse", icon: <IconFactory /> }] },
    { id: "closed", label: "Acme Iberia (closed 2024)", icon: <IconBuilding />, disabled: true },
  ] },
  { id: "jv", label: "Northwind joint venture", icon: <IconBuilding />, meta: <Badge size="sm" tone="neutral">49% equity</Badge> },
];

export function Thumbnail() {
  return <div style={{ inlineSize: "12rem" }}><Tree aria-label="Boundary" items={boundary.slice(0, 1)} defaultExpanded={["group"]} /></div>;
}

export function Overview() {
  return (
    <div style={{ inlineSize: "min(100%, 380px)" }}>
      <Tree aria-label="Organisational boundary" items={boundary} defaultExpanded={["group", "uk"]} defaultSelected="leeds" />
    </div>
  );
}

export function Controlled() {
  const [expanded, setExpanded] = useState<string[]>(["group"]);
  const [selected, setSelected] = useState<string | null>("uk");
  return (
    <Stack gap="3" style={{ inlineSize: "min(100%, 380px)" }}>
      <Tree aria-label="Organisational boundary" items={boundary} expanded={expanded} onExpandedChange={setExpanded} selected={selected} onSelectedChange={setSelected} />
      <span style={{ color: "var(--faun-fg-muted)" }}>Selected: {selected ?? "none"}</span>
    </Stack>
  );
}

export function NoGuides() {
  return (
    <div style={{ inlineSize: "min(100%, 380px)" }}>
      <Tree aria-label="ESRS topics" guides={false} defaultExpanded={["e"]} items={[
        { id: "e", label: "Environment", icon: <IconFolder />, children: [{ id: "e1", label: "E1 Climate change" }, { id: "e2", label: "E2 Pollution" }, { id: "e3", label: "E3 Water" }] },
        { id: "s", label: "Social", icon: <IconFolder />, children: [{ id: "s1", label: "S1 Own workforce" }] },
      ]} />
    </div>
  );
}

export function DoShallow() {
  return <div style={{ inlineSize: "min(100%, 320px)" }}><Tree aria-label="Topics" defaultExpanded={["e"]} items={[{ id: "e", label: "Environment", children: [{ id: "e1", label: "E1 Climate change" }] }]} /></div>;
}

export function DontDeep() {
  return (
    <div style={{ inlineSize: "min(100%, 320px)" }}>
      <Tree aria-label="Deep" defaultExpanded={["a", "b", "c", "d"]} items={[{ id: "a", label: "Level 1", children: [{ id: "b", label: "Level 2", children: [{ id: "c", label: "Level 3", children: [{ id: "d", label: "Level 4", children: [{ id: "e", label: "Level 5" }] }] }] }] }]} />
    </div>
  );
}
