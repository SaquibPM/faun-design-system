import { IconFileText, IconOrchestrator, IconPlay, IconSearch, IconSettings } from "@faun-ds/icons";
import { useState } from "react";
import { Button } from "../Button/Button";
import { Kbd } from "../Kbd/Kbd";
import { Inline, Stack } from "../Layout/Layout";
import { CommandPalette, type CommandPaletteItem } from "./CommandPalette";

const items: CommandPaletteItem[] = [
  { value: "csrd", label: "CSRD filing FY2026", description: "ESRS E1-6 · 3 approvals open", group: "Navigate", icon: <IconFileText />, keywords: ["disclosure"] },
  { value: "scope3", label: "Scope 3 workspace", description: "Category 1 · purchased goods", group: "Navigate", icon: <IconFileText />, keywords: ["value chain", "suppliers"] },
  { value: "agents", label: "Agent catalogue", group: "Navigate", icon: <IconOrchestrator /> },
  { value: "run", label: "Start a run", description: "Pick an agent and a period", group: "Actions", icon: <IconPlay />, shortcut: ["⌘", "R"] },
  { value: "settings", label: "Workspace settings", group: "Actions", icon: <IconSettings /> },
];

export function Thumbnail() {
  return (
    <Inline gap="2" style={{ color: "var(--faun-fg-muted)" }}>
      <IconSearch aria-hidden="true" /> Search <Kbd keys={["⌘", "K"]} size="sm" />
    </Inline>
  );
}

export function Overview() {
  const [open, setOpen] = useState(false);
  return (
    <Stack gap="3" style={{ alignItems: "center" }}>
      <Button leadingIcon={<IconSearch />} trailingIcon={<Kbd keys={["⌘", "K"]} size="sm" />} onClick={() => setOpen(true)}>Search or jump to</Button>
      <CommandPalette open={open} onOpenChange={setOpen} items={items} />
    </Stack>
  );
}

export function WithResults() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<string | null>(null);
  const withActions = items.map((i) => ({ ...i, onSelect: () => setLast(i.label) }));
  return (
    <Stack gap="3" style={{ alignItems: "center" }}>
      <Button onClick={() => setOpen(true)}>Open palette</Button>
      <span style={{ color: "var(--faun-fg-muted)" }}>{last ? `Last command: ${last}` : "No command run yet"}</span>
      <CommandPalette open={open} onOpenChange={setOpen} items={withActions} hotkey={false} placeholder="Type a command or a filing" />
    </Stack>
  );
}

export function DoShortLabels() {
  return <Stack gap="1"><strong>Start a run</strong><span style={{ color: "var(--faun-fg-muted)" }}>Pick an agent and a period</span></Stack>;
}

export function DontLongSentences() {
  return <Stack gap="1"><strong>Click here if you would like to begin a new run of one of your agents</strong></Stack>;
}
