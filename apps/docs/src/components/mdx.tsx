import { Badge, Button } from "@faun-ds/react";
import { IconCheck, IconClose, IconCode, IconStatusInfo, IconStatusWarning, IconStatusDanger } from "@faun-ds/icons";
import tokensJson from "@faun-ds/tokens/json";
import { createContext, useContext, useId, useState, type ReactNode } from "react";
import { getExample } from "../content/registry";
import { PaletteSwitch } from "./PaletteSwitch";
import props from "../generated/props.json";
import { CodeBlock } from "./CodeBlock";

export type DocTab = "usage" | "style" | "code" | "accessibility";
export const TabContext = createContext<DocTab | null>(null);

/** Content for one tab of a component page. */
export function Section({ tab, children }: { tab: DocTab; children: ReactNode }) {
  const active = useContext(TabContext);
  if (active && active !== tab) return null;
  return <>{children}</>;
}

type Layout = "center" | "start" | "stretch" | "padded" | "full";

/** Live example rendered from a `*.examples.tsx` export, with its source. `of="Button/Variants"`. */
export function Example({ of, title, description, layout = "center", code = "collapsed", height }: { of: string; title?: string; description?: ReactNode; layout?: Layout; code?: "collapsed" | "open" | "none"; height?: number }) {
  const ex = getExample(of);
  const [show, setShow] = useState(code === "open");
  const [flip, setFlip] = useState(false);
  const pageDark = typeof window !== "undefined" && getComputedStyle(document.documentElement).colorScheme === "dark";
  const previewTheme = flip ? (pageDark ? "light" : "dark") : undefined;
  const id = useId();
  if (!ex) return <Callout tone="danger" title={`Missing example ${of}`}>Add an exported function to the component's examples file.</Callout>;
  const { Component, source } = ex;
  return (
    <figure className="docs-example">
      {title || description ? (
        <figcaption className="docs-example-head">
          {title ? <h3 className="docs-example-title">{title}</h3> : null}
          {description ? <div className="docs-example-desc">{description}</div> : null}
        </figcaption>
      ) : null}
      <div className="docs-example-frame">
        <div className="docs-example-stage" data-layout={layout} data-faun-theme={previewTheme} style={height ? { minHeight: height } : undefined}>
          <Component />
        </div>
        <div className="docs-example-bar">
          <Button size="sm" variant="ghost" aria-pressed={flip} onClick={() => setFlip((d) => !d)}>{pageDark !== flip ? "Light" : "Dark"} preview</Button>
          {code !== "none" ? (
            <Button size="sm" variant="ghost" leadingIcon={<IconCode />} aria-expanded={show} aria-controls={id} onClick={() => setShow((s) => !s)}>
              {show ? "Hide code" : "Show code"}
            </Button>
          ) : null}
        </div>
        {show ? <div id={id}><CodeBlock code={source} /></div> : null}
      </div>
    </figure>
  );
}

type PropRow = { name: string; type: string; required: boolean; default: string | null; description: string };

