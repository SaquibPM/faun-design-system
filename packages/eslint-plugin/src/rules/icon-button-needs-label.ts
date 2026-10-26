import type { Rule } from "eslint";
import { findAttribute, jsxName, type Node } from "../utils/ast.js";

export interface Options {
  /** Components that must carry an accessible name in `label`. Default ["IconButton"]. */
  components?: string[];
  /** Check native `<button>` elements that contain only icons. Default true. */
  nativeButtons?: boolean;
}

const ICON_NAME = /^(?:Icon[A-Z]\w*|Icon)$/;
const NAMING_ATTRIBUTES = ["aria-label", "aria-labelledby", "title"];

/** True when the attribute value is statically empty (""/undefined/null/false) or absent. */
function isEmptyValue(attr: Node): boolean {
  const v = attr.value;
  if (v === null) return true; // <IconButton label />
  if (v.type === "Literal") return typeof v.value !== "string" || v.value.trim() === "";
  if (v.type === "JSXExpressionContainer") {
    const e = v.expression;
    if (e.type === "Literal") return e.value === null || e.value === false || (typeof e.value === "string" && e.value.trim() === "");
    if (e.type === "Identifier" && e.name === "undefined") return true;
    if (e.type === "TemplateLiteral" && e.expressions.length === 0) return e.quasis.every((q: Node) => !String(q.value.cooked ?? "").trim());
  }
  return false;
}

const hasSpread = (opening: Node) => opening.attributes.some((a: Node) => a.type === "JSXSpreadAttribute");

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Require icon-only buttons to have an accessible label.",
      recommended: true,
    },
    messages: {
      missing: "<{{name}}> needs a `label`. Icon-only buttons have no visible text, so the label is the accessible name and the tooltip.",
      empty: "<{{name}}> has an empty `label`. Say what the button does, e.g. label=\"Download evidence\".",
      native: "Icon-only <button> needs an accessible name. Add aria-label, or use <IconButton label=\"…\" icon={…} />.",
    },
    schema: [
      {
        type: "object",
        properties: {
          components: { type: "array", items: { type: "string" } },
          nativeButtons: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const opts = (context.options[0] ?? {}) as Options;
    const components = new Set(opts.components ?? ["IconButton"]);
    const nativeButtons = opts.nativeButtons !== false;
    return {
      JSXOpeningElement(node: Node) {
        const name = jsxName(node.name);
        if (components.has(name)) {
          const label = findAttribute(node, "label");
          if (!label) {
            // A spread may supply it; we cannot know.
            if (!hasSpread(node)) context.report({ node, messageId: "missing", data: { name } });
          } else if (isEmptyValue(label)) {
            context.report({ node: label, messageId: "empty", data: { name } });
          }
          return;
        }
        if (!nativeButtons || name !== "button" || hasSpread(node)) return;
        if (NAMING_ATTRIBUTES.some((n) => { const a = findAttribute(node, n); return a && !isEmptyValue(a); })) return;
        const children: Node[] = node.parent.children ?? [];
        const meaningful = children.filter((c) => !(c.type === "JSXText" && !c.value.trim()));
        if (!meaningful.length) return;
        const iconOnly = meaningful.every((c) => c.type === "JSXElement" && ICON_NAME.test(jsxName(c.openingElement.name)));
        if (iconOnly) context.report({ node, messageId: "native" });
      },
    };
  },
};

export default rule;
