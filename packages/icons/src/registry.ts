/**
 * Name-based lookup, for data-driven UI (status maps, CMS content, agent output).
 * This entry pulls in every icon. In hand-written UI import named components instead.
 */
import { createElement } from "react";
import type { IconProps } from "./create-icon.js";
import { icons, type IconName } from "./generated/registry.js";

export { icons, type IconName };

export function isIconName(name: string): name is IconName {
  return Object.prototype.hasOwnProperty.call(icons, name);
}

/** Renders an icon by name; falls back to `status-unknown` so unknown data never crashes the UI. */
export function DynamicIcon({ name, ...props }: IconProps & { name: string }) {
  const Component = isIconName(name) ? icons[name] : icons["status-unknown"];
  return createElement(Component, props);
}
