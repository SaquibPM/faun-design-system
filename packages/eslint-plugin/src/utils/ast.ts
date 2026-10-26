import type { Rule } from "eslint";

/** Loose ESTree/JSX node. Typed loosely on purpose: ESLint ships no JSX node types. */
export type Node = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Callee names whose string arguments are treated as class lists. */
export const DEFAULT_CLASS_FUNCTIONS = ["cn", "clsx", "cx", "classnames", "classNames", "twMerge", "twJoin", "cva", "tv"];
export const CLASS_ATTRIBUTES = ["className", "class"];

export function jsxName(node: Node): string {
  const n = node;
  if (!n) return "";
  if (n.type === "JSXIdentifier") return n.name;
  if (n.type === "JSXMemberExpression") return `${jsxName(n.object)}.${jsxName(n.property)}`;
  if (n.type === "JSXNamespacedName") return `${n.namespace.name}:${n.name.name}`;
  return "";
}

export function findAttribute(opening: Node, name: string): Node | undefined {
  return opening.attributes.find((a: Node) => a.type === "JSXAttribute" && jsxName(a.name) === name);
}

/** True when `node` is, or sits inside, a class list: a className attribute or a class helper call. */
export function inClassContext(context: Rule.RuleContext, node: Node, classFunctions: readonly string[]): boolean {
  const ancestors: Node[] = context.sourceCode.getAncestors(node);
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const a = ancestors[i];
    if (a.type === "JSXAttribute" && CLASS_ATTRIBUTES.includes(jsxName(a.name))) return true;
    if (a.type === "CallExpression") {
      const c = a.callee;
      if (c.type === "Identifier" && classFunctions.includes(c.name)) return true;
      if (c.type === "MemberExpression" && c.property.type === "Identifier" && classFunctions.includes(c.property.name)) return true;
    }
    if (a.type === "TaggedTemplateExpression" && a.tag.type === "Identifier" && classFunctions.includes(a.tag.name)) return true;
  }
  return false;
}

/** Visits string literals and template quasis (the text parts), skipping import/export sources. */
export function onStrings(visit: (node: Node, text: string) => void): Rule.RuleListener {
  return {
    Literal(node: Node) {
      if (typeof node.value !== "string") return;
      const p = node.parent;
      if (p && (p.type === "ImportDeclaration" || p.type === "ExportAllDeclaration" || p.type === "ExportNamedDeclaration")) return;
      if (p && p.type === "ImportExpression") return;
      visit(node, node.value);
    },
    TemplateElement(node: Node) {
      visit(node, node.value.cooked ?? node.value.raw);
    },
    JSXText(node: Node) {
      visit(node, node.value);
    },
  };
}

/** Splits a class string into tokens, keeping `[...]` groups (which may contain spaces never, but colons) intact. */
export function classTokens(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/** Splits a Tailwind class into its variants and its utility, ignoring `:` inside brackets. */
export function splitVariants(token: string): { variants: string[]; utility: string } {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of token) {
    if (ch === "[" || ch === "(") depth++;
    else if (ch === "]" || ch === ")") depth--;
    if (ch === ":" && depth === 0) { parts.push(cur); cur = ""; } else cur += ch;
  }
  return { variants: parts, utility: cur };
}
