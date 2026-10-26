import { IconCopy, IconDownload, IconEdit, IconMoreHorizontal } from "@faun-ds/icons";
import { Button } from "../Button/Button";
import { Inline } from "../Layout/Layout";
import { IconButton } from "./IconButton";

export function Thumbnail() {
  return <IconButton icon={<IconDownload />} label="Download" tooltip={false} variant="outline" />;
}

export function Overview() {
  return (
    <Inline gap="2">
      <IconButton icon={<IconEdit />} label="Edit narrative" />
      <IconButton icon={<IconCopy />} label="Copy run ID" shortcut="⌘C" />
      <IconButton icon={<IconDownload />} label="Download evidence package" />
      <IconButton icon={<IconMoreHorizontal />} label="More actions" />
    </Inline>
  );
}

export function Variants() {
  return (
    <Inline gap="2">
      <IconButton icon={<IconEdit />} label="Edit" variant="ghost" />
      <IconButton icon={<IconEdit />} label="Edit" variant="outline" />
      <IconButton icon={<IconEdit />} label="Edit" variant="soft" />
      <IconButton icon={<IconEdit />} label="Edit" variant="solid" intent="accent" />
    </Inline>
  );
}

export function Sizes() {
  return (
    <Inline gap="2">
      <IconButton icon={<IconEdit />} label="Edit, extra small" size="xs" variant="outline" />
      <IconButton icon={<IconEdit />} label="Edit, small" size="sm" variant="outline" />
      <IconButton icon={<IconEdit />} label="Edit, medium" size="md" variant="outline" />
      <IconButton icon={<IconEdit />} label="Edit, large" size="lg" variant="outline" />
      <IconButton icon={<IconEdit />} label="Edit, extra large" size="xl" variant="outline" />
    </Inline>
  );
}

export function DoLabelled() {
  return <IconButton icon={<IconDownload />} label="Download evidence package" variant="outline" />;
}

export function DontUnlabelled() {
  return <Button variant="outline"><IconDownload /></Button>;
}
