import { IconDownload, IconStatusInfo } from "@faun-ds/icons";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { Inline } from "../Layout/Layout";
import { Tooltip } from "./Tooltip";

export function Thumbnail() {
  return (
    <div className="faun-tooltip" style={{ position: "static", animation: "none" }}>
      <span>Download</span><kbd className="faun-tooltip-shortcut">⌘D</kbd>
    </div>
  );
}

export function Overview() {
  return (
    <Tooltip content="Locked after approval">
      <Button aria-disabled="true" style={{ cursor: "not-allowed" }}>Edit factor</Button>
    </Tooltip>
  );
}

export function Sides() {
  return (
    <Inline gap="4">
      <Tooltip content="Top" side="top"><Button>Top</Button></Tooltip>
      <Tooltip content="Right" side="right"><Button>Right</Button></Tooltip>
      <Tooltip content="Bottom" side="bottom"><Button>Bottom</Button></Tooltip>
      <Tooltip content="Left" side="left"><Button>Left</Button></Tooltip>
    </Inline>
  );
}

export function WithShortcut() {
  return (
    <Tooltip content="Download evidence package" shortcut="⌘D">
      <IconButton icon={<IconDownload />} label="Download evidence package" tooltip={false} variant="outline" />
    </Tooltip>
  );
}

export function Open() {
  return (
    <Tooltip content="DEFRA 2025 factor, location-based" defaultOpen side="right">
      <Button leadingIcon={<IconStatusInfo />}>Factor source</Button>
    </Tooltip>
  );
}

export function DoShortHint() {
  return <Tooltip content="Copy run ID"><Button>Copy</Button></Tooltip>;
}

export function DontEssentialInfo() {
  return <Tooltip content="You must attach evidence before approving. Open the evidence tab, add at least one file, then return here."><Button>Approve</Button></Tooltip>;
}
