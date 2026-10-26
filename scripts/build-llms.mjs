#!/usr/bin/env node
// Generates llms.txt (index) and llms-full.txt (everything) for agents, from the repository sources:
// component docs (*.docs.mdx), token JSON, the status map, the icon manifest, guides and AGENTS.md.
// Usage: node scripts/build-llms.mjs [--out apps/docs/public]
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  SITE, REPO, defaultRoot, formatValue, mdTable, readAgents, readComponents, readFoundations, readGuides, readIcons,
  readProps, readStatusMap, readTokens, sortComponents, componentUrl, guideUrl, foundationUrl, CATEGORY_ORDER,
} from "./lib/faun-docs.mjs";

const SUMMARY = "Faun is an open design system for agentic enterprise software: tokens, accessible React components, data and AI components, and rules so coding agents build with it correctly. Its visual language (warm paper neutrals, moss brand, oxblood danger) is Faun's own.";

const oneLine = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

/** Builds both files as strings. Pure given its inputs, so it can be tested. */
export function buildLlms({ components, tokens, statusMap, icons, guides, foundations, agents, version }) {
  const sorted = sortComponents(components);
  const categories = [...new Set([...CATEGORY_ORDER, ...sorted.map((c) => c.category)])].filter((c) => sorted.some((x) => x.category === c));

  // ---- llms.txt
  const idx = [
    "# Faun",
    "",
    `> ${SUMMARY}`,
    "",
    "Rules that matter most: never write a colour or an arbitrary value (use semantic tokens and type roles); use a Faun component before writing markup; status is always tone, icon and label via `StatusBadge`; icon-only buttons need a `label`. The full text of everything below is in llms-full.txt.",
    "",
    "## Start here",
    "",
    `- [Agent rules](${REPO}/blob/main/AGENTS.md): the contract for building with and changing Faun`,
    `- [Builder spec](${REPO}/blob/main/BUILDERS.md): how every component is built`,
    `- [Full documentation for LLMs](${SITE}/llms-full.txt): guides, tokens, status map, icons and every component page in one file`,
    "",
    "## Guides",
    "",
    ...guides.map((g) => `- [${g.title}](${guideUrl(g)}): ${oneLine(g.description)}`),
    "",
  ];
  if (foundations.length) idx.push("## Foundations", "", ...foundations.map((f) => `- [${f.title}](${foundationUrl(f)}): ${oneLine(f.description)}`), "");
  idx.push("## Components", "");
  for (const cat of categories) {
    idx.push(`### ${cat}`, "", ...sorted.filter((c) => c.category === cat).map((c) => `- [${c.name}](${componentUrl(c)}): ${oneLine(c.description)}`), "");
  }
  idx.push(
    "## Machine-readable references",
    "",
    "- `@faun-ds/tokens/json`: every token with values per theme and descriptions",
    "- `@faun-ds/tokens/status-map`: domain state to tone, icon and label",
    "- `@faun-ds/tokens/contrast`: contrast results for every pair in every theme",
    "- `@faun-ds/icons/manifest.json`: icons with categories and keywords",
    "- `@faun-ds/mcp`: an MCP server exposing components, tokens, status map and icons as tools",
    "- `@faun-ds/eslint-plugin`: lint rules that enforce the agent rules",
    "",
    "## Optional",
    "",
    `- [Repository](${REPO})`,
    `- [Documentation site](${SITE})`,
    "",
  );

  // ---- llms-full.txt
  const full = ["# Faun: full documentation", "", `> ${SUMMARY}`, "", `Version ${version}. Generated from the repository; do not edit.`, ""];
  if (agents) full.push("# Agent rules (AGENTS.md)", "", agents.replace(/^# .*\n+/, "").trim(), "");

  full.push("# Guides", "");
  for (const g of guides) full.push(`## ${g.title}`, "", `Source: ${guideUrl(g)}`, "", oneLine(g.description), "", g.markdown, "");

  if (foundations.length) {
    full.push("# Foundations", "", ...foundations.map((f) => `- ${f.title} (${foundationUrl(f)}): ${oneLine(f.description)}`), "");
  }

  full.push("# Status map", "", oneLine(statusMap.$description), "", "## Tones", "", mdTable(["Tone", "Icon", "Meaning"], Object.entries(statusMap.tones).map(([k, v]) => [k, v.icon, v.meaning])), "");
  for (const [domain, states] of Object.entries(statusMap.domains)) {
    const rows = Object.entries(states).filter(([k]) => !k.startsWith("$")).map(([k, v]) => [k, v.tone, v.icon, v.label]);
    full.push(`## Domain: ${domain}`, "", ...(states.$description ? [oneLine(states.$description), ""] : []), mdTable(["State", "Tone", "Icon", "Label"], rows), "");
  }

  const themeIds = Object.keys(tokens.themes);
  full.push("# Tokens", "", `CSS variables are prefixed \`--${tokens.prefix}-\`. Colour tokens list the light and dark values; the complete per-theme values (${themeIds.join(", ")}) are in \`@faun-ds/tokens/json\`.`, "");
  const byCat = new Map();
  for (const t of tokens.tokens) { if (!byCat.has(t.category)) byCat.set(t.category, []); byCat.get(t.category).push(t); }
  for (const [cat, list] of byCat) {
    const themed = list.some((t) => t.values);
    full.push(`## ${cat}`, "", themed
      ? mdTable(["Token", "CSS variable", "Light", "Dark", "Description"], list.map((t) => [t.name, t.cssVar ? `\`${t.cssVar}\`` : "", formatValue(t.values?.light ?? t.value), formatValue(t.values?.dark), oneLine(t.description)]))
      : mdTable(["Token", "CSS variable", "Value", "Description"], list.map((t) => [t.name, t.cssVar ? `\`${t.cssVar}\`` : "", formatValue(t.value ?? t.values?.light), oneLine(t.description)])), "");
  }

  full.push("# Icons", "", `Import by component name from \`@faun-ds/icons\`, e.g. \`import { IconHome } from "@faun-ds/icons"\`. ${icons.count ?? icons.icons.length} icons.`, "", mdTable(["Name", "Component", "Category", "Keywords"], icons.icons.map((i) => [i.name, i.component, i.category, (i.keywords ?? []).join(", ")])), "");

  full.push("# Components", "");
  for (const c of sorted) {
    full.push(`## ${c.name}`, "", `Category: ${c.category}. Package \`${c.package}\`. Status: ${c.status}. Source: ${componentUrl(c)}`, "", `Import: \`import { ${c.exports.join(", ")} } from "${c.package}";\``, "", oneLine(c.description), "");
    if (c.related.length) full.push(`Related: ${c.related.join(", ")}`, "");
    full.push(c.docs, "");
    for (const [name, p] of Object.entries(c.props)) {
      if (!p.props.length) continue;
      full.push(`### Props: ${name}`, "", mdTable(["Prop", "Type", "Default", "Description"], p.props.map((x) => [`${x.name}${x.required ? " (required)" : ""}`, `\`${oneLine(x.type)}\``, x.default ?? "", oneLine(x.description)])), "");
    }
    const code = c.examples.find((e) => e.ref?.endsWith("/Overview"))?.code;
    if (code) full.push("### Example", "", "```tsx", code, "```", "");
  }
  return { llms: idx.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n", llmsFull: full.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n" };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const o = argv.indexOf("--out");
  const outDir = resolve(defaultRoot, o >= 0 ? argv[o + 1] : "apps/docs/public");
  const props = readProps(defaultRoot);
  const tokens = readTokens(defaultRoot);
  const { llms, llmsFull } = buildLlms({
    components: readComponents(defaultRoot, props), tokens, statusMap: readStatusMap(defaultRoot), icons: readIcons(defaultRoot),
    guides: readGuides(defaultRoot), foundations: readFoundations(defaultRoot), agents: readAgents(defaultRoot), version: tokens.version,
  });
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "llms.txt"), llms);
  writeFileSync(join(outDir, "llms-full.txt"), llmsFull);
  console.log(`llms: wrote llms.txt (${llms.length} chars) and llms-full.txt (${llmsFull.length} chars) to ${outDir}`);
}
