import { IconColumns, IconCopy, IconDownload, IconFilter, IconRefresh, IconRows, IconShare, IconSort } from "@faun-ds/icons";
import { useState } from "react";
import { Toolbar, ToolbarButton, ToolbarSeparator } from "./Toolbar";

export function Thumbnail() {
  return (
    <Toolbar label="Thumbnail">
      <ToolbarButton label="Filter" icon={<IconFilter />} />
      <ToolbarButton label="Sort" icon={<IconSort />} />
      <ToolbarSeparator />
      <ToolbarButton label="Export" icon={<IconDownload />} />
    </Toolbar>
  );
}

export function Overview() {
  const [zebra, setZebra] = useState(false);
  return (
    <Toolbar label="Ledger table actions">
      <ToolbarButton label="Filter" icon={<IconFilter />} />
      <ToolbarButton label="Sort" icon={<IconSort />} />
      <ToolbarButton label="Columns" icon={<IconColumns />} />
      <ToolbarSeparator />
      <ToolbarButton label="Zebra rows" icon={<IconRows />} pressed={zebra} onPressedChange={setZebra} />
      <ToolbarSeparator />
      <ToolbarButton label="Refresh" icon={<IconRefresh />} />
      <ToolbarButton label="Export" icon={<IconDownload />} />
    </Toolbar>
  );
}

export function Overflowing() {
  const [wide, setWide] = useState(false);
  const [zebra, setZebra] = useState(true);
  return (
    <div style={{ display: "grid", gap: "var(--faun-space-3)", justifyItems: "start" }}>
      <label style={{ display: "inline-flex", gap: "var(--faun-space-2)", alignItems: "center" }}>
        <input type="checkbox" checked={wide} onChange={(e) => setWide(e.target.checked)} /> Wide container
      </label>
      <div style={{ inlineSize: wide ? "100%" : 220, maxInlineSize: "100%", transition: "inline-size 200ms" }}>
        <Toolbar label="Table actions" overflow>
          <ToolbarButton label="Filter" icon={<IconFilter />} />
          <ToolbarButton label="Sort" icon={<IconSort />} />
          <ToolbarButton label="Columns" icon={<IconColumns />} />
          <ToolbarSeparator />
          <ToolbarButton label="Zebra rows" icon={<IconRows />} pressed={zebra} onPressedChange={setZebra} />
          <ToolbarButton label="Copy link" icon={<IconCopy />} />
          <ToolbarButton label="Share" icon={<IconShare />} />
          <ToolbarButton label="Export" icon={<IconDownload />} />
        </Toolbar>
      </div>
    </div>
  );
}

export function Vertical() {
  return (
    <Toolbar label="Chart tools" orientation="vertical">
      <ToolbarButton label="Filter" icon={<IconFilter />} />
      <ToolbarButton label="Sort" icon={<IconSort />} />
      <ToolbarSeparator />
      <ToolbarButton label="Export" icon={<IconDownload />} />
    </Toolbar>
  );
}

export function DoGrouped() {
  return (
    <Toolbar label="Grouped">
      <ToolbarButton label="Filter" icon={<IconFilter />} />
      <ToolbarButton label="Sort" icon={<IconSort />} />
      <ToolbarSeparator />
      <ToolbarButton label="Export" icon={<IconDownload />} />
    </Toolbar>
  );
}

export function DontMixed() {
  return (
    <Toolbar label="Mixed">
      <ToolbarButton label="Filter" icon={<IconFilter />} showLabel />
      <ToolbarButton label="Sort" icon={<IconSort />} />
      <ToolbarButton label="Export" icon={<IconDownload />} showLabel />
    </Toolbar>
  );
}
