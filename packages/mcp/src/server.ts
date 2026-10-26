import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getComponent, getStatusMap, listComponents, resolveIcon, searchTokens } from "./tools.js";
import type { FaunData, Result } from "./types.js";

const json = (value: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] });
const failure = (r: { error: string; suggestions: string[] }) => ({
  isError: true,
  content: [{ type: "text" as const, text: JSON.stringify({ error: r.error, suggestions: r.suggestions }, null, 2) }],
});
/** Strips the `ok` flag from a successful result. */
const unwrap = <T extends object>(r: Result<T>) => (r.ok ? json((({ ok: _ok, ...rest }) => rest)(r)) : failure(r));

const readOnly = { readOnlyHint: true, idempotentHint: true, openWorldHint: false } as const;

export function createServer(data: FaunData): McpServer {
  const server = new McpServer({ name: "faun", version: data.version });

  server.registerTool(
    "list_components",
    {
      title: "List components",
      description: "List every Faun component with its package, category, status and exported names. Use before writing markup: if a component exists, use it.",
      inputSchema: {
        category: z.string().optional().describe('Filter by category, e.g. "Forms", "Overlays", "Data", "AI and agents".'),
        package: z.string().optional().describe('Filter by package: "react", "data" or "ai".'),
      },
      annotations: readOnly,
    },
    async ({ category, package: pkg }) => {
      const components = listComponents(data, { category, package: pkg });
      return json({ count: components.length, components });
    },
  );

  server.registerTool(
    "get_component",
    {
      title: "Get component",
      description: "Get one component: import line, props (type, default, description), related components, tokens it uses, examples and its docs page as Markdown. Accepts the display name, folder, slug or any exported part name.",
      inputSchema: {
        name: z.string().min(1).describe('Component name, e.g. "Button", "icon-button" or "DialogContent".'),
        examples: z.enum(["overview", "all", "none"]).optional().describe("How much example code to include. Default overview."),
        docs: z.boolean().optional().describe("Include the docs page Markdown. Default true."),
      },
      annotations: readOnly,
    },
    async ({ name, examples, docs }) => unwrap(getComponent(data, name, { exampleCode: examples, docs })),
  );

  server.registerTool(
    "search_tokens",
    {
      title: "Search tokens",
      description: "Search design tokens by name, CSS variable, category, description or value. Returns CSS variables and values per theme. Use it instead of writing a colour or size.",
      inputSchema: {
        query: z.string().min(1).describe('Words to match, e.g. "muted text", "danger solid", "elevation", "#3e4c3a".'),
        category: z.string().optional().describe('Restrict to a category such as "fg", "bg", "status", "space", "radius", "dataviz".'),
        limit: z.number().int().min(1).max(100).optional().describe("Maximum results. Default 20."),
      },
      annotations: readOnly,
    },
    async ({ query, category, limit }) => json(searchTokens(data, query, { category, limit })),
  );

  server.registerTool(
    "get_status_map",
    {
      title: "Get status map",
      description: "Map a domain's states to tone, icon and label for StatusBadge. Domains include lifecycle, task, run, progress, approval and data-quality. Omit the domain to list all domains and tones.",
      inputSchema: { domain: z.string().optional().describe('Status domain, e.g. "run" or "data-quality".') },
      annotations: readOnly,
    },
    async ({ domain }) => unwrap(getStatusMap(data, domain)),
  );

  server.registerTool(
    "resolve_icon",
    {
      title: "Resolve icon",
      description: 'Find the Faun icon for a name or concept ("home", "IconHome", "trash", "download"). Returns the component, import line and alternatives. Icons come only from @faun-ds/icons; never use emoji.',
      inputSchema: { name: z.string().min(1).describe("Icon name, component name or a word describing it.") },
      annotations: readOnly,
    },
    async ({ name }) => unwrap(resolveIcon(data, name)),
  );

  return server;
}
