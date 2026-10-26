import { IconFileText, IconOrchestrator, IconPlay, IconSearch, IconSettings } from "@faun-ds/icons";
import { Button, CommandPalette, Kbd, type CommandPaletteItem } from "@faun-ds/react";
import { useState } from "react";
import { H2 } from "../foundations/shared";

export function SearchCommandPattern() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<string | null>(null);
  const pick = (label: string) => () => setLast(label);
  const items: CommandPaletteItem[] = [
    { value: "csrd", label: "CSRD filing FY2026", description: "ESRS E1-6 · 3 approvals open", group: "Filings", icon: <IconFileText />, keywords: ["disclosure"], onSelect: pick("CSRD filing FY2026") },
    { value: "gri", label: "GRI 305 emissions disclosure", description: "Draft · due 30 Nov", group: "Filings", icon: <IconFileText />, onSelect: pick("GRI 305 emissions disclosure") },
    { value: "scope3", label: "Scope 3 Sub-agent", description: "Category 1 · purchased goods", group: "Agents", icon: <IconOrchestrator />, keywords: ["suppliers", "value chain"], onSelect: pick("Scope 3 Sub-agent") },
    { value: "materiality", label: "Materiality Agent", description: "Awaiting your approval", group: "Agents", icon: <IconOrchestrator />, onSelect: pick("Materiality Agent") },
    { value: "run", label: "Start a run", description: "Pick an agent and a period", group: "Actions", icon: <IconPlay />, shortcut: ["⌘", "R"], onSelect: pick("Start a run") },
    { value: "settings", label: "Workspace settings", group: "Actions", icon: <IconSettings />, onSelect: pick("Workspace settings") },
  ];
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="example" lede="One shortcut to jump to a filing or agent, or to run a common action, from anywhere. Open it with the button or press Cmd or Ctrl K in the app; type to filter and use the arrow keys.">Example</H2>
        <div className="pt-center">
          <Button leadingIcon={<IconSearch />} trailingIcon={<Kbd keys={["⌘", "K"]} size="sm" />} onClick={() => setOpen(true)}>Search or jump to</Button>
          <span className="pt-note">{last ? `Last chosen: ${last}` : "Nothing chosen yet"}</span>
        </div>
        <CommandPalette open={open} onOpenChange={setOpen} items={items} hotkey={false} placeholder="Search filings, agents and actions" />
      </section>
      <section className="fd-section">
        <H2 id="rules">Rules</H2>
        <ul className="fd-rules">
          <li>Always show the trigger with its shortcut. The search field in the top bar and the palette are the same entry point.</li>
          <li>Group results by what they are (Filings, agents, Actions) and keep group order stable. Put the most likely group first.</li>
          <li>Labels are nouns for places and verbs for actions. A description carries state ("3 approvals open"), not instructions.</li>
          <li>Match on keywords as well as labels, so "suppliers" finds the Scope 3 Sub-agent.</li>
          <li>An empty result says what to try. Never leave the list blank.</li>
          <li>Use the palette to navigate and start actions. Anything that needs several inputs opens its own form instead.</li>
          <li>Search for records inside a table uses that table's SearchField, not the palette.</li>
        </ul>
      </section>
    </div>
  );
}
