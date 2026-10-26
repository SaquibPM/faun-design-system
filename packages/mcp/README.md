# @faun-ds/mcp

> **Status: pre-1.0 (0.1.0).** Interfaces can change in minor releases. Covered by unit tests on Node 22 and 24 in CI; not tested with every editor, agent client or package manager. [What is tested and what is not](https://github.com/SaquibPM/faun-design-system/blob/main/docs/STATUS.md)

A stdio [Model Context Protocol](https://modelcontextprotocol.io) server that gives coding agents Faun's components, props, tokens, status map and icons.

```bash
claude mcp add faun -- npx -y @faun-ds/mcp
```

```json
{ "mcpServers": { "faun": { "command": "npx", "args": ["-y", "@faun-ds/mcp"] } } }
```

| Tool | Arguments | Returns |
| --- | --- | --- |
| `list_components` | `category?`, `package?` | Components with package, category, status and exports |
| `get_component` | `name`, `examples?`, `docs?` | Import line, props, related, tokens, examples, docs Markdown |
| `search_tokens` | `query`, `category?`, `limit?` | Tokens ranked by match, with CSS variable and per-theme values |
| `get_status_map` | `domain?` | States with tone, icon, label and a `StatusBadge` line |
| `resolve_icon` | `name` | Icon, import line and alternatives |

## Data

The server reads `data/faun.json`, generated from the repository by `pnpm --filter @faun-ds/mcp build` (component docs and props, token JSON, status map, icon manifest). Set `FAUN_MCP_DATA` to use another file.

## Development

```bash
pnpm --filter @faun-ds/mcp data    # regenerate data/faun.json
pnpm --filter @faun-ds/mcp test
```

Tool logic is in `src/tools.ts` as pure functions over the dataset; `src/server.ts` only adapts them.
