import { IconStatusArchived, IconChevronDown, IconColumns, IconCopy, IconDelete, IconDownload, IconEdit, IconMoreHorizontal, IconPlay, IconShare, IconWorkflow } from "@faun-ds/icons";
import { useState } from "react";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger,
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "./Menu";

export function Thumbnail() {
  return (
    <div className="faun-menu" style={{ animation: "none", minInlineSize: 180 }}>
      <div className="faun-menu-item" data-highlighted=""><span className="faun-menu-icon"><IconPlay size="md" /></span><span className="faun-menu-text"><span className="faun-menu-label">Run now</span></span></div>
      <div className="faun-menu-item"><span className="faun-menu-icon"><IconEdit size="md" /></span><span className="faun-menu-text"><span className="faun-menu-label">Edit</span></span><kbd className="faun-menu-shortcut">⌘E</kbd></div>
      <div className="faun-menu-item" data-intent="danger"><span className="faun-menu-icon"><IconStatusArchived size="md" /></span><span className="faun-menu-text"><span className="faun-menu-label">Archive</span></span></div>
    </div>
  );
}

export function Overview() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button trailingIcon={<IconChevronDown />}>Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem icon={<IconPlay />} shortcut="⌘↵">Run now</DropdownMenuItem>
        <DropdownMenuItem icon={<IconEdit />} shortcut="⌘E">Edit agent</DropdownMenuItem>
        <DropdownMenuItem icon={<IconCopy />}>Duplicate</DropdownMenuItem>
        <DropdownMenuItem icon={<IconWorkflow />}>Use in workflow</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<IconStatusArchived />} intent="danger">Archive</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RowActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton icon={<IconMoreHorizontal />} label="Actions for CSRD Discovery" tooltip={false} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem icon={<IconPlay />} description="Dry run with sample input">Test</DropdownMenuItem>
        <DropdownMenuItem icon={<IconShare />} description="Copy a link to this Sub-agent">Share</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger icon={<IconDownload />}>Export</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Definition (JSON)</DropdownMenuItem>
            <DropdownMenuItem>Run history (CSV)</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<IconDelete />} intent="danger">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Selection() {
  const [cols, setCols] = useState({ frameworks: true, status: true, lastRun: false });
  const [sort, setSort] = useState("recent");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button leadingIcon={<IconColumns />}>View</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Columns</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked={cols.frameworks} onCheckedChange={(v) => setCols((c) => ({ ...c, frameworks: v === true }))}>Frameworks</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={cols.status} onCheckedChange={(v) => setCols((c) => ({ ...c, status: v === true }))}>Status</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={cols.lastRun} onCheckedChange={(v) => setCols((c) => ({ ...c, lastRun: v === true }))}>Last run</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
          <DropdownMenuRadioItem value="recent">Recently used</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="runs">Most runs</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Context() {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div style={{ display: "grid", placeItems: "center", inlineSize: 320, blockSize: 120, border: "1px dashed var(--faun-border-strong)", borderRadius: "var(--faun-radius-lg)", color: "var(--faun-fg-muted)", background: "var(--faun-bg-surface)" }}>
          Right-click the Materiality node
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem icon={<IconPlay />}>Re-run from here</ContextMenuItem>
        <ContextMenuItem icon={<IconEdit />}>Open Sub-agent</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem icon={<IconDelete />} intent="danger">Remove node</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function DoGroup() {
  return <Thumbnail />;
}

export function DontLong() {
  return (
    <div className="faun-menu" style={{ animation: "none", minInlineSize: 200, maxBlockSize: 130, overflow: "hidden" }}>
      {["Archive", "Run now", "Delete", "Edit", "Share", "Duplicate"].map((l) => (
        <div key={l} className="faun-menu-item" data-intent={l === "Delete" || l === "Archive" ? "danger" : "neutral"}><span className="faun-menu-text"><span className="faun-menu-label">{l}</span></span></div>
      ))}
    </div>
  );
}
