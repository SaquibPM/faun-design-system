import axe from "axe-core";

/** Runs axe on a rendered container. Colour contrast is excluded (jsdom has no layout or computed colours; contrast is enforced by the token contract). */
export async function axeViolations(container: Element) {
  const results = await axe.run(container, {
    rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
  });
  return results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`);
}
