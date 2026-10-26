import type { Rule } from "eslint";
import { DEFAULT_CLASS_FUNCTIONS, classTokens, inClassContext, onStrings, splitVariants, type Node } from "../utils/ast.js";

/** `text-[11px]`, `-mt-[3px]`, `w-[calc(100%-2rem)]/50`. Group 1 is the bracket content. */
const ARBITRARY_VALUE = /^!?-?[a-z][\w-]*-\[(.+)\](?:\/[\w.[\]%-]+)?!?$/;
/** `[mask-type:luminance]` */
const ARBITRARY_PROPERTY = /^!?\[[a-z-]+:.+\]!?$/;
/** A reference to a Faun token is on-system even inside brackets. */
const FAUN_VAR = /^(?:var\(--faun-[\w-]+(?:,[^)]*)?\)|--faun-[\w-]+)$/;

export interface Options {
  /** Extra helper names whose arguments are class lists, added to cn, clsx, cx, classnames, twMerge, twJoin, cva, tv. */
  classFunctions?: string[];
  /** Bracket contents to allow, matched as regular expression sources, e.g. "^var\\(--radix-". */
  allow?: string[];
}

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow Tailwind arbitrary values such as text-[11px]; use type roles, radii, the spacing scale and named layers.",
      recommended: true,
    },
    messages: {
      value: "Arbitrary Tailwind value `{{token}}` is off-system. Use a type role (text-body-sm), radius (rounded-md), the 4px spacing scale or a named layer (z-modal).",
      property: "Arbitrary Tailwind property `{{token}}` is off-system. Use a token-backed utility or a component.",
    },
    schema: [
      {
        type: "object",
        properties: {
          classFunctions: { type: "array", items: { type: "string" } },
          allow: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const opts = (context.options[0] ?? {}) as Options;
    const fns = [...DEFAULT_CLASS_FUNCTIONS, ...(opts.classFunctions ?? [])];
    const allow = (opts.allow ?? []).map((s) => new RegExp(s));
    return onStrings((node: Node, text: string) => {
      if (node.type === "JSXText" || !inClassContext(context, node, fns)) return;
      for (const token of classTokens(text)) {
        const { utility } = splitVariants(token);
        const value = ARBITRARY_VALUE.exec(utility);
        if (value) {
          const inner = value[1]!;
          if (FAUN_VAR.test(inner) || allow.some((r) => r.test(inner))) continue;
          context.report({ node, messageId: "value", data: { token } });
        } else if (ARBITRARY_PROPERTY.test(utility)) {
          context.report({ node, messageId: "property", data: { token } });
        }
      }
    });
  },
};

export default rule;
