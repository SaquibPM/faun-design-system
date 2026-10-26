import { IconCopy, IconDownload, IconPlay, IconShare, IconWorkflow } from "@faun-ds/icons";
import { Inline } from "../Layout/Layout";
import { DropdownMenuItem, DropdownMenuSeparator } from "../Menu/Menu";
import { ComboButton, MenuButton } from "./MenuButton";

const exports = (
  <>
    <DropdownMenuItem icon={<IconDownload />}>CSV</DropdownMenuItem>
    <DropdownMenuItem icon={<IconDownload />}>XLSX</DropdownMenuItem>
    <DropdownMenuItem icon={<IconDownload />}>iXBRL package</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem icon={<IconShare />}>Share link</DropdownMenuItem>
  </>
);

const runs = (
  <>
    <DropdownMenuItem icon={<IconPlay />}>Run with sample data</DropdownMenuItem>
    <DropdownMenuItem icon={<IconWorkflow />}>Run as scheduled</DropdownMenuItem>
    <DropdownMenuItem icon={<IconCopy />}>Duplicate and run</DropdownMenuItem>
  </>
);

export function Thumbnail() {
  return <MenuButton menu={exports}>Export</MenuButton>;
}

export function Overview() {
  return <MenuButton menu={exports} leadingIcon={<IconDownload />}>Export</MenuButton>;
}

export function Sizes() {
  return (
    <Inline gap="3">
      <MenuButton menu={exports} size="sm">Export</MenuButton>
      <MenuButton menu={exports} size="md">Export</MenuButton>
      <MenuButton menu={exports} size="lg">Export</MenuButton>
    </Inline>
  );
}

export function Combo() {
  return <ComboButton menu={runs} onClick={() => undefined} leadingIcon={<IconPlay />}>Run now</ComboButton>;
}

export function ComboVariants() {
  return (
    <Inline gap="3">
      <ComboButton menu={runs}>Run now</ComboButton>
      <ComboButton menu={runs} variant="outline" intent="neutral">Run now</ComboButton>
      <ComboButton menu={runs} variant="soft">Run now</ComboButton>
    </Inline>
  );
}

export function DoOneDefault() {
  return <ComboButton menu={runs}>Run now</ComboButton>;
}

export function DontUnrelatedItems() {
  return <ComboButton menu={<><DropdownMenuItem>Delete workspace</DropdownMenuItem><DropdownMenuItem>Change theme</DropdownMenuItem></>}>Run now</ComboButton>;
}
