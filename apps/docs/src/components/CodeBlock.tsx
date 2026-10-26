import { IconButton } from "@faun-ds/react";
import { IconCheck, IconCopy } from "@faun-ds/icons";
import { useEffect, useState } from "react";
import { createHighlighterCore, createCssVariablesTheme, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

const theme = createCssVariablesTheme({ name: "faun", variablePrefix: "--shiki-", variableDefaults: {}, fontStyle: true });
let highlighter: Promise<HighlighterCore> | null = null;
function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [theme],
    langs: [import("shiki/langs/tsx.mjs"), import("shiki/langs/css.mjs"), import("shiki/langs/bash.mjs"), import("shiki/langs/json.mjs")],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

export function CodeBlock({ code, lang = "tsx", title }: { code: string; lang?: "tsx" | "css" | "bash" | "json"; title?: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    let live = true;
    getHighlighter().then((h) => { if (live) setHtml(h.codeToHtml(code, { lang, theme: "faun" })); }).catch(() => {});
    return () => { live = false; };
  }, [code, lang]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* clipboard refused: leave text selectable */ }
  };
  return (
    <div className="docs-code">
      {title ? <div className="docs-code-title">{title}</div> : null}
      <IconButton className="docs-code-copy" size="sm" icon={copied ? <IconCheck /> : <IconCopy />} label={copied ? "Copied" : "Copy code"} onClick={copy} />
      {html ? <div className="docs-code-body" dangerouslySetInnerHTML={{ __html: html }} /> : <pre className="docs-code-body"><code>{code}</code></pre>}
    </div>
  );
}