/** Props table generated from the component's TypeScript types and JSDoc. */
export function Props({ of }: { of: string }) {
  const doc = (props as Record<string, { description: string; props: PropRow[] }>)[of];
  if (!doc) return <Callout tone="warning" title={`No props found for ${of}`}>Run the props script after adding the component.</Callout>;
  return (
    <div className="docs-props">
      <h3 className="docs-h3" id={`props-${of.toLowerCase()}`}><code>{of}</code></h3>
      {doc.description ? <p className="docs-muted">{doc.description}</p> : null}
      <div className="docs-table-wrap">
        <table className="docs-table">
          <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
          <tbody>
            {doc.props.map((p) => (
              <tr key={p.name}>
                <td><code className="docs-prop-name">{p.name}</code>{p.required ? <Badge size="sm" tone="danger" variant="outline">Required</Badge> : null}</td>
                <td><code className="docs-prop-type">{p.type}</code></td>
                <td>{p.default ? <code>{p.default}</code> : <span className="docs-muted">—</span>}</td>
                <td className="docs-prop-desc">{renderInlineCode(p.description)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderInlineCode(s: string) {
  return s.split(/(`[^`]+`)/g).map((part, i) => (part.startsWith("`") ? <code key={i}>{part.slice(1, -1)}</code> : part));
}

export function DoDont({ children }: { children: ReactNode }) {
  return <div className="docs-dodont">{children}</div>;
}
function Rule({ kind, of, children, caption }: { kind: "do" | "dont"; of?: string; children?: ReactNode; caption: ReactNode }) {
  const ex = of ? getExample(of) : null;
  const C = ex?.Component;
  return (
    <figure className="docs-rule" data-kind={kind}>
      <div className="docs-rule-stage">{C ? <C /> : children}</div>
      <figcaption>
        <span className="docs-rule-label">{kind === "do" ? <IconCheck size="sm" /> : <IconClose size="sm" />}{kind === "do" ? "Do" : "Don't"}</span>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}
export const Do = (p: { of?: string; children?: ReactNode; caption: ReactNode }) => <Rule kind="do" {...p} />;
export const Dont = (p: { of?: string; children?: ReactNode; caption: ReactNode }) => <Rule kind="dont" {...p} />;

export function Callout({ tone = "info", title, children }: { tone?: "info" | "warning" | "danger"; title?: ReactNode; children?: ReactNode }) {
  const Icon = tone === "warning" ? IconStatusWarning : tone === "danger" ? IconStatusDanger : IconStatusInfo;
  return (
    <aside className="docs-callout" data-tone={tone}>
      <Icon size="md" />
      <div>{title ? <p className="docs-callout-title">{title}</p> : null}{children}</div>
    </aside>
  );
}

/** Keyboard interaction table. rows: [keys, behaviour]. */
export function Keys({ rows }: { rows: [string, string][] }) {
  return (
    <div className="docs-table-wrap">
      <table className="docs-table">
        <thead><tr><th>Key</th><th>Behaviour</th></tr></thead>
        <tbody>
          {rows.map(([k, b]) => (
            <tr key={k}><td>{k.split(" + ").map((x, i) => <span key={i}>{i ? " + " : ""}<kbd className="docs-kbd">{x}</kbd></span>)}</td><td>{b}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Lists component tokens with a prefix, e.g. <ComponentTokens name="button" />. */
export function ComponentTokens({ name }: { name: string }) {
  const rows = (tokensJson as { tokens: { name: string; cssVar: string; value?: string }[] }).tokens.filter((t) => t.name.startsWith(`component.${name}.`));
  return (
    <div className="docs-table-wrap">
      <table className="docs-table">
        <thead><tr><th>Token</th><th>Value</th></tr></thead>
        <tbody>{rows.map((t) => <tr key={t.name}><td><code>{t.cssVar}</code></td><td><code>{t.value}</code></td></tr>)}</tbody>
      </table>
    </div>
  );
}

/** Lists semantic tokens a component uses: <UsesTokens names={["accent.solid-bg", ...]} /> */
export function UsesTokens({ names }: { names: string[] }) {
  const all = (tokensJson as { tokens: { name: string; cssVar: string; description?: string | null }[] }).tokens;
  return (
    <div className="docs-table-wrap">
      <table className="docs-table">
        <thead><tr><th></th><th>Token</th><th>Role</th></tr></thead>
        <tbody>
          {names.map((n) => {
            const t = all.find((x) => x.name === n);
            return (
              <tr key={n}>
                <td><span className="docs-token-chip" style={{ background: `var(${t?.cssVar ?? ""})` }} /></td>
                <td><code>{t?.cssVar ?? n}</code></td>
                <td className="docs-muted">{t?.description ?? ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export const mdxComponents = {
  Section, Example, Props, DoDont, Do, Dont, Callout, Keys, ComponentTokens, UsesTokens, CodeBlock, PaletteSwitch,
  pre: (p: { children?: { props?: { children?: string; className?: string } } }) => {
    const code = String(p.children?.props?.children ?? "").replace(/\n$/, "");
    const lang = (p.children?.props?.className ?? "").replace("language-", "") as "tsx" | "css" | "bash" | "json";
    return <CodeBlock code={code} lang={lang || "tsx"} />;
  },
  h2: (p: { children?: ReactNode }) => <h2 className="docs-h2" id={slug(p.children)}>{p.children}</h2>,
  h3: (p: { children?: ReactNode }) => <h3 className="docs-h3" id={slug(p.children)}>{p.children}</h3>,
  table: (p: { children?: ReactNode }) => <div className="docs-table-wrap"><table className="docs-table">{p.children}</table></div>,
};
export function slug(children: ReactNode): string {
  const text = typeof children === "string" ? children : Array.isArray(children) ? children.map((c) => (typeof c === "string" ? c : "")).join("") : "";
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
