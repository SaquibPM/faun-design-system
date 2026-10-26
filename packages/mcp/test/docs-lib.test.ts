import { describe, expect, it } from "vitest";
// Shared extraction used by scripts/build-llms.mjs and scripts/build-data.mjs.
import { extractExample, formatValue, mdxToMarkdown, parseFoundations, parseGuide, scanTag, slugify, splitMeta } from "../../../scripts/lib/faun-docs.mjs";
import { buildLlms } from "../../../scripts/build-llms.mjs";
import { buildData } from "../scripts/build-data.mjs";
import { fixture } from "./fixture.js";

const page = `export const meta = { title: "Thing", description: "A thing: with {braces}.", category: "Actions", components: ["Thing"], related: ["other"], order: 3 };

<Section tab="usage">

<Example of="Thing/Overview" />

## When to use

- To do things.

<Example of="Thing/Big" title="Big" description="A big one." code="open" />

<DoDont>
  <Do of="Thing/Good" caption="Do it right." />
  <Dont of="Thing/Bad" caption="Don't do it wrong." />
</DoDont>

</Section>

<Section tab="accessibility">

<Keys rows={[["Tab", "Moves focus."], ["Enter", "Activates | it."]]} />

<UsesTokens names={["accent.solid-bg", "focus.ring"]} />
<ComponentTokens name="thing" />

\`\`\`tsx
const x = <Thing a="<Section>" />;
## not a heading
\`\`\`

</Section>
`;

describe("splitMeta", () => {
  it("parses a multi-line meta with nested values and strips it", () => {
    const { meta, rest } = splitMeta(`export const meta = {\n  title: "A } B",\n  components: ["X", "Y"],\n};\n\nBody`);
    expect(meta).toEqual({ title: "A } B", components: ["X", "Y"] });
    expect(rest.trim()).toBe("Body");
  });
  it("returns an empty meta when none exists", () => {
    expect(splitMeta("Just text").meta).toEqual({});
  });
});

describe("scanTag", () => {
  it("reads string and expression attributes and self-closing", () => {
    const t = scanTag(`<Keys rows={[["a", "b"]]} flag title='x' />rest`, 0)!;
    expect(t).toMatchObject({ name: "Keys", selfClosing: true, closing: false });
    expect(t.attrs).toEqual({ rows: [["a", "b"]], flag: true, title: "x" });
  });
  it("reads closing tags and rejects non-tags", () => {
    expect(scanTag("</DoDont>", 0)).toMatchObject({ name: "DoDont", closing: true });
    expect(scanTag("< 3", 0)).toBeNull();
  });
});

describe("mdxToMarkdown", () => {
  const r = mdxToMarkdown(page, { baseLevel: 2 });
  it("turns sections into headings below the page title and shifts inner headings", () => {
    expect(r.markdown).toContain("### Usage");
    expect(r.markdown).toContain("### Accessibility");
    expect(r.markdown).toContain("#### When to use");
  });
  it("renders examples, do and don't, keys and tokens as Markdown", () => {
    expect(r.markdown).toContain("- Example `Thing/Big` (Big): A big one.");
    expect(r.markdown).toContain("- Do (`Thing/Good`): Do it right.");
    expect(r.markdown).toContain("- Don't (`Thing/Bad`): Don't do it wrong.");
    expect(r.markdown).toContain("| Key | Behaviour |");
    expect(r.markdown).toContain("| Enter | Activates \\| it. |");
    expect(r.markdown).toContain("Uses tokens: `accent.solid-bg`, `focus.ring`");
    expect(r.markdown).toContain("Component tokens: `--faun-thing-*`");
  });
  it("leaves code fences untouched", () => {
    expect(r.markdown).toContain('const x = <Thing a="<Section>" />;');
    expect(r.markdown).toContain("\n## not a heading\n");
  });
  it("collects examples and tokens and leaves no JSX behind", () => {
    expect(r.examples.map((e) => e.ref)).toEqual(["Thing/Overview", "Thing/Big"]);
    expect(r.tokens).toEqual(["accent.solid-bg", "focus.ring"]);
    expect(r.componentTokens).toEqual(["thing"]);
    expect(r.markdown.replace(/```[\s\S]*?```/g, "")).not.toMatch(/<\/?[A-Z]/);
    expect(r.markdown).not.toContain("export const meta");
  });
  it("is idempotent in shape for plain guides", () => {
    const g = parseGuide("tooling", `export const meta = { title: "Tooling", description: "d", order: 6 };\n\nIntro.\n\n## Part\n\ntext`);
    expect(g).toMatchObject({ slug: "tooling", title: "Tooling", order: 6 });
    expect(g.markdown).toBe("Intro.\n\n### Part\n\ntext");
  });
});

