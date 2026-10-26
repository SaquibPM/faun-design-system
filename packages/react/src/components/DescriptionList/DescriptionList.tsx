import { IconCheck, IconCopy } from "@faun-ds/icons";
import { forwardRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { IconButton } from "../IconButton/IconButton.js";

export interface DescriptionItem {
  /** The term, e.g. "Reporting period". */
  term: ReactNode;
  /** The value. Use "—" for empty values rather than leaving the row out. */
  value: ReactNode;
  /** Plain text to copy; shows a copy button on hover and focus. */
  copyValue?: string;
  /** Render the value in the mono face (IDs, slugs, references). */
  mono?: boolean;
}

export interface DescriptionListProps extends HTMLAttributes<HTMLDListElement> {
  items: DescriptionItem[];
  /** `horizontal` puts terms beside values (detail panels); `stacked` puts them above (narrow columns). */
  layout?: "horizontal" | "stacked";
  /** Divider lines between rows. */
  divided?: boolean;
  /** Term column width in horizontal layout, as a CSS length. */
  termWidth?: string;
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <IconButton
      className="faun-dl-copy"
      size="sm"
      icon={done ? <IconCheck /> : <IconCopy />}
      label={done ? "Copied" : "Copy"}
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch { /* clipboard unavailable */ }
      }}
    />
  );
}

/** Key–value metadata for detail panels and summaries. */
export const DescriptionList = forwardRef<HTMLDListElement, DescriptionListProps>(function DescriptionList({ items, layout = "horizontal", divided = true, termWidth, className, style, ...props }, ref) {
  return (
    <dl ref={ref} className={cx("faun-dl", className)} data-layout={layout} data-divided={divided ? "" : undefined} style={termWidth ? { ...style, ["--_term" as string]: termWidth } : style} {...props}>
      {items.map((it, i) => (
        <div key={i} className="faun-dl-row">
          <dt className="faun-dl-term">{it.term}</dt>
          <dd className="faun-dl-value" data-mono={it.mono ? "" : undefined}>
            <span className="faun-dl-text">{it.value}</span>
            {it.copyValue ? <CopyButton text={it.copyValue} /> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
});
