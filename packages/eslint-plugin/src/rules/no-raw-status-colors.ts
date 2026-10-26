import type { Rule } from "eslint";
import { DEFAULT_CLASS_FUNCTIONS, classTokens, inClassContext, jsxName, onStrings, splitVariants, type Node } from "../utils/ast.js";

/** Palette hues people reach for to signal status. */
const STATUS_HUES = "red|green|emerald|lime|teal|amber|yellow|orange|rose|pink|sky|cyan|blue|indigo|violet|purple|fuchsia";
const UTILITIES = "text|bg|border|ring|fill|stroke|from|via|to|divide|outline|decoration|accent|caret|shadow|placeholder";
const PALETTE_CLASS = new RegExp(`^!?-?(?:${UTILITIES})-(?:${STATUS_HUES})(?:-(?:50|[1-9]00|950))?(?:/[\\w.[\\]%-]+)?!?$`);
/** `text-green` alone is not a Tailwind class, so a bare hue needs a shade to count. */
const NEEDS_SHADE = new RegExp(`-(?:${STATUS_HUES})$`);

const STYLE_COLOR_PROPS = new Set(["color", "background", "backgroundColor", "borderColor", "borderLeftColor", "borderTopColor", "borderRightColor", "borderBottomColor", "fill", "stroke", "outlineColor"]);
const NAMED_STATUS_COLORS = new Set(["red", "green", "lime", "teal", "amber", "yellow", "orange", "darkred", "darkgreen", "crimson", "tomato", "gold", "limegreen", "forestgreen", "seagreen", "firebrick", "orangered", "goldenrod"]);

export interface Options {
  /** Extra helper names whose arguments are class lists. */
  classFunctions?: string[];
}

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow raw red/green/amber colours for status; use StatusBadge or status-* utilities.",
      recommended: true,
    },
    messages: {
      cls: "`{{token}}` colours a status by hue. Use <StatusBadge domain=… state=… /> (tone, icon and label) or the status-* utilities, never a palette colour.",
      style: "`{{prop}}: {{value}}` colours a status by hue. Use <StatusBadge domain=… state=… /> or var(--faun-status-<tone>-…).",
    },
    schema: [{ type: "object", properties: { classFunctions: { type: "array", items: { type: "string" } } }, additionalProperties: false }],
  },
  create(context) {
    const opts = (context.options[0] ?? {}) as Options;
    const fns = [...DEFAULT_CLASS_FUNCTIONS, ...(opts.classFunctions ?? [])];
    const listeners = onStrings((node: Node, text: string) => {
      if (node.type === "JSXText" || !inClassContext(context, node, fns)) return;
      for (const token of classTokens(text)) {
        const { utility } = splitVariants(token);
        if (!PALETTE_CLASS.test(utility)) continue;
        const bare = utility.replace(/^!/, "").replace(/!$/, "").replace(/\/.*$/, "");
        if (NEEDS_SHADE.test(bare)) continue;
        context.report({ node, messageId: "cls", data: { token } });
      }
    });
    return {
      ...listeners,
      // style={{ color: "green" }}
      Property(node: Node) {
        if (node.parent?.type !== "ObjectExpression") return;
        const key = node.key.type === "Identifier" ? node.key.name : node.key.type === "Literal" ? String(node.key.value) : "";
        if (!STYLE_COLOR_PROPS.has(key) || node.value.type !== "Literal" || typeof node.value.value !== "string") return;
        // Only inside a style attribute, so unrelated objects (chart configs, tests) are left alone.
        const inStyle = context.sourceCode.getAncestors(node).some((a: Node) => a.type === "JSXAttribute" && jsxName(a.name) === "style");
        if (!inStyle) return;
        const value = node.value.value.trim().toLowerCase();
        if (NAMED_STATUS_COLORS.has(value)) context.report({ node, messageId: "style", data: { prop: key, value } });
      },
    };
  },
};

export default rule;
