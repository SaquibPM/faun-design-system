import tokensJson from "@faun-ds/tokens/json";
import { useEffect, useState, type ReactNode } from "react";

export type Token = { name: string; cssVar: string | null; type: string; category: string; description: string | null; value?: unknown; values?: Record<string, string> };
export const TOKENS = (tokensJson as { tokens: Token[] }).tokens;
export const byCategory = (c: string) => TOKENS.filter((t) => t.category === c);
export const tokenNamed = (n: string) => TOKENS.find((t) => t.name === n);

export function H2({ id, children, lede }: { id: string; children: ReactNode; lede?: ReactNode }) {
  return (
    <div className="fd-head">
      <h2 className="docs-h2" id={id}>{children}</h2>
      {lede ? <p className="fd-lede">{lede}</p> : null}
    </div>
  );
}

/** Copies text; returns a setter + "copied" flag for the UI. */
export function useCopy(): [string | null, (s: string) => void] {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (s: string) => {
    navigator.clipboard?.writeText(s).then(() => { setCopied(s); window.setTimeout(() => setCopied(null), 1400); }).catch(() => {});
  };
  return [copied, copy];
}

/** Reads a resolved CSS custom property from an element, re-reading when the theme attribute changes. */
export function useCssVar(name: string, el?: HTMLElement | null) {
  const [v, setV] = useState("");
  useEffect(() => {
    const read = () => setV(getComputedStyle(el ?? document.documentElement).getPropertyValue(name).trim());
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-faun-theme", "style"] });
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    return () => { mo.disconnect(); mq.removeEventListener("change", read); };
  }, [name, el]);
  return v;
}

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: [T, string][]; label: string }) {
  return (
    <div className="fd-seg" role="radiogroup" aria-label={label}>
      {options.map(([v, l]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}>{l}</button>
      ))}
    </div>
  );
}
