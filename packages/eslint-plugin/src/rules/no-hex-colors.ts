import type { Rule } from "eslint";
import { jsxName, onStrings, type Node } from "../utils/ast.js";

const HEX = /(^|[^\w&#/-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![\w-])/g;
const FUNCTIONAL = /(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(\s*(?!var\()[^)]*\)/gi;
/** Attributes whose values are anchors or ids, never colours. */
const NON_COLOR_ATTRIBUTES = new Set(["href", "to", "id", "htmlFor", "xlinkHref", "src", "name", "key", "value", "role", "target", "rel", "data-testid"]);

export interface Options {
  /** Literal colour strings to allow, e.g. "#fff" in a fixture. Case-insensitive. */
  allow?: string[];
  /** Also flag rgb(), hsl(), oklch() and similar functions. Default true. */
  functions?: boolean;
}

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow hex colours and colour functions; use Faun tokens instead.",
      recommended: true,
    },
    messages: {
      hex: "Hex colour {{value}} is off-system. Use a semantic utility (bg-surface, text-fg-muted), var(--faun-…) or `vars` from @faun-ds/tokens.",
      fn: "Colour function {{value}} is off-system. Use a semantic utility, var(--faun-…) or `vars` from @faun-ds/tokens.",
    },
    schema: [
      {
        type: "object",
        properties: {
          allow: { type: "array", items: { type: "string" }, uniqueItems: true },
          functions: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const opts = (context.options[0] ?? {}) as Options;
    const allow = new Set((opts.allow ?? []).map((s) => s.toLowerCase()));
    const functions = opts.functions !== false;
    return onStrings((node: Node, text: string) => {
      const attr = node.parent?.type === "JSXAttribute" ? node.parent : null;
      if (attr && NON_COLOR_ATTRIBUTES.has(jsxName(attr.name))) return;
      if (node.type === "JSXText") return;
      for (const m of text.matchAll(HEX)) {
        const value = m[0].slice(m[1]!.length);
        if (allow.has(value.toLowerCase())) continue;
        context.report({ node, messageId: "hex", data: { value } });
      }
      if (functions) {
        for (const m of text.matchAll(FUNCTIONAL)) {
          if (allow.has(m[0].toLowerCase())) continue;
          context.report({ node, messageId: "fn", data: { value: m[0] } });
        }
      }
    });
  },
};

export default rule;
