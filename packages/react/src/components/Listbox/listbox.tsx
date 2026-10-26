import { IconCheck } from "@faun-ds/icons";
import type { ReactNode } from "react";

/** Option shape shared by Select, Combobox and MultiSelect. */
export interface ListOption {
  value: string;
  label: string;
  /** Secondary line under the label. */
  description?: string;
  /** Leading icon element. */
  icon?: ReactNode;
  disabled?: boolean;
  /** Group heading; options with the same group render together. */
  group?: string;
  /** Extra search terms. */
  keywords?: string[];
}

/** Internal: the inner layout of an option row. */
export function OptionContent({ option, selected, indicator }: { option: Pick<ListOption, "label" | "description" | "icon">; selected?: boolean; indicator?: ReactNode }) {
  return (
    <>
      {indicator ?? (option.icon ? <span className="faun-listbox-option-icon" aria-hidden="true">{option.icon}</span> : null)}
      <span className="faun-listbox-option-text">
        <span className="faun-listbox-option-label">{option.label}</span>
        {option.description ? <span className="faun-listbox-option-desc">{option.description}</span> : null}
      </span>
      {!indicator && selected ? <span className="faun-listbox-option-check" aria-hidden="true"><IconCheck /></span> : null}
    </>
  );
}

/** Groups options by their `group` key, keeping first-seen order. */
export function groupOptions<T extends ListOption>(options: T[]): [string | undefined, T[]][] {
  const out = new Map<string | undefined, T[]>();
  for (const o of options) {
    const list = out.get(o.group) ?? [];
    list.push(o);
    out.set(o.group, list);
  }
  return [...out.entries()];
}
