import { Inline, Stack } from "../Layout/Layout";
import { Kbd } from "./Kbd";

export function Thumbnail() {
  return <Kbd keys={["⌘", "K"]} />;
}

export function Overview() {
  return (
    <Stack gap="3">
      <Inline gap="3"><span>Search or ask the assistant</span><Kbd keys={["⌘", "K"]} /></Inline>
      <Inline gap="3"><span>Approve and continue</span><Kbd keys={["⌘", "↵"]} /></Inline>
      <Inline gap="3"><span>Close</span><Kbd keys="Esc" /></Inline>
    </Stack>
  );
}

export function Forms() {
  return (
    <Stack gap="3">
      <Inline gap="3"><Kbd keys="Esc" /><span>single key</span></Inline>
      <Inline gap="3"><Kbd keys={["⌘", "⇧", "P"]} /><span>array of keys</span></Inline>
      <Inline gap="3"><Kbd keys="Ctrl+Shift+P" /><span>“+”-joined string</span></Inline>
    </Stack>
  );
}

export function Sizes() {
  return <Inline gap="4"><Kbd size="sm" keys={["⌘", "K"]} /><Kbd size="md" keys={["⌘", "K"]} /></Inline>;
}

export function DoOnePerShortcut() {
  return <Kbd keys={["⌘", "K"]} />;
}

export function DontPlusTyped() {
  return <span><Kbd keys="⌘" /> + <Kbd keys="K" /></span>;
}