describe("small helpers", () => {
  it("slugify", () => {
    expect(slugify("IconButton")).toBe("icon-button");
    expect(slugify("AIThing")).toBe("aithing");
  });
  it("extractExample takes one exported function", () => {
    const src = `import x;\nexport function A() {\n  return 1;\n}\n\nexport function B() {\n  return 2;\n}\n`;
    expect(extractExample(src, "A")).toBe("function A() {\n  return 1;\n}");
    expect(extractExample(src, "B")).toBe("function B() {\n  return 2;\n}");
    expect(extractExample(src, "C")).toBe("");
  });
  it("formatValue flattens composite token values", () => {
    expect(formatValue("16px")).toBe("16px");
    expect(formatValue(null)).toBe("");
    expect(formatValue({ fontFamily: ["IBM Plex Sans", "sans-serif"], fontSize: "14px" })).toBe("fontFamily IBM Plex Sans, sans-serif; fontSize 14px");
  });
  it("parseFoundations reads the registry", () => {
    const src = `{ slug: "colour", title: "Colour", description: "Twelve \\"steps\\".", Component: C },\n{ slug: "grid", title: "Grid", description: "Cols.", Component: G },`;
    expect(parseFoundations(src)).toEqual([{ slug: "colour", title: "Colour", description: 'Twelve "steps".' }, { slug: "grid", title: "Grid", description: "Cols." }]);
  });
});

const input = () => ({
  components: fixture.components.map((c, i) => ({ ...c, order: i })),
  tokens: { name: "Faun", version: "1.2.3", prefix: "faun", themes: { light: {}, dark: {} }, tokens: fixture.tokens },
  statusMap: fixture.statusMap,
  icons: { count: fixture.icons.length, icons: fixture.icons },
  guides: [{ slug: "tooling", title: "Tooling", description: "Lint and MCP.", order: 1, markdown: "### Part\n\ntext" }],
  foundations: [{ slug: "colour", title: "Colour", description: "Scales." }],
  agents: "# Rules\n\n## Building\n\n1. Never write a colour.\n",
  version: "1.2.3",
});

describe("buildLlms", () => {
  const { llms, llmsFull } = buildLlms(input());
  it("llms.txt follows the llmstxt.org shape", () => {
    expect(llms.startsWith("# Faun\n\n> ")).toBe(true);
    expect(llms).toMatch(/^## Guides$/m);
    expect(llms).toContain("- [Tooling](https://saquibpm.github.io/faun-design-system/#/guides/tooling): Lint and MCP.");
    expect(llms).toContain("### Actions");
    expect(llms).toContain("- [Icon button](https://saquibpm.github.io/faun-design-system/#/components/icon-button): A square button with only an icon.");
    expect(llms.indexOf("### Actions")).toBeLessThan(llms.indexOf("### Overlays"));
    expect(llms.indexOf("### Overlays")).toBeLessThan(llms.indexOf("### AI and agents"));
    expect(llms.endsWith("\n")).toBe(true);
  });
  it("llms-full.txt carries rules, status map, tokens, icons and components", () => {
    expect(llmsFull).toContain("Never write a colour.");
    expect(llmsFull).toContain("## Domain: run");
    expect(llmsFull).toContain("| awaiting_approval | attention | status-attention | Awaiting approval |");
    expect(llmsFull).toContain("| fg.muted | `--faun-fg-muted` | #5c5a55 | #a9a7a0 | Secondary text. |");
    expect(llmsFull).toContain("| space.4 | `--faun-space-4` | 16px |  |");
    expect(llmsFull).not.toContain("[object Object]");
    expect(llmsFull).toContain("| home | IconHome | navigation | home, building, residence |");
    expect(llmsFull).toContain('Import: `import { Dialog, DialogContent, DialogTrigger } from "@faun-ds/react";`');
    expect(llmsFull).toContain("### Props: IconButton");
    expect(llmsFull).toContain("| label (required) | `string` |  | Required accessible name. |");
    expect(llmsFull).toContain("```tsx\nfunction Overview()");
  });
  it("is deterministic", () => {
    expect(buildLlms(input())).toEqual({ llms, llmsFull });
  });
});

describe("buildData", () => {
  it("assembles the dataset the server reads", () => {
    const d = buildData({ components: input().components, tokens: input().tokens, statusMap: fixture.statusMap, icons: input().icons });
    expect(d).toMatchObject({ schema: 1, version: "1.2.3", prefix: "faun", themes: ["light", "dark"] });
    expect(d.components.map((c: { name: string }) => c.name)).toEqual(["Button", "Icon button", "Dialog", "Run trail"]);
    expect(d.components[0]).not.toHaveProperty("order");
    expect(d.icons).toHaveLength(5);
  });
});
