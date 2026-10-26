import { IconCopy, IconDownload, IconEdit, IconStatusArchived } from "@faun-ds/icons";
import { Inline } from "../Layout/Layout";
import { DropdownMenuItem, DropdownMenuSeparator } from "../Menu/Menu";
import { OverflowMenu } from "./OverflowMenu";

const items = (
  <>
    <DropdownMenuItem icon={<IconEdit />}>Edit mapping</DropdownMenuItem>
    <DropdownMenuItem icon={<IconCopy />}>Duplicate</DropdownMenuItem>
    <DropdownMenuItem icon={<IconDownload />}>Download CSV</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem icon={<IconStatusArchived />} intent="danger">Archive</DropdownMenuItem>
  </>
);

export function Thumbnail() {
  return <OverflowMenu label="Actions for Scope 2 import">{items}</OverflowMenu>;
}

export function Overview() {
  return <OverflowMenu label="Actions for Scope 2 import">{items}</OverflowMenu>;
}

export function Orientation() {
  return (
    <Inline gap="2">
      <OverflowMenu label="Actions for Scope 2 import, horizontal">{items}</OverflowMenu>
      <OverflowMenu label="Actions for Scope 2 import, vertical" orientation="vertical">{items}</OverflowMenu>
    </Inline>
  );
}

export function Sizes() {
  return (
    <Inline gap="2">
      <OverflowMenu label="Actions, extra small" size="xs" variant="outline">{items}</OverflowMenu>
      <OverflowMenu label="Actions, small" size="sm" variant="outline">{items}</OverflowMenu>
      <OverflowMenu label="Actions, medium" size="md" variant="outline">{items}</OverflowMenu>
      <OverflowMenu label="Actions, large" size="lg" variant="outline">{items}</OverflowMenu>
    </Inline>
  );
}

export function DoNameTheObject() {
  return <OverflowMenu label="Actions for Scope 2 import">{items}</OverflowMenu>;
}

export function DontGenericLabel() {
  return <OverflowMenu label="More">{items}</OverflowMenu>;
}
