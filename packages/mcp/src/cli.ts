#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { defaultDataPath, loadData } from "./data.js";
import { createServer } from "./server.js";

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    process.stderr.write("faun-mcp: stdio MCP server for the Faun design system.\nSet FAUN_MCP_DATA to use a different dataset file.\n");
    return;
  }
  const data = loadData();
  const server = createServer(data);
  await server.connect(new StdioServerTransport());
  // stdout carries the protocol; anything human-readable goes to stderr.
  process.stderr.write(`faun-mcp ${data.version} ready (${data.components.length} components, ${data.tokens.length} tokens) from ${defaultDataPath()}\n`);
}

main().catch((e) => {
  process.stderr.write(`faun-mcp: ${(e as Error).message}\n`);
  process.exit(1);
});
